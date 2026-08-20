// ---------------------------------------------------------------------------
// Mapping between the app's navigation state machine and the URL.
//
// `CLAUDE.md` records that navigation is a state machine, not a router. That
// stays true — but a state machine with no history integration means the
// Android and iOS back gesture *exits the app* instead of going back a screen,
// which reads as broken (docs/14-platform-pwa.md D-14-2). So the machine is
// kept and synced to `history` rather than replaced by a router.
//
// Pure functions, so the mapping is testable without a DOM.
// ---------------------------------------------------------------------------

export type Section = "home" | "verbs-learning" | "conversation" | "settings";
export type StageKind = "home" | "lesson" | "summary";

export type NavState = { section: Section; stage: StageKind };

export const HOME: NavState = { section: "home", stage: "home" };

const SECTION_PATH: Record<Section, string> = {
  home: "/",
  "verbs-learning": "/verbs",
  conversation: "/conversation",
  settings: "/settings",
};

/** URL for a navigation state. */
export function pathFor({ section, stage }: NavState): string {
  const base = SECTION_PATH[section] ?? "/";
  // Only the verbs section has stages worth appearing in the URL.
  if (section !== "verbs-learning" || stage === "home") return base;
  return `${base}/${stage}`;
}

/**
 * Navigation state for a URL. Unknown paths fall back to home rather than
 * erroring, because the server serves the SPA for every path.
 *
 * A `lesson` path resolves to the section home: a lesson is generated at
 * runtime and cannot be reconstructed from a URL, so deep-linking into one
 * would mean inventing a different lesson than the one the learner left.
 */
export function navFromPath(path: string): NavState {
  const clean = path.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  const segments = clean.split("/").filter(Boolean);
  if (segments.length === 0) return HOME;

  const section = (Object.keys(SECTION_PATH) as Section[]).find(
    (s) => SECTION_PATH[s] === `/${segments[0]}`
  );
  if (!section || section === "home") return HOME;
  if (section === "verbs-learning" && segments[1] === "summary") {
    // A summary is also not reconstructable; land on the section instead.
    return { section, stage: "home" };
  }
  return { section, stage: "home" };
}

/** Whether two navigation states are the same screen. */
export function sameNav(a: NavState, b: NavState): boolean {
  return a.section === b.section && a.stage === b.stage;
}

/**
 * Whether moving from `a` to `b` should add a history entry (going deeper) or
 * replace the current one. Returning to home is a *back* movement, so it does
 * not stack a new entry.
 */
export function isForward(a: NavState, b: NavState): boolean {
  if (sameNav(a, b)) return false;
  if (b.section === "home") return false;
  if (a.section === "home") return true;
  // Within a section, entering a lesson or summary goes deeper.
  return a.section === b.section && a.stage === "home" && b.stage !== "home";
}
