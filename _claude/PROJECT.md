# Bucks Prototype — Project Context

## What this is
A prototype homepage for Buckinghamshire Council, built to explore a smarter, task-led design direction. Not a production build — a design/UX proof of concept for stakeholder review.

Live at: https://bucks-prototype.fly.dev
GitHub: https://github.com/benenright/bucks-prototype
Git baseline tag: `v1.0-baseline` (stable point before major changes)

---

## Tech stack
- **Vite** (multi-page build, vanilla JS, no framework)
- **SCSS** (BEM naming, `$space-*` 8pt scale, `$color-*` tokens, `@include bp(md/lg)` breakpoints)
- **Nginx** serving the `dist/` folder in a Docker container on **Fly.io**
- Deploy: `fly deploy` from project root

---

## Project structure
```
/
├── index.html                              # Homepage
├── bins-and-recycling/
│   ├── index.html                          # Section index page
│   └── bin-collection-days/index.html      # Content page template
├── public/assets/images/                   # Hero sunset images + other assets
├── src/
│   ├── js/main.js                          # All JS (hero rotation, nav, AI chat, footer year)
│   └── styles/
│       ├── main.scss                       # Imports all partials
│       ├── _variables.scss                 # Tokens: colours, spacing, fonts
│       ├── _base.scss                      # Reset, global typography (h1=3.5rem @md+)
│       ├── _header.scss                    # Site header / nav
│       ├── _hero.scss                      # Hero section + .page-banner
│       ├── _top-tasks.scss                 # Task tile grid
│       ├── _cards.scss                     # News/service cards
│       ├── _footer.scss                    # Footer
│       ├── _seasonal.scss                  # Seasonal alert banner
│       └── _content-page.scss              # Content page layout (added this session)
├── vite.config.js                          # Entry points for each HTML page
├── Dockerfile
├── fly.toml
└── nginx.conf
```

---

## Pages built so far

### Homepage (`/`)
- Hero: random sunset photo background (sunset2–8), dark navy gradient overlay (0.3→1.0 opacity), rotating via JS
- AI chat widget (prototype — keyword matching, not real AI)
- Top tasks grid (task tiles with icons)
- News/updates cards
- Seasonal alert component

### Bins & Recycling index (`/bins-and-recycling/`)
- `.page-banner` — dark navy header section, same style as hero gradient
- Top task tiles moved inside `.page-banner` (bleed into banner, no separate "Top Tasks" heading)
- Task tiles have `task-tile__sublabel` descriptions always visible here (override mobile default)

### Bin Collection Days content page (`/bins-and-recycling/bin-collection-days/`)
- White background content page template
- `.content-header`: white breadcrumb, H1, anchor links with CSS chevron arrows (↘ via border trick)
- `.content-layout`: 2-col grid on desktop (main + sticky sidebar), stacked on mobile
- `.prose`: body content with h2 sections, blue link colour, `.btn-primary` (blue CTA) with `:not(.btn-primary)` specificity fix
- `.related-pages` sidebar widget: thick top border in `$color-primary-dark`

---

## Key design decisions / gotchas

### Colours
- Primary blue: `$color-primary` — used for links, buttons, sidebar border
- Dark navy: `rgba(44, 45, 132, 1)` — hero/banner background (hardcoded in JS gradient)
- Button text: `.btn-primary` uses `$color-primary-fg` (#fff) — needed `:not(.btn-primary)` on `.prose a` to prevent link colour override

### Typography
- Global H1: `3.5rem` at `@include bp(md)` (set in `_base.scss`)
- `.page-banner h1`: inherits global — no font-size override in `_hero.scss`

### Hero background
- Images live in `public/assets/images/`: sunset2.jpeg, sunset3.jpeg, sunset4.jpeg, sunset5.jpg, sunset6.jpg, sunset7.jpg, sunset8.jpeg
- JS sets `heroEl.style.backgroundImage` to `linear-gradient(...), url('${img}')`
- Adding new images: update `heroImages` array in `src/js/main.js`

### Anchor links (content page)
- CSS `::after` chevron: `border-right + border-bottom + rotate(45deg)`, 8px × 8px, `top: -3px` to vertically align
- `gap: 8px` between text and chevron

### H2 spacing in `.prose`
- `margin-top: $space-12; padding-top: $space-12; border-top: 1px solid $color-border-light`
- No `:first-child` exception (it was matching every h2 since each is first child of its `<section>`)

### Vite multi-page
- Each new HTML page needs an entry in `vite.config.js` under `rollupOptions.input`

---

## Session log

### Session 1 (context window summary + this session)
- Moved top tasks tiles inside `.page-banner` on bins index
- Added `task-tile__sublabel` descriptions to all task tiles
- Fixed global H1 to 3.5rem
- Created content page template (`bin-collection-days`)
- Anchor link arrow iterations → settled on CSS border chevron `::after`
- Hero gradient opacity: 0.5 → 0.3
- Hero image rotation: removed sunset.jpeg, added sunset5/6/7/8
- Attempted hero background blur → reverted (too complex, imperceptible at subtle values)
- Created git repo on GitHub, tagged `v1.0-baseline`, deployed to Fly.io
