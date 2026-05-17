import type { TraduciItem } from "../types";

export const traduciItems: TraduciItem[] = [
  {
    es: "Yo voy al supermercado todos los días.",
    answer: "io vado al supermercato tutti i giorni",
    accept: [
      "io vado al supermercato tutti i giorni",
      "vado al supermercato tutti i giorni",
    ],
    hintIt: "supermercato = supermercado, tutti i giorni = todos los días",
    hintEs: "supermercato = supermercado, tutti i giorni = todos los días",
    verbs: ["andare"],
  },
  {
    es: "¿Qué haces tú mañana por la mañana?",
    answer: "cosa fai tu domani mattina",
    accept: [
      "cosa fai tu domani mattina",
      "cosa fai domani mattina",
      "tu cosa fai domani mattina",
    ],
    hintIt: "domani mattina = mañana por la mañana",
    hintEs: "domani mattina = mañana por la mañana",
    verbs: ["fare"],
  },
  {
    es: "Nosotros decimos siempre la verdad.",
    answer: "noi diciamo sempre la verità",
    accept: [
      "noi diciamo sempre la verità",
      "diciamo sempre la verità",
    ],
    hintIt: "la verità = la verdad, sempre = siempre",
    hintEs: "la verità = la verdad, sempre = siempre",
    verbs: ["dire"],
  },
  {
    es: "Ellos van al parque con los niños.",
    answer: "loro vanno al parco con i bambini",
    accept: [
      "loro vanno al parco con i bambini",
      "vanno al parco con i bambini",
    ],
    hintIt: "il parco = el parque, i bambini = los niños",
    hintEs: "il parco = el parque, i bambini = los niños",
    verbs: ["andare"],
  },
  {
    es: "¿Qué dice ella del nuevo profesor?",
    answer: "cosa dice lei del nuovo professore",
    accept: [
      "cosa dice lei del nuovo professore",
      "lei cosa dice del nuovo professore",
      "che cosa dice lei del nuovo professore",
    ],
    hintIt: "il professore = el profesor, nuovo = nuevo",
    hintEs: "il professore = el profesor, nuovo = nuevo",
    verbs: ["dire"],
  },
];
