# Corso di Italiano 🇮🇹

A small, focused web app for **mastering Italian verbs**. It combines a Duolingo-style
path of short lessons with an AI conversation partner ("Marco"), and it keeps everything
on the learner's device — no accounts, no database.

The interface language is **English or Spanish**; Italian is the *content* language
(plus flavour words like *Ciao!*, *Bravo!*, *Quasi!*).

---

## What the app does today

### First launch
A full-screen **language gate** asks for the interface language (English / Español). The
choice is stored in `localStorage` (`corso-lang`) and can be changed later from the header
toggle or Settings.

### Main menu
Three sections, plus a header showing the app title, the current section subtitle, the
🍕 streak badge and the language toggle.

| Section | What it is |
| --- | --- |
| 📚 **Verbs** | Short guided lessons — the learning core. |
| 💬 **Conversation** | Free chat in Italian with Marco, an AI Italian friend. |
| ⚙️ **Settings** | Interface language, name, daily goal, topics, theme. |

### 📚 Verbs section
Opens on a greeting (using the learner's name if set) and a **daily-goal progress bar**,
then three modes:

- **Path** — the 14 ordered units in [src/curriculum/path.ts](src/curriculum/path.ts).
  Each unit pairs a small verb set with one tense. Units unlock in sequence: a unit is
  playable only once the previous one is complete; completed units are ticked, the next one
  is highlighted with a **START** badge. Completion is stored per unit id.
- **Pick verbs** — choose any verbs (grouped by level 1–5) plus any of the four tenses,
  then start a custom lesson.
- **Quick practice** — two one-tap options:
  - *Quick practice*: a random 4-verb mix drawn from verbs seen in completed units
    (falling back to level 1–2 verbs), present tense, no intro card.
  - *Review weak spots*: rebuilds a lesson from the forms the learner misses most.
    Disabled until there is miss data.

### Lesson player
A lesson is **6 exercises** (~2 minutes), generated at runtime rather than authored,
preceded by an `intro` conjugation table on path and custom lessons:

- `flash` — type the form for a given pronoun.
- `choice` — pick the correct form from 4 options (distractors are real forms from the
  same lesson's verbs).
- `complete` — fill the blank in `Io _____ (parlare)`.
- `match` — match 4 pronouns to shuffled forms.

The pattern cycles `flash → choice → complete → match → …`, drawing distinct
(verb, pronoun) targets where possible. Typed answers are compared **case-, accent- and
whitespace-insensitively**. During a lesson the learner can toggle the conjugation table
at any time, sees a progress bar and a live error count, and gets an exit confirmation
(progress in an abandoned lesson is not saved).

### Lesson summary
Shows errors, elapsed time and the current streak, plus a "new day recorded" note, a
daily-goal-met banner, and 🍕 streak milestones at 7 / 30 / 100 / 365 days.

### 💬 Conversation section
- **Focus verbs** (up to 6) default to verbs from completed units, or common ones for a
  new learner; they are editable inline.
- **Topic** chips (travel, food, football, music, weekend, work, movies, daily life);
  the learner's preferred topic from Settings is preselected.
- Marco opens with a greeting naming the focus verbs, offers **quick-reply suggestions**,
  and renders `**bold**` highlights on target verbs.
- The whole thread, focus verbs and topic are persisted (`corso-convo`), so the chat
  survives a reload; "New conversation" clears it.
- Each turn posts to `POST /api/chat` with the UI language, focus verbs, topic, learner
  name, weak verbs and the full history. The **API key never reaches the browser** — the
  Node server holds it and builds the system prompt.

Marco's persona (see [server/prompt.mjs](server/prompt.mjs)): speaks only Italian, writes
corrections/explanations in the learner's interface language, corrects at most 1–2 errors
per message with a `📝 "wrong" → "**right**"` line, keeps replies short, asks one question
at a time, and steers toward the focus verbs.

### ⚙️ Settings
Interface language, name (used in greetings and in the chat prompt), daily goal
(1/2/3/5 lessons), enjoyed conversation topics, and theme (light / dark / **system**, which
follows `prefers-color-scheme` live).

### Progress, streaks and adaptivity
Everything lives in `localStorage`:

| Key | Contents |
| --- | --- |
| `corso-lang` | `en` \| `es` — also marks the language gate as answered |
| `corso-theme` | `light` \| `dark` \| `system` |
| `corso-profile` | name, completed unit ids, weak-form scores, daily goal, lessons today, topics |
| `italiano-streak` | current streak, longest streak, last activity date |
| `corso-convo` | conversation messages, focus verbs, topic |

- **Weak forms** are tracked per `verbId:tense:pronounIndex`: a miss adds 2, a hit
  subtracts 1, zero drops the entry. Weak keys are duplicated in the lesson draw pool, so
  the forms you get wrong come back more often — and feed *Review weak spots*.
- **Streak** counts calendar days (local time) with at least one finished lesson:
  consecutive days extend it, a gap resets the current streak while the longest is kept.
- **Daily goal** counts finished lessons today and resets at midnight.

---

## Content model

Conjugations are **generated, not hand-written**, so adding content is a data-only change.

- [src/curriculum/conjugator.ts](src/curriculum/conjugator.ts) — rule-based engine for
  regular `-are / -ere / -ire / -ire(-isc-)` verbs, including the `-care/-gare → -ch/-gh`
  and `-iare → -i` spelling rules; irregular tenses come from per-verb override tables.
- [src/curriculum/verbs.ts](src/curriculum/verbs.ts) — 27 verbs, each with translations,
  group, auxiliary, a difficulty **level 1–5**, and only the forms that are irregular
  (full tense overrides, irregular participle, futuro stem, imperfetto stem).
- Tenses taught: **presente**, **passato prossimo** (with `essere`/`avere` agreement on the
  participle), **imperfetto**, **futuro semplice**.
- [src/curriculum/path.ts](src/curriculum/path.ts) — the 14-unit ordered path.
- [src/curriculum/lesson.ts](src/curriculum/lesson.ts) — the lesson composer described above.

Adding a verb = one registry entry. Adding a unit = one entry in `UNITS`.

---

## Architecture

```
Browser (React 19 SPA, Vite)
   │  POST /api/chat  {uiLang, verbs, topic, name, weakVerbs, messages}
   ▼
server/index.mjs  (dependency-free Node http server)
   ├── GET  /api/health         → "ok"
   ├── POST /api/chat           → builds the system prompt, calls Gemini, returns {reply}
   └── GET  *                   → serves dist/ with SPA fallback + immutable asset caching
                                   (GEMINI_API_KEY stays server-side)
```

- **Frontend:** React 19 + TypeScript, Vite, no UI library, no router — sections are React
  state. Styling is inline styles over CSS custom properties defined in
  [index.html](index.html) (light/dark palettes switched by `data-theme`).
- **Backend:** a single `.mjs` file using only Node built-ins — no Express, no npm deps in
  production beyond React's build output.
- **Model:** `gemini-flash-latest` by default (an alias that tracks the current Flash
  model), overridable via `GEMINI_MODEL`.
- **Deployment:** one Cloud Run service serves both the static SPA and `/api`.

### Project layout
```
index.html                 shell + design tokens (light/dark)
src/
  App.tsx                  section/stage state machine + header
  main.tsx                 React entry
  config.ts                verb badge colours, conversation topics
  types.ts                 Lang + legacy exercise types
  utils.tsx                shared style helpers, **bold** message formatting
  context/                 Lang, Theme, Profile, Streak providers (localStorage-backed)
  curriculum/              conjugator, verb registry, path, lesson generator, types
  components/              LanguageGate, MainMenu, VerbHome, Conversation, Settings,
                           ConjTable, LessonSummary, StreakBadge, LangToggle
  components/lesson/       LessonPlayer, LessonCards, lessonUi
server/
  index.mjs                static server + /api/chat proxy
  prompt.mjs               Marco's system prompt builder
class.tsx                  original single-file prototype (unused, kept for reference)
PLAN.md                    the optimization plan this version was built from
```

---

## Running it

### Prerequisites
Node 22+ and a Google AI Studio API key (only needed for the Conversation section).

```bash
npm install
cp .env.example .env      # then set GEMINI_API_KEY
```

`.env` is git-ignored. `GEMINI_API_KEY` is read server-side only; the legacy
`VITE_GEMINI_API_KEY` name is also accepted.

### Development (two processes)
```bash
npm run start   # Node server on :8080 — serves /api/chat, loads .env if present
npm run dev     # Vite dev server with HMR, proxying /api → :8080
```
Open the Vite URL (usually http://localhost:5173). Without the Node server the app works
except for the Conversation section.

### Production-like, single process
```bash
npm run serve   # tsc && vite build, then node server/index.mjs on :8080
```

### Docker
```bash
make docker     # build the image and run it on :8080 with your GEMINI_API_KEY
```

### Deploy to Cloud Run
```bash
make deploy     # Cloud Build → Artifact Registry → gcloud run deploy
```
The key is injected as a **runtime env var**, never baked into the image. Targets are
overridable at the top of the [Makefile](Makefile) (`GCP_PROJECT`, `GCP_REGION`,
`CLOUD_RUN_SERVICE`).

### Scripts
| Command | Does |
| --- | --- |
| `npm run dev` | Vite dev server (HMR, `/api` proxied to :8080) |
| `npm run build` | Type-check (`tsc`) then build to `dist/` |
| `npm run preview` | Preview the built bundle (no `/api`) |
| `npm run start` | Node server on `PORT` (default 8080), serving `dist/` + `/api` |
| `npm run serve` | `build` + `start` |

### Environment variables
| Variable | Default | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | — | Required for `/api/chat`; server-side only |
| `GEMINI_MODEL` | `gemini-flash-latest` | Gemini model to call |
| `PORT` | `8080` | Port the Node server listens on |

Without a key the server still serves the SPA and answers `/api/chat` with
`(Server missing GEMINI_API_KEY)`.
