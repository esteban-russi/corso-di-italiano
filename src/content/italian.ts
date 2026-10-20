// ---------------------------------------------------------------------------
// Italian *content*: words the learner is meant to read, absorb or send. This
// is the target language, so it is never localized.
//
// The boundary (docs/04-interface-language.md): Italian belongs here, in
// `curriculum/` and in `server/prompt.mjs`. It does NOT belong in
// `src/components/`, where every string is interface text in the learner's own
// language. `src/interfaceLanguage.test.ts` enforces that.
// ---------------------------------------------------------------------------

/** Marco's opening line. `verbs` are the focus infinitives, already formatted. */
export function marcoGreeting(verbs: string, name?: string): string {
  const who = name ? ` ${name}` : "";
  return `Ciao${who}! 😊 Sono Marco, il tuo amico italiano. Oggi possiamo usare i verbi **${verbs}**. Di cosa vuoi parlare?`;
}

/** Openers offered before the learner has said anything. */
export const CONVERSATION_OPENERS: string[] = [
  "Ciao Marco! Come stai?",
  "Raccontami del tuo weekend",
  "Cosa fai oggi?",
];

/** Replies offered mid-conversation, including the two escape hatches. */
export const CONVERSATION_REPLIES: string[] = [
  "Come si dice...?",
  "Dammi una sfida! 💪",
  "Non ho capito, puoi ripetere?",
];
