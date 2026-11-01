import { createAssistantCompletion } from './ai-provider.mjs';
import { CELESTE_SYSTEM_PROMPT } from './celeste-prompt.mjs';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_TURNS = 12;
const MAX_HISTORY_ITEM_LENGTH = 2000;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 12;
const requestsByIp = new Map();

function jsonResponse(statusCode, body) {
    return new Response(JSON.stringify(body), {
        status: statusCode,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff'
        }
    });
}

function isRateLimited(ip) {
    const now = Date.now();
    const timestamps = (requestsByIp.get(ip) || []).filter(time => now - time < RATE_WINDOW_MS);
    if (timestamps.length >= RATE_LIMIT) {
        requestsByIp.set(ip, timestamps);
        return true;
    }
    timestamps.push(now);
    requestsByIp.set(ip, timestamps);
    if (requestsByIp.size > 5000) {
        for (const [key, times] of requestsByIp) {
            if (!times.length || now - times[times.length - 1] >= RATE_WINDOW_MS) requestsByIp.delete(key);
        }
        if (requestsByIp.size > 5000) requestsByIp.delete(requestsByIp.keys().next().value);
    }
    return false;
}

function validHistory(history) {
    if (!Array.isArray(history) || history.length > MAX_HISTORY_TURNS) return null;
    const safeHistory = [];
    for (const item of history) {
        if (!item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string') return null;
        const content = item.content.trim();
        if (!content || content.length > MAX_HISTORY_ITEM_LENGTH) return null;
        safeHistory.push({ role: item.role, content });
    }
    return safeHistory;
}

export default async (request, context) => {
    if (request.method !== 'POST') {
        return jsonResponse(405, { error: 'Method not allowed.' });
    }

    const ip = context?.ip || 'unknown';
    if (isRateLimited(ip)) {
        return jsonResponse(429, { error: 'Too many messages. Please wait a moment before trying again.' });
    }

    let body;
    try {
        const contentLength = Number(request.headers.get('content-length') || 0);
        if (contentLength > 30_000) return jsonResponse(413, { error: 'Request is too large.' });
        const raw = await request.text();
        if (raw.length > 30_000) return jsonResponse(413, { error: 'Request is too large.' });
        body = JSON.parse(raw);
    } catch {
        return jsonResponse(400, { error: 'Invalid request.' });
    }

    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : '';
    const history = validHistory(body?.history);
    if (!message || message.length > MAX_MESSAGE_LENGTH || !history || sessionId.length > 100) {
        return jsonResponse(400, { error: 'Please send a valid message and try again.' });
    }

    try {
        const reply = await createAssistantCompletion([
            { role: 'system', content: CELESTE_SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: message }
        ]);
        return jsonResponse(200, { reply });
    } catch (error) {
        const notConfigured = !process.env.XAI_API_KEY;
        const diagnosticId = globalThis.crypto?.randomUUID?.() || `celeste-${Date.now()}`;
        console.error('Celeste AI request failed', {
            diagnosticId,
            category: notConfigured ? 'configuration' : 'provider',
            providerStatus: Number.isInteger(error?.status) ? error.status : undefined,
            providerCode: error?.code,
            providerType: error?.type,
            providerRequestId: error?.providerRequestId,
            errorName: error instanceof Error ? error.name : 'UnknownError',
            errorMessage: error instanceof Error ? error.message.slice(0, 300) : 'Unknown provider error'
        });
        return jsonResponse(notConfigured ? 503 : 502, {
            error: notConfigured
                ? 'Celeste is being configured. Please contact info@celestechsolutions.com.'
                : 'Celeste could not reach the assistant service. Please try again shortly.'
        });
    }
};