import { useState, useMemo } from "react";
import { useLang, T } from "../../context/LangContext";
import { abbinaItems } from "../../data/abbina";
import { shuffle, btn, sub } from "../../utils";

export default function Abbina({
  selectedVerbs,
  onError,
  onComplete,
}: {
  selectedVerbs: string[];
  onError: () => void;
  onComplete: () => void;
}) {
  const { lang } = useLang();
  const filtered = useMemo(
    () => abbinaItems.filter((q) => q.verbs.some((v) => selectedVerbs.includes(v))),
    [selectedVerbs]
  );
  const [verbIdx, setVerbIdx] = useState(0);
  const set = filtered[verbIdx];
  const [shuffledForms] = useState(() => filtered.map((s) => shuffle(s.pairs.map((p) => p.form))));
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
    const ni = (verbIdx + 1) % filtered.length;
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
          ({verbIdx + 1}/{filtered.length})
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
            onClick={() => {
              setChecked(true);
              const errorCount = set.pairs.filter((p) => !isCorrect(p.pronoun)).length;
              for (let e = 0; e < errorCount; e++) onError();
            }}
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
            <button onClick={onComplete} style={{ ...btn(), background: '#009246', color: '#fff', border: 'none' }}>
              <T it="Continua →" es="Continuar →" />
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
