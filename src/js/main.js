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
// Off-canvas AI chat panel
// Chat history persists across pages via sessionStorage so users can continue
// a conversation after navigating. The header button shows "Continue chat"
// when a session exists.
// =============================================================================

const CHAT_KEY = 'bucks_chat';

// Tracks multi-turn conversation state (e.g. waiting for a postcode)
let chatState = null;

// --- Storage helpers ----------------------------------------------------------
function loadChat() {
  try { return JSON.parse(sessionStorage.getItem(CHAT_KEY)) || []; }
  catch { return []; }
}

function saveChat(messages) {
  sessionStorage.setItem(CHAT_KEY, JSON.stringify(messages));
}

// --- Header button state ------------------------------------------------------
function updateAiHeaderBtn() {
  document.querySelectorAll('.header-ai-btn').forEach(btn => {
    const label = btn.querySelector('.header-ai-btn__label');
    const hasChat = loadChat().length > 0;
    btn.classList.toggle('has-chat', hasChat);
    if (label) label.textContent = hasChat ? 'Continue chat' : 'Ask us anything';
    btn.setAttribute('aria-label', hasChat ? 'Continue chat' : 'Ask us anything');
  });
}

// --- Panel open / close -------------------------------------------------------
const chatPanel   = document.getElementById('chat-panel');
const chatOverlay = document.getElementById('chat-panel-overlay');

let panelOpener = null; // element that opened the panel, restored on close

function openPanel() {
  if (!chatPanel) return;
  panelOpener = document.activeElement;
  chatPanel.classList.add('is-open');
  chatPanel.setAttribute('aria-hidden', 'false');
  chatOverlay?.classList.add('is-visible');
  document.body.classList.add('chat-panel-open');
  renderSavedMessages();
  // Focus the input after the slide-in transition
  setTimeout(() => document.getElementById('chat-input')?.focus(), 300);
}

function closePanel() {
  if (!chatPanel) return;
  chatPanel.classList.remove('is-open');
  chatPanel.setAttribute('aria-hidden', 'true');
  chatOverlay?.classList.remove('is-visible');
  document.body.classList.remove('chat-panel-open');
  chatState = null;
  panelOpener?.focus();
}

// Open triggers: hero button + header button (both pages)
document.querySelectorAll('[data-open-chat]').forEach(el => {
  el.addEventListener('click', openPanel);
});

document.getElementById('chat-panel-close')?.addEventListener('click', closePanel);
chatOverlay?.addEventListener('click', closePanel);

// Close on Escape; focus-trap Tab within the panel while open
document.addEventListener('keydown', e => {
  if (!chatPanel?.classList.contains('is-open')) return;

  if (e.key === 'Escape') {
    closePanel();
    return;
  }

  if (e.key === 'Tab') {
    const focusable = Array.from(chatPanel.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

// --- Restore messages from sessionStorage ------------------------------------
function renderSavedMessages() {
  const msgs = loadChat();
  const container = document.getElementById('chat-messages');
  const empty     = document.getElementById('chat-empty');
  if (!container) return;

  // Don't re-render if already populated (same page, panel re-opened)
  if (container.querySelector('.chat-panel__bubble')) return;

  if (msgs.length === 0) return;

  if (empty) empty.style.display = 'none';
  msgs.forEach(m => appendBubble(m, false));
}

// --- Chat responses -----------------------------------------------------------
const RESPONSES = {
  'garden waste': {
    text: "You can subscribe to or manage your garden waste collection online. If you're having trouble with your account or payment, our support team can help.",
    link: { href: '/bins-and-recycling/garden-waste/', label: 'Manage garden waste subscription' }
  },
  'council tax': {
    text: "To pay your council tax online you'll need your account reference number (on your bill). You can pay by Direct Debit, card, or set up a standing order.",
    link: { href: '/council-tax/pay/', label: 'Pay council tax' }
  },
  'job': {
    text: 'We have a wide range of roles across the council. Search current vacancies on our jobs portal.',
    link: { href: '/jobs/', label: 'Search council jobs' }
  },
  'vacanc': {
    text: 'Browse all current vacancies at Buckinghamshire Council, including full-time, part-time, and temporary roles.',
    link: { href: '/jobs/', label: 'Search council jobs' }
  },
  'term': {
    text: "School term dates for Buckinghamshire are set countywide. Most schools follow these dates, but some academies may differ — always check with the school.",
    link: { href: '/schools-and-learning/term-dates/', label: 'View all term dates' }
  },
  'school': {
    text: 'You can apply for a primary or secondary school place online. Applications for September 2026 are open.',
    link: { href: '/schools-and-learning/apply-for-school/', label: 'Apply for a school place' }
  },
  'planning': {
    text: "You can search planning applications by address or postcode. If you're having trouble, try searching just the postcode.",
    link: { href: '/planning/search-applications/', label: 'Search planning applications' }
  },
  'roadwork': {
    text: 'Check planned roadworks and closures by entering your road name or postcode.',
    link: { href: '/roads-and-transport/roadworks/', label: 'Check roadworks' }
  },
  'pothole': {
    text: "Report a pothole or road defect using our online form. We aim to repair safety-critical potholes within 24 hours.",
    link: { href: '/roads-and-transport/report-pothole/', label: 'Report a pothole' }
  },
  'parking fine': {
    text: "To pay or appeal a penalty charge notice (PCN), you'll need the web code printed on your PCN letter.",
    link: { href: '/roads-and-transport/parking/pay-parking-fine/', label: 'Pay or appeal a parking fine' }
  },
  'pcn': {
    text: 'To pay or appeal a PCN, find the web code on your notice and enter it on our parking fines page.',
    link: { href: '/roads-and-transport/parking/pay-parking-fine/', label: 'Pay or appeal a parking fine' }
  },
  'parking': {
    text: 'We can help with parking permits, paying fines (PCN), or appealing a penalty charge notice.',
    link: { href: '/roads-and-transport/parking/', label: 'Parking information' }
  },
  'blue badge': {
    text: "Blue Badges help people with disabilities park closer to their destination. You can apply or renew online.",
    link: { href: '/transport-and-roads/blue-badges/', label: 'Apply for a Blue Badge' }
  },
  'default': {
    text: 'I can help you find council services. The most common things people ask about are: bin collection days, council tax, jobs, school term dates, planning applications, and road repairs.',
    link: { href: '/all-services/', label: 'Browse all services A–Z' }
  }
};

function getResponse(query) {
  const q = query.toLowerCase().trim();

  // Step 2 of bin/recycling flow: postcode received — return fabricated schedule
  if (chatState === 'awaiting_postcode') {
    chatState = null;
    const postcode = query.trim().toUpperCase();
    return {
      text: `Thanks — here are the collection days for <strong>${postcode}</strong>:<br><br>
<strong>Food waste caddy</strong> — every Wednesday<br>
<strong>Recycling bin</strong> — every other Wednesday (next collection: Wed 4 March)<br>
<strong>General waste bin</strong> — every other Wednesday (next collection: Wed 11 March)<br>
<strong>Garden waste</strong> — fortnightly on Tuesdays, if you have an active subscription (next: Tue 3 March)<br><br>
Collections may move by one day after a bank holiday.`,
      link: { href: '/bins-and-recycling/bin-collection-days/', label: 'View your full schedule and set up reminders' }
    };
  }

  // Step 1: bin/recycling/collection queries → ask for postcode
  if (q.includes('bin') || q.includes('recycl') || q.includes('rubbish') || q.includes('waste') || q.includes('collection')) {
    chatState = 'awaiting_postcode';
    return {
      text: "I can look up your bin collection days. What's your postcode?",
      link: null
    };
  }

  for (const [key, response] of Object.entries(RESPONSES)) {
    if (key !== 'default' && q.includes(key)) return response;
  }
  return RESPONSES['default'];
}

// --- Bubble rendering ---------------------------------------------------------
function appendBubble({ role, text, link }, save = true) {
  const container = document.getElementById('chat-messages');
  const empty     = document.getElementById('chat-empty');
  if (!container) return;

  if (empty) empty.style.display = 'none';

  const bubble = document.createElement('div');
  bubble.className = `chat-panel__bubble chat-panel__bubble--${role}`;

  if (role === 'ai') {
    bubble.innerHTML = `
      <div class="chat-panel__bubble-avatar" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      </div>
      <div class="chat-panel__bubble-text">
        ${text}
        ${link ? `<br><br><a href="${link.href}">${link.label} &rarr;</a>` : ''}
      </div>`;
  } else {
    bubble.innerHTML = `<div class="chat-panel__bubble-text">${text}</div>`;
  }

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;

  if (save) {
    const msgs = loadChat();
    msgs.push({ role, text, link: link || null });
    saveChat(msgs);
    updateAiHeaderBtn();
  }
}

// --- Typing indicator then response ------------------------------------------
function simulateResponse(query) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const typing = document.createElement('div');
  typing.className = 'chat-panel__bubble chat-panel__bubble--ai';
  typing.setAttribute('aria-label', 'Assistant is typing');
  typing.innerHTML = `
    <div class="chat-panel__bubble-avatar" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    </div>
    <div class="chat-panel__bubble-text typing-dots">
      <span></span><span></span><span></span>
    </div>`;
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    container.removeChild(typing);
    const response = getResponse(query);
    appendBubble({ role: 'ai', text: response.text, link: response.link });
  }, 900);
}

// --- Chat form submit ---------------------------------------------------------
const chatForm  = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

chatForm?.addEventListener('submit', e => {
  e.preventDefault();
  const query = chatInput.value.trim();
  if (!query) return;
  appendBubble({ role: 'user', text: query });
  chatInput.value = '';
  simulateResponse(query);
});

// --- Suggestion chip clicks --------------------------------------------------
document.querySelectorAll('.chat-panel__suggestion').forEach(btn => {
  btn.addEventListener('click', () => {
    const query = btn.dataset.query;
    if (!chatPanel?.classList.contains('is-open')) openPanel();
    // small delay so panel is open before bubbles appear
    setTimeout(() => {
      appendBubble({ role: 'user', text: query });
      simulateResponse(query);
    }, chatPanel?.classList.contains('is-open') ? 0 : 350);
  });
});

// Initialise header button state on every page
updateAiHeaderBtn();

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
// Sticky header: shrink logo after scrolling away from top
// =============================================================================
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  const onScroll = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 0);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // set correct state on load
}

// =============================================================================
// Footer: auto-update copyright year
// =============================================================================
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =============================================================================
// Header search button → navigate to /search/
// =============================================================================
document.getElementById('search-trigger')?.addEventListener('click', () => {
  window.location.href = '/search/';
});

// =============================================================================
// Search results page
// =============================================================================
if (location.pathname.includes('/search')) {
  const RESULTS = [
    { title: 'Check your bin collection day', desc: 'Find out when your bins and boxes are collected. Enter your postcode to get your personalised collection schedule.', href: '/bins-and-recycling/bin-collection-days/' },
    { title: 'Report a missed bin collection', desc: "Let us know if your bin wasn't collected on your scheduled day. We'll investigate and rearrange if needed.", href: '/bins-and-recycling/bin-collections/report-missed/' },
    { title: 'Garden waste subscription', desc: 'Sign up for or renew your garden waste collection service. Collections run from March to November.', href: '/bins-and-recycling/garden-waste/' },
    { title: 'Household waste recycling centres', desc: 'Find your nearest recycling centre, check opening times, and see what materials are accepted.', href: '/bins-and-recycling/recycling-centres/' },
    { title: 'Council tax – pay online', desc: 'Pay your council tax bill, set up a Direct Debit, or apply for a discount or exemption.', href: '/council-tax/pay/' },
    { title: 'Planning applications – search and comment', desc: 'Search for planning applications in Buckinghamshire, view documents, and submit comments on proposals.', href: '/planning/search-applications/' },
    { title: 'School term dates', desc: 'View term dates and school holidays for Buckinghamshire maintained schools and academies.', href: '/schools-and-learning/term-dates/' },
    { title: 'Apply for a school place', desc: "Apply for your child's first school place or transfer to a new school. Applications for September 2026 are now open.", href: '/schools-and-learning/apply-for-school/' },
    { title: 'Resident parking permits', desc: 'Apply for, renew or update a resident parking permit for your zone. Check which zone your address is in.', href: '/roads-and-transport/parking/permits/' },
    { title: 'Housing benefit and council tax support', desc: 'Apply for help with your rent or council tax if you are on a low income or receiving benefits.', href: '/housing/benefits/' },
    { title: 'Register to vote', desc: 'Register to vote or update your details on the electoral register. You must be registered to vote in elections.', href: '/council-and-elections/register-to-vote/' },
    { title: 'Report a pothole or road defect', desc: 'Report a pothole, damaged road surface, or other highway defect. Safety-critical repairs are prioritised within 24 hours.', href: '/roads-and-transport/report-pothole/' },
    { title: 'Bulky waste collection', desc: "Book a collection for large items that can't go in your normal bins, such as furniture, mattresses and appliances.", href: '/bins-and-recycling/bulky-waste/' },
    { title: 'Blue Badge – apply or renew', desc: "Apply for a Blue Badge parking permit for people with disabilities. Check if you're eligible and apply online.", href: '/transport-and-roads/blue-badges/' },
    { title: 'Freedom of Information requests', desc: 'Make a request for information held by Buckinghamshire Council under the Freedom of Information Act 2000.', href: '/foi/' },
  ];

  const PER_PAGE = 5;
  let currentPage = 1;

  const params = new URLSearchParams(location.search);
  const query  = params.get('q') || '';

  // Pre-fill search input
  const searchInput = document.getElementById('search-page-input');
  if (searchInput) searchInput.value = query;

  // Simple relevance filter: any result whose title/desc contains a query word
  function getFiltered() {
    if (!query.trim()) return RESULTS;
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return RESULTS.filter(r =>
      words.some(w => r.title.toLowerCase().includes(w) || r.desc.toLowerCase().includes(w))
    );
  }

  function renderPage(page) {
    const filtered = getFiltered();
    const total    = filtered.length;
    const totalPages = Math.ceil(total / PER_PAGE);
    currentPage = Math.min(Math.max(1, page), totalPages || 1);

    const start   = (currentPage - 1) * PER_PAGE;
    const slice   = filtered.slice(start, start + PER_PAGE);

    // Meta
    const metaEl = document.getElementById('search-meta');
    if (metaEl) {
      if (total === 0) {
        metaEl.textContent = query ? `No results for '${query}'` : '';
      } else {
        const from = start + 1;
        const to   = Math.min(start + PER_PAGE, total);
        metaEl.textContent = query
          ? `Showing ${from}–${to} of ${total} results for '${query}'`
          : `Showing ${from}–${to} of ${total} results`;
      }
    }

    // Results list
    const listEl   = document.getElementById('search-results');
    const noResEl  = document.getElementById('search-no-results');
    if (listEl) {
      listEl.innerHTML = '';
      if (slice.length === 0) {
        listEl.hidden = true;
        if (noResEl) noResEl.hidden = false;
      } else {
        listEl.hidden = false;
        if (noResEl) noResEl.hidden = true;
        slice.forEach(r => {
          const li = document.createElement('li');
          li.className = 'search-result';
          li.innerHTML = `
            <h2 class="search-result__title"><a href="${r.href}">${r.title}</a></h2>
            <p class="search-result__desc">${r.desc}</p>`;
          listEl.appendChild(li);
        });
      }
    }

    // Pagination
    const paginationEl = document.getElementById('search-pagination');
    if (paginationEl) {
      paginationEl.innerHTML = '';
      if (totalPages <= 1) return;

      const prevBtn = document.createElement('button');
      prevBtn.className = `search-pagination__btn${currentPage === 1 ? ' search-pagination__btn--disabled' : ''}`;
      prevBtn.setAttribute('aria-label', 'Previous page');
      prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg> Previous`;
      function goToPage(p) { renderPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      if (currentPage > 1) prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
      paginationEl.appendChild(prevBtn);

      for (let p = 1; p <= totalPages; p++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `search-pagination__btn${p === currentPage ? ' search-pagination__btn--active' : ''}`;
        pageBtn.textContent = p;
        pageBtn.setAttribute('aria-label', `Page ${p}`);
        if (p === currentPage) pageBtn.setAttribute('aria-current', 'page');
        if (p !== currentPage) pageBtn.addEventListener('click', () => goToPage(p));
        paginationEl.appendChild(pageBtn);
      }

      const nextBtn = document.createElement('button');
      nextBtn.className = `search-pagination__btn${currentPage === totalPages ? ' search-pagination__btn--disabled' : ''}`;
      nextBtn.setAttribute('aria-label', 'Next page');
      nextBtn.innerHTML = `Next <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>`;
      if (currentPage < totalPages) nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
      paginationEl.appendChild(nextBtn);
    }
  }

  renderPage(1);

  // Feedback buttons
  document.getElementById('feedback-yes')?.addEventListener('click', () => {
    document.getElementById('search-feedback-actions').hidden = true;
    document.getElementById('search-feedback-thanks').hidden = false;
  });
  document.getElementById('feedback-no')?.addEventListener('click', () => {
    document.getElementById('search-feedback-actions').hidden = true;
    document.getElementById('search-feedback-thanks').hidden = false;
  });
}
