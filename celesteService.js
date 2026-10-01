/**
 * @typedef {Object} CelesteLead
 * @property {string|null} fullName
 * @property {string|null} company
 * @property {string|null} businessEmail
 * @property {string|null} phone
 * @property {string|null} primaryProblem
 * @property {string|null} serviceInterest
 * @property {string|null} cloudProvider
 * @property {string|null} approximateCloudSpend
 * @property {string|null} urgency
 * @property {string|null} desiredOutcome
 * @property {string|null} conversationSummary
 * @property {string|null} assignedSpecialist
 * @property {'new'|'qualifying'|'qualified'|'consultation_requested'|'referred'} qualificationStatus
 */

/**
 * @param {{message: string, history: Array<{role: 'user'|'assistant', content: string}>, sessionId: string, signal?: AbortSignal}} request
 * @returns {Promise<string>}
 */
export async function requestCelesteReply({ message, history, sessionId, signal }) {
    const response = await fetch('/api/celeste', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message,
            sessionId,
            history,
        }),
        signal
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.error || 'Celeste is unavailable right now. Please try again shortly.');
    }
    if (typeof result.reply !== 'string' || !result.reply.trim()) {
        throw new Error('Celeste could not prepare a response. Please try again.');
    }
    return result.reply;
}

export function createLeadSessionId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `celeste-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}