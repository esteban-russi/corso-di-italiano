// Scenario presets for targeted conversation practice.
// Plan 01 — Conversation core (Deliverables 6 & 7).
// Interface copy is in EN/ES; Italian is content.

import { CharacterId } from "./characters";

export interface Scenario {
  id: string;
  icon: string;
  title: { en: string; es: string; it: string };
  description: { en: string; es: string };
  setting: string;
  characterRole: string;
  objective: { en: string; es: string; it: string };
  suggestedCharacter: CharacterId;
  starterMessage: string;
  suggestedVerbs: string[];
  level: "A1" | "A2" | "B1";
}

export const SCENARIOS: Scenario[] = [
  {
    id: "bar_espresso",
    icon: "☕",
    title: { en: "Ordering at the Bar", es: "Pidiendo en el bar", it: "Al bar per un caffè" },
    description: {
      en: "Order an espresso and a pastry, ask for the bill, and pay at the counter.",
      es: "Pide un café espresso y una medialuna, pide la cuenta y paga en caja.",
    },
    setting: "Un bar vivace nel centro storico di Roma o Milano.",
    characterRole: "Barista amichevole",
    objective: {
      en: "Order coffee and food, ask about price, and use polite forms.",
      es: "Pedir café y comida, consultar precio y usar formas de cortesía.",
      it: "Ordinare colazione, chiedere il conto e pagare.",
    },
    suggestedCharacter: "marco",
    starterMessage: "Buongiorno! Benvenuto al bar. Cosa posso portarti di buono oggi?",
    suggestedVerbs: ["prendere", "volere", "costare", "pagare"],
    level: "A1",
  },
  {
    id: "stazione_treno",
    icon: "🚆",
    title: { en: "At the Train Station", es: "En la estación de tren", it: "In stazione ferroviaria" },
    description: {
      en: "Buy a train ticket to Florence, ask about schedule, platform, and seat reservation.",
      es: "Compra un boleto de tren a Florencia, consulta horario, andén y asiento.",
    },
    setting: "La biglietteria della stazione di Roma Termini o Milano Centrale.",
    characterRole: "Impiegato della biglietteria",
    objective: {
      en: "Purchase a train ticket, specify time, and check the platform.",
      es: "Comprar un billete de tren, especificar hora y consultar el andén.",
      it: "Comprare un biglietto, chiedere orari e binario di partenza.",
    },
    suggestedCharacter: "giulia",
    starterMessage: "Buongiorno. Dica pure, dove desidera andare e per quale orario?",
    suggestedVerbs: ["andare", "partire", "arrivare", "costare"],
    level: "A2",
  },
  {
    id: "ristorante_cena",
    icon: "🍝",
    title: { en: "Dinner at the Trattoria", es: "Cena en la trattoria", it: "A cena in trattoria" },
    description: {
      en: "Ask for a table, ask for local dish recommendations, and order a typical meal.",
      es: "Pide mesa, solicita recomendaciones de platos típicos y ordena tu cena.",
    },
    setting: "Una trattoria accogliente con tovaglie a scacchi e profumo di basilico.",
    characterRole: "Cameriere attento e cordiale",
    objective: {
      en: "Inquire about ingredients, express food preferences, and order dessert.",
      es: "Preguntar sobre ingredientes, expresar gustos y pedir postre.",
      it: "Chiedere i piatti del giorno, ordinare da mangiare e da bere.",
    },
    suggestedCharacter: "marco",
    starterMessage: "Buonasera! Avete prenotato un tavolo? Abbiamo ottimi piatti tipici fatti in casa stasera!",
    suggestedVerbs: ["mangiare", "bere", "consigliare", "preferire"],
    level: "A1",
  },
  {
    id: "mercato_frutta",
    icon: "🍎",
    title: { en: "At the Open-Air Market", es: "En el mercado de frutas", it: "Al mercato rionale" },
    description: {
      en: "Buy fresh produce, ask about weight, ripeness, and negotiate quantities.",
      es: "Compra frutas y verduras frescas, pregunta por peso, madurez y cantidades.",
    },
    setting: "Il mercato rionale rionale di Napoli con frutta fresca e verdura colorata.",
    characterRole: "Fruttivendola affettuosa e saggia",
    objective: {
      en: "Ask for quantities (un chilo, mezzo chilo) and ask if the fruit is sweet.",
      es: "Pedir cantidades (un kilo, medio kilo) y preguntar si la fruta está madura.",
      it: "Chiedere quantità, peso e scegliere frutta fresca di stagione.",
    },
    suggestedCharacter: "rosa",
    starterMessage: "Buongiorno gioia mia! Guarda che pomodori e che arance fresche oggi. Cosa ti serve per la spesa?",
    suggestedVerbs: ["pesare", "volere", "dare", "bastare"],
    level: "A1",
  },
  {
    id: "indicazioni_strada",
    icon: "🗺️",
    title: { en: "Asking for Directions", es: "Pidiendo direcciones", it: "Chiedere indicazioni" },
    description: {
      en: "You are lost in the historic center. Ask a passerby how to reach the main square or museum.",
      es: "Estás perdido en el centro histórico. Pide indicaciones para llegar a la plaza o museo.",
    },
    setting: "Una stradina del centro storico con vicoli e palazzi d'epoca.",
    characterRole: "Passante gentile e disponibile",
    objective: {
      en: "Understand directional verbs (girare a destra, andare dritto, attraversare).",
      es: "Comprender verbos de dirección (girar a la derecha, seguir recto, cruzar).",
      it: "Chiedere dov'è un luogo e comprendere le indicazioni stradali.",
    },
    suggestedCharacter: "luca",
    starterMessage: "Ciao! Ti vedo con la mappa in mano, ti serve un aiuto per trovare la strada?",
    suggestedVerbs: ["sapere", "girare", "continuare", "trovare"],
    level: "A2",
  },
  {
    id: "festa_universitaria",
    icon: "🎉",
    title: { en: "Meeting Someone at a Party", es: "Conociendo a alguien en una fiesta", it: "A una festa tra amici" },
    description: {
      en: "Introduce yourself, talk about your city, studies or hobbies, and find common interests.",
      es: "Preséntate, habla sobre tu ciudad, estudios o pasatiempos, y busca temas afines.",
    },
    setting: "Un appartamento studentesco a Bologna con musica indie e amici in terrazza.",
    characterRole: "Studente socievole",
    objective: {
      en: "Introduce yourself, ask questions about someone's life, and use casual conversation.",
      es: "Presentarte, hacer preguntas sobre la vida del otro y conversar informalmente.",
      it: "Presentarsi, raccontare da dove vieni e parlare di interessi e tempo libero.",
    },
    suggestedCharacter: "luca",
    starterMessage: "Ehi ciao! Piacere, io sono Luca. Non mi sembra di averti già visto da queste parti, sei qui con amici?",
    suggestedVerbs: ["chiamarsi", "abitare", "studiare", "ascoltare"],
    level: "A2",
  },
  {
    id: "aperitivo_milano",
    icon: "🍸",
    title: { en: "Aperitivo in Milan", es: "Aperitivo en Milán", it: "Aperitivo dopo il lavoro" },
    description: {
      en: "Join colleagues for a Spritz in Navigli, discuss how the week went, and talk about weekend plans.",
      es: "Suma al Spritz con colegas en Navigli, comenta cómo fue la semana y planes de fin de semana.",
    },
    setting: "Un locale moderno sui Navigli a Milano all'ora del tramonto.",
    characterRole: "Collega brillante e vivace",
    objective: {
      en: "Discuss past events (passato prossimo) and future plans (weekend).",
      es: "Conversar sobre eventos pasados y planes para el fin de semana.",
      it: "Raccontare com'è andata la settimana lavorativa e fare progetti per il weekend.",
    },
    suggestedCharacter: "giulia",
    starterMessage: "Meno male che è venerdì! Prendiamo uno Spritz o un analcolico? Com'è andata questa settimana?",
    suggestedVerbs: ["fare", "lavorare", "organizzare", "rilassarsi"],
    level: "B1",
  },
  {
    id: "ricetta_nonna",
    icon: "👵",
    title: { en: "Cooking with Nonna Rosa", es: "Cocinando con Nonna Rosa", it: "I segreti della pasta al sugo" },
    description: {
      en: "Learn the secrets of a traditional Italian sauce, asking step-by-step instructions.",
      es: "Aprende los secretos de una salsa tradicional paso a paso con Nonna Rosa.",
    },
    setting: "La cucina accogliente di Nonna Rosa con un grande tagliere di legno.",
    characterRole: "Nonna che spiega la cucina di casa",
    objective: {
      en: "Follow culinary instructions and understand everyday cooking verbs.",
      es: "Seguir instrucciones de cocina y comprender verbos culinarios cotidianos.",
      it: "Ascoltare la preparazione di un sugo e chiedere i segreti della ricetta.",
    },
    suggestedCharacter: "rosa",
    starterMessage: "Vieni qui vicino ai fornelli, tesoro! Oggi ti insegno come si fa il vero ragù napoletano. Sei pronto?",
    suggestedVerbs: ["mettere", "tagliare", "cuocere", "assaggiare"],
    level: "A1",
  },
];

export function getScenario(id?: string | null): Scenario | null {
  if (!id) return null;
  return SCENARIOS.find((s) => s.id === id) || null;
}
