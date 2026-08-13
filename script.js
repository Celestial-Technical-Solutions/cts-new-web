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

const mainContactForm = document.getElementById('contactForm');
if (mainContactForm) {
  mainContactForm.addEventListener('submit', e => {
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
}

const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotPanel = document.getElementById('ctsChatbot');
const chatbotClose = document.querySelector('.chatbot-close');
const chatbotForm = document.getElementById('chatbotForm');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotChips = document.querySelectorAll('.chatbot-chip');
const chatbotCta = document.getElementById('chatbotCta');
const chatbotBookButton = document.querySelector('.chatbot-book-button');
const chatbotLeadForm = document.getElementById('chatbotLeadForm');

const chatServiceMap = {
  cloud: 'Cloud Infrastructure Assessment',
  aws: 'Cloud Infrastructure Assessment',
  azure: 'Cloud Infrastructure Assessment',
  gcp: 'Cloud Infrastructure Assessment',
  cost: 'Cloud Infrastructure Assessment',
  spend: 'Cloud Infrastructure Assessment',
  ai: 'Custom Enterprise Solutions',
  automation: 'Custom Enterprise Solutions',
  workflow: 'Custom Enterprise Solutions',
  strategy: 'Strategic Technology Advisory',
  roadmap: 'Strategic Technology Advisory',
  infrastructure: 'Infrastructure Health Check',
  data: 'Data Center Consulting',
  cooling: 'Data Center Consulting',
  power: 'Data Center Consulting',
  modernization: 'IT Infrastructure Migration Planning'
};

const chatbotReplies = {
  default: 'A strong next step is to identify the business problem behind the technology decision. We can help with cloud efficiency, AI automation, infrastructure modernization, and IT strategy. Tell me what challenge you are trying to solve, and I’ll point you in the right direction.',
  services: 'CTS helps businesses with strategic technology advisory, infrastructure assessments, cloud modernization, AI automation, and operational improvement planning. If you want the best fit, tell me whether you are focused on cost, speed, automation, or reliability.',
  cloud: 'Cloud cost and performance issues are often a sign that infrastructure needs better design, usage visibility, or modernization. We help organizations reduce spend, improve resilience, and align cloud decisions to business goals.',
  data: 'Data center and infrastructure challenges can impact cost, uptime, and growth. We evaluate capacity, efficiency, modernization opportunities, and long-term operational strategy to help teams make smarter infrastructure decisions.',
  ai: 'AI automation can streamline repetitive work, improve lead follow-up, and help teams move faster. We design practical AI and workflow solutions that support sales, operations, and service delivery without adding unnecessary complexity.',
  contact: 'The easiest next step is to fill out the contact form or email info@celestechsolutions.com with a short overview of your goals. We can recommend the right engagement based on your current situation.'
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

  if (text.includes('cloud') || text.includes('aws') || text.includes('azure') || text.includes('gcp') || text.includes('cost') || text.includes('spend')) {
    return 'A cloud cost review is a smart place to start. We can identify waste, improve efficiency, and help you reduce recurring infrastructure spend without slowing growth.';
  }

  if (text.includes('ai') || text.includes('automation') || text.includes('workflow') || text.includes('agent')) {
    return chatbotReplies.ai;
  }

  if (text.includes('data center') || text.includes('data-center') || text.includes('power') || text.includes('cooling') || text.includes('infrastructure')) {
    return chatbotReplies.data;
  }

  if (text.includes('service') || text.includes('offer') || text.includes('what do you do') || text.includes('solutions')) {
    return chatbotReplies.services;
  }

  if (text.includes('contact') || text.includes('consult') || text.includes('talk') || text.includes('start') || text.includes('book')) {
    return chatbotReplies.contact;
  }

  if (text.includes('strategy') || text.includes('it') || text.includes('roadmap')) {
    return 'Technology strategy is where smart growth starts. We help teams prioritize the right initiatives, reduce operational friction, and build a roadmap that supports both short-term wins and long-term scale.';
  }

  return chatbotReplies.default;
}

function triggerChatReply(messageText) {
  addChatMessage(messageText, 'user');
  const reply = getBotReply(messageText);
  if (chatbotCta) {
    chatbotCta.hidden = false;
  }
  window.setTimeout(() => {
    addChatMessage(reply, 'bot');
    if (chatbotCta) {
      chatbotCta.hidden = false;
    }
  }, 220);
}

function getSuggestedService(topicText) {
  const text = (topicText || '').toLowerCase();

  for (const [keyword, serviceName] of Object.entries(chatServiceMap)) {
    if (text.includes(keyword)) {
      return serviceName;
    }
  }

  return 'Strategic Technology Advisory';
}

function openLeadCaptureForm() {
  if (chatbotCta) {
    chatbotCta.hidden = false;
  }
  if (chatbotLeadForm) {
    chatbotLeadForm.hidden = false;
    const firstInput = chatbotLeadForm.querySelector('input');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }
}

function submitChatLead(form) {
  const formData = new FormData(form);
  const name = formData.get('chatbotName') || 'No name provided';
  const email = formData.get('chatbotEmail') || 'No email provided';
  const company = formData.get('chatbotCompany') || 'No company provided';
  const selectedGoal = formData.get('chatbotGoal') || 'General consultation';
  const suggestedService = getSuggestedService(`${selectedGoal} ${formData.get('chatbotInput') || ''}`);

  if (mainContactForm) {
    mainContactForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    mainContactForm.name.value = name;
    mainContactForm.email.value = email;
    mainContactForm.company.value = company;
    mainContactForm.message.value = `Lead captured from CTS Chat Agent. Goal: ${selectedGoal}. Please contact me about a consultation.`;
    if (mainContactForm.service) {
      mainContactForm.service.value = suggestedService;
    }
    mainContactForm.requestSubmit();
  } else {
    const subject = encodeURIComponent('CTS Chat Lead Submission');
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nLead Source: CTS Chat Agent\nService: ${suggestedService}\nGoal: ${selectedGoal}\n\nPlease contact me about a consultation.`
    );
    window.location.href = `mailto:info@celestechsolutions.com?subject=${subject}&body=${body}`;
  }

  form.reset();
  form.hidden = true;
}

if (chatbotToggle && chatbotPanel) {
  chatbotToggle.addEventListener('click', () => {
    const isHidden = chatbotPanel.hasAttribute('hidden');
    chatbotPanel.toggleAttribute('hidden', !isHidden);
    chatbotToggle.setAttribute('aria-expanded', String(isHidden));
    if (isHidden) {
      if (chatbotCta) {
        chatbotCta.hidden = false;
      }
      setTimeout(() => chatbotInput.focus(), 100);
    }
  });

  if (chatbotClose) {
    chatbotClose.addEventListener('click', () => {
      chatbotPanel.setAttribute('hidden', 'hidden');
      chatbotToggle.setAttribute('aria-expanded', 'false');
      if (chatbotCta) {
        chatbotCta.hidden = true;
      }
      if (chatbotLeadForm) {
        chatbotLeadForm.hidden = true;
      }
    });
  }

  if (chatbotBookButton) {
    chatbotBookButton.addEventListener('click', openLeadCaptureForm);
  }

  chatbotChips.forEach(button => {
    button.addEventListener('click', () => {
      const selectedPrompt = button.dataset.chat || button.textContent.trim();
      chatbotInput.value = selectedPrompt;
      triggerChatReply(selectedPrompt);
      chatbotInput.value = '';
    });
  });

  if (chatbotLeadForm) {
    chatbotLeadForm.addEventListener('submit', e => {
      e.preventDefault();
      submitChatLead(chatbotLeadForm);
    });
  }

  chatbotForm.addEventListener('submit', e => {
    e.preventDefault();
    const userInput = chatbotInput.value.trim();

    if (!userInput) {
      return;
    }

    triggerChatReply(userInput);
    chatbotInput.value = '';
  });
}