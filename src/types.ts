export type Lang = "it" | "es";

export type Verb = {
  id: string;
  infinitive: string;
  conjugations: string[];
};

export type ExerciseType =
  | "intro"
  | "flash-quiz"
  | "multiple-choice"
  | "completa"
  | "riordina"
  | "traduci"
  | "abbina"
  | "chat";

export type QuizItem = {
  pronoun: string;
  verb: string;
  answer: string;
  verbs: string[];
};

export type MultipleChoiceItem = {
  questionIt: string;
  questionEs: string;
  options: string[];
  answer: string;
  explainIt: string;
  explainEs: string;
  verbs: string[];
};

export type CompletaItem = {
  sentence: string;
  answer: string;
  verb: string;
  hintIt: string;
  hintEs: string;
  verbs: string[];
};

export type RiordinaItem = {
  words: string[];
  answer: string;
  translationIt: string | null;
  translationEs: string | null;
  verbs: string[];
};

export type TraduciItem = {
  es: string;
  answer: string;
  accept: string[];
  hintIt: string;
  hintEs: string;
  verbs: string[];
};

export type AbbinaItem = {
  verb: string;
  pairs: { pronoun: string; form: string }[];
  verbs: string[];
};
