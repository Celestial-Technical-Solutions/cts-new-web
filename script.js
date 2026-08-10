const toggle=document.querySelector('.menu-toggle');const nav=document.querySelector('.nav');
toggle.addEventListener('click',()=>{nav.classList.toggle('open');toggle.setAttribute('aria-expanded',nav.classList.contains('open'))});
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

// Replace each placeholder below with the real Stripe Payment Link for that CTS service.
const stripeLinks={
  "Strategic Technology Advisory":"",
  "Infrastructure Health Check":"",
  "Data Center Consulting":"",
  "Cloud Infrastructure Assessment":""
};
document.querySelectorAll('.pay').forEach(btn=>btn.addEventListener('click',e=>{
  const url=stripeLinks[btn.dataset.service];
  if(!url){e.preventDefault();alert('Stripe checkout for '+btn.dataset.service+' is ready to connect. Add the Payment Link in script.js before launch.');}
}));
document.getElementById('contactForm').addEventListener('submit',e=>{
  e.preventDefault();
  document.getElementById('formStatus').textContent='Form design is ready. Connect this form to your CRM, email service, or GoHighLevel workflow before launch.';
});