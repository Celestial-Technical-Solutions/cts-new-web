import { requestCelesteReply } from './celesteService.js';

if (window.self === window.top && !document.querySelector('link[rel="stylesheet"][href="/celeste.css"]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/celeste.css';
    document.head.append(stylesheet);
}

const STORAGE_KEY = 'cts-celeste-chat-v1';
const GREETING = "Hi, I'm Celeste from Celestial Technical Solutions. I can help you scope an infrastructure assessment or cloud cost review. What are you trying to solve?";
const QUICK_REPLIES = [
    'Infrastructure Quick Scan ($1,500)',
    'Cloud Cost Optimization',
    'Talk to a human'
];

function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
}

function readSession() {
    try {
        const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
        if (!saved || !Array.isArray(saved.messages)) return { conversationId: null, messages: [] };
        return {
            conversationId: typeof saved.conversationId === 'string' ? saved.conversationId : null,
            messages: saved.messages.filter(message =>
                message && ['assistant', 'user'].includes(message.role) && typeof message.content === 'string'
            ).slice(-100)
        };
    } catch {
        return { conversationId: null, messages: [] };
    }
}

function installCeleste() {
    if (document.querySelector('.celeste-widget')) return;

    const widget = element('div', 'celeste-widget');
    const launcher = element('button', 'celeste-launcher');
    launcher.type = 'button';
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-controls', 'celeste-dialog');
    launcher.setAttribute('aria-label', 'Open Celeste sales chat');
    const launcherMark = element('span', 'celeste-launcher-mark', '✦');
    launcherMark.setAttribute('aria-hidden', 'true');
    launcher.append(launcherMark, element('span', '', 'Chat with Celeste'));

    const panel = element('section', 'celeste-panel');
    panel.id = 'celeste-dialog';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'celeste-title');

    const header = element('header', 'celeste-header');
    const titleWrap = element('div', 'celeste-title-wrap');
    const heading = element('h2', '', 'Celeste — Sales');
    heading.id = 'celeste-title';
    const online = element('span', 'celeste-online');
    online.setAttribute('aria-label', 'Online');
    titleWrap.append(heading, online);
    const headerActions = element('div', 'celeste-header-actions');
    const resetButton = element('button', 'celeste-reset', 'New chat');
    resetButton.type = 'button';
    resetButton.setAttribute('aria-label', 'Start a new chat');
    const closeButton = element('button', 'celeste-close', '×');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close Celeste chat');
    headerActions.append(resetButton, closeButton);
    header.append(titleWrap, headerActions);

    const transcript = element('div', 'celeste-transcript');
    transcript.setAttribute('role', 'log');
    transcript.setAttribute('aria-live', 'polite');
    transcript.setAttribute('aria-relevant', 'additions text');
    transcript.setAttribute('aria-label', 'Conversation with Celeste');

    const quickReplies = element('div', 'celeste-quick-replies');
    quickReplies.setAttribute('aria-label', 'Suggested messages');
    QUICK_REPLIES.forEach(text => {
        const chip = element('button', 'celeste-chip', text);
        chip.type = 'button';
        quickReplies.append(chip);
    });

    const footer = element('footer', 'celeste-footer');
    const humanLink = element('a', 'celeste-human', 'Talk to a human');
    humanLink.href = 'mailto:cparham@celestechsolutions.com';
    const disclaimer = element('p', 'celeste-disclaimer', 'Celeste is an AI assistant. Conversations may be used to improve service.');
    const form = element('form', 'celeste-form');
    const input = element('textarea', 'celeste-input');
    input.name = 'message';
    input.rows = 1;
    input.maxLength = 2000;
    input.placeholder = 'Write a message…';
    input.setAttribute('aria-label', 'Message Celeste');
    const sendButton = element('button', 'celeste-send', 'Send');
    sendButton.type = 'submit';
    form.append(input, sendButton);
    footer.append(humanLink, disclaimer, form);
    panel.append(header, transcript, quickReplies, footer);
    widget.append(panel, launcher);
    document.body.append(widget);

    const session = readSession();
    let conversationId = session.conversationId;
    let messages = session.messages;
    let pending = false;

    function scrollLatest() {
        transcript.scrollTop = transcript.scrollHeight;
    }

    function persist() {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ conversationId, messages: messages.slice(-100) }));
        } catch {
            // The chat remains usable when browser storage is unavailable.
        }
    }

    function renderMessage(content, role) {
        const bubble = element('div', `celeste-message celeste-message-${role}`, content);
        bubble.setAttribute('dir', 'auto');
        transcript.append(bubble);
        scrollLatest();
        return bubble;
    }

    function renderOfflineMessage() {
        const bubble = element('div', 'celeste-message celeste-message-error');
        bubble.setAttribute('role', 'status');
        bubble.append(document.createTextNode('Celeste is offline right now — email '));
        const email = element('a', '', 'cparham@celestechsolutions.com');
        email.href = 'mailto:cparham@celestechsolutions.com';
        bubble.append(email, document.createTextNode(" and we'll respond today."));
        transcript.append(bubble);
        scrollLatest();
    }

    function renderHistory() {
        transcript.replaceChildren();
        if (!messages.length) {
            renderMessage(GREETING, 'assistant');
            return;
        }
        messages.forEach(message => renderMessage(message.content, message.role));
    }

    function resetChat() {
        if (pending) return;
        conversationId = null;
        messages = [];
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch {
            // Resetting the visible chat still works without browser storage.
        }
        input.value = '';
        input.style.height = '';
        quickReplies.hidden = false;
        renderHistory();
        input.focus();
    }

    function openChat() {
        panel.hidden = false;
        widget.classList.add('is-open');
        launcher.setAttribute('aria-expanded', 'true');
        input.focus();
        scrollLatest();
    }

    function closeChat() {
        panel.hidden = true;
        widget.classList.remove('is-open');
        launcher.setAttribute('aria-expanded', 'false');
        launcher.focus();
    }

    async function sendMessage(rawMessage) {
        const message = rawMessage.trim();
        if (!message || pending) return;

        quickReplies.hidden = true;
        messages.push({ role: 'user', content: message });
        renderMessage(message, 'user');
        persist();
        input.value = '';
        input.style.height = '';
        pending = true;
        sendButton.disabled = true;
        input.disabled = true;
        const typing = element('div', 'celeste-message celeste-message-assistant celeste-typing', 'Celeste is typing…');
        typing.setAttribute('role', 'status');
        transcript.append(typing);
        scrollLatest();

        try {
            const result = await requestCelesteReply({
                message,
                conversationId,
                pagePath: window.location.pathname,
                pageTitle: document.title
            });
            conversationId = result.conversationId;
            messages.push({ role: 'assistant', content: result.reply });
            persist();
            typing.remove();
            renderMessage(result.reply, 'assistant');
        } catch (error) {
            typing.remove();
            if (error instanceof Error && error.message === 'offline') {
                renderOfflineMessage();
            } else {
                renderMessage(error instanceof Error ? error.message : 'Celeste could not send that message. Please try again.', 'error');
            }
        } finally {
            pending = false;
            sendButton.disabled = false;
            input.disabled = false;
            input.focus();
        }
    }

    launcher.addEventListener('click', openChat);
    closeButton.addEventListener('click', closeChat);
    resetButton.addEventListener('click', resetChat);
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
    quickReplies.addEventListener('click', event => {
        const chip = event.target.closest('button');
        if (chip) sendMessage(chip.textContent || '');
    });
    document.addEventListener('keydown', event => {
        if (panel.hidden) return;
        if (event.key === 'Escape') {
            closeChat();
            return;
        }
        if (event.key !== 'Tab') return;
        const focusable = [...panel.querySelectorAll('button:not(:disabled), textarea:not(:disabled), a[href]')]
            .filter(node => !node.hidden && node.getClientRects().length);
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

    renderHistory();
    quickReplies.hidden = messages.length > 0;
}

if (window.self === window.top) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', installCeleste, { once: true });
    } else {
        installCeleste();
    }
}
