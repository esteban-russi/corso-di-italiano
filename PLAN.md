# Corso di Italiano — Optimization Plan

## Goal

Turn the app from a "pick-your-own-exercises" tool into a **verb-mastery app** with a
Duolingo-style lesson flow, an agentic conversation partner, and real personalization.
Everything — content model, lessons, conversation — is oriented toward **understanding and
using Italian verbs**.

Success = a deployed app where a learner can:
1. Choose interface language **English or Spanish** on first launch (Italian is used only for
   flavor words like *Ciao!*, *Andiamo!*, *Bravo!* and for the learning content itself).
2. Follow a **leveled path** of predefined verb lessons, **pick a specific verb/verbs**, or do a
   **quick practice** — each lesson auto-composes several exercise types and averages **≤ 2 min**.
3. Have an **agentic conversation** (in the Conversation section, not as an exercise) that
   remembers them, steers toward target verbs, and offers predefined reply options.
4. Get a **personalized** experience: name, adaptive difficulty (weak verbs resurface), a daily
   goal tied to the streak, and preferred conversation topics.

## Architecture decisions (confirmed with product owner)

- **Interface language:** `en | es`, chosen on first launch, switchable in Settings. Italian
  remains the *target* language (content) + flavor words.
- **Conversation AI:** small **Node backend proxy** on Cloud Run holds the Gemini key
  (`GEMINI_API_KEY`, no longer shipped in the client bundle) and exposes `POST /api/chat`.
  Same service serves the built static site.
- **Content:** expand verbs **and** tenses, organized into **levels**.
- **Personalization:** name & greeting, adaptive difficulty, daily goal, topic preferences.

## Robust verb + progression model (proposed)

The old model hard-coded 8 verbs × present tense with hand-written exercise arrays. That does not
scale to more verbs/tenses. New model:

### 1. Conjugation engine (`src/curriculum/conjugator.ts`)
Rule-based conjugator for regular `-are / -ere / -ire (+ -isc-)` verbs across the supported
tenses, plus per-verb **irregular override tables**. Forms are *generated*, so adding a verb =
adding one registry entry (and overrides only where irregular). This keeps content correct and
scalable.

Supported tenses (each gated by level):
- `presente` (L1) · `passato_prossimo` (L2) · `imperfetto` (L3) · `futuro_semplice` (L4)

### 2. Verb registry (`src/curriculum/verbs.ts`)
Each verb: `{ id, infinitive, en, es, group, auxiliary, level, irregular }` where `irregular`
holds only the forms that deviate from the rules. Verbs are assigned a **level 1–5**: common,
high-frequency, easy verbs (essere, avere, fare, parlare…) at low levels; rarer/irregular ones
later.

### 3. Curriculum path (`src/curriculum/path.ts`)
An ordered list of **units** (the Duolingo-style path). Each unit = `{ level, tense, verbIds,
title }`. Units unlock as the previous one is completed; progress is stored in `localStorage`.

### 4. Lesson generator (`src/curriculum/lesson.ts`)
Given `(verbIds, tense)` it composes a lesson of **5–7 micro-exercises** (~15–20s each → ≤2 min
avg), mixing exercise types. Most items are generated from the conjugation engine (always
correct); a curated sentence pool enriches lower levels. Adaptive difficulty weights in the
learner's known-weak verbs/forms.

## Exercise types (verb section)
Kept: `intro` (conjugation table), `flash-quiz`, `multiple-choice`, `completa`, `riordina`,
`traduci`, `abbina`. **Removed from exercises:** `chat` → moved to the Conversation section.

## Backend impact on prompts
The conversation prompt is assembled server-side from: target verbs + tense, the learner's
**UI language** (used for corrections/explanations — `en` or `es`), their name, preferred topic,
and a compact **memory** blob (weak verbs, recent corrections) sent by the client each turn.

## Working agreement
- Separate branch `feat/lesson-engine-and-conversation`, **atomic commits** per phase.
- Build + verify before deploy, then `make deploy`.
