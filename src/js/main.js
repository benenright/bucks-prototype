/**
 * Buckinghamshire Council – Prototype JS
 *
 * Minimal vanilla JS for interactive prototype behaviour.
 * Wagtail note: In the Wagtail build this file maps to /static/js/main.js
 * No build step needed; this runs as an ES module.
 */

// =============================================================================
// Hero — random sunset background on each page load
// =============================================================================
const heroImages = [
  '/assets/images/sunset2.jpeg',
  '/assets/images/sunset3.jpeg',
  '/assets/images/sunset4.jpeg',
  '/assets/images/sunset5.jpg',
  '/assets/images/sunset6.jpg',
  '/assets/images/sunset7.jpg',
  '/assets/images/sunset8.jpeg',
];

const heroEl = document.querySelector('.hero');
if (heroEl) {
  const img = heroImages[Math.floor(Math.random() * heroImages.length)];
  heroEl.style.backgroundImage =
    `linear-gradient(rgba(44, 45, 132, 0.3), rgba(44, 45, 132, 1)), url('${img}')`;
}

// =============================================================================
// Navigation panel toggle (Menu button)
// =============================================================================
const navToggle = document.getElementById('nav-toggle');
const siteNav   = document.getElementById('site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
    siteNav.classList.toggle('is-open', !isOpen);
  });

  // Close panel when clicking outside the header
  document.addEventListener('click', (e) => {
    const header = navToggle.closest('.site-header');
    if (header && !header.contains(e.target)) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
      siteNav.classList.remove('is-open');
    }
  });

  // Close panel on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
      navToggle.setAttribute('aria-expanded', 'false');
      siteNav.classList.remove('is-open');
      navToggle.focus();
    }
  });
}

// =============================================================================
// AI Chat widget – prototype simulation
// (In production: swap sendMessage() body for your API call)
// =============================================================================
const chatForm        = document.getElementById('chat-form');
const chatInput       = document.getElementById('chat-input');
const chatMessages    = document.getElementById('chat-messages');
const suggestionBtns  = document.querySelectorAll('.chat-widget__suggestion');

/**
 * Prototype responses map – keywords to helpful replies + links.
 * Order matters: more specific keys (e.g. 'garden waste') before broader ones ('bin').
 * Source: Buckinghamshire Council Analytics Review, Feb 2026.
 */
const RESPONSES = {
  // #1 single destination – 256k views, ~20–25% of all sessions
  'bin collection': {
    text: 'Enter your postcode to find your exact collection day for general waste, recycling, and food waste. Collection days vary by street.',
    link: { href: '/bins-and-recycling/bin-collection-days/', label: 'Check my bin collection day' }
  },
  // Separate high-demand service – major feedback volume around login loops & payment failures
  'garden waste': {
    text: 'You can subscribe to or manage your garden waste collection online. If you\'re having trouble with your account or payment, our support team can help.',
    link: { href: '/bins-and-recycling/garden-waste/', label: 'Manage garden waste subscription' }
  },
  // Catches "bin", "bins", "recycling", "missed bin" etc. after garden waste has been checked
  'bin': {
    text: 'Enter your postcode to check your bin collection days. We collect general waste, recycling, and food waste — usually on different days.',
    link: { href: '/bins-and-recycling/bin-collection-days/', label: 'Check your collection day' }
  },
  'recycling': {
    text: 'Find out what goes in each bin and when your recycling is collected by entering your postcode.',
    link: { href: '/bins-and-recycling/', label: 'Bins & recycling' }
  },
  // #2 traffic cluster – 32k+ sessions; high fail rate on login/contact pages
  'council tax': {
    text: 'To pay your council tax online you\'ll need your account reference number (on your bill). You can pay by Direct Debit, card, or set up a standing order. If you\'re having trouble logging in, use the account recovery link on the sign-in page.',
    link: { href: '/council-tax/pay/', label: 'Pay council tax' }
  },
  // #1 internal search term – 186k page views; was completely absent from the old homepage
  'job': {
    text: 'We have a wide range of roles across the council — from social care and education to IT and planning. Search current vacancies on our jobs portal.',
    link: { href: '/jobs/', label: 'Search council jobs' }
  },
  'vacanc': {
    text: 'Browse all current vacancies at Buckinghamshire Council, including full-time, part-time, and temporary roles.',
    link: { href: '/jobs/', label: 'Search council jobs' }
  },
  // School admissions + term dates – 32k + 27k sessions; strong seasonal spike
  'term': {
    text: 'School term dates for Buckinghamshire are set countywide. Most schools follow these dates, but some academies may differ — always check with the school directly.',
    link: { href: '/schools-and-learning/term-dates/', label: 'View all term dates' }
  },
  'school': {
    text: 'You can apply for a primary or secondary school place online. Applications for September 2026 are open — check the closing date on the admissions page.',
    link: { href: '/schools-and-learning/apply-for-school/', label: 'Apply for a school place' }
  },
  // Planning – 45k sessions, 94k views; key frustration: can't search by postcode
  'planning': {
    text: 'You can search planning applications by address or postcode. If you\'re having trouble finding an application, try searching just the postcode rather than the full address.',
    link: { href: '/planning/search-applications/', label: 'Search planning applications' }
  },
  // Roads – roadworks 45k sessions; 82% 'not useful' on contact/check pages
  'roadwork': {
    text: 'You can check planned roadworks and closures by entering your road name or postcode. For road defects, use the report a pothole tool.',
    link: { href: '/roads-and-transport/roadworks/', label: 'Check roadworks' }
  },
  'pothole': {
    text: 'Report a pothole or road defect using our online form — you\'ll need the road name and a rough location. We aim to repair safety-critical potholes within 24 hours.',
    link: { href: '/roads-and-transport/report-pothole/', label: 'Report a pothole' }
  },
  // Parking fine – 16k sessions; 60–79% 'not useful'; missing payment web code on paperwork
  'parking fine': {
    text: 'To pay or appeal a penalty charge notice (PCN), you\'ll need the web code printed on your PCN letter. Enter it on our parking fines page.',
    link: { href: '/roads-and-transport/parking/pay-parking-fine/', label: 'Pay or appeal a parking fine' }
  },
  'pcn': {
    text: 'To pay or appeal a PCN, find the web code on your notice and enter it on our parking fines page.',
    link: { href: '/roads-and-transport/parking/pay-parking-fine/', label: 'Pay or appeal a parking fine' }
  },
  'parking': {
    text: 'We can help with parking permits, paying fines (PCN), or appealing a penalty charge notice. What do you need?',
    link: { href: '/roads-and-transport/parking/', label: 'Parking information' }
  },
  'blue badge': {
    text: 'Blue Badges help people with disabilities park closer to their destination. You can apply or renew online — the process takes about 20 minutes.',
    link: { href: '/transport-and-roads/blue-badges/', label: 'Apply for a Blue Badge' }
  },
  'default': {
    text: 'I can help you find council services. The most common things people ask about are: bin collection days, council tax, jobs, school term dates, planning applications, and road repairs. What do you need?',
    link: { href: '/all-services/', label: 'Browse all services A–Z' }
  }
};

/**
 * Very simple prototype matching: checks if any keyword is in the query.
 * In production: replace with an actual AI/LLM API call.
 */
function getResponse(query) {
  const q = query.toLowerCase();
  for (const [key, response] of Object.entries(RESPONSES)) {
    if (key !== 'default' && q.includes(key)) return response;
  }
  return RESPONSES['default'];
}

/** Creates and appends a chat bubble to the messages container */
function appendBubble({ role, text, link }) {
  const bubble = document.createElement('div');
  bubble.className = `chat-widget__bubble chat-widget__bubble--${role}`;

  if (role === 'ai') {
    bubble.innerHTML = `
      <div class="chat-widget__bubble-avatar" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      </div>
      <div class="chat-widget__bubble-text">
        ${text}
        ${link ? `<br><br><a href="${link.href}">${link.label} &rarr;</a>` : ''}
      </div>
    `;
  } else {
    bubble.innerHTML = `
      <div class="chat-widget__bubble-text">${text}</div>
    `;
  }

  chatMessages.appendChild(bubble);
  chatMessages.classList.add('has-messages');

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/** Simulate a typing indicator then show response */
function simulateResponse(query) {
  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'chat-widget__bubble chat-widget__bubble--ai';
  typing.setAttribute('aria-label', 'Assistant is typing');
  typing.innerHTML = `
    <div class="chat-widget__bubble-avatar" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    </div>
    <div class="chat-widget__bubble-text typing-dots">
      <span></span><span></span><span></span>
    </div>
  `;
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  setTimeout(() => {
    chatMessages.removeChild(typing);
    const response = getResponse(query);
    appendBubble({ role: 'ai', text: response.text, link: response.link });
  }, 900);
}

/** Handle chat form submit */
if (chatForm && chatInput && chatMessages) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query) return;

    appendBubble({ role: 'user', text: query });
    chatInput.value = '';
    simulateResponse(query);
  });
}

/** Suggestion chip clicks */
suggestionBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const query = btn.dataset.query;
    appendBubble({ role: 'user', text: query });
    simulateResponse(query);
  });
});

// =============================================================================
// Footer: auto-update copyright year
// =============================================================================
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
