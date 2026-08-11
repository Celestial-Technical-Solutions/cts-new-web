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