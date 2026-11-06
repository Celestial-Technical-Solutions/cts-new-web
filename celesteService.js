export async function requestCelesteReply({ message, conversationId, pagePath, pageTitle }) {
    let response;
    try {
        response = await fetch('/api/celeste', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, conversationId, pagePath, pageTitle })
        });
    } catch {
        throw new Error('offline');
    }

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        if (response.status === 404 || response.status >= 500) throw new Error('offline');
        throw new Error(typeof result.error === 'string' ? result.error : 'Celeste could not send that message. Please try again.');
    }
    if (typeof result.conversationId !== 'string' || typeof result.reply !== 'string' || !result.reply.trim()) {
        throw new Error('offline');
    }
    return { conversationId: result.conversationId, reply: result.reply.trim() };
}
