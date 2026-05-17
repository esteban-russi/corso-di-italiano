import { useState, createContext, useContext, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  LANGUAGE CONTEXT                                                   */
/* ------------------------------------------------------------------ */
type Lang = "it" | "es";
const LangCtx = createContext<{ lang: Lang; toggle: () => void }>({
  lang: "it",
  toggle: () => {},
});
function useLang() {
  return useContext(LangCtx);
}
function T({ it, es }: { it: string; es: string }) {
  const { lang } = useLang();
  return <>{lang === "it" ? it : es}</>;
}
function t(lang: Lang, it: string, es: string) {
  return lang === "it" ? it : es;
}

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */
const conjugations: Record<string, string[]> = {
  fare: ["faccio", "fai", "fa", "facciamo", "fate", "fanno"],
  andare: ["vado", "vai", "va", "andiamo", "andate", "vanno"],
  dire: ["dico", "dici", "dice", "diciamo", "dite", "dicono"],
};
const pronouns = ["io", "tu", "lui/lei", "noi", "voi", "loro"];

const quizItems = [
  { pronoun: "Tu", verb: "Andare", answer: "vai" },
  { pronoun: "Io", verb: "Fare", answer: "faccio" },
  { pronoun: "Loro", verb: "Dire", answer: "dicono" },
  { pronoun: "Noi", verb: "Andare", answer: "andiamo" },
  { pronoun: "Lui/Lei", verb: "Fare", answer: "fa" },
  { pronoun: "Voi", verb: "Dire", answer: "dite" },
  { pronoun: "Io", verb: "Andare", answer: "vado" },
  { pronoun: "Tu", verb: "Dire", answer: "dici" },
  { pronoun: "Loro", verb: "Fare", answer: "fanno" },
  { pronoun: "Noi", verb: "Fare", answer: "facciamo" },
  { pronoun: "Voi", verb: "Andare", answer: "andate" },
  { pronoun: "Lui/Lei", verb: "Dire", answer: "dice" },
];

const multipleChoiceItems = [
  {
    questionIt: "Completa: \"Io ___ al cinema stasera.\"",
    questionEs: "Completa: \"Io ___ al cinema stasera.\"",
    options: ["vado", "vai", "andiamo", "vanno"],
    answer: "vado",
    explainIt: "Il soggetto è \"io\", quindi serve la 1ª persona singolare di andare: \"vado\".",
    explainEs: "El sujeto es \"io\", así que se necesita la 1ª persona singular de andare: \"vado\".",
  },
  {
    questionIt: "Quale frase è corretta?",
    questionEs: "¿Cuál frase es correcta?",
    options: [
      "Noi facciamo colazione insieme.",
      "Noi faciamo colazione insieme.",
      "Noi faccio colazione insieme.",
      "Noi fanno colazione insieme.",
    ],
    answer: "Noi facciamo colazione insieme.",
    explainIt: "La 1ª persona plurale di fare è \"facciamo\" (con doppia C).",
    explainEs: "La 1ª persona plural de fare es \"facciamo\" (con doble C).",
  },
  {
    questionIt: "Completa: \"Cosa ___ voi di questo film?\"",
    questionEs: "Completa: \"Cosa ___ voi di questo film?\"",
    options: ["dicono", "dite", "dici", "diciamo"],
    answer: "dite",
    explainIt: "Con \"voi\" si usa la 2ª persona plurale di dire: \"dite\".",
    explainEs: "Con \"voi\" se usa la 2ª persona plural de dire: \"dite\".",
  },
  {
    questionIt: "Completa: \"Loro ___ un corso di cucina.\"",
    questionEs: "Completa: \"Loro ___ un corso di cucina.\"",
    options: ["faccio", "fate", "fa", "fanno"],
    answer: "fanno",
    explainIt: "Il soggetto è \"loro\", 3ª persona plurale di fare: \"fanno\".",
    explainEs: "El sujeto es \"loro\", 3ª persona plural de fare: \"fanno\".",
  },
  {
    questionIt: "Completa: \"Tu dove ___ domani?\"",
    questionEs: "Completa: \"Tu dove ___ domani?\"",
    options: ["vado", "va", "vai", "andate"],
    answer: "vai",
    explainIt: "Con \"tu\" si usa la 2ª persona singolare di andare: \"vai\".",
    explainEs: "Con \"tu\" se usa la 2ª persona singular de andare: \"vai\".",
  },
  {
    questionIt: "Completa: \"Lui non ___ mai niente.\"",
    questionEs: "Completa: \"Lui non ___ mai niente.\"",
    options: ["dico", "dici", "dice", "dicono"],
    answer: "dice",
    explainIt: "Con \"lui\" si usa la 3ª persona singolare di dire: \"dice\".",
    explainEs: "Con \"lui\" se usa la 3ª persona singular de dire: \"dice\".",
  },
  {
    questionIt: "Quale frase è corretta?",
    questionEs: "¿Cuál frase es correcta?",
    options: [
      "Io dicio sempre la verità.",
      "Io dico sempre la verità.",
      "Io dice sempre la verità.",
      "Io dicono sempre la verità.",
    ],
    answer: "Io dico sempre la verità.",
    explainIt: "La 1ª persona singolare di dire è \"dico\".",
    explainEs: "La 1ª persona singular de dire es \"dico\".",
  },
  {
    questionIt: "Completa: \"Noi ___ in montagna ogni inverno.\"",
    questionEs: "Completa: \"Noi ___ in montagna ogni inverno.\"",
    options: ["vado", "vai", "andiamo", "vanno"],
    answer: "andiamo",
    explainIt: "Con \"noi\" si usa la 1ª persona plurale di andare: \"andiamo\".",
    explainEs: "Con \"noi\" se usa la 1ª persona plural de andare: \"andiamo\".",
  },
  {
    questionIt: "Quale frase ha un errore?",
    questionEs: "¿Cuál frase tiene un error?",
    options: [
      "Io faccio colazione alle 8.",
      "Tu fai sempre tardi.",
      "Lui fannono un errore.",
      "Noi facciamo sport.",
    ],
    answer: "Lui fannono un errore.",
    explainIt: "\"Fannono\" non esiste. La forma corretta è \"fa\" (3ª persona singolare).",
    explainEs: "\"Fannono\" no existe. La forma correcta es \"fa\" (3ª persona singular).",
  },
  {
    questionIt: "Completa: \"Voi ___ sport il fine settimana?\"",
    questionEs: "Completa: \"Voi ___ sport il fine settimana?\"",
    options: ["faccio", "fai", "fate", "fanno"],
    answer: "fate",
    explainIt: "Con \"voi\" si usa la 2ª persona plurale di fare: \"fate\".",
    explainEs: "Con \"voi\" se usa la 2ª persona plural de fare: \"fate\".",
  },
];

const completaItems = [
  {
    sentence: "Domani io ___ al mercato per comprare la frutta.",
    answer: "vado",
    verb: "andare",
    hintIt: "verbo: andare, 1ª persona singolare",
    hintEs: "verbo: andare, 1ª persona singular",
  },
  {
    sentence: "Che cosa ___ tu questo fine settimana?",
    answer: "fai",
    verb: "fare",
    hintIt: "verbo: fare, 2ª persona singolare",
    hintEs: "verbo: fare, 2ª persona singular",
  },
  {
    sentence: "I miei genitori ___ sempre la verità.",
    answer: "dicono",
    verb: "dire",
    hintIt: "verbo: dire, 3ª persona plurale",
    hintEs: "verbo: dire, 3ª persona plural",
  },
  {
    sentence: "Noi ___ una passeggiata ogni sera dopo cena.",
    answer: "facciamo",
    verb: "fare",
    hintIt: "verbo: fare, 1ª persona plurale",
    hintEs: "verbo: fare, 1ª persona plural",
  },
  {
    sentence: "Voi ___ in palestra il martedì e il giovedì?",
    answer: "andate",
    verb: "andare",
    hintIt: "verbo: andare, 2ª persona plurale",
    hintEs: "verbo: andare, 2ª persona plural",
  },
  {
    sentence: "Lui non ___ mai niente, è molto silenzioso.",
    answer: "dice",
    verb: "dire",
    hintIt: "verbo: dire, 3ª persona singolare",
    hintEs: "verbo: dire, 3ª persona singular",
  },
  {
    sentence: "Io ___ sempre quello che penso.",
    answer: "dico",
    verb: "dire",
    hintIt: "verbo: dire, 1ª persona singolare",
    hintEs: "verbo: dire, 1ª persona singular",
  },
  {
    sentence: "Loro ___ in montagna ogni inverno per sciare.",
    answer: "vanno",
    verb: "andare",
    hintIt: "verbo: andare, 3ª persona plurale",
    hintEs: "verbo: andare, 3ª persona plural",
  },
];

const riordinaItems = [
  {
    words: ["io", "vado", "al", "cinema", "stasera"],
    answer: "io vado al cinema stasera",
    translationIt: null,
    translationEs: "Yo voy al cine esta noche.",
  },
  {
    words: ["noi", "facciamo", "colazione", "insieme", "domani"],
    answer: "noi facciamo colazione insieme domani",
    translationIt: null,
    translationEs: "Nosotros desayunamos juntos mañana.",
  },
  {
    words: ["cosa", "dici", "tu", "di", "questo", "libro", "?"],
    answer: "cosa dici tu di questo libro ?",
    translationIt: null,
    translationEs: "¿Qué dices tú de este libro?",
  },
  {
    words: ["loro", "vanno", "sempre", "in", "vacanza", "ad", "agosto"],
    answer: "loro vanno sempre in vacanza ad agosto",
    translationIt: null,
    translationEs: "Ellos siempre van de vacaciones en agosto.",
  },
  {
    words: ["voi", "fate", "sport", "il", "fine", "settimana", "?"],
    answer: "voi fate sport il fine settimana ?",
    translationIt: null,
    translationEs: "¿Ustedes hacen deporte el fin de semana?",
  },
  {
    words: ["lui", "dice", "che", "fa", "freddo", "oggi"],
    answer: "lui dice che fa freddo oggi",
    translationIt: null,
    translationEs: "Él dice que hace frío hoy.",
  },
];

const traduciItems = [
  {
    es: "Yo voy al supermercado todos los días.",
    answer: "io vado al supermercato tutti i giorni",
    accept: [
      "io vado al supermercato tutti i giorni",
      "vado al supermercato tutti i giorni",
    ],
    hintIt: "supermercato = supermercado, tutti i giorni = todos los días",
    hintEs: "supermercato = supermercado, tutti i giorni = todos los días",
  },
  {
    es: "¿Qué haces tú mañana por la mañana?",
    answer: "cosa fai tu domani mattina",
    accept: [
      "cosa fai tu domani mattina",
      "cosa fai domani mattina",
      "tu cosa fai domani mattina",
    ],
    hintIt: "domani mattina = mañana por la mañana",
    hintEs: "domani mattina = mañana por la mañana",
  },
  {
    es: "Nosotros decimos siempre la verdad.",
    answer: "noi diciamo sempre la verità",
    accept: [
      "noi diciamo sempre la verità",
      "diciamo sempre la verità",
    ],
    hintIt: "la verità = la verdad, sempre = siempre",
    hintEs: "la verità = la verdad, sempre = siempre",
  },
  {
    es: "Ellos van al parque con los niños.",
    answer: "loro vanno al parco con i bambini",
    accept: [
      "loro vanno al parco con i bambini",
      "vanno al parco con i bambini",
    ],
    hintIt: "il parco = el parque, i bambini = los niños",
    hintEs: "il parco = el parque, i bambini = los niños",
  },
  {
    es: "¿Qué dice ella del nuevo profesor?",
    answer: "cosa dice lei del nuovo professore",
    accept: [
      "cosa dice lei del nuovo professore",
      "lei cosa dice del nuovo professore",
      "che cosa dice lei del nuovo professore",
    ],
    hintIt: "il professore = el profesor, nuovo = nuevo",
    hintEs: "il professore = el profesor, nuovo = nuevo",
  },
];

const abbinaItems = [
  {
    verb: "fare",
    pairs: [
      { pronoun: "io", form: "faccio" },
      { pronoun: "tu", form: "fai" },
      { pronoun: "lui/lei", form: "fa" },
      { pronoun: "noi", form: "facciamo" },
      { pronoun: "voi", form: "fate" },
      { pronoun: "loro", form: "fanno" },
    ],
  },
  {
    verb: "andare",
    pairs: [
      { pronoun: "io", form: "vado" },
      { pronoun: "tu", form: "vai" },
      { pronoun: "lui/lei", form: "va" },
      { pronoun: "noi", form: "andiamo" },
      { pronoun: "voi", form: "andate" },
      { pronoun: "loro", form: "vanno" },
    ],
  },
  {
    verb: "dire",
    pairs: [
      { pronoun: "io", form: "dico" },
      { pronoun: "tu", form: "dici" },
      { pronoun: "lui/lei", form: "dice" },
      { pronoun: "noi", form: "diciamo" },
      { pronoun: "voi", form: "dite" },
      { pronoun: "loro", form: "dicono" },
    ],
  },
];

const conversacion = [
  {
    role: "amico" as const,
    text: "Ciao, come stai? 😊 Io sono Marco, il tuo amico italiano! Vuoi parlare di un argomento in particolare, oppure ti suggerisco io un tema? Possiamo parlare del weekend, dei viaggi, della cucina... tu cosa preferisci?",
  },
];

/* ------------------------------------------------------------------ */
/*  STYLE HELPERS                                                      */
/* ------------------------------------------------------------------ */
const btn = (active = false): React.CSSProperties => ({
  padding: "8px 20px",
  borderRadius: 8,
  border: `0.5px solid var(--color-border-secondary)`,
  background: active
    ? "var(--color-background-secondary)"
    : "var(--color-background-primary)",
  cursor: "pointer",
  fontWeight: 500,
  fontSize: 14,
  color: "var(--color-text-primary)",
});
const card: React.CSSProperties = {
  background: "var(--color-background-primary)",
  border: "0.5px solid var(--color-border-tertiary)",
  borderTop: "3px solid #009246",
  borderRadius: 12,
  padding: "20px 20px",
};
const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 14px",
  background: "var(--color-background-secondary)",
  borderRadius: 10,
  border: "0.5px solid var(--color-border-tertiary)",
};
const sub: React.CSSProperties = {
  fontSize: 14,
  color: "var(--color-text-secondary)",
};

/* ------------------------------------------------------------------ */
/*  SHARED COMPONENTS                                                  */
/* ------------------------------------------------------------------ */
function LangToggle() {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      title={lang === "it" ? "Mostra in spagnolo" : "Mostrar en italiano"}
      style={{
        padding: "4px 12px",
        borderRadius: 20,
        border: "0.5px solid var(--color-border-secondary)",
        background: "var(--color-background-secondary)",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 500,
        color: "var(--color-text-secondary)",
      }}
    >
      {lang === "it" ? "🇪🇸 Ver en Español" : "🇮🇹 Italiano"}
    </button>
  );
}

function SectionHeader({
  emoji,
  titleIt,
  titleEs,
  descIt,
  descEs,
}: {
  emoji: string;
  titleIt: string;
  titleEs: string;
  descIt: string;
  descEs: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
      }}
    >
      <span style={{ fontSize: 22 }} aria-hidden="true">
        {emoji}
      </span>
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>
          <T it={titleIt} es={titleEs} />
        </h3>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
          <T it={descIt} es={descEs} />
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CONJUGATION TABLE                                                  */
/* ------------------------------------------------------------------ */
function ConjTable() {
  const { lang } = useLang();
  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
        <T it="Presente indicativo — tabella delle coniugazioni" es="Presente indicativo — tabla de conjugaciones" />
      </h3>
      <p style={{ ...sub, marginBottom: 12 }}>
        <T
          it="Tre verbi irregolari essenziali. Studiali prima dei blocchi."
          es="Tres verbos irregulares esenciales. Estúdialos antes de los bloques."
        />
      </p>
      <div style={{ overflowX: "auto", marginTop: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              <th
                style={{
                  padding: "8px 12px",
                  textAlign: "left",
                  color: "var(--color-text-secondary)",
                  fontWeight: 500,
                  borderBottom: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <T it="Pronome" es="Pronombre" />
              </th>
              {["Fare", "Andare", "Dire"].map((v) => (
                <th
                  key={v}
                  style={{
                    padding: "8px 12px",
                    textAlign: "center",
                    fontWeight: 500,
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {v}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pronouns.map((p, i) => (
              <tr
                key={p}
                style={{
                  background:
                    i % 2 === 0
                      ? "var(--color-background-secondary)"
                      : "var(--color-background-primary)",
                }}
              >
                <td
                  style={{
                    padding: "8px 12px",
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  {p}
                </td>
                {(["fare", "andare", "dire"] as const).map((v) => (
                  <td
                    key={v}
                    style={{
                      padding: "8px 12px",
                      textAlign: "center",
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {conjugations[v][i]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          marginTop: 18,
          padding: "12px 16px",
          background: "var(--color-background-secondary)",
          borderRadius: 8,
          fontSize: 13,
          color: "var(--color-text-secondary)",
          borderLeft: "3px solid #AFA9EC",
        }}
      >
        <b style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
          <T it="Trucco di memoria:" es="Truco de memoria:" />
        </b>{" "}
        <T
          it="fare e dire condividono la radice irregolare al singolare (faccio / fai / fa · dico / dici / dice) e tornano al modello regolare al plurale, tranne la 3ª plurale."
          es="fare y dire comparten la raíz irregular en singular (faccio / fai / fa · dico / dici / dice) y vuelven al patrón regular en plural, excepto la 3ª plural."
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BLOQUE 1 — FLASH QUIZ                                             */
/* ------------------------------------------------------------------ */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function BloqueFlashQuiz() {
  const { lang } = useLang();
  const [quiz, setQuiz] = useState(() => shuffle(quizItems).slice(0, 8));
  const [answers, setAnswers] = useState<string[]>(Array(8).fill(""));
  const [checked, setChecked] = useState(false);
  const update = (i: number, v: string) => {
    const a = [...answers];
    a[i] = v;
    setAnswers(a);
  };
  const correct = (i: number) =>
    answers[i].trim().toLowerCase() === quiz[i].answer;
  const reset = () => {
    const next = shuffle(quizItems).slice(0, 8);
    setQuiz(next);
    setAnswers(Array(8).fill(""));
    setChecked(false);
  };
  return (
    <div>
      <p style={{ ...sub, marginBottom: 16 }}>
        <T
          it="Scrivi la coniugazione corretta per ogni coppia. Veloce!"
          es="Escribe la conjugación correcta para cada par. ¡Rápido!"
        />
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        {quiz.map((q, i) => (
          <div key={i} style={row}>
            <span
              style={{
                fontWeight: 500,
                fontSize: 14,
                minWidth: 24,
                color: "var(--color-text-secondary)",
              }}
            >
              {i + 1}.
            </span>
            <span style={{ fontSize: 14, flex: 1 }}>
              <b style={{ fontWeight: 500 }}>{q.pronoun}</b> +{" "}
              <b style={{ fontWeight: 500 }}>{q.verb}</b>
            </span>
            <input
              value={answers[i]}
              onChange={(e) => update(i, e.target.value)}
              disabled={checked}
              placeholder="..."
              style={{
                width: 110,
                fontSize: 14,
                padding: "6px 10px",
                borderRadius: 8,
                border: `0.5px solid ${
                  checked
                    ? correct(i)
                      ? "#1D9E75"
                      : "#E24B4A"
                    : "var(--color-border-secondary)"
                }`,
                background: checked
                  ? correct(i)
                    ? "#E1F5EE"
                    : "#FCEBEB"
                  : "var(--color-background-primary)",
                color: "var(--color-text-primary)",
                outline: "none",
              }}
            />
            {checked && (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: correct(i) ? "#0F6E56" : "#A32D2D",
                  minWidth: 70,
                }}
              >
                {correct(i) ? "✓ Esatto!" : "✗ → " + quiz[i].answer}
              </span>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {!checked ? (
          <button onClick={() => setChecked(true)} style={btn()}>
            <T it="Verifica risposte" es="Verificar respuestas" />
          </button>
        ) : (
          <button onClick={reset} style={btn()}>
            <T it="Riprova" es="Intentar de nuevo" />
          </button>
        )}
        {checked && (
          <span style={{ ...sub, alignSelf: "center" }}>
            {answers.filter((_, i) => correct(i)).length}/{quiz.length}{" "}
            <T it="corrette" es="correctas" />
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BLOQUE 2 — MULTIPLE CHOICE                                        */
/* ------------------------------------------------------------------ */
function BloqueMultipleChoice() {
  const { lang } = useLang();
  const [items] = useState(() => shuffle(multipleChoiceItems).slice(0, 6));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const item = items[currentIdx];
  const isCorrect = selected === item?.answer;

  const handleSelect = (opt: string) => {
    if (answered) return;
    setSelected(opt);
  };

  const handleConfirm = () => {
    if (!selected || answered) return;
    setAnswered(true);
    if (selected === item.answer) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentIdx + 1 >= items.length) {
      setFinished(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>
          {score === items.length ? "🎉" : score >= items.length / 2 ? "👏" : "💪"}
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
          <T it="Risultato" es="Resultado" />
        </h3>
        <p style={{ fontSize: 16, marginBottom: 16, color: "var(--color-text-secondary)" }}>
          {score}/{items.length} <T it="risposte corrette" es="respuestas correctas" />
        </p>
        <button onClick={handleReset} style={btn()}>
          <T it="Riprova con nuove domande" es="Intentar con nuevas preguntas" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <p style={{ ...sub, marginBottom: 16 }}>
        <T
          it="Seleziona la risposta corretta per ogni domanda."
          es="Selecciona la respuesta correcta para cada pregunta."
        />{" "}
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          ({currentIdx + 1}/{items.length})
        </span>
      </p>

      {/* Question */}
      <div
        style={{
          padding: "14px 18px",
          background: "var(--color-background-secondary)",
          borderRadius: 10,
          border: "0.5px solid var(--color-border-tertiary)",
          marginBottom: 14,
          fontSize: 15,
          fontWeight: 500,
        }}
      >
        {lang === "it" ? item.questionIt : item.questionEs}
      </div>

      {/* Options */}
      <div style={{ display: "grid", gap: 8 }}>
        {item.options.map((opt, i) => {
          const isThis = selected === opt;
          const rightAnswer = opt === item.answer;
          let bg = "var(--color-background-primary)";
          let borderColor = isThis ? "var(--color-border-primary)" : "var(--color-border-tertiary)";
          if (answered) {
            if (rightAnswer) {
              bg = "#E1F5EE";
              borderColor = "#1D9E75";
            } else if (isThis && !rightAnswer) {
              bg = "#FCEBEB";
              borderColor = "#E24B4A";
            }
          } else if (isThis) {
            bg = "var(--color-background-secondary)";
          }
          return (
            <div
              key={i}
              onClick={() => handleSelect(opt)}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                cursor: answered ? "default" : "pointer",
                border: `0.5px solid ${borderColor}`,
                background: bg,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
                transition: "background 0.15s",
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: `2px solid ${answered && rightAnswer ? "#1D9E75" : answered && isThis ? "#E24B4A" : isThis ? "#3C3489" : "var(--color-border-secondary)"}`,
                  background: isThis ? (answered ? (rightAnswer ? "#1D9E75" : "#E24B4A") : "#3C3489") : "transparent",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isThis && (
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                )}
              </span>
              <span style={{ flex: 1 }}>{opt}</span>
              {answered && rightAnswer && <span style={{ fontSize: 14 }}>✅</span>}
              {answered && isThis && !rightAnswer && <span style={{ fontSize: 14 }}>❌</span>}
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            background: isCorrect ? "#E1F5EE" : "#FAECE7",
            borderRadius: 8,
            fontSize: 13,
            color: isCorrect ? "#0F6E56" : "#993C1D",
          }}
        >
          {isCorrect ? (
            <><b>✓ <T it="Esatto!" es="¡Correcto!" /></b> {lang === "it" ? item.explainIt : item.explainEs}</>
          ) : (
            <><b>✗ <T it="Non è corretto." es="No es correcto." /></b> {lang === "it" ? item.explainIt : item.explainEs}</>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "center" }}>
        {!answered ? (
          <button
            onClick={handleConfirm}
            disabled={!selected}
            style={{ ...btn(), opacity: selected ? 1 : 0.5, cursor: selected ? "pointer" : "not-allowed" }}
          >
            <T it="Conferma" es="Confirmar" />
          </button>
        ) : (
          <button onClick={handleNext} style={btn()}>
            {currentIdx + 1 >= items.length
              ? <T it="Vedi risultato" es="Ver resultado" />
              : <T it="Domanda successiva →" es="Siguiente pregunta →" />}
          </button>
        )}
        <span style={{ ...sub, marginLeft: "auto" }}>
          {score}/{currentIdx + (answered ? 1 : 0)} <T it="corrette" es="correctas" />
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BLOQUE 3 — COMPLETA LA FRASE                                      */
/* ------------------------------------------------------------------ */
function BloqueCompleta() {
  const { lang } = useLang();
  const [items] = useState(() => shuffle(completaItems).slice(0, 6));
  const [answers, setAnswers] = useState<string[]>(Array(6).fill(""));
  const [checked, setChecked] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const update = (i: number, v: string) => {
    const a = [...answers];
    a[i] = v;
    setAnswers(a);
  };
  const correct = (i: number) =>
    answers[i].trim().toLowerCase() === items[i].answer;
  return (
    <div>
      <p style={{ ...sub, marginBottom: 16 }}>
        <T
          it="Completa ogni frase con la forma corretta del verbo."
          es="Completa cada frase con la forma correcta del verbo."
        />
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item, i) => {
          const parts = item.sentence.split("___");
          return (
            <div key={i} style={{ ...row, flexWrap: "wrap" }}>
              <span
                style={{
                  fontWeight: 500,
                  fontSize: 14,
                  minWidth: 24,
                  color: "var(--color-text-secondary)",
                }}
              >
                {i + 1}.
              </span>
              <span style={{ fontSize: 14, flex: 1 }}>
                {parts[0]}
                <input
                  value={answers[i]}
                  onChange={(e) => update(i, e.target.value)}
                  disabled={checked}
                  placeholder="___"
                  style={{
                    width: 100,
                    fontSize: 14,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: `0.5px solid ${
                      checked
                        ? correct(i)
                          ? "#1D9E75"
                          : "#E24B4A"
                        : "var(--color-border-secondary)"
                    }`,
                    background: checked
                      ? correct(i)
                        ? "#E1F5EE"
                        : "#FCEBEB"
                      : "var(--color-background-primary)",
                    color: "var(--color-text-primary)",
                    outline: "none",
                    margin: "0 4px",
                  }}
                />
                {parts[1]}
              </span>
              {checked && !correct(i) && (
                <span style={{ fontSize: 12, color: "#A32D2D", fontWeight: 500 }}>
                  → {items[i].answer}
                </span>
              )}
              {checked && correct(i) && (
                <span style={{ fontSize: 12, color: "#0F6E56", fontWeight: 500 }}>
                  ✓
                </span>
              )}
              {showHints && !checked && (
                <span style={{ fontSize: 11, color: "#185FA5", fontStyle: "italic" }}>
                  {lang === "it" ? item.hintIt : item.hintEs}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {!checked ? (
          <>
            <button onClick={() => setChecked(true)} style={btn()}>
              <T it="Verifica" es="Verificar" />
            </button>
            <button
              onClick={() => setShowHints((h) => !h)}
              style={{
                ...btn(),
                fontSize: 12,
                padding: "6px 16px",
                color: "var(--color-text-secondary)",
                border: "0.5px solid var(--color-border-tertiary)",
                background: "transparent",
              }}
            >
              <T it={showHints ? "Nascondi suggerimenti" : "Suggerimenti"} es={showHints ? "Ocultar pistas" : "Pistas"} />
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setAnswers(Array(6).fill(""));
              setChecked(false);
            }}
            style={btn()}
          >
            <T it="Riprova" es="Intentar de nuevo" />
          </button>
        )}
        {checked && (
          <span style={{ ...sub, alignSelf: "center" }}>
            {answers.filter((_, i) => correct(i)).length}/{items.length}{" "}
            <T it="corrette" es="correctas" />
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BLOQUE 4 — RIORDINA LA FRASE                                      */
/* ------------------------------------------------------------------ */
function BloqueRiordina() {
  const { lang } = useLang();
  const [itemIdx, setItemIdx] = useState(0);
  const item = riordinaItems[itemIdx];
  const [available, setAvailable] = useState(() => shuffle(item.words));
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  const pick = (word: string, idx: number) => {
    if (result) return;
    setSelected((s) => [...s, word]);
    setAvailable((a) => a.filter((_, i) => i !== idx));
  };
  const unpick = (idx: number) => {
    if (result) return;
    const word = selected[idx];
    setSelected((s) => s.filter((_, i) => i !== idx));
    setAvailable((a) => [...a, word]);
  };
  const check = () => {
    const attempt = selected.join(" ").toLowerCase();
    setResult(attempt === item.answer ? "correct" : "wrong");
  };
  const next = () => {
    const ni = (itemIdx + 1) % riordinaItems.length;
    setItemIdx(ni);
    setAvailable(shuffle(riordinaItems[ni].words));
    setSelected([]);
    setResult(null);
  };
  const reset = () => {
    setAvailable(shuffle(item.words));
    setSelected([]);
    setResult(null);
  };
  return (
    <div>
      <p style={{ ...sub, marginBottom: 16 }}>
        <T
          it="Metti le parole nell'ordine giusto per formare una frase corretta."
          es="Pon las palabras en el orden correcto para formar una frase."
        />{" "}
        <span style={{ fontSize: 12 }}>
          ({itemIdx + 1}/{riordinaItems.length})
        </span>
      </p>

      {/* selected area */}
      <div
        style={{
          minHeight: 48,
          padding: "10px 14px",
          background: result === "correct" ? "#E1F5EE" : result === "wrong" ? "#FCEBEB" : "var(--color-background-secondary)",
          borderRadius: 10,
          border: "0.5px solid var(--color-border-tertiary)",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {selected.length === 0 && (
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)", fontStyle: "italic" }}>
            <T it="Clicca sulle parole qui sotto..." es="Haz clic en las palabras abajo..." />
          </span>
        )}
        {selected.map((w, i) => (
          <span
            key={i}
            onClick={() => unpick(i)}
            style={{
              padding: "5px 14px",
              borderRadius: 8,
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-secondary)",
              cursor: result ? "default" : "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {w}
          </span>
        ))}
      </div>

      {/* available words */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {available.map((w, i) => (
          <span
            key={i}
            onClick={() => pick(w, i)}
            style={{
              padding: "5px 14px",
              borderRadius: 8,
              background: "#EEEDFE",
              color: "#3C3489",
              border: "0.5px solid #d5d3f0",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {w}
          </span>
        ))}
      </div>

      {result === "wrong" && (
        <p style={{ fontSize: 13, color: "#A32D2D", marginBottom: 10 }}>
          <T it="Non è corretto. La risposta giusta è:" es="No es correcto. La respuesta correcta es:" />{" "}
          <i>{item.answer}</i>
        </p>
      )}
      {result === "correct" && item.translationEs && (
        <p style={{ fontSize: 13, color: "#0F6E56", marginBottom: 10 }}>
          ✓ <T it="Perfetto!" es="¡Perfecto!" />{" "}
          <span style={{ color: "var(--color-text-secondary)" }}>
            ({item.translationEs})
          </span>
        </p>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        {!result ? (
          <button onClick={check} disabled={selected.length === 0} style={{ ...btn(), opacity: selected.length ? 1 : 0.5 }}>
            <T it="Verifica" es="Verificar" />
          </button>
        ) : (
          <>
            <button onClick={reset} style={btn()}>
              <T it="Ricomincia" es="Reiniciar" />
            </button>
            <button onClick={next} style={btn()}>
              <T it="Frase successiva →" es="Siguiente frase →" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BLOQUE 5 — TRADUCI (translation from Spanish)                     */
/* ------------------------------------------------------------------ */
function BloqueTraduci() {
  const { lang } = useLang();
  const [items] = useState(() => shuffle(traduciItems).slice(0, 4));
  const [answers, setAnswers] = useState<string[]>(Array(4).fill(""));
  const [checked, setChecked] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const update = (i: number, v: string) => {
    const a = [...answers];
    a[i] = v;
    setAnswers(a);
  };
  const correct = (i: number) =>
    items[i].accept.some(
      (a) =>
        answers[i].trim().toLowerCase().replace(/[?.!,]/g, "").replace(/\s+/g, " ") ===
        a.toLowerCase()
    );
  return (
    <div>
      <p style={{ ...sub, marginBottom: 16 }}>
        <T
          it="Traduci queste frasi dallo spagnolo all'italiano usando fare, andare o dire."
          es="Traduce estas frases del español al italiano usando fare, andare o dire."
        />
      </p>
      <div style={{ display: "grid", gap: 14 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              padding: "12px 16px",
              background: "var(--color-background-secondary)",
              borderRadius: 10,
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
              <span style={{ fontWeight: 500, fontSize: 14, minWidth: 24, color: "var(--color-text-secondary)" }}>
                {i + 1}.
              </span>
              <span style={{ fontSize: 14, fontStyle: "italic" }}>🇪🇸 {item.es}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 34 }}>
              <span style={{ fontSize: 14 }}>🇮🇹</span>
              <input
                value={answers[i]}
                onChange={(e) => update(i, e.target.value)}
                disabled={checked}
                placeholder={t(lang, "Scrivi in italiano...", "Escribe en italiano...")}
                style={{
                  flex: 1,
                  fontSize: 14,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: `0.5px solid ${
                    checked
                      ? correct(i)
                        ? "#1D9E75"
                        : "#E24B4A"
                      : "var(--color-border-secondary)"
                  }`,
                  background: checked
                    ? correct(i)
                      ? "#E1F5EE"
                      : "#FCEBEB"
                    : "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                }}
              />
            </div>
            {showHints && !checked && (
              <p style={{ fontSize: 11, color: "#185FA5", marginTop: 6, marginLeft: 34, fontStyle: "italic" }}>
                {lang === "it" ? item.hintIt : item.hintEs}
              </p>
            )}
            {checked && !correct(i) && (
              <p style={{ fontSize: 12, color: "#A32D2D", marginTop: 6, marginLeft: 34 }}>
                → {item.answer}
              </p>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {!checked ? (
          <>
            <button onClick={() => setChecked(true)} style={btn()}>
              <T it="Verifica" es="Verificar" />
            </button>
            <button
              onClick={() => setShowHints((h) => !h)}
              style={{
                ...btn(),
                fontSize: 12,
                padding: "6px 16px",
                color: "var(--color-text-secondary)",
                border: "0.5px solid var(--color-border-tertiary)",
                background: "transparent",
              }}
            >
              <T it={showHints ? "Nascondi" : "Suggerimenti"} es={showHints ? "Ocultar" : "Pistas"} />
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setAnswers(Array(4).fill(""));
              setChecked(false);
            }}
            style={btn()}
          >
            <T it="Riprova" es="Intentar de nuevo" />
          </button>
        )}
        {checked && (
          <span style={{ ...sub, alignSelf: "center" }}>
            {answers.filter((_, i) => correct(i)).length}/{items.length}{" "}
            <T it="corrette" es="correctas" />
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BLOQUE 6 — ABBINA (matching)                                       */
/* ------------------------------------------------------------------ */
function BloqueAbbina() {
  const { lang } = useLang();
  const [verbIdx, setVerbIdx] = useState(0);
  const set = abbinaItems[verbIdx];
  const [shuffledForms] = useState(() => abbinaItems.map((s) => shuffle(s.pairs.map((p) => p.form))));
  const forms = shuffledForms[verbIdx];
  const [matches, setMatches] = useState<Record<string, string | null>>({});
  const [selPronoun, setSelPronoun] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const handlePronoun = (p: string) => {
    if (checked) return;
    setSelPronoun(p);
  };
  const handleForm = (f: string) => {
    if (checked || !selPronoun) return;
    // remove previous match for this pronoun or form
    const newM = { ...matches };
    for (const k in newM) {
      if (newM[k] === f) newM[k] = null;
    }
    newM[selPronoun] = f;
    setMatches(newM);
    setSelPronoun(null);
  };
  const isCorrect = (pronoun: string) => {
    const pair = set.pairs.find((p) => p.pronoun === pronoun);
    return matches[pronoun] === pair?.form;
  };
  const allMatched = set.pairs.every((p) => matches[p.pronoun]);
  const reset = () => {
    setMatches({});
    setSelPronoun(null);
    setChecked(false);
  };
  const nextVerb = () => {
    const ni = (verbIdx + 1) % abbinaItems.length;
    setVerbIdx(ni);
    setMatches({});
    setSelPronoun(null);
    setChecked(false);
  };
  const matchedForms = new Set(Object.values(matches).filter(Boolean));

  return (
    <div>
      <p style={{ ...sub, marginBottom: 16 }}>
        <T
          it={`Abbina ogni pronome alla forma corretta di "${set.verb}". Clicca un pronome, poi la forma.`}
          es={`Empareja cada pronombre con la forma correcta de "${set.verb}". Haz clic en un pronombre, luego en la forma.`}
        />{" "}
        <span style={{ fontSize: 12 }}>
          ({verbIdx + 1}/{abbinaItems.length})
        </span>
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* pronouns column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 4 }}>
            <T it="Pronomi" es="Pronombres" />
          </span>
          {set.pairs.map((p) => (
            <div
              key={p.pronoun}
              onClick={() => handlePronoun(p.pronoun)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                cursor: checked ? "default" : "pointer",
                border: `0.5px solid ${
                  selPronoun === p.pronoun
                    ? "#3C3489"
                    : checked
                    ? isCorrect(p.pronoun)
                      ? "#1D9E75"
                      : "#E24B4A"
                    : "var(--color-border-tertiary)"
                }`,
                background:
                  selPronoun === p.pronoun
                    ? "#EEEDFE"
                    : checked
                    ? isCorrect(p.pronoun)
                      ? "#E1F5EE"
                      : "#FCEBEB"
                    : "var(--color-background-secondary)",
                fontSize: 14,
                fontWeight: 500,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{p.pronoun}</span>
              {matches[p.pronoun] && (
                <span style={{ color: "var(--color-text-secondary)", fontWeight: 400 }}>
                  → {matches[p.pronoun]}
                </span>
              )}
            </div>
          ))}
        </div>
        {/* forms column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 4 }}>
            <T it="Forme" es="Formas" />
          </span>
          {forms.map((f) => (
            <div
              key={f}
              onClick={() => handleForm(f)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                cursor: checked || !selPronoun ? "default" : "pointer",
                border: `0.5px solid ${
                  matchedForms.has(f)
                    ? "var(--color-border-secondary)"
                    : "var(--color-border-tertiary)"
                }`,
                background: matchedForms.has(f)
                  ? "var(--color-background-secondary)"
                  : "#EEEDFE",
                fontSize: 14,
                fontWeight: 500,
                color: matchedForms.has(f) ? "var(--color-text-secondary)" : "#3C3489",
                opacity: matchedForms.has(f) && !checked ? 0.5 : 1,
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {!checked ? (
          <button
            onClick={() => setChecked(true)}
            disabled={!allMatched}
            style={{ ...btn(), opacity: allMatched ? 1 : 0.5 }}
          >
            <T it="Verifica" es="Verificar" />
          </button>
        ) : (
          <>
            <button onClick={reset} style={btn()}>
              <T it="Ricomincia" es="Reiniciar" />
            </button>
            <button onClick={nextVerb} style={btn()}>
              <T it="Verbo successivo →" es="Siguiente verbo →" />
            </button>
          </>
        )}
        {checked && (
          <span style={{ ...sub, alignSelf: "center" }}>
            {set.pairs.filter((p) => isCorrect(p.pronoun)).length}/{set.pairs.length}{" "}
            <T it="corrette" es="correctas" />
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BLOQUE 7 — ROLE PLAY CHAT                                         */
/* ------------------------------------------------------------------ */
function formatMessage(text: string): ReactNode {
  // Split corrections block from main text
  const correctionRegex = /((?:📝|✅).*)/s;
  const corrMatch = text.match(correctionRegex);
  const mainText = corrMatch ? text.slice(0, corrMatch.index).trim() : text;
  const correctionText = corrMatch ? corrMatch[1].trim() : null;

  // Parse inline formatting: **bold**
  const parseInline = (str: string): ReactNode[] => {
    const parts: ReactNode[] = [];
    const re = /\*\*(.+?)\*\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(str)) !== null) {
      if (m.index > last) parts.push(str.slice(last, m.index));
      parts.push(
        <b key={m.index} style={{ fontWeight: 600, color: "#3C3489" }}>
          {m[1]}
        </b>
      );
      last = re.lastIndex;
    }
    if (last < str.length) parts.push(str.slice(last));
    return parts;
  };

  // Split main text into paragraphs
  const paragraphs = mainText.split(/\n\n+/);

  return (
    <>
      {paragraphs.map((p, i) => (
        <span key={i} style={{ display: "block", marginBottom: i < paragraphs.length - 1 ? 8 : 0 }}>
          {parseInline(p)}
        </span>
      ))}
      {correctionText && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 12px",
            background: "#FFF8E6",
            border: "0.5px solid #E8D48A",
            borderRadius: 8,
            fontSize: 13,
            lineHeight: 1.6,
            color: "#6B5A00",
          }}
        >
          {correctionText.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </>
  );
}

function BloqueChat() {
  const { lang } = useLang();
  const [msgs, setMsgs] = useState<{ role: "amico" | "user"; text: string }[]>(conversacion);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user" as const, text: input };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const history = newMsgs.map((m) => ({
        role: m.role === "amico" ? "model" : "user",
        parts: [{ text: m.text }],
      }));
      const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: `Sei Marco, un amico italiano simpatico e paziente. Stai aiutando uno studente ispanofono a praticare i verbi fare, andare e dire in italiano.

FLUSSO DELLA CONVERSAZIONE:
- Il primo messaggio è già stato inviato ("Ciao, come stai?"). Dopo la risposta dello studente, continua in modo naturale.
- Se lo studente non ha scelto un tema, suggeriscine uno (weekend, viaggi, cucina, sport, ecc.).
- Mantieni la conversazione sul tema scelto ma sii flessibile.
- IMPORTANTE: Incoraggia attivamente lo studente a usare i verbi fare, andare e dire.
- Proponi mini-sfide durante la conversazione, come: "Come diresti in italiano: 'Yo voy al cine mañana'?" oppure "Prova a usare il verbo **fare** in una frase!"
- Se lo studente sbaglia, NON dare subito la risposta corretta. Prima dagli un suggerimento gentile: "Quasi! Ricorda che con 'io' il verbo andare diventa..." e lascia che riprovi.
- Solo se lo studente sbaglia di nuovo, fornisci la risposta corretta.
- Festeggia quando lo studente scrive correttamente! Usa espressioni come "Perfetto!", "Bravo/a!", "Esattamente!"

REGOLE DI RISPOSTA:
- Rispondi SEMPRE in italiano.
- Usa i verbi fare, andare e dire naturalmente nel tuo testo.
- Risposte brevi e naturali (3-5 frasi).
- Metti in grassetto i verbi chiave (fare, andare, dire e le loro coniugazioni) usando **doppi asterischi**, es: "Io **faccio** una passeggiata".
- NON usare asterischi singoli per il corsivo.
- Se lo studente sembra confuso o non capisce qualcosa, puoi aggiungere una brevissima nota in spagnolo tra parentesi, es: "Andiamo al mare (vamos al mar)". Usalo con moderazione.
- Ogni 3-4 messaggi, proponi una mini-sfida con un nuovo verbo/coniugazione.

CORREZIONI:
- Se lo studente fa errori grammaticali, aggiungi le correzioni IN UN PARAGRAFO SEPARATO alla fine.
- Usa esattamente questo formato (una correzione per riga):

📝 Correzione: "forma sbagliata" → "forma corretta" — breve spiegazione.

- Se non ci sono errori, scrivi: ✅ Nessun errore, ottimo lavoro!
- Non mescolare le correzioni con il testo della conversazione.`,
                },
              ],
            },
            contents: history,
            generationConfig: { maxOutputTokens: 1000 },
          }),
        }
      );
      const data = await res.json();
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "...";
      setMsgs((m) => [...m, { role: "amico" as const, text: reply }]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "amico" as const, text: "(Errore di connessione — riprova!)" },
      ]);
    }
    setLoading(false);
  };

  return (
    <div>
      <p style={{ ...sub, marginBottom: 12 }}>
        <T
          it="Rispondi in italiano usando fare, andare e dire almeno una volta. Il tuo amico ti correggerà se ci sono errori."
          es="Responde en italiano usando fare, andare y dire al menos una vez. Tu amigo te corregirá si hay errores."
        />
      </p>
      {hint && (
        <div
          style={{
            fontSize: 13,
            background: "#E6F1FB",
            color: "#185FA5",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 12,
          }}
        >
          <T it="Esempio:" es="Ejemplo:" />{" "}
          <i>
            "Io faccio una passeggiata domani e poi vado al mare. Tu cosa ne
            dici?"
          </i>
        </div>
      )}
      <div
        style={{
          minHeight: 180,
          maxHeight: 320,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 14,
          padding: "4px 0",
        }}
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: m.role === "amico" ? "flex-start" : "flex-end",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "10px 14px",
                borderRadius:
                  m.role === "amico"
                    ? "4px 12px 12px 12px"
                    : "12px 4px 12px 12px",
                background:
                  m.role === "amico"
                    ? "var(--color-background-secondary)"
                    : "#EEEDFE",
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--color-text-primary)",
              }}
            >
              {m.role === "amico" && (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    marginBottom: 4,
                  }}
                >
                  Amico italiano
                </div>
              )}
              {m.role === "amico" ? formatMessage(m.text) : m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 14px",
              background: "var(--color-background-secondary)",
              borderRadius: "4px 12px 12px 12px",
              maxWidth: "60%",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
              Sta scrivendo...
            </span>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Scrivi in italiano..."
          rows={2}
          style={{
            flex: 1,
            fontSize: 14,
            padding: "8px 12px",
            borderRadius: 8,
            border: "0.5px solid var(--color-border-secondary)",
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
            resize: "none",
            outline: "none",
            lineHeight: 1.5,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            style={{
              ...btn(),
              padding: "8px 16px",
              opacity: input.trim() && !loading ? 1 : 0.5,
            }}
          >
            Invia
          </button>
          <button
            onClick={() => setHint((h) => !h)}
            style={{
              padding: "6px 16px",
              borderRadius: 8,
              border: "0.5px solid var(--color-border-tertiary)",
              background: "transparent",
              cursor: "pointer",
              fontSize: 12,
              color: "var(--color-text-secondary)",
            }}
          >
            <T it="Suggerimento" es="Pista" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN APP                                                           */
/* ------------------------------------------------------------------ */
const blocks = [
  {
    key: "intro",
    labelIt: "Coniugazioni",
    labelEs: "Conjugaciones",
    emoji: "📋",
  },
  {
    key: "b1",
    labelIt: "Flash-Quiz",
    labelEs: "Flash-Quiz",
    emoji: "⚡",
  },
  {
    key: "b2",
    labelIt: "Scelta multipla",
    labelEs: "Opción múltiple",
    emoji: "🔘",
  },
  {
    key: "b3",
    labelIt: "Completa la frase",
    labelEs: "Completa la frase",
    emoji: "✏️",
  },
  {
    key: "b4",
    labelIt: "Riordina",
    labelEs: "Reordena",
    emoji: "🔀",
  },
  {
    key: "b5",
    labelIt: "Traduci",
    labelEs: "Traduce",
    emoji: "🇪🇸→🇮🇹",
  },
  {
    key: "b6",
    labelIt: "Abbina",
    labelEs: "Empareja",
    emoji: "🔗",
  },
  {
    key: "b7",
    labelIt: "Conversazione",
    labelEs: "Conversación",
    emoji: "💬",
  },
];

export default function App() {
  const [stage, setStage] = useState(0);
  const [lang, setLang] = useState<Lang>("it");
  const toggle = () => setLang((l) => (l === "it" ? "es" : "it"));

  return (
    <LangCtx.Provider value={{ lang, toggle }}>
      <div style={{ padding: "1rem 0", fontFamily: "var(--font-sans)" }}>
        <h2 className="sr-only">
          Classe interattiva di italiano — verbi fare, andare, dire
        </h2>

        {/* Italian flag title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
            padding: "12px 16px",
            background: "var(--color-background-primary)",
            borderRadius: 10,
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 0,
              borderRadius: 4,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <span style={{ width: 8, height: 24, background: "#009246" }} />
            <span style={{ width: 8, height: 24, background: "#fff" }} />
            <span style={{ width: 8, height: 24, background: "#CE2B37" }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)" }}>
              Corso di Italiano
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
              <T it="Verbi irregolari — presente indicativo" es="Verbos irregulares — presente indicativo" />
            </div>
          </div>
          <span style={{ flex: 1 }} />
          <LangToggle />
        </div>

        {/* header row */}
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {["fare", "andare", "dire"].map((v) => (
            <span
              key={v}
              style={{
                padding: "4px 16px",
                borderRadius: 20,
                fontWeight: 500,
                fontSize: 13,
                background: {
                  fare: "#EEEDFE",
                  andare: "#E1F5EE",
                  dire: "#FAECE7",
                }[v],
                color: {
                  fare: "#3C3489",
                  andare: "#0F6E56",
                  dire: "#993C1D",
                }[v],
              }}
            >
              {v}
            </span>
          ))}
          <span
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              marginLeft: 4,
            }}
          >
            <T it="Presente indicativo" es="Presente indicativo" />
          </span>
        </div>

        {/* nav tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          {blocks.map((b, i) => (
            <button
              key={b.key}
              onClick={() => setStage(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 8,
                border: `0.5px solid ${
                  stage === i
                    ? "var(--color-border-primary)"
                    : "var(--color-border-tertiary)"
                }`,
                borderBottom: stage === i ? "2px solid #009246" : undefined,
                background:
                  stage === i
                    ? "var(--color-background-secondary)"
                    : "var(--color-background-primary)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: stage === i ? 500 : 400,
                color: "var(--color-text-primary)",
              }}
            >
              <span style={{ fontSize: 14 }} aria-hidden="true">
                {b.emoji}
              </span>
              {lang === "it" ? b.labelIt : b.labelEs}
            </button>
          ))}
        </div>

        {/* content area */}
        <div style={card}>
          {stage === 0 && (
            <>
              <ConjTable />
              <button onClick={() => setStage(1)} style={{ ...btn(), marginTop: 16 }}>
                <T it="Inizia Blocco 1 →" es="Comenzar Bloque 1 →" />
              </button>
            </>
          )}
          {stage === 1 && (
            <>
              <SectionHeader
                emoji="⚡"
                titleIt="Blocco 1 — Il riscaldamento"
                titleEs="Bloque 1 — El calentamiento"
                descIt="Flash-quiz di coniugazione. Risposte rapide."
                descEs="Flash-quiz de conjugación. Respuestas rápidas."
              />
              <BloqueFlashQuiz />
            </>
          )}
          {stage === 2 && (
            <>
              <SectionHeader
                emoji="🔘"
                titleIt="Blocco 2 — Scelta multipla"
                titleEs="Bloque 2 — Opción múltiple"
                descIt="Scegli la risposta corretta tra le opzioni."
                descEs="Elige la respuesta correcta entre las opciones."
              />
              <BloqueMultipleChoice />
            </>
          )}
          {stage === 3 && (
            <>
              <SectionHeader
                emoji="✏️"
                titleIt="Blocco 3 — Completa la frase"
                titleEs="Bloque 3 — Completa la frase"
                descIt="Inserisci il verbo corretto nel contesto."
                descEs="Inserta el verbo correcto en contexto."
              />
              <BloqueCompleta />
            </>
          )}
          {stage === 4 && (
            <>
              <SectionHeader
                emoji="🔀"
                titleIt="Blocco 4 — Riordina la frase"
                titleEs="Bloque 4 — Reordena la frase"
                descIt="Metti le parole nell'ordine giusto."
                descEs="Pon las palabras en el orden correcto."
              />
              <BloqueRiordina />
            </>
          )}
          {stage === 5 && (
            <>
              <SectionHeader
                emoji="🇪🇸→🇮🇹"
                titleIt="Blocco 5 — Traduci"
                titleEs="Bloque 5 — Traduce"
                descIt="Traduci dallo spagnolo all'italiano."
                descEs="Traduce del español al italiano."
              />
              <BloqueTraduci />
            </>
          )}
          {stage === 6 && (
            <>
              <SectionHeader
                emoji="🔗"
                titleIt="Blocco 6 — Abbina"
                titleEs="Bloque 6 — Empareja"
                descIt="Collega ogni pronome alla forma verbale corretta."
                descEs="Conecta cada pronombre con la forma verbal correcta."
              />
              <BloqueAbbina />
            </>
          )}
          {stage === 7 && (
            <>
              <SectionHeader
                emoji="💬"
                titleIt="Blocco 7 — Simulazione di ruolo"
                titleEs="Bloque 7 — Simulación de rol"
                descIt="Conversa con il tuo amico italiano. Lui ti correggerà."
                descEs="Conversa con tu amigo italiano. Él te corregirá."
              />
              <BloqueChat />
            </>
          )}
        </div>
      </div>
    </LangCtx.Provider>
  );
}
