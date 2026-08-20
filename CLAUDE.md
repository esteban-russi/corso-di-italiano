# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## `docs/` is the source of truth

**Before doing any work on this project, read [docs/00-master-plan.md](docs/00-master-plan.md).**

The `docs/` directory holds the versioned planning system for v2 of this app. It is the single
source of truth: the plans define what gets built, in what order, and why. Code follows the
plans. **When reality diverges from a plan, the plan is wrong until it is updated** — never
leave the two out of sync and never treat the code as self-documenting the intent.

`docs/` is **git-ignored** (decision D7). That has a direct consequence: there is no git history
for design decisions, so **the work-log tables inside each plan are the project's only decision
record.** Keeping them faithful is not bookkeeping, it is the archive.

### Where things live

| File | What it is |
| --- | --- |
| `docs/00-master-plan.md` | Vision, the north star, confirmed decisions (D1–D8), phasing, dependency order, Skills index. **Start here.** |
| `docs/01`–`docs/15` | One plan per workstream. Numbering encodes priority: 01–03 are the conversation core. |
| `docs/99-open-decisions.md` | Every question waiting on the product owner, batched. **Read this before asking them anything.** |

### The north star governs everything

*The purpose of this app is to help learners improve their conversational Italian.* Conversation
is the product; verbs and slang are scaffolding; auth, progress and social are retention
machinery. **Tie-breaker rule: when two options conflict, the one that gets the learner talking
sooner wins.** This is a valid and sufficient justification for cutting scope — cite it.

### How to read a plan

Every plan has the same sections: Goal · how it serves the north star · Scope and non-goals ·
Open decisions (with options, trade-offs and a recommendation) · Deliverables · Dependencies ·
Relevant Skills · Work log.

- **Non-goals are binding.** They are decisions, not omissions. Do not implement one because it
  seems easy.
- **Open decisions are open.** If a task depends on an unresolved decision, stop and ask — do not
  pick one silently. Check `docs/99-open-decisions.md` first; the answer may already be batched.
- **Deliverables are the unit of work.** Reference them by number.

### When to update a plan

- **Before starting a task** — confirm its deliverable, its dependencies, and that no open
  decision blocks it.
- **When a decision is made** — record it immediately, in the plan that owns it, with the reasoning
  and the date. If it is one of D1–D8, update the master plan's decisions table too.
- **When scope changes** — edit Scope/Non-goals in the same commit as the code, not later.
- **When a new dependency or Skill gap is discovered** — update that plan *and* the master plan's
  Skills index. The index is living documentation.
- **After finishing a task** — write the work-log row. **A task is not done until its work-log
  row is written.**

### How to log a task

Append one row to the plan's work log. Never rewrite history; add rows.

```
| date | task | actions taken | decisions made | complications | status |
```

- `date` — ISO, absolute. Never "today" or "last week".
- `task` — the deliverable, by number where one exists.
- `actions taken` — what was actually done, specifically. Files, not adjectives.
- `decisions made` — every judgment call, with the reasoning. This column is the decision record.
- `complications` — what went wrong, what was discovered, what got deferred. **Write these
  honestly; a blank complications column on a hard task is a missing record, not a clean one.**
- `status` — `planned` · `in progress` · `blocked on <what>` · `done` · `cancelled`.

### How decisions get recorded

| Kind | Where |
| --- | --- |
| Project-wide (stack, platform, ambition) | Master plan §2, as `D<n>`, plus a work-log row |
| Workstream-level | The plan's Open decisions table — move it from open to decided with the reasoning, plus a work-log row |
| Needs the product owner | `docs/99-open-decisions.md`, batched. **Do not interrupt them item by item.** |
| Reversed later | Record the reversal *and* the original. Never delete a decision. |

### Working with the product owner

- **Ask before assuming.** Assume only when the answer is genuinely obvious from the code or the
  README. Everything else goes in the decision queue.
- **Batch questions.** Sequence work so decision-free tasks come first; anything needing their
  input, an account, a key, or a paid service gets batched in `docs/99-open-decisions.md`.
- **Advise, don't survey.** Present real alternatives with trade-offs, then recommend one and say
  why. Never pick an option and rationalize it afterwards.
- **Two levels of detail.** A plan's first pass is high-level, enough to agree scope and phasing.
  It gets expanded into full detail when the work reaches it. Plans are expected to be revised.

### Conventions scheduled to change

Some rules below are correct today and are deliberately retired by planned work. Do not "fix"
these inconsistencies — they are tracked decisions.

| Convention | Fate |
| --- | --- |
| *"Production has no runtime npm dependencies; keep `server/` on node built-ins"* | **Retired** when auth lands. Hand-rolling JWT verification to preserve it is the wrong trade. See [11 — Auth](docs/11-auth.md) D-11-5. |
| *"Content is generated, never authored"* | **Scoped, not retired.** True for conjugation, which is rule-governed; false for slang, whose register is not derivable. See [06 — Slang](docs/06-slang-and-idioms.md) D-06-6. |
| The `localStorage` contract | **Becomes legacy** when the database lands. See [12 — Persistence](docs/12-persistence.md). |
| *"Navigation is a state machine, not a router"* | **Amended** — the machine stays, but is synced to `history` so the mobile back gesture works. See [14 — Platform](docs/14-platform-pwa.md) D-14-2. |
| `formKey` as a string identity | **Normalized into columns** at the database migration, permanently ending the schema-invalidation trap described below. See [12](docs/12-persistence.md) D-12-2. |

---

## Commands

```bash
npm install
cp .env.example .env          # set GEMINI_API_KEY

npm run start                 # Node server on :8080 — serves dist/ + /api, auto-loads .env
npm run dev                   # Vite dev server (HMR), proxies /api → :8080
npm test                      # Vitest, run once
npm run test:watch            # Vitest, watch mode
npm run typecheck             # tsc on src/, then tsc -p tsconfig.server.json on server/
npm run check                 # typecheck + test
npm run build                 # check, then vite build → dist/
npm run serve                 # build + start (production-like, single process)

make docker                   # build image, run on :8080 with $GEMINI_API_KEY
make deploy                   # Cloud Build → Artifact Registry → Cloud Run
```

**Local development needs two processes**: `npm run start` and `npm run dev` in separate
terminals. Without the Node server everything works except the Conversation section.

**Automated checks**: `npm run build` runs `npm run check` (type-check + tests) before
bundling, so a broken test fails the build and the deploy. CI runs the same thing plus a
gzipped-JS bundle budget. There is still no linter — deliberately; the guards that matter are
tests (see `src/designTokens.test.ts`).

`tsconfig.json` only includes `src/`; `server/*.mjs` is type-checked separately by
`tsconfig.server.json` (`checkJs`, `noImplicitAny` off as a stopgap until `server/` becomes
TypeScript with auth). The legacy root `class.tsx` is still never type-checked.

Tests live beside their subject as `*.test.ts` (`server/*.test.mjs` for the server) and run in
a **node** environment — no jsdom. Storage loaders are tested against the stub in
`src/test/localStorageStub.ts`; anything drawing on `Math.random` must seed it.

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
  **Always use tokens (`var(--color-*)`), never literal colors — there are now no exceptions**,
  and `src/designTokens.test.ts` fails the build on any hex, `rgb()` or CSS named colour in
  `src/`. Add the token to *both* palettes in `index.html`; the same test enforces
  light/dark symmetry. Primitives beyond `btn`/`card`/`row`/`sub`: `onPrimary`, `scrim`,
  `modalPanel`, `badge`.
- **Interface is the learner's language. Italian is content.** The learner does not speak
  Italian — that is the premise of the app — so every string they must *understand in order to
  act* renders in `en`/`es`. The rule, enforced by `src/interfaceLanguage.test.ts`:

  1. **New interface copy goes in `src/copy.ts`**, keyed, via `useCopy()`. Existing screens
     still use inline `lang === "en" ? … : …` ternaries (`T`/`t` helpers in `LangContext`);
     those migrate as [07](docs/07-design-system.md) rebuilds each screen, not before —
     migrating call sites in files about to be rewritten is wasted work.
  2. **Italian in the interface comes only from `FLAVOUR_WORDS`** in `src/copy.ts`, and only as
     celebration or greeting — never instruction, label, navigation or error text. A flavour
     word is never the sole carrier of meaning: `Quasi!` may *precede* "Here's the correct
     form:", never replace it.
  3. **Italian content lives in `src/content/italian.ts`, `curriculum/` and
     `server/prompt.mjs`** — never in `src/components/`. Marco's dialogue and the learner's
     suggested replies are content, not interface.
  4. Anything the learner must understand to act — buttons, errors, permissions, empty and
     offline states — is interface. No exceptions.

  The guard is heuristic (`ITALIAN_MARKERS`), deliberately excluding words that also read as
  Spanish or English. It catches regressions cheaply; it is not a proof.
- **Typed answers** are graded through `answersMatch` / `normalize` in `lesson/lessonUi.tsx` —
  case-, accent- and whitespace-insensitive. Route all answer comparison through it.
- **Production has no runtime npm dependencies** beyond React's build output. Keep
  `server/` on node built-ins.

## Legacy files

`class.tsx` (root) is the original single-file prototype — unused, not compiled, kept for
reference. `src/types.ts` keeps its old per-exercise types (`QuizItem`, `RiordinaItem`, …)
from that prototype; only `Lang` is live. The current model is `curriculum/types.ts`.
`PLAN.md` is the design document this version was built from.
