const XAI_BASE_URL = 'https://api.x.ai/v1';
const DEFAULT_XAI_MODEL = 'grok-3';

function safeProviderText(value) {
    if (typeof value !== 'string') return undefined;
    return value
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/Bearer\s+[^\s,;]+/gi, 'Bearer [REDACTED]')
        .replace(/\b(?:sk|xai)-[A-Za-z0-9_-]{8,}\b/gi, '[REDACTED]')
        .slice(0, 300);
}

export async function createAssistantCompletion(messages) {
    const apiKey = process.env.XAI_API_KEY;
    const model = process.env.CELESTE_AI_MODEL || DEFAULT_XAI_MODEL;

    if (!apiKey) {
        throw new Error('Missing XAI_API_KEY environment variable.');
    }

    const endpoint = new URL(`${XAI_BASE_URL}/chat/completions`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages,
                max_tokens: 700,
                temperature: 0.4
            }),
            signal: controller.signal
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            const providerError = errorBody?.error;
            const providerMessage = typeof providerError === 'string' ? providerError : providerError?.message;
            const error = new Error(
                safeProviderText(providerMessage) || `AI provider returned HTTP ${response.status}.`
            );
            error.name = 'AIProviderError';
            error.status = response.status;
            error.code = safeProviderText(providerError?.code);
            error.type = safeProviderText(providerError?.type);
            error.providerRequestId = safeProviderText(response.headers.get('x-request-id'));
            throw error;
        }
        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content;
        if (typeof reply !== 'string' || !reply.trim()) {
            throw new Error('AI provider returned an empty response.');
        }
        return reply.trim().slice(0, 6000);
    } finally {
        clearTimeout(timeout);
    }
}