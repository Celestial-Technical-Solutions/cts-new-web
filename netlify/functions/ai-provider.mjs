const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const XAI_BASE_URL = 'https://api.x.ai/v1';

export async function createAssistantCompletion(messages) {
    const useXaiKey = !process.env.CELESTE_AI_API_KEY && Boolean(process.env.XAI_API_KEY);
    const apiKey = process.env.CELESTE_AI_API_KEY || process.env.XAI_API_KEY;
    const defaultBaseUrl = useXaiKey ? XAI_BASE_URL : DEFAULT_BASE_URL;
    const baseUrl = (process.env.CELESTE_AI_BASE_URL || defaultBaseUrl).replace(/\/+$/, '');
    const model = process.env.CELESTE_AI_MODEL;

    if (!apiKey || !model) {
        throw new Error('AI provider configuration is incomplete.');
    }

    let endpoint;
    try {
        endpoint = new URL(`${baseUrl}/chat/completions`);
    } catch {
        throw new Error('AI provider configuration is invalid.');
    }
    if (endpoint.protocol !== 'https:') {
        throw new Error('AI provider must use HTTPS.');
    }

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

        if (!response.ok) throw new Error(`AI provider returned ${response.status}.`);
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