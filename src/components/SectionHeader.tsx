import { T } from "../context/LangContext";

export default function SectionHeader({
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
