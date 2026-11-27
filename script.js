const toggle = document.querySelector('.menu-toggle'); const nav = document.querySelector('.nav');
toggle.addEventListener('click', () => { nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', nav.classList.contains('open')) });
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// ===== GOOGLE ANALYTICS 4 EVENT TRACKING =====
// TODO: Replace 'G-XXXXXXXXXX' with your actual GA4 property ID
function trackEvent(eventName, eventData = {}) {
  if (window.gtag) {
    gtag('event', eventName, eventData);
  }
}

// Track page views
trackEvent('page_view', {
  'page_path': window.location.pathname
});

// ===== BOOKING SYSTEM INITIALIZATION =====
// No booking tool is connected yet, so booking CTAs scroll to the contact form.
// When a real scheduler exists, set BOOKING_LINK and the click handler will open it.
const BOOKING_LINK = "";

document.querySelectorAll('a.booking-link').forEach(link => {
  link.addEventListener('click', e => {
    trackEvent('booking_link_click', { 'cta_text': link.textContent });
    if (BOOKING_LINK) {
      e.preventDefault();
      window.open(BOOKING_LINK, '_blank');
      return;
    }
    const contact = document.getElementById('contact');
    if (contact) {
      e.preventDefault();
      contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const nameField = document.querySelector('#contactForm input[name="name"]');
      if (nameField) setTimeout(() => nameField.focus(), 400);
    }
  });
});

// Stripe Payment Links per service. A service with no link sends the visitor to the contact form.
const stripeLinks = {
  "Strategic Technology Advisory": "",
  "Infrastructure Health Check": "https://buy.stripe.com/4gM3cwbgngfg05a49P7ss0e",
  "Data Center Consulting": "https://buy.stripe.com/eVq5kvdtS6di6dbbQXeZ209",
  "Cloud Infrastructure Assessment": "https://buy.stripe.com/eVq9ALcpOgRWatr9IPeZ20a"
};
document.querySelectorAll('.pay').forEach(btn => btn.addEventListener('click', e => {
  const url = stripeLinks[btn.dataset.service];
  trackEvent('checkout_intent', { 'service': btn.dataset.service, 'has_link': Boolean(url) });
  if (url) return;
  e.preventDefault();
  const contact = document.getElementById('contact');
  const serviceSelect = document.querySelector('select[name="service"]');
  if (serviceSelect && btn.dataset.service) serviceSelect.value = btn.dataset.service;
  if (contact) {
    contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const status = document.getElementById('formStatus');
    if (status) status.textContent = 'Tell us a little about your project below and we will scope it with you.';
  }
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
  mainContactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const status = document.getElementById('formStatus');
    const formData = new FormData(form);
    const service = formData.get('service') || '';
    const company = formData.get('company') || '';

    trackEvent('contact_form_submit', {
      'service': service,
      'company': company
    });

    if (status) status.textContent = 'Sending...';

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });
      if (!response.ok) throw new Error('Request failed with status ' + response.status);
      form.reset();
      if (status) status.textContent = 'Thanks, your message is in. We respond within one business day.';
    } catch (error) {
      if (status) {
        status.textContent = 'Something went wrong sending that. Please email cparham@celestechsolutions.com or call 904-640-1193.';
      }
    }
  });
}

// ===== ASSESSMENT FORM TRACKING =====
const assessmentForm = document.getElementById('assessmentForm');
if (assessmentForm) {
  assessmentForm.addEventListener('submit', e => {
    const companySize = document.querySelector('select[name="companySize"]')?.value || 'unknown';
    const primaryChallenge = document.querySelector('select[name="primaryChallenge"]')?.value || 'unknown';

    trackEvent('assessment_requested', {
      'company_size': companySize,
      'primary_challenge': primaryChallenge
    });
  });
}

// ===== ENTRY POINT TRACKING =====
document.querySelectorAll('.entry-grid a, .entry-card a').forEach(link => {
  link.addEventListener('click', () => {
    trackEvent('entry_point_click', {
      'entry_path': link.href,
      'entry_text': link.textContent
    });
  });
});