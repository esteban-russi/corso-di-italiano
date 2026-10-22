# DESIGN.md — Corso di Italiano Design System

**Direction:** 1 · Editorial Italian  
**Inspiration:** Italian editorial design heritage (Olivetti, Pirelli, Massimo Vignelli, *Domus* magazine)  
**Status:** Canonical design system document (Deliverables 4, 6 & 10 of `docs/07-design-system.md`)

---

## 1. Visual Theme & Atmosphere

Corso di Italiano is built around a bookish, grown-up, and calm editorial aesthetic. Rather than relying on cartoonish gamification or generic rounded SaaS components, the app treats conversational Italian practice with the dignity of mid-century Italian publication design:

- **Canvas & Ground:** Warm paper tones (`#fbf8f2` card surface on `#f3eee4` ground in light mode; `#24211c` on `#1a1815` in dark mode). The texture feels like high-grade printed stock.
- **Accents:** A single, authoritative Italian red (*Rosso Corsa* / typographic carmine `#b8202a` in light; split into fill `#cb353f` and high-contrast text `#ec6c66` in dark). Red is deployed with surgical restraint on primary actions, active navigation states, and editorial rules.
- **Tone & Mood:** Warm, welcoming, respectful, and uncluttered. Conversational text reads smoothly without visual noise, easing anxiety for learners engaging in foreign language production.

---

## 2. Typography

The typographic hierarchy pairs a generous Italian-feeling display serif with a clean, humanist grotesque sans-serif. Both are self-hosted in `public/fonts/` (WOFF2, OFL-licensed) with zero third-party font network dependencies.

| Role | Font Family | Weights | Usage |
| --- | --- | --- | --- |
| **Display / Headlines** | `DM Serif Display`, Georgia, serif (`var(--font-serif)`) | Regular 400, Italic 400 | App title, character greetings, lesson prompt sentences, pull quotes |
| **Body & UI** | `Work Sans`, system-ui, sans-serif (`var(--font-sans)`) | Regular 400, Semi-bold 600, Bold 700 | Chat bubbles, explanations, options, navigation labels, buttons |

### Typographic Rules
- **No All-Caps Italian:** Italian text must maintain correct casing. Accented capital letters (such as *È*) must never be obscured by artificial all-caps styling.
- **Pull Quotes:** Key remarks from characters (such as Marco's conversational prompts) can be styled with italic display serif accompanied by a subtle red margin line.

---

## 3. Color Tokens

All colors are declared in `index.html` as CSS custom properties and validated by `src/contrast.test.ts` (100% WCAG 2.1 AA compliant across all 54 tested combinations) and `src/designTokens.test.ts` (zero raw hex/rgb in `src/`).

### Light Mode (`:root`)
- **Canvas:** `--color-background-primary: #fbf8f2`, `--color-background-secondary: #f3eee4`, `--color-background-tint: #ebe3d5`
- **Text:** `--color-text-primary: #1c1a17` (deep ink), `--color-text-secondary: #686157` (graphite)
- **Primary Red:** `--color-primary: #b8202a`, `--color-primary-text: #b8202a`, `--color-on-primary: #fbf8f2`
- **Hover/Active:** `--color-primary-hover: #9e1a23`, `--color-primary-active: #84141c`
- **Tints:** `--color-primary-soft: #fae6e7`, `--color-primary-softer: #fdf4f4`, `--color-primary-ring: rgba(184, 32, 42, 0.35)`
- **Success:** `--color-success: #255c34`, `--color-success-soft: #e4ede0`
- **Borders:** `--color-border-primary: #d6cdbd`, `--color-border-secondary: #e2dbcd`, `--color-border-tertiary: #ebe4d7`

### Dark Mode (`[data-theme="dark"]`)
- **Canvas:** `--color-background-primary: #24211c`, `--color-background-secondary: #1a1815`, `--color-background-tint: #2e2a24`
- **Text:** `--color-text-primary: #efe8da` (warm parchment), `--color-text-secondary: #a89f90` (muted clay)
- **Primary Red:** `--color-primary: #cb353f` (button fill), `--color-primary-text: #ec6c66` (text & lines), `--color-on-primary: #f7f1e5`
- **Hover/Active:** `--color-primary-hover: #b02830`, `--color-primary-active: #991f26`
- **Tints:** `--color-primary-soft: #3f1b1e`, `--color-primary-softer: #2e1416`, `--color-primary-ring: rgba(236, 108, 102, 0.4)`
- **Success:** `--color-success: #6fb07f`, `--color-success-soft: #1a3322`
- **Borders:** `--color-border-primary: #3d382f`, `--color-border-secondary: #4d473c`, `--color-border-tertiary: #343028`

---

## 4. Spacing, Geometry & Radii

Editorial Italian favors clean architectural lines over bubble-like curvature:
- **Buttons & Interactive Tiles:** Modest, crisp border-radii (4px to 8px), or pill (9999px) for chips and audio controls.
- **Card Radii:** 8px to 14px maximum.
- **Hairlines & Dividers:** 1px solid borders (`var(--color-border-primary)` or `var(--color-border-secondary)`) separating editorial blocks.
- **Shadows:** Restrained and soft. Avoid heavy, cartoonish drop shadows:
  - `--shadow-sm: 0 1px 2px rgba(28, 26, 23, 0.06)`
  - `--shadow-md: 0 4px 14px rgba(184, 32, 42, 0.12)`

---

## 5. Information Architecture & Navigation

The layout follows **Pattern C** (decided 2026-10-21):
- **Bottom Navigation Bar:** Mobile-first anchor with four primary destinations:
  1. **Talk (Default):** Character-first entry point. Marco greets the learner immediately.
  2. **Learn:** Verb drills, conjugation paths, and targeted review.
  3. **Progress:** CEFR levels, vocabulary retention metrics, and streak status.
  4. **You:** Learner profile, avatar configuration, and settings.
- **Responsive Widening:** Desktop gracefully widens into a centered 720px reading column with comfortable gutters.

---

## 6. Language & Content Guardrails

1. **Interface Copy vs. Italian Content:**
   - All instructions, buttons, errors, status labels, and UI controls **must** be rendered in the learner's interface language (`en` or `es`).
   - Italian is strictly content (character dialogue, practice drills, and allowlisted celebratory flavour words in `FLAVOUR_WORDS` like *"Bravo!"* or *"Ciao!"*).
2. **Token Integrity:**
   - Never introduce raw hex, rgb, or named CSS color strings in `src/`. All styles must reference CSS variables (`var(--color-*)`).
