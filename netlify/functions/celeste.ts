type CelesteRequest = {
    message: string;
    conversationId?: string;
    pagePath?: string;
    pageTitle?: string;
};

type AgentResponseKind = 'conversation' | 'reply';

type MappedAgentResponse = {
    conversationId?: string;
    reply?: string;
};

type NetlifyContext = {
    ip?: string;
};

const MAX_MESSAGE_LENGTH = 2000;
const MAX_PAGE_VALUE_LENGTH = 300;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = 20;
const requestsByIp = new Map<string, number[]>();

function jsonResponse(status: number, body: { error?: string; conversationId?: string; reply?: string }) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff'
        }
    });
}

function isRateLimited(ip: string) {
    const now = Date.now();
    const timestamps = (requestsByIp.get(ip) || []).filter(time => now - time < RATE_WINDOW_MS);
    if (timestamps.length >= RATE_LIMIT) {
        requestsByIp.set(ip, timestamps);
        return true;
    }

    timestamps.push(now);
    requestsByIp.set(ip, timestamps);
    if (requestsByIp.size > 5000) {
        for (const [key, values] of requestsByIp) {
            if (!values.length || now - values[values.length - 1] >= RATE_WINDOW_MS) requestsByIp.delete(key);
        }
    }
    return false;
}

function cleanPageValue(value: unknown) {
    if (typeof value !== 'string') return '';
    return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, MAX_PAGE_VALUE_LENGTH);
}

function mapAgentResponse(data: unknown, kind: AgentResponseKind): MappedAgentResponse {
    // TODO: confirm field names against the Base44 Developer/API Docs panel.
    if (!data || typeof data !== 'object') return {};

    const root = data as Record<string, unknown>;
    const conversations = Array.isArray(data) ? data : Array.isArray(root.conversations) ? root.conversations : [];
    const defaultConversation = conversations.find(value => {
        if (!value || typeof value !== 'object') return false;
        const record = value as Record<string, unknown>;
        return record.is_default === true || record.isDefault === true || record.default === true;
    });
    const conversation = root.conversation && typeof root.conversation === 'object'
        ? root.conversation as Record<string, unknown>
        : defaultConversation && typeof defaultConversation === 'object'
            ? defaultConversation as Record<string, unknown>
            : conversations[0] && typeof conversations[0] === 'object'
                ? conversations[0] as Record<string, unknown>
                : root;
    const conversationId = [conversation.id, conversation.conversation_id, conversation.conversationId]
        .find(value => typeof value === 'string' && value.trim());

    if (kind === 'conversation') {
        return typeof conversationId === 'string' ? { conversationId } : {};
    }

    const message = root.message && typeof root.message === 'object'
        ? root.message as Record<string, unknown>
        : {};
    const assistant = root.assistant && typeof root.assistant === 'object'
        ? root.assistant as Record<string, unknown>
        : {};
    const content = [root.reply, root.content, root.text, root.output, message.content, message.text, assistant.content]
        .find(value => typeof value === 'string' && value.trim());
    return {
        ...(typeof conversationId === 'string' ? { conversationId } : {}),
        ...(typeof content === 'string' ? { reply: content.trim() } : {})
    };
}

async function readJson(response: Response) {
    if (!response.ok) throw new Error(`Base44 request failed with status ${response.status}`);
    return response.json() as Promise<unknown>;
}

export default async (request: Request, context: NetlifyContext) => {
    if (request.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed.' });

    const ip = context.ip || request.headers.get('x-nf-client-connection-ip') || 'unknown';
    if (isRateLimited(ip)) {
        return jsonResponse(429, { error: 'Too many messages. Please try again later.' });
    }

    let body: CelesteRequest;
    try {
        const contentLength = Number(request.headers.get('content-length') || 0);
        if (contentLength > 12000) return jsonResponse(400, { error: 'Please send a valid message.' });
        const raw = await request.text();
        if (raw.length > 12000) return jsonResponse(400, { error: 'Please send a valid message.' });
        body = JSON.parse(raw) as CelesteRequest;
    } catch {
        return jsonResponse(400, { error: 'Please send a valid message.' });
    }

    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const conversationId = typeof body?.conversationId === 'string' ? body.conversationId.trim() : '';
    if (!message || message.length > MAX_MESSAGE_LENGTH || conversationId.length > 200) {
        return jsonResponse(400, { error: 'Please send a valid message.' });
    }

    const apiKey = process.env.BASE44_API_KEY;
    const baseUrl = process.env.BASE44_BASE_URL?.replace(/\/+$/, '');
    if (!apiKey || !baseUrl) {
        console.error('Celeste Base44 configuration is incomplete.');
        return jsonResponse(502, { error: 'Celeste is offline right now. Please email cparham@celestechsolutions.com and we’ll respond today.' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    try {
        const headers = { api_key: apiKey, Accept: 'application/json', 'Content-Type': 'application/json' };
        let activeConversationId = conversationId;

        if (!activeConversationId) {
            const conversationsResponse = await fetch(`${baseUrl}/conversations`, {
                method: 'GET',
                headers,
                signal: controller.signal
            });
            const conversations = mapAgentResponse(await readJson(conversationsResponse), 'conversation');
            activeConversationId = conversations.conversationId || '';

            if (!activeConversationId) {
                const createResponse = await fetch(`${baseUrl}/conversations`, {
                    method: 'POST',
                    headers,
                    signal: controller.signal
                });
                activeConversationId = mapAgentResponse(await readJson(createResponse), 'conversation').conversationId || '';
            }
        }

        if (!activeConversationId) throw new Error('Base44 did not return a conversation identifier.');

        const pagePath = cleanPageValue(body.pagePath) || '/';
        const pageTitle = cleanPageValue(body.pageTitle) || 'Celestial Technical Solutions';
        const contextualMessage = `[Website context] page=${pagePath} title=${pageTitle} ref=[celestechsolutions.com](https://celestechsolutions.com)\n\n${message}`;
        const messageResponse = await fetch(`${baseUrl}/conversations/${encodeURIComponent(activeConversationId)}/messages`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ content: contextualMessage }),
            signal: controller.signal
        });
        const result = mapAgentResponse(await readJson(messageResponse), 'reply');
        if (!result.reply) throw new Error('Base44 returned no assistant reply.');

        return jsonResponse(200, { conversationId: activeConversationId, reply: result.reply });
    } catch (error) {
        console.error('Celeste Base44 request failed.', {
            errorName: error instanceof Error ? error.name : 'UnknownError',
            status: error instanceof Error ? error.message.match(/status (\d+)/)?.[1] : undefined
        });
        return jsonResponse(502, { error: 'Celeste is offline right now. Please email cparham@celestechsolutions.com and we’ll respond today.' });
    } finally {
        clearTimeout(timeout);
    }
};