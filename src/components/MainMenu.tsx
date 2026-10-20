import { useLang } from "../context/LangContext";
import { useProfile } from "../context/ProfileContext";

type Section = "verbs-learning" | "conversation" | "settings";

function MenuCard({
  emoji, title, body, accent, onClick,
}: {
  emoji: string; title: string; body: string; accent: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "grid", gridTemplateColumns: "52px 1fr auto", alignItems: "center", gap: 16,
        width: "100%", padding: "20px 22px", textAlign: "left",
        background: "var(--color-background-primary)", border: "1px solid var(--color-border-tertiary)",
        borderLeft: `4px solid ${accent}`, borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
      }}
    >
      <span aria-hidden="true" style={{ width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, background: `${accent}18` }}>
        {emoji}
      </span>
      <span>
        <span style={{ display: "block", fontSize: 17, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>{title}</span>
        <span style={{ display: "block", fontSize: 13, lineHeight: 1.5, color: "var(--color-text-secondary)" }}>{body}</span>
      </span>
      <span aria-hidden="true" style={{ fontSize: 20, color: "var(--color-text-secondary)", opacity: 0.5 }}>›</span>
    </button>
  );
}

export default function MainMenu({ onSelectSection }: { onSelectSection: (s: Section) => void }) {
  const { lang } = useLang();
  const { name } = useProfile();
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
          {name ? (lang === "en" ? `Ciao, ${name}! 👋` : `¡Ciao, ${name}! 👋`) : "Ciao! 👋"}
        </div>
        <div style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          {lang === "en" ? "What would you like to do today?" : "¿Qué te gustaría hacer hoy?"}
        </div>
      </div>

      <MenuCard
        emoji="📚"
        accent="var(--color-accent-verbs)"
        title={lang === "en" ? "Verbs" : "Verbos"}
        body={lang === "en" ? "Short, guided lessons that build verb mastery." : "Lecciones cortas y guiadas para dominar los verbos."}
        onClick={() => onSelectSection("verbs-learning")}
      />
      <MenuCard
        emoji="💬"
        accent="var(--color-accent-conversation)"
        title={lang === "en" ? "Conversation" : "Conversación"}
        body={lang === "en" ? "Chat with Marco, your Italian friend, to use verbs for real." : "Habla con Marco, tu amigo italiano, y usa los verbos de verdad."}
        onClick={() => onSelectSection("conversation")}
      />
      <MenuCard
        emoji="⚙️"
        accent="var(--color-accent-settings)"
        title={lang === "en" ? "Settings" : "Ajustes"}
        body={lang === "en" ? "Language, name, daily goal, topics and theme." : "Idioma, nombre, meta diaria, temas y tema visual."}
        onClick={() => onSelectSection("settings")}
      />
    </div>
  );
}
