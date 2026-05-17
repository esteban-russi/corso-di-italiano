import { useLang, T } from "../context/LangContext";
import { PRONOUNS } from "../config";
import { VERB_REGISTRY } from "../data/verbs";
import { sub } from "../utils";

export default function ConjTable() {
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
              {VERB_REGISTRY.map((v) => (
                <th
                  key={v.id}
                  style={{
                    padding: "8px 12px",
                    textAlign: "center",
                    fontWeight: 500,
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {v.infinitive.charAt(0).toUpperCase() + v.infinitive.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRONOUNS.map((p, i) => (
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
                {VERB_REGISTRY.map((v) => (
                  <td
                    key={v.id}
                    style={{
                      padding: "8px 12px",
                      textAlign: "center",
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {v.conjugations[i]}
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
