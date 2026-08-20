import { useMemo } from "react";
import { useLang } from "../context/LangContext";
import { getVerbs } from "../curriculum/verbs";
import { conjugate, PRONOUNS } from "../curriculum/conjugator";
import { TENSE_LABEL, type Tense } from "../curriculum/types";
import { sub } from "../utils";

export default function ConjTable({
  verbIds,
  tense = "presente",
}: {
  verbIds: string[];
  tense?: Tense;
}) {
  const { lang } = useLang();
  const verbs = useMemo(() => getVerbs(verbIds), [verbIds]);
  const tables = useMemo(() => verbs.map((v) => conjugate(v, tense)), [verbs, tense]);
  const tenseName = TENSE_LABEL[tense][lang];

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
        {tenseName} — {lang === "en" ? "conjugation table" : "tabla de conjugación"}
      </h3>
      <p style={{ ...sub, marginBottom: 12 }}>
        {lang === "en"
          ? "Study the forms before you practise."
          : "Estudia las formas antes de practicar."}
      </p>
      <div style={{ overflowX: "auto", marginTop: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--color-text-secondary)", fontWeight: 500, borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                {lang === "en" ? "Pronoun" : "Pronombre"}
              </th>
              {verbs.map((v) => (
                <th key={v.id} style={{ padding: "8px 12px", textAlign: "center", fontWeight: 600, borderBottom: "0.5px solid var(--color-border-tertiary)", color: "var(--color-text-primary)" }}>
                  {v.infinitive}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRONOUNS.map((p, i) => (
              <tr key={p} style={{ background: i % 2 === 0 ? "var(--color-background-secondary)" : "var(--color-background-primary)" }}>
                <td style={{ padding: "8px 12px", color: "var(--color-text-secondary)", fontWeight: 500 }}>{p}</td>
                {tables.map((forms, vi) => (
                  <td key={verbs[vi].id} style={{ padding: "8px 12px", textAlign: "center", fontWeight: 500, color: "var(--color-text-primary)" }}>
                    {forms[i]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
