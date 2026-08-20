import { useState, useRef, useEffect } from "react";
import { useLang } from "../../context/LangContext";
import { getVerb } from "../../curriculum/verbs";
import { PRONOUNS } from "../../curriculum/conjugator";
import { formKey } from "../../curriculum/lesson";
import { TENSE_LABEL } from "../../curriculum/types";
import type { FlashItem, ChoiceItem, CompleteItem, MatchItem, IntroItem } from "../../curriculum/types";
import { btn } from "../../utils";
import ConjTable from "../ConjTable";
import {
  answersMatch, correctFlavor, wrongFlavor, feedbackBox, answerInput, cap, normalize,
} from "./lessonUi";

export type LessonResult = { misses: string[]; hits: string[] };

function VerbChip({ verbId }: { verbId: string }) {
  const v = getVerb(verbId);
  return (
    <span style={{ padding: "3px 12px", borderRadius: 999, background: "var(--color-primary-softer)", color: "var(--color-primary-hover)", fontSize: 13, fontWeight: 600 }}>
      {v?.infinitive}
    </span>
  );
}

function TenseLine({ tense }: { tense: FlashItem["tense"] }) {
  const { lang } = useLang();
  return (
    <div style={{ fontSize: 12, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600, marginBottom: 10 }}>
      {TENSE_LABEL[tense][lang]}
    </div>
  );
}

function ContinueBtn({ onClick }: { onClick: () => void }) {
  const { lang } = useLang();
  return (
    <button onClick={onClick} className="btn-primary" style={{ ...btn(), marginTop: 14, padding: "12px 24px", fontWeight: 600, width: "100%" }}>
      {lang === "en" ? "Continue →" : "Continuar →"}
    </button>
  );
}

// --- Type-the-answer cards (flash + complete) ------------------------------

function TypeCard({
  verbId, tense, pronounIndex, answer, mode, onComplete,
}: {
  verbId: string; tense: FlashItem["tense"]; pronounIndex: number; answer: string;
  mode: "flash" | "complete"; onComplete: (r: LessonResult) => void;
}) {
  const { lang } = useLang();
  const v = getVerb(verbId);
  const [value, setValue] = useState("");
  const [graded, setGraded] = useState<null | boolean>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const key = formKey(verbId, tense, pronounIndex);
  const grade = () => { if (value.trim()) setGraded(answersMatch(value, answer)); };
  const finish = () => onComplete(graded ? { misses: [], hits: [key] } : { misses: [key], hits: [] });
  const pronoun = PRONOUNS[pronounIndex];

  return (
    <div>
      <TenseLine tense={tense} />
      {mode === "flash" ? (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 10 }}>
            {lang === "en" ? "Conjugate" : "Conjuga"} <VerbChip verbId={verbId} />{" "}
            {lang === "en" ? "for" : "para"} <b>{pronoun}</b>:
          </p>
        </div>
      ) : (
        <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, lineHeight: 1.5 }}>
          {cap(pronoun)} <span style={{ color: "var(--color-primary)" }}>_____</span>{" "}
          <span style={{ fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 400 }}>({v?.infinitive})</span>
        </p>
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        disabled={graded !== null}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && graded === null) grade(); }}
        placeholder={lang === "en" ? "type the form…" : "escribe la forma…"}
        style={answerInput}
        autoCapitalize="off" autoCorrect="off" spellCheck={false}
      />
      {graded === null ? (
        <button onClick={grade} disabled={!value.trim()} className="btn-primary" style={{ ...btn(), marginTop: 14, padding: "12px 24px", fontWeight: 600, width: "100%" }}>
          {lang === "en" ? "Check" : "Comprobar"}
        </button>
      ) : (
        <>
          <div style={feedbackBox(graded)}>
            {graded ? correctFlavor(pronounIndex + answer.length) : (
              <>
                {wrongFlavor(lang)} <span style={{ textDecoration: "underline" }}>{answer}</span>
              </>
            )}
          </div>
          <ContinueBtn onClick={finish} />
        </>
      )}
    </div>
  );
}

export function FlashCard({ item, onComplete }: { item: FlashItem; onComplete: (r: LessonResult) => void }) {
  return <TypeCard {...item} mode="flash" onComplete={onComplete} />;
}

export function CompleteCard({ item, onComplete }: { item: CompleteItem; onComplete: (r: LessonResult) => void }) {
  return <TypeCard {...item} mode="complete" onComplete={onComplete} />;
}

// --- Multiple choice -------------------------------------------------------

export function ChoiceCard({ item, onComplete }: { item: ChoiceItem; onComplete: (r: LessonResult) => void }) {
  const { lang } = useLang();
  const [picked, setPicked] = useState<string | null>(null);
  const key = formKey(item.verbId, item.tense, item.pronounIndex);
  const correct = picked !== null && normalize(picked) === normalize(item.answer);
  const pronoun = PRONOUNS[item.pronounIndex];

  return (
    <div>
      <TenseLine tense={item.tense} />
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 14 }}>
        {lang === "en" ? "Pick the correct form of" : "Elige la forma correcta de"} <VerbChip verbId={item.verbId} />{" "}
        {lang === "en" ? "for" : "para"} <b>{pronoun}</b>:
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        {item.options.map((opt) => {
          const isPicked = picked === opt;
          const isAnswer = normalize(opt) === normalize(item.answer);
          let bg = "var(--color-background-primary)", border = "var(--color-border-secondary)", color = "var(--color-text-primary)";
          if (picked !== null) {
            if (isAnswer) { bg = "var(--color-success-soft)"; border = "var(--color-success)"; color = "var(--color-success)"; }
            else if (isPicked) { bg = "var(--color-danger-soft)"; border = "var(--color-danger)"; color = "var(--color-danger-hover)"; }
          }
          return (
            <button
              key={opt}
              disabled={picked !== null}
              onClick={() => setPicked(opt)}
              style={{ ...btn(), padding: "13px 16px", fontSize: 16, fontWeight: 600, textAlign: "left", background: bg, borderColor: border, color, cursor: picked !== null ? "default" : "pointer" }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <ContinueBtn onClick={() => onComplete(correct ? { misses: [], hits: [key] } : { misses: [key], hits: [] })} />
      )}
    </div>
  );
}

// --- Match pronouns to forms ----------------------------------------------

export function MatchCard({ item, onComplete }: { item: MatchItem; onComplete: (r: LessonResult) => void }) {
  const { lang } = useLang();
  const [forms] = useState(() => {
    const arr = item.pairs.map((p) => p.form);
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  });
  const [assign, setAssign] = useState<Record<string, string>>({}); // pronoun -> chosen form
  const [active, setActive] = useState<string | null>(null); // selected pronoun awaiting a form
  const [graded, setGraded] = useState(false);

  const pick = (pronoun: string) => { if (!graded) setActive(pronoun); };
  const choose = (form: string) => {
    if (graded || !active) return;
    setAssign((a) => {
      const next = { ...a };
      for (const k of Object.keys(next)) if (next[k] === form) delete next[k];
      next[active] = form;
      return next;
    });
    setActive(null);
  };
  const allDone = Object.keys(assign).length === item.pairs.length;

  const finish = () => {
    const misses: string[] = [], hits: string[] = [];
    // formKey uses the true pronoun index of each pair's pronoun.
    item.pairs.forEach((p) => {
      const pi = PRONOUNS.indexOf(p.pronoun);
      const k = formKey(item.verbId, item.tense, pi);
      (assign[p.pronoun] === p.form ? hits : misses).push(k);
    });
    onComplete({ misses, hits });
  };

  return (
    <div>
      <TenseLine tense={item.tense} />
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 14 }}>
        {lang === "en" ? "Match each pronoun with the right form of" : "Empareja cada pronombre con la forma correcta de"} <VerbChip verbId={item.verbId} />:
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ display: "grid", gap: 8 }}>
          {item.pairs.map((p) => {
            const chosen = assign[p.pronoun];
            const ok = graded && chosen === p.form;
            const bad = graded && chosen !== p.form;
            return (
              <button key={p.pronoun} onClick={() => pick(p.pronoun)} disabled={graded}
                style={{ ...btn(active === p.pronoun), padding: "10px 12px", textAlign: "left", display: "flex", justifyContent: "space-between", gap: 8,
                  borderColor: ok ? "var(--color-success)" : bad ? "var(--color-danger)" : undefined }}>
                <span style={{ fontWeight: 600 }}>{p.pronoun}</span>
                <span style={{ color: "var(--color-primary-hover)", fontWeight: 600 }}>{chosen ?? "—"}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {forms.map((f) => {
            const usedBy = Object.entries(assign).find(([, v]) => v === f);
            return (
              <button key={f} onClick={() => choose(f)} disabled={graded || !active}
                style={{ ...btn(), padding: "10px 12px", opacity: usedBy ? 0.4 : 1, fontWeight: 600 }}>
                {f}
              </button>
            );
          })}
        </div>
      </div>
      {!graded ? (
        <button onClick={() => setGraded(true)} disabled={!allDone} className="btn-primary" style={{ ...btn(), marginTop: 14, padding: "12px 24px", fontWeight: 600, width: "100%" }}>
          {lang === "en" ? "Check" : "Comprobar"}
        </button>
      ) : (
        <ContinueBtn onClick={finish} />
      )}
    </div>
  );
}

// --- Intro (conjugation table) --------------------------------------------

export function IntroCard({ item, onComplete }: { item: IntroItem; onComplete: () => void }) {
  const { lang } = useLang();
  return (
    <div className="fade-in">
      <ConjTable verbIds={item.verbIds} tense={item.tense} />
      <button onClick={onComplete} className="btn-primary" style={{ ...btn(), marginTop: 16, padding: "12px 24px", fontWeight: 600 }}>
        {lang === "en" ? "Start practising →" : "Empezar a practicar →"}
      </button>
    </div>
  );
}
