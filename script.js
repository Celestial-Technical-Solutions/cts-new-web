const toggle = document.querySelector('.menu-toggle'); const nav = document.querySelector('.nav');
toggle.addEventListener('click', () => { nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', nav.classList.contains('open')) });
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// Replace each placeholder below with the real Stripe Payment Link for that CTS service.
const stripeLinks = {
  "Strategic Technology Advisory": "",
  "Infrastructure Health Check": "https://buy.stripe.com/5kQ9AL75ufNS7hfaMTeZ208",
  "Data Center Consulting": "https://buy.stripe.com/eVq5kvdtS6di6dbbQXeZ209",
  "Cloud Infrastructure Assessment": "https://buy.stripe.com/eVq9ALcpOgRWatr9IPeZ20a"
};
document.querySelectorAll('.pay').forEach(btn => btn.addEventListener('click', e => {
  const url = stripeLinks[btn.dataset.service];
  if (!url) { e.preventDefault(); alert('Stripe checkout for ' + btn.dataset.service + ' is ready to connect. Add the Payment Link in script.js before launch.'); }
}));

document.querySelectorAll('a[data-service]').forEach(btn => btn.addEventListener('click', e => {
  const selectedService = btn.dataset.service;
  const serviceSelect = document.querySelector('select[name="service"]');
  if (serviceSelect) {
    serviceSelect.value = selectedService;
  }
}));

document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const form = new FormData(e.target);
  const name = form.get('name') || 'No name provided';
  const email = form.get('email') || 'No email provided';
  const company = form.get('company') || 'No company provided';
  const service = form.get('service') || 'No service selected';
  const message = form.get('message') || 'No message provided';
  const subject = encodeURIComponent('CTS Contact Form Submission');
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nService: ${service}\n\nMessage:\n${message}`
  );
  window.location.href = `mailto:info@celestechsolutions.com?subject=${subject}&body=${body}`;
  document.getElementById('formStatus').textContent = 'Your email client should open shortly so you can send this message to info@celestechsolutions.com.';
});

const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotPanel = document.getElementById('ctsChatbot');
const chatbotClose = document.querySelector('.chatbot-close');
const chatbotForm = document.getElementById('chatbotForm');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotMessages = document.getElementById('chatbotMessages');

const chatbotReplies = {
  default: 'I can help with CTS services, strategy, architecture, cloud modernization, and next steps. Tell me what you need help with.',
  services: 'CTS offers strategic technology advisory, infrastructure health checks, data center consulting, cloud infrastructure assessments, technical program management, and solutions architecture design.',
  cloud: 'Our cloud work covers AWS, Azure, GCP strategy, migration planning, architecture reviews, and modernization recommendations.',
  data: 'We support data center consulting, capacity planning, cooling and power efficiency reviews, and modernization roadmaps.',
  contact: 'You can start by using the contact form on this page or email info@celestechsolutions.com to request a consultation.'
};

function addChatMessage(text, sender = 'bot') {
  const message = document.createElement('div');
  message.className = `message ${sender}`;
  message.textContent = text;
  chatbotMessages.appendChild(message);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function getBotReply(inputText) {
  const text = inputText.toLowerCase();

  if (text.includes('cloud') || text.includes('aws') || text.includes('azure') || text.includes('gcp')) {
    return chatbotReplies.cloud;
  }

  if (text.includes('data center') || text.includes('data-center') || text.includes('power') || text.includes('cooling')) {
    return chatbotReplies.data;
  }

  if (text.includes('service') || text.includes('offer') || text.includes('what do you do')) {
    return chatbotReplies.services;
  }

  if (text.includes('contact') || text.includes('consult') || text.includes('talk') || text.includes('start')) {
    return chatbotReplies.contact;
  }

  return chatbotReplies.default;
}

if (chatbotToggle && chatbotPanel) {
  chatbotToggle.addEventListener('click', () => {
    const isHidden = chatbotPanel.hasAttribute('hidden');
    chatbotPanel.toggleAttribute('hidden', !isHidden);
    chatbotToggle.setAttribute('aria-expanded', String(isHidden));
    if (isHidden) {
      setTimeout(() => chatbotInput.focus(), 100);
    }
  });

  if (chatbotClose) {
    chatbotClose.addEventListener('click', () => {
      chatbotPanel.setAttribute('hidden', 'hidden');
      chatbotToggle.setAttribute('aria-expanded', 'false');
    });
  }

  chatbotForm.addEventListener('submit', e => {
    e.preventDefault();
    const userInput = chatbotInput.value.trim();

    if (!userInput) {
      return;
    }

    addChatMessage(userInput, 'user');
    chatbotInput.value = '';

    const reply = getBotReply(userInput);
    window.setTimeout(() => addChatMessage(reply, 'bot'), 200);
  });
}