import { card } from "../utils";

/**
 * The three ways in — Random, Continue, Choose (docs/05-three-ways-in.md).
 *
 * Deliberately knows nothing about verbs: the slang section
 * (docs/06-slang-and-idioms.md) renders the same three doors from its own
 * config, so a learner who understands one section understands the other.
 *
 * Styling is kept shallow on purpose. docs/07-design-system.md will restyle
 * these; the behaviour should not need touching when it does.
 */
export type EntryDoor = {
  kind: "random" | "continue" | "choose";
  emoji: string;
  title: string;
  body: string;
  /** Short status line, e.g. "Unit 3 of 14". */
  meta?: string;
  disabled?: boolean;
  onSelect: () => void;
};

export default function EntryPoints({
  doors,
  secondary,
}: {
  doors: EntryDoor[];
  /** Optional link below the doors, e.g. "See the whole path". */
  secondary?: { label: string; onSelect: () => void };
}) {
  return (
    <div>
      <div style={{ display: "grid", gap: 10 }}>
        {doors.map((door) => (
          <button
            key={door.kind}
            onClick={door.onSelect}
            disabled={door.disabled}
            style={{
              ...card,
              // Continue is the habitual one-tap path, so it leads visually.
              borderTopWidth: door.kind === "continue" ? 3 : 1,
              borderTopColor:
                door.kind === "continue" ? "var(--color-primary)" : "var(--color-border-tertiary)",
              padding: "16px 18px",
              display: "grid",
              gridTemplateColumns: "40px 1fr",
              alignItems: "center",
              gap: 14,
              textAlign: "left",
              fontFamily: "inherit",
              cursor: door.disabled ? "not-allowed" : "pointer",
              opacity: door.disabled ? 0.55 : 1,
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 24 }}>{door.emoji}</span>
            <span style={{ minWidth: 0 }}>
              <span
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  flexWrap: "wrap",
                  fontSize: 15.5,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              >
                {door.title}
                {door.meta && (
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--color-text-secondary)" }}>
                    {door.meta}
                  </span>
                )}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 12.5,
                  color: "var(--color-text-secondary)",
                  marginTop: 3,
                  lineHeight: 1.5,
                }}
              >
                {door.body}
              </span>
            </span>
          </button>
        ))}
      </div>

      {secondary && (
        <button
          onClick={secondary.onSelect}
          className="btn-ghost"
          style={{
            marginTop: 12,
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text-secondary)",
          }}
        >
          {secondary.label}
        </button>
      )}
    </div>
  );
}
