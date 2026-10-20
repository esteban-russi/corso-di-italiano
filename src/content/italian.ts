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

/** Testing app sample text for speech synthesis */
export const LAB_SAMPLE_TTS = "Buongiorno! Vorrei un caffè espresso e un cornetto caldo, grazie.";

/** Testing app passage for barge-in interruption tests */
export const LAB_BARGE_IN_PASSAGE = "Oggi a Roma è una giornata meravigliosa di sole. Ho fatto una passeggiata vicino al Colosseo e poi mi sono fermato per mangiare un piatto di pasta fresca. Tu cosa hai fatto di bello?";

/** Simulated mock reply for offline benchmarking */
export function mockItalianReply(charName: string, city: string): string {
  return `Ti ho capito benissimo! [${charName} - ${city}] Risposta di prova generata con successo dal provider mock.`;
}
