# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
cp .env.example .env          # set GEMINI_API_KEY

npm run start                 # Node server on :8080 — serves dist/ + /api, auto-loads .env
npm run dev                   # Vite dev server (HMR), proxies /api → :8080
npm run build                 # tsc --noEmit, then vite build → dist/
npm run serve                 # build + start (production-like, single process)

make docker                   # build image, run on :8080 with $GEMINI_API_KEY
make deploy                   # Cloud Build → Artifact Registry → Cloud Run
```

**Local development needs two processes**: `npm run start` and `npm run dev` in separate
terminals. Without the Node server everything works except the Conversation section.

**There is no test suite and no linter.** `npm run build` (which runs `tsc` first) is the only
automated check — run it after changes. `tsconfig.json` only includes `src/`, so
`server/*.mjs` and the legacy root `class.tsx` are never type-checked.

## Architecture

React 19 + TypeScript SPA (Vite) with a **dependency-free Node server** (`server/index.mjs`,
node built-ins only) that serves `dist/` with SPA fallback and proxies `POST /api/chat` to
Gemini. One Cloud Run service serves both. No database, no accounts — all state is
`localStorage`. See README.md for the full feature walkthrough.

### Content is generated, never authored

The heart of the app. Do not hand-write conjugation data:

- `curriculum/conjugator.ts` — rule engine for regular `-are/-ere/-ire/-ire(-isc-)`, including
  `-care/-gare → ch/gh`, `-iare` i-collapse, and `essere` participle agreement in passato prossimo.
- `curriculum/verbs.ts` — registry storing **only** irregular forms (`irregular` tense overrides,
  `participle`, `futuroStem`, `imperfettoStem`). Adding a verb = one entry.
- `curriculum/path.ts` — `UNITS`, the ordered 14-unit path. Adding a unit = one entry.
- `curriculum/lesson.ts` — `generateLesson()` composes 6 items at runtime by cycling
  `flash → choice → complete → match`, drawing distinct (verb, pronoun) targets, and building
  `choice` distractors from real forms of the same lesson's verbs.

### `formKey` is the cross-cutting identity

`` `${verbId}:${tense}:${pronounIndex}` `` (from `curriculum/lesson.ts`) is the single key
threading adaptivity through four files: lesson cards emit hit/miss formKeys →
`ProfileContext.recordLesson` scores them (miss +2, hit −1, 0 deletes) → `VerbHome` filters
weak keys by tense → `generateLesson` duplicates weak targets in the draw pool. Changing its
shape silently invalidates every learner's stored `weakForms`.

### Navigation is a state machine, not a router

`App.tsx` holds `Section` (`home` | `verbs-learning` | `conversation` | `settings`) × `Stage`
(`home` | `lesson` | `summary`). Add screens there. Provider nesting is
`Theme > Lang > Profile > Streak`.

### localStorage contract

`corso-lang` · `corso-theme` · `corso-profile` · `italiano-streak` · `corso-convo`. Each
loader must tolerate absent/corrupt JSON and merge onto a defaults object — profiles written by
older builds are still in the wild. `ProfileContext.persist` deliberately re-reads `load()`
before every write instead of using React state, so concurrent updates don't clobber each other;
preserve that pattern.

Streak (calendar days with a finished lesson) and daily goal (lessons today, resets at
midnight) are independent stores that both advance at lesson end via `LessonPlayer`.

### The API key must stay server-side

`GEMINI_API_KEY` is read only in `server/index.mjs`. **Never reintroduce a `VITE_`-prefixed
key in client code** — Vite inlines those into the browser bundle. The server accepts
`VITE_GEMINI_API_KEY` as a fallback only because old local `.env` files carry that name.

Marco's persona lives entirely in `server/prompt.mjs` (`buildChatPrompt`), built per-request
from `{uiLang, verbs, topic, name, weakVerbs}`. The client sends full history each turn;
there is no server-side session.

## Conventions

- **Styling**: inline `React.CSSProperties` over CSS custom properties defined in `index.html`.
  No CSS files, no UI library, no CSS-in-JS. Light/dark palettes switch on `data-theme` set by
  `ThemeContext`. Shared style objects (`btn`, `card`, `row`, `sub`) live in `src/utils.tsx`.
  Always use tokens (`var(--color-*)`), never literal colors — the exception is the fixed
  correction-banner palette in `formatMessage`.
- **Bilingual UI**: mostly inline `lang === "en" ? … : …` ternaries; `T` / `t` helpers exist in
  `LangContext`. Italian appears only as *content* and flavor words (`Bravo!`, `Quasi!`), never
  as an interface language.
- **Typed answers** are graded through `answersMatch` / `normalize` in `lesson/lessonUi.tsx` —
  case-, accent- and whitespace-insensitive. Route all answer comparison through it.
- **Production has no runtime npm dependencies** beyond React's build output. Keep
  `server/` on node built-ins.

## Legacy files

`class.tsx` (root) is the original single-file prototype — unused, not compiled, kept for
reference. `src/types.ts` keeps its old per-exercise types (`QuizItem`, `RiordinaItem`, …)
from that prototype; only `Lang` is live. The current model is `curriculum/types.ts`.
`PLAN.md` is the design document this version was built from.
