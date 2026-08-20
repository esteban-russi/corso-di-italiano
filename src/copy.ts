// ---------------------------------------------------------------------------
// Interface copy catalog.
//
// The learner does not speak Italian — that is the premise of the app. So every
// string they must *understand in order to act* renders in their own language.
// See docs/04-interface-language.md for the full rule.
//
// Migration status: existing screens still use inline `lang === "en" ? … : …`
// ternaries. Those move here as the redesign rebuilds each screen (D-04-3c);
// migrating call sites in files that docs/07-design-system.md is about to
// rewrite would be wasted work. **All new copy goes here.**
// ---------------------------------------------------------------------------

import { useCallback } from "react";
import { useLang } from "./context/LangContext";
import type { Lang } from "./types";

/**
 * The only Italian permitted in the interface. Celebration and greeting words
 * the learner absorbs by repetition — never instruction, label, navigation or
 * error text, and never the sole carrier of meaning (`Quasi!` may precede
 * "Here's the correct form:", never replace it).
 *
 * Deliberately short and fixed. Once the slang section exists
 * (docs/06-slang-and-idioms.md) there is a real risk of slang leaking in here
 * as "flavour" and quietly making the UI Italian again.
 */
export const FLAVOUR_WORDS = [
  "ciao",
  "benvenuto",
  "bravo",
  "bravissimo",
  "benissimo",
  "ottimo",
  "perfetto",
  "esatto",
  "quasi",
  "andiamo",
  "dai",
] as const;

/**
 * Italian words distinctive enough that finding one in `src/components/` means
 * content has leaked into the interface. Deliberately excludes anything that
 * also reads as Spanish or English (`cosa`, `italiano`, `casi`, `no`), because
 * Spanish is a supported interface language. Heuristic by design: it cannot
 * catch every leak, but it catches regressions cheaply and has no false
 * positives on the current copy.
 */
export const ITALIAN_MARKERS = [
  "sono", "siamo", "siete", "sei",
  "gli", "della", "dello", "degli", "nella", "nello",
  "molto", "adesso", "magari", "allora", "grazie", "prego", "scusa",
  "dice", "sfida", "capito", "stai", "raccontami", "fai", "vuoi", "puoi",
  "lezione", "verbi", "parlare", "ripetere",
] as const;

type Entry = { en: string; es: string };

/**
 * Copy is keyed by id so a missing key is a compile error and a third
 * interface language is a column, not a sweep through the components.
 */
export const COPY = {
  // --- Connection and server states ---------------------------------------
  "state.connectionError": {
    en: "Something went wrong reaching Marco. Check your connection and try again.",
    es: "Hubo un problema al contactar con Marco. Revisa tu conexión e inténtalo de nuevo.",
  },
  "state.rateLimited": {
    en: "You have sent a lot of messages just now — take a short break and try again in a few minutes.",
    es: "Has enviado muchos mensajes ahora mismo — descansa un momento e inténtalo de nuevo en unos minutos.",
  },
  "state.serverUnavailable": {
    en: "Marco is not available right now. The conversation will work again shortly.",
    es: "Marco no está disponible ahora mismo. La conversación funcionará de nuevo en breve.",
  },
  "state.offlineTitle": {
    en: "You are offline",
    es: "Estás sin conexión",
  },
  "state.offlineBody": {
    en: "Lessons still work offline. Conversation needs a connection, so it will come back when you do.",
    es: "Las lecciones funcionan sin conexión. La conversación necesita conexión, así que volverá cuando tú vuelvas.",
  },
  "state.loading": {
    en: "Loading…",
    es: "Cargando…",
  },
  "state.retry": {
    en: "Try again",
    es: "Inténtalo de nuevo",
  },

  // --- Empty states --------------------------------------------------------
  "empty.noWeakForms": {
    en: "Nothing to review yet — finish a lesson and the forms you miss will show up here.",
    es: "Nada que repasar todavía — termina una lección y las formas que falles aparecerán aquí.",
  },
  "empty.pathComplete": {
    en: "You have finished every unit on the path. Practise anything you like, or go and talk to Marco.",
    es: "Has terminado todas las unidades del camino. Practica lo que quieras, o ve a hablar con Marco.",
  },

  // --- Permissions ---------------------------------------------------------
  "permission.microphoneDenied": {
    en: "Microphone access is blocked. Allow it in your browser settings to send a voice message.",
    es: "El acceso al micrófono está bloqueado. Permítelo en los ajustes del navegador para enviar un mensaje de voz.",
  },

  // --- Translation (docs/01-conversation-core.md) --------------------------
  "chat.translate": {
    en: "Translate",
    es: "Traducir",
  },
  "chat.hideTranslation": {
    en: "Hide translation",
    es: "Ocultar traducción",
  },
  "chat.translationUnavailable": {
    en: "No translation available for this message.",
    es: "No hay traducción disponible para este mensaje.",
  },

  // --- Entry points (docs/05-three-ways-in.md) ----------------------------
  "entry.random.title": {
    en: "Learn something new",
    es: "Aprende algo nuevo",
  },
  "entry.random.body": {
    en: "A surprise lesson, weighted toward what you keep getting wrong.",
    es: "Una lección sorpresa, centrada en lo que sigues fallando.",
  },
  "entry.continue.title": {
    en: "Continue",
    es: "Continuar",
  },
  "entry.continue.body": {
    en: "Pick up the path where you left off.",
    es: "Sigue el camino donde lo dejaste.",
  },
  "entry.choose.title": {
    en: "Choose",
    es: "Elegir",
  },
  "entry.choose.body": {
    en: "Pick exactly what you want to practise.",
    es: "Elige exactamente lo que quieres practicar.",
  },
  "entry.viewPath": {
    en: "See the whole path",
    es: "Ver todo el camino",
  },
  "entry.unitProgress": {
    en: "Unit {current} of {total}",
    es: "Unidad {current} de {total}",
  },
} as const satisfies Record<string, Entry>;

export type CopyId = keyof typeof COPY;

/** Substitute `{name}`-style placeholders. */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in params ? String(params[key]) : whole
  );
}

/** Resolve copy outside a component (tests, helpers). */
export function copy(
  lang: Lang,
  id: CopyId,
  params?: Record<string, string | number>
): string {
  return interpolate(COPY[id][lang], params);
}

/** Resolve copy in the learner's interface language. */
export function useCopy() {
  const { lang } = useLang();
  return useCallback(
    (id: CopyId, params?: Record<string, string | number>) => copy(lang, id, params),
    [lang]
  );
}
