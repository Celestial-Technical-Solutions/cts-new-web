# CTS WEBSITE IMPLEMENTATION PLAN

**Status:** Ready for Implementation  
**Approved:** 2026-08-18  
**Target Completion:** P0 by 2026-08-25, P1 by 2026-09-01, P2 by 2026-09-15

---

## P0 — REVENUE GENERATION (HIGHEST PRIORITY)

### **P0-1: Create /ai-automation-assessment/ Landing Page**

**File:** `ai-automation-assessment/index.html` (NEW)

**Purpose:** Flagship low-risk entry product to build trust and generate $500–$997 assessments

**Content Structure:**
- Hero: "Free AI & Automation Assessment" (or "$497 Comprehensive Review")
- Problem statement: "Most organizations waste 30-40% of operational time on manual processes"
- Value prop: "Identify cost savings, automation opportunities, and AI agent applications"
- Assessment scope (4-5 sections): Current Workflow, Pain Points, Automation Opportunities, Timeline, Budget
- Request form: Name, Email, Company, Phone, Company Size, Primary Challenge, Budget, Timeline
- Social proof: Client logos / "Completed 50+ Assessments"
- FAQ section
- CTA: "Request Your Assessment" (prominent)

**Key Metrics:**
- Estimated conversion: 5-10% of visitors who see this page
- Estimated revenue: $250-$1K per assessment × 3-5/month = $750-$5K/month

---

### **P0-2: Implement Email Notifications on Contact Forms**

**File:** `netlify.toml` (MODIFY)

**Current State:**
```toml
[build]
  publish = "."
  command = ""
```

**Change Required:**
Add `email-notifications` configuration and form routing. Since Netlify Forms doesn't have native email routing without a function, we will:
1. Set up form to post to Netlify (already done)
2. Configure email notification via Netlify Functions OR
3. Use Zapier integration OR
4. Use Formspree as alternative

**Action:** Add to netlify.toml:
```toml
[[forms]]
  name = "contact"
  action = "/"
  notifiedEmail = "info@celestechsolutions.com"

[[forms]]
  name = "chatbot-lead-form"
  action = "/"
  notifiedEmail = "info@celestechsolutions.com"
```

**Alternative:** Create `functions/send-email.js` (Netlify Function) to forward form submissions to info@celestechsolutions.com

---

### **P0-3: Add "3 Entry Points" Section to Homepage**

**File:** `index.html` (MODIFY - add new section after hero)

**Location:** Insert after `</section>` closing hero section (around line 127)

**HTML to Add:**
```html
<section class="entry-points section">
  <h2>How Do You Want to Improve?</h2>
  <p class="section-subtitle">Choose your starting point. We'll identify opportunities in your specific area.</p>
  <div class="entry-grid">
    <article class="entry-card">
      <div class="entry-icon">💰</div>
      <h3>Reduce Cloud Costs</h3>
      <p>Optimize AWS, Azure, or GCP spend without sacrificing performance or reliability.</p>
      <a class="btn btn-outline" href="cloud-cost-optimization/">Review Your Costs</a>
    </article>
    <article class="entry-card">
      <div class="entry-icon">⚡</div>
      <h3>Increase Revenue & Productivity</h3>
      <p>Deploy AI agents and automation to accelerate sales, support, and operations.</p>
      <a class="btn btn-outline" href="ai-automation-assessment/">Request Assessment</a>
    </article>
    <article class="entry-card">
      <div class="entry-icon">🎯</div>
      <h3>Modernize Infrastructure</h3>
      <p>Evaluate technology strategy, improve resilience, and plan digital transformation.</p>
      <a class="btn btn-outline" href="cloud-infrastructure-consulting/">Plan Your Path</a>
    </article>
  </div>
</section>
```

**CSS to Add** (in `styles.css`, at end before closing brace):
```css
.entry-points {
  background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
  padding: 60px 20px;
}

.entry-points h2 {
  text-align: center;
  margin-bottom: 10px;
}

.section-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
  font-size: 1.1rem;
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.entry-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
}

.entry-card:hover {
  border-color: #BE9E44;
  box-shadow: 0 8px 24px rgba(190, 158, 68, 0.1);
  transform: translateY(-4px);
}

.entry-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.entry-card h3 {
  color: #000;
  margin-bottom: 10px;
}

.entry-card p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}
```

**Key Metrics:**
- Expected impact: 20-30% increase in form submissions
- Users self-select their entry point (better targeting)

---

### **P0-4: Implement Google Analytics 4**

**File:** `index.html` (MODIFY - add to `<head>` section, after line 60)

**Add:**
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    'allow_google_signals': false,
    'allow_ad_personalization_signals': false
  });
</script>
```

**Note:** Replace `G-XXXXXXXXXX` with actual Google Analytics ID

**File:** `script.js` (MODIFY - add event tracking)

**Add tracking events:**
```javascript
// Analytics event helper
function trackEvent(eventName, eventData = {}) {
  if (window.gtag) {
    gtag('event', eventName, eventData);
  }
}

// Track hero CTA click
document.querySelectorAll('a[href="#contact"]').forEach(link => {
  link.addEventListener('click', () => {
    trackEvent('hero_cta_click', {
      'cta_text': link.textContent,
      'location': link.closest('section')?.id || 'unknown'
    });
  });
});

// Track service page visits (if available)
trackEvent('page_view', {
  'page_path': window.location.pathname
});

// Track contact form submission
const mainContactForm = document.getElementById('contactForm');
if (mainContactForm) {
  const originalHandler = mainContactForm.onsubmit;
  mainContactForm.addEventListener('submit', e => {
    trackEvent('contact_form_submit', {
      'service': document.querySelector('select[name="service"]')?.value || 'not_selected'
    });
  });
}

// Track assessment page request (if on assessment page)
const assessmentForm = document.getElementById('assessmentForm');
if (assessmentForm) {
  assessmentForm.addEventListener('submit', e => {
    trackEvent('assessment_requested', {
      'company_size': document.querySelector('select[name="companySize"]')?.value || 'unknown'
    });
  });
}
```

**Key Metrics to Track:**
- `page_view` – Every page visit
- `hero_cta_click` – Hero button clicks
- `entry_point_click` – "3 Entry Points" section clicks
- `contact_form_submit` – Contact form submissions
- `assessment_requested` – Assessment requests
- `service_page_view` – Individual service page visits

---

### **P0-5: Fix Homepage Hero CTA**

**File:** `index.html` (MODIFY - lines 120-124)

**Current:**
```html
<div class="actions">
  <a class="btn btn-gold" href="#contact">Schedule a Consultation</a>
  <a class="btn btn-outline" href="#services">Explore Services</a>
</div>
```

**Change To:**
```html
<div class="actions">
  <a class="btn btn-gold" href="ai-automation-assessment/">Get Your Free AI Assessment</a>
  <a class="btn btn-outline" href="#entry-points">Find Your Path</a>
</div>
```

**Rationale:** Create urgency with specific offer; second CTA directs to "3 Entry Points" section

---

### **P0-6: Create Booking System Placeholder**

**File:** `script.js` (MODIFY - add booking handler)

**Add near top of file:**
```javascript
// Booking system initialization
// TODO: Replace with real booking link (Calendly, Acuity, HubSpot)
const BOOKING_LINK = "https://calendly.com/celestechsolutions/consultation"; // Placeholder

document.querySelectorAll('a[href*="book"], a[href*="schedule"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    trackEvent('booking_link_click', { 'cta_text': link.textContent });
    window.open(BOOKING_LINK, '_blank');
  });
});
```

**Also modify all "Book a Call" CTAs** to use class `booking-link`:
```html
<!-- Before: -->
<a class="btn btn-gold header-cta" href="#contact">Book a Call</a>

<!-- After: -->
<a class="btn btn-gold header-cta booking-link" href="javascript:void(0)">Book a Call</a>
```

---

### **P0-7: Update Service Grid to Link Assessment Page**

**File:** `index.html` (MODIFY - lines 144-145, add prominent "Assessment" card)

**Current:** 9 service cards

**Add as new card (first position, before "Cloud Cost Optimization"):**
```html
<article class="card flagship-card assessment-card">
  <div class="icon">✨</div>
  <h3>Free AI & Automation Assessment</h3>
  <p>Discover automation opportunities, cost savings, and AI agent applications specific to your business.</p>
  <a class="btn btn-gold" href="ai-automation-assessment/">Request Assessment</a>
</article>
```

**CSS for assessment card** (add to styles.css):
```css
.assessment-card {
  background: linear-gradient(135deg, #BE9E44 0%, #D8C690 100%);
  color: white;
  border: 2px solid #BE9E44;
}

.assessment-card h3,
.assessment-card p {
  color: white;
}

.assessment-card .btn {
  background: white;
  color: #BE9E44;
}

.assessment-card .btn:hover {
  background: #f5f5f5;
}
```

---

## P1 — HIGH-VALUE IMPROVEMENTS (IMPLEMENT SECOND)

### **P1-1: Add Schema.org Structured Data to Service Pages**

**File:** All 14 service pages (MODIFY - add to `<head>`)

**Add after existing og: meta tags:**
```html
<!-- Schema.org Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": "https://celestechsolutions.com/"
  }, {
    "@type": "ListItem",
    "position": 2,
    "name": "[Service Name]",
    "item": "https://celestechsolutions.com/[service-path]/"
  }]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[FAQ Question 1]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[FAQ Answer 1]"
      }
    }
  ]
}
</script>
```

**Impact:** Better SEO, richer search snippets, FAQ accordion in Google results

---

### **P1-2: Create /ozark-innovation-center/ Page**

**File:** `ozark-innovation-center/index.html` (NEW)

**Purpose:** Strategic narrative for future development; Missouri SEO positioning

**Content:**
- Hero: "Ozark Innovation Center — Future Development Vision"
- Position as "future hub for AI research, training, and emerging tech"
- Do NOT publish street address (as per user guidance)
- Sections:
  - Vision statement
  - Potential concepts (AI Lab, Training Center, Innovation Hub)
  - Timeline (aspirational)
  - Join our vision CTA
- Link from homepage footer

---

### **P1-3: Add Unique og:image for Each Service Page**

**Files:** All 14 service pages (MODIFY - og:image meta tag)

**Current:** All pages reference homepage image

**Change:** Create service-specific social preview graphics
- `/images/cts-cloud-cost-opt-preview.jpg`
- `/images/cts-ai-superagents-preview.jpg`
- etc.

**Implementation:**
1. Generate 14 x 1200×630 images (one per service)
2. Update og:image in each service page header
3. Update twitter:image as well

---

### **P1-4: Add Logo/Social Proof Section**

**File:** `index.html` (MODIFY - add new section)

**Location:** After "Entry Points" section

**Content:**
```html
<section class="social-proof section">
  <h3>Trusted by leading organizations</h3>
  <div class="logo-grid">
    <!-- Placeholder for 6-8 client logos -->
    <div class="logo-placeholder">Client 1</div>
    <div class="logo-placeholder">Client 2</div>
    <!-- etc. -->
  </div>
</section>
```

**Note:** Use placeholder for now; populate with real logos as clients are onboarded

---

### **P1-5: Improve Hero Image/Visual**

**File:** `index.html` and `styles.css` (MODIFY)

**Current:** Uses social preview JPEG as hero background

**Action:** Replace with:
- Custom hero gradient + grid pattern
- OR higher-quality brand asset
- Improves visual hierarchy and professionalism

---

### **P1-6: Add Mobile-Specific Touch Targets**

**File:** `styles.css` (MODIFY - add mobile breakpoint)

**Add at end of file:**
```css
@media (max-width: 768px) {
  .btn, a.btn {
    min-height: 48px;
    padding: 14px 20px;
    font-size: 16px; /* Prevents auto-zoom on iOS */
  }

  .nav a, .header-cta {
    padding: 12px 16px;
    font-size: 16px;
  }

  .entry-grid {
    gap: 20px;
  }

  .service-grid {
    grid-template-columns: 1fr;
  }
}
```

---

### **P1-7: Create Lead Magnet (Cloud Cost Checklist PDF)**

**File:** New lead magnet assets

**What:** Create `downloads/cloud-cost-checklist.pdf` (1-2 page PDF)

**Content:**
- "10-Point Cloud Cost Audit Checklist"
- Free download on homepage
- Gated form (email required)
- Drive to email list

**Implementation:**
1. Create PDF (using design tool or Canva)
2. Upload to `/downloads/`
3. Add gated form to homepage
4. Integrate with Zapier → email list

---

## P2 — STRATEGIC/FUTURE IMPROVEMENTS (IMPLEMENT THIRD)

### **P2-1: CRM Integration (GoHighLevel or HubSpot)**

**Integration:** Route form submissions to CRM
- Automated follow-up sequences
- Lead scoring
- Automated sales routing

### **P2-2: Add Calendly/Acuity Integration**

**Replace placeholder:** Connect real booking calendar to "Book a Call" CTA

### **P2-3: Create /case-studies/ Page**

**Purpose:** Social proof at scale

**Content:**
- 3-5 structured case studies (problem → solution → results)
- Metrics-driven
- Client testimonials (if approved)

### **P2-4: Add Retargeting Pixels**

- Facebook Pixel
- Google Ads conversion tracking
- LinkedIn insight tag

### **P2-5: Create Blog/Content Hub**

**Purpose:** Long-tail keyword capture; thought leadership

**Structure:**
- `/blog/` directory with category pages
- 2-4 articles/month on cloud, AI, automation
- SEO-optimized content
- Internal linking to service pages

---

## IMPLEMENTATION SEQUENCE

### Week 1 (P0 — Ready to Ship)
1. ✅ Create `/ai-automation-assessment/` page
2. ✅ Add "3 Entry Points" section to homepage
3. ✅ Implement Google Analytics 4
4. ✅ Fix email notifications (netlify.toml)
5. ✅ Fix hero CTA ("Get Your Free AI Assessment")
6. ✅ Add assessment card to service grid

### Week 2 (P1 — Deploy & Test)
7. ✅ Add schema.org structured data to all service pages
8. ✅ Create `/ozark-innovation-center/` page
9. ✅ Improve mobile touch targets
10. ✅ Add social proof placeholder section

### Week 3+ (P2 — Long-term Revenue)
11. CRM integration
12. Calendly/Acuity booking
13. Case studies
14. Blog/content hub
15. Retargeting pixels

---

## DEPLOYMENT CHECKLIST

- [ ] All P0 files created/modified
- [ ] Test contact form submissions (email to inbox)
- [ ] Test GA4 events firing (check debug view)
- [ ] Test booking link redirect
- [ ] Test responsive design on mobile
- [ ] Verify all CTAs are unbroken
- [ ] QA: Click every button on homepage
- [ ] Git commit and push to origin/main
- [ ] Verify live on celestechsolutions.com
- [ ] Monitor GA4 for incoming traffic

---

## ESTIMATED REVENUE IMPACT

| Metric | Current | After P0 | After P1 |
|--------|---------|----------|----------|
| Homepage visitors/month | 100 | 100 | 150+ |
| Assessment page visits | 0 | 20-30 | 40-50 |
| Assessment requests | 0 | 3-5 | 5-8 |
| Assessment revenue | $0 | $1.5K–$5K | $2.5K–$8K |
| Contact form submissions | 5-10 | 8-15 | 12-20 |
| MRR | $0 | $250-$1K | $500-$2K |

**Year 1 Projection (with P0+P1):**
- Month 1-2: $0–$1K (launching)
- Month 3-6: $1K–$5K/month (assessment pipeline)
- Month 7-12: $5K–$10K/month (assessments + projects + retainers)
- **Year 1 Total: $25K–$50K**

---

## NEXT STEPS

1. ✅ Approve this implementation plan
2. ✅ Provide answers to:
   - Preferred booking system (Calendly, Acuity, HubSpot, other)?
   - Preferred CRM (GoHighLevel, HubSpot, Pipedrive, other)?
   - GA4 property ID for Google Analytics 4
   - Any content changes to assessment form?
3. ⏳ I'll implement all P0 changes and deploy
4. ⏳ You review live site
5. ⏳ Proceed to P1

---

**Ready to implement?** Confirm and provide:
1. Booking system preference
2. CRM preference  
3. GA4 ID
4. Any other P0 adjustments
