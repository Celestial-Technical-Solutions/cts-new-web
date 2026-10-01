import { createLeadSessionId, requestCelesteReply } from './celesteService.js';

const OPENING_MESSAGE = "Hi, I’m Celeste — the AI SuperAgent for Celestial Technical Solutions. I help businesses reduce cloud spend, deploy practical AI automation, and modernize their technology environments.\n\nWhat are you looking to improve today — cloud costs, AI SuperAgents, infrastructure, or something else?";
const QUICK_ACTIONS = [
    'Reduce Cloud Costs',
    'Build My AI Workforce',
    'Improve IT / Infrastructure',
    'Talk to CTS'
];
const HISTORY_LIMIT = 12;

function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
}

function installCeleste() {
    if (document.querySelector('.celeste-widget')) return;

    const widget = createElement('div', 'celeste-widget');
    const launcher = createElement('button', 'celeste-launcher');
    launcher.type = 'button';
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-controls', 'celeste-dialog');
    launcher.setAttribute('aria-label', 'Ask Celeste, AI Sales Consultant');
    const launcherMark = createElement('span', 'celeste-launcher-mark', '✦');
    launcherMark.setAttribute('aria-hidden', 'true');
    const launcherCopy = createElement('span', 'celeste-launcher-copy');
    launcherCopy.append(createElement('strong', '', 'Ask Celeste'));
    const launcherSubtitle = createElement('span');
    const statusDot = createElement('i');
    statusDot.setAttribute('aria-hidden', 'true');
    launcherSubtitle.append(statusDot, document.createTextNode('AI Sales Consultant'));
    launcherCopy.append(launcherSubtitle);
    launcher.append(launcherMark, launcherCopy);

    const panel = createElement('section', 'celeste-panel');
    panel.id = 'celeste-dialog';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'celeste-title');

    const header = createElement('header', 'celeste-header');
    const identity = createElement('div', 'celeste-identity');
    const avatar = createElement('span', 'celeste-avatar', 'C');
    avatar.setAttribute('aria-hidden', 'true');
    const titles = createElement('div', 'celeste-titles');
    const heading = createElement('strong', '', 'CELESTE');
    heading.id = 'celeste-title';
    titles.append(heading, createElement('span', '', 'AI Sales & Client Success Director'), createElement('small', '', 'Celestial Technical Solutions'));
    identity.append(avatar, titles);

    const headerActions = createElement('div', 'celeste-header-actions');
    const clearButton = createElement('button', 'celeste-clear', 'Clear');
    clearButton.type = 'button';
    clearButton.setAttribute('aria-label', 'Clear conversation');
    const closeButton = createElement('button', 'celeste-close', '×');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close Celeste chat');
    headerActions.append(clearButton, closeButton);
    header.append(identity, headerActions);

    const body = createElement('div', 'celeste-body');
    body.id = 'celeste-messages';
    body.setAttribute('role', 'log');
    body.setAttribute('aria-live', 'polite');
    body.setAttribute('aria-relevant', 'additions text');

    const followupButton = createElement('button', 'celeste-followup', 'Request a CTS follow-up');
    followupButton.type = 'button';
    followupButton.hidden = true;

    const quickActions = createElement('div', 'celeste-quick-actions');
    quickActions.setAttribute('aria-label', 'Quick topics');
    QUICK_ACTIONS.forEach(label => {
        const action = createElement('button', 'celeste-chip', label);
        action.type = 'button';
        quickActions.append(action);
    });

    const privacyNote = createElement('p', 'celeste-privacy', 'Please don’t share passwords, API keys, authentication codes, payment card numbers, Social Security numbers, or other confidential credentials.');

    const form = createElement('form', 'celeste-form');
    const input = createElement('textarea', 'celeste-input');
    input.name = 'message';
    input.rows = 1;
    input.maxLength = 2000;
    input.placeholder = 'Tell Celeste what you’re working on…';
    input.setAttribute('aria-label', 'Message Celeste');
    const sendButton = createElement('button', 'celeste-send', 'Send');
    sendButton.type = 'submit';
    form.append(input, sendButton);

    const footer = createElement('footer', 'celeste-footer');
    footer.append(privacyNote, form);
    panel.append(header, body, followupButton, quickActions, footer);
    widget.append(panel, launcher);
    document.body.append(widget);

    let history = [];
    let sessionId = createLeadSessionId();
    let pending = false;
    let leadForm = null;
    let lastFocused = null;

    function scrollToLatest() {
        body.scrollTop = body.scrollHeight;
    }

    function appendMessage(text, role) {
        const message = createElement('div', `celeste-message celeste-message-${role}`);
        message.textContent = text;
        message.setAttribute('dir', 'auto');
        body.append(message);
        scrollToLatest();
        return message;
    }

    function resetConversation() {
        if (pending) return;
        history = [];
        sessionId = createLeadSessionId();
        body.replaceChildren();
        leadForm = null;
        followupButton.hidden = true;
        appendMessage(OPENING_MESSAGE, 'assistant');
        quickActions.hidden = false;
        input.value = '';
        input.style.height = '';
    }

    function inferLeadContext() {
        const text = history.filter(item => item.role === 'user').map(item => item.content).join(' ').toLowerCase();
        const specialist = text.includes('compliance') || text.includes('ethic') || text.includes('risk') ? 'Sophia'
            : text.includes('machine learning') || text.includes('model training') ? 'Atlas'
                : text.includes('analytics') || text.includes('data analysis') || text.includes('cloud cost') || text.includes('finops') ? 'Nova'
                    : text.includes('workflow') || text.includes('operations') || text.includes('automation') ? 'Marley'
                        : text.includes('strategy') || text.includes('solution architecture') ? 'Titan'
                            : text.includes('cloud') || text.includes('infrastructure') || text.includes('modernization') ? 'Echo' : '';
        const service = text.includes('cloud') || text.includes('aws') || text.includes('azure') || text.includes('gcp') || text.includes('finops') ? 'Cloud cost optimization / FinOps'
            : text.includes('automat') || text.includes('workflow') || text.includes('crm') || text.includes('agent') ? 'AI automation / AI workforce'
                : text.includes('infrastructure') || text.includes('migration') || text.includes('moderniz') ? 'Infrastructure / modernization' : 'CTS consultation';
        const summary = history.filter(item => item.role === 'user').map(item => item.content)
            .join(' ')
            .replace(/(?:password|api[_ -]?key|secret|token|authorization)\s*[:=]\s*\S+/gi, '[redacted]')
            .replace(/\b(?:sk-[A-Za-z0-9_-]{12,}|AKIA[A-Z0-9]{16})\b/g, '[redacted]')
            .slice(0, 800);
        return { specialist, service, summary };
    }

    function appendLeadField(formElement, labelText, name, options = {}) {
        const label = createElement('label', 'celeste-lead-field');
        label.append(createElement('span', '', labelText));
        let control;
        if (options.choices) {
            control = createElement('select');
            control.name = name;
            options.choices.forEach(([value, labelText]) => {
                const option = createElement('option', '', labelText);
                option.value = value;
                control.append(option);
            });
        } else if (options.multiline) {
            control = createElement('textarea');
            control.rows = 2;
            control.name = name;
            control.maxLength = 500;
        } else {
            control = createElement('input');
            control.type = options.type || 'text';
            control.name = name;
            control.maxLength = 200;
            if (options.autocomplete) control.autocomplete = options.autocomplete;
        }
        control.required = Boolean(options.required);
        if (options.placeholder) control.placeholder = options.placeholder;
        label.append(control);
        formElement.append(label);
        return control;
    }

    function showLeadForm() {
        if (leadForm) {
            leadForm.querySelector('input[name="fullName"]')?.focus();
            return;
        }
        const context = inferLeadContext();
        leadForm = createElement('form', 'celeste-lead-form');
        leadForm.append(createElement('h3', '', 'Request a CTS follow-up'));
        leadForm.append(createElement('p', 'celeste-lead-intro', 'Share the best way for the CTS team to follow up. Your chat summary is included only when you submit this form.'));
        appendLeadField(leadForm, 'Full name', 'fullName', { required: true, autocomplete: 'name' });
        appendLeadField(leadForm, 'Company', 'company', { required: true, autocomplete: 'organization' });
        appendLeadField(leadForm, 'Business email', 'businessEmail', { required: true, type: 'email', autocomplete: 'email' });
        appendLeadField(leadForm, 'Phone (optional)', 'phone', { type: 'tel', autocomplete: 'tel' });
        appendLeadField(leadForm, 'Primary problem', 'primaryProblem', { required: true, multiline: true, placeholder: 'What would you like CTS to help solve?' });
        appendLeadField(leadForm, 'Urgency', 'urgency', { required: true, choices: [['', 'Select timing'], ['Exploring', 'Exploring'], ['Within 1–3 months', 'Within 1–3 months'], ['Within 30 days', 'Within 30 days'], ['Urgent', 'Urgent']] });
        appendLeadField(leadForm, 'Cloud provider (if relevant)', 'cloudProvider', { choices: [['', 'Not applicable / select'], ['AWS', 'AWS'], ['Azure', 'Azure'], ['Google Cloud', 'Google Cloud'], ['Hybrid', 'Hybrid'], ['Other', 'Other']] });
        appendLeadField(leadForm, 'Approximate monthly cloud spend (optional)', 'approximateCloudSpend', { placeholder: 'Optional' });
        appendLeadField(leadForm, 'Desired outcome (optional)', 'desiredOutcome', { placeholder: 'What would a good result look like?' });

        const details = {
            serviceInterest: context.service,
            conversationSummary: context.summary,
            assignedSpecialist: context.specialist,
            qualificationStatus: 'consultation_requested'
        };
        Object.entries(details).forEach(([name, value]) => {
            const field = createElement('input');
            field.type = 'hidden';
            field.name = name;
            field.value = value;
            leadForm.append(field);
        });

        const consentLabel = createElement('label', 'celeste-consent');
        const consent = createElement('input');
        consent.type = 'checkbox';
        consent.name = 'followUpConsent';
        consent.required = true;
        consentLabel.append(consent, document.createTextNode('I agree to send these details and my chat summary to CTS for follow-up.'));
        leadForm.append(consentLabel);

        const actions = createElement('div', 'celeste-lead-actions');
        const submit = createElement('button', 'celeste-send', 'Send to CTS');
        submit.type = 'submit';
        const cancel = createElement('button', 'celeste-cancel', 'Cancel');
        cancel.type = 'button';
        actions.append(submit, cancel);
        leadForm.append(actions);
        const status = createElement('p', 'celeste-form-status');
        status.setAttribute('role', 'status');
        leadForm.append(status);
        body.append(leadForm);
        scrollToLatest();
        leadForm.querySelector('input[name="fullName"]')?.focus();

        cancel.addEventListener('click', () => {
            leadForm.remove();
            leadForm = null;
            followupButton.focus();
        });
        leadForm.addEventListener('submit', async event => {
            event.preventDefault();
            submit.disabled = true;
            status.textContent = 'Sending your request…';
            const formData = new FormData(leadForm);
            formData.set('form-name', 'celeste-lead');
            formData.set('bot-field', '');
            try {
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                });
                if (!response.ok) throw new Error('Submission failed');
                leadForm.replaceChildren(createElement('p', 'celeste-lead-success', 'Thank you. Your request has been sent to CTS for follow-up.'));
            } catch {
                status.textContent = 'We could not send your request. Please email info@celestechsolutions.com instead.';
                submit.disabled = false;
            }
        });
    }

    function openChat() {
        lastFocused = document.activeElement;
        panel.hidden = false;
        launcher.setAttribute('aria-expanded', 'true');
        input.focus();
        scrollToLatest();
    }

    function closeChat() {
        panel.hidden = true;
        launcher.setAttribute('aria-expanded', 'false');
        launcher.focus();
        if (lastFocused && lastFocused !== launcher && lastFocused.isConnected) lastFocused.focus();
    }

    async function sendMessage(text) {
        const message = text.trim();
        if (!message || pending) return;

        quickActions.hidden = true;
        appendMessage(message, 'user');
        history.push({ role: 'user', content: message });
        input.value = '';
        input.style.height = '';
        pending = true;
        sendButton.disabled = true;
        input.disabled = true;
        const typing = createElement('div', 'celeste-message celeste-message-assistant celeste-typing', 'Celeste is thinking…');
        typing.setAttribute('role', 'status');
        body.append(typing);
        scrollToLatest();

        try {
            const reply = await requestCelesteReply({
                message,
                history: history.slice(0, -1).slice(-HISTORY_LIMIT),
                sessionId
            });
            typing.remove();
            appendMessage(reply, 'assistant');
            history.push({ role: 'assistant', content: reply });
            history = history.slice(-HISTORY_LIMIT);
            followupButton.hidden = false;
        } catch (error) {
            typing.remove();
            appendMessage(error instanceof Error ? error.message : 'Celeste is unavailable right now. Please try again shortly.', 'error');
            history.pop();
        } finally {
            pending = false;
            sendButton.disabled = false;
            input.disabled = false;
            input.focus();
        }
    }

    launcher.addEventListener('click', openChat);
    closeButton.addEventListener('click', closeChat);
    clearButton.addEventListener('click', resetConversation);
    followupButton.addEventListener('click', showLeadForm);
    form.addEventListener('submit', event => {
        event.preventDefault();
        sendMessage(input.value);
    });
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            form.requestSubmit();
        }
    });
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
    });
    quickActions.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (button) sendMessage(button.textContent === 'Talk to CTS' ? 'I would like to talk to CTS about a consultation.' : button.textContent);
    });
    document.addEventListener('keydown', event => {
        if (panel.hidden) return;
        if (event.key === 'Escape') {
            closeChat();
            return;
        }
        if (event.key !== 'Tab') return;
        const focusable = [...panel.querySelectorAll('button:not(:disabled), textarea:not(:disabled), a[href]')]
            .filter(element => !element.hidden && element.getClientRects().length);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

    resetConversation();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installCeleste, { once: true });
} else {
    installCeleste();
}