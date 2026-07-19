import { useState } from "react";
import { useLang } from "../context/LangContext";
import { useTheme } from "../context/ThemeContext";
import { useProfile } from "../context/ProfileContext";
import { TOPICS } from "../config";
import { btn } from "../utils";
import type { Lang } from "../types";

type ThemeMode = "light" | "dark" | "system";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

export default function Settings({ onBack }: { onBack: () => void }) {
  const { lang, setLang } = useLang();
  const { mode, setMode } = useTheme();
  const profile = useProfile();
  const [name, setNameLocal] = useState(profile.name);

  const themeOpts: { value: ThemeMode; emoji: string; en: string; es: string }[] = [
    { value: "light", emoji: "☀️", en: "Light", es: "Claro" },
    { value: "dark", emoji: "🌙", en: "Dark", es: "Oscuro" },
    { value: "system", emoji: "💻", en: "System", es: "Sistema" },
  ];
  const langOpts: { value: Lang; label: string }[] = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
  ];

  const toggleTopic = (id: string) => {
    const next = profile.topics.includes(id) ? profile.topics.filter((t) => t !== id) : [...profile.topics, id];
    profile.setTopics(next);
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
          {lang === "en" ? "Settings" : "Ajustes"}
        </div>
        <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
          {lang === "en" ? "Make the app yours." : "Personaliza la app a tu gusto."}
        </div>
      </div>

      {/* Language */}
      <Section title={lang === "en" ? "Interface language" : "Idioma de la interfaz"}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {langOpts.map((o) => (
            <button key={o.value} onClick={() => setLang(o.value)} style={{ ...btn(lang === o.value), padding: "12px", fontWeight: 700 }}>
              {o.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Name */}
      <Section title={lang === "en" ? "Your name" : "Tu nombre"}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setNameLocal(e.target.value)}
            onBlur={() => profile.setName(name.trim())}
            placeholder={lang === "en" ? "e.g. Maria" : "p. ej. María"}
            maxLength={24}
            style={{ flex: 1, padding: "11px 14px", fontSize: 15, borderRadius: 10, border: "1px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }}
          />
          <button onClick={() => profile.setName(name.trim())} className="btn-secondary" style={{ ...btn(), padding: "10px 16px", fontWeight: 600 }}>
            {lang === "en" ? "Save" : "Guardar"}
          </button>
        </div>
      </Section>

      {/* Daily goal */}
      <Section title={lang === "en" ? "Daily goal" : "Meta diaria"}>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 5].map((n) => (
            <button key={n} onClick={() => profile.setDailyGoal(n)} style={{ ...btn(profile.dailyGoal === n), flex: 1, padding: "12px", fontWeight: 700 }}>
              {n} {lang === "en" ? (n === 1 ? "lesson" : "lessons") : (n === 1 ? "lección" : "lecciones")}
            </button>
          ))}
        </div>
      </Section>

      {/* Topics */}
      <Section title={lang === "en" ? "Conversation topics you enjoy" : "Temas de conversación que disfrutas"}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TOPICS.map((t) => {
            const on = profile.topics.includes(t.id);
            return (
              <button key={t.id} onClick={() => toggleTopic(t.id)} style={{ ...btn(on), padding: "8px 12px", fontSize: 13, fontWeight: 600, display: "inline-flex", gap: 6, alignItems: "center" }}>
                <span aria-hidden="true">{t.emoji}</span> {lang === "en" ? t.en : t.es}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Theme */}
      <Section title={lang === "en" ? "Theme" : "Tema"}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {themeOpts.map((opt) => {
            const active = mode === opt.value;
            return (
              <button key={opt.value} onClick={() => setMode(opt.value)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 8px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", border: `2px solid ${active ? "var(--color-primary)" : "var(--color-border-tertiary)"}`, background: active ? "var(--color-primary-softer)" : "var(--color-background-primary)" }}>
                <span style={{ fontSize: 24 }}>{opt.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "var(--color-primary-hover)" : "var(--color-text-primary)" }}>
                  {lang === "en" ? opt.en : opt.es}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <div style={{ display: "flex" }}>
        <button onClick={onBack} className="btn-secondary" style={{ ...btn(), padding: "10px 18px", fontWeight: 600 }}>
          {lang === "en" ? "Back to menu" : "Volver al menú"}
        </button>
      </div>
    </div>
  );
}
