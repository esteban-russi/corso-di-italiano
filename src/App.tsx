import { useState } from "react";
import { LangProvider, useLang, T } from "./context/LangContext";
import { EXERCISE_REGISTRY } from "./config";
import { VERB_BADGE_COLORS } from "./config";
import { VERB_REGISTRY } from "./data/verbs";
import { btn, card } from "./utils";
import LangToggle from "./components/LangToggle";
import SectionHeader from "./components/SectionHeader";
import ConjTable from "./components/ConjTable";
import FlashQuiz from "./components/exercises/FlashQuiz";
import MultipleChoice from "./components/exercises/MultipleChoice";
import Completa from "./components/exercises/Completa";
import Riordina from "./components/exercises/Riordina";
import Traduci from "./components/exercises/Traduci";
import Abbina from "./components/exercises/Abbina";
import Chat from "./components/exercises/Chat";

function AppContent() {
  const [stage, setStage] = useState(0);
  const { lang } = useLang();

  return (
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

      {/* verb badges */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {VERB_REGISTRY.map((v) => {
          const colors = VERB_BADGE_COLORS[v.id] ?? { bg: "#eee", color: "#333" };
          return (
            <span
              key={v.id}
              style={{
                padding: "4px 16px",
                borderRadius: 20,
                fontWeight: 500,
                fontSize: 13,
                background: colors.bg,
                color: colors.color,
              }}
            >
              {v.infinitive}
            </span>
          );
        })}
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
        {EXERCISE_REGISTRY.map((b, i) => (
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
            <FlashQuiz />
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
            <MultipleChoice />
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
            <Completa />
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
            <Riordina />
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
            <Traduci />
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
            <Abbina />
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
            <Chat />
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppContent />
    </LangProvider>
  );
}
