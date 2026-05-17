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
  // essere
  {
    es: "Nosotros somos estudiantes de italiano.",
    answer: "noi siamo studenti di italiano",
    accept: [
      "noi siamo studenti di italiano",
      "siamo studenti di italiano",
    ],
    hintIt: "studenti = estudiantes",
    hintEs: "studenti = estudiantes",
    verbs: ["essere"],
  },
  {
    es: "Ella es muy simpática.",
    answer: "lei è molto simpatica",
    accept: [
      "lei è molto simpatica",
      "è molto simpatica",
    ],
    hintIt: "simpatica = simpática",
    hintEs: "simpatica = simpática",
    verbs: ["essere"],
  },
  {
    es: "¿Ustedes están listos?",
    answer: "voi siete pronti",
    accept: [
      "voi siete pronti",
      "siete pronti",
    ],
    hintIt: "pronti = listos",
    hintEs: "pronti = listos",
    verbs: ["essere"],
  },
  // avere
  {
    es: "Yo tengo mucha hambre.",
    answer: "io ho molta fame",
    accept: [
      "io ho molta fame",
      "ho molta fame",
    ],
    hintIt: "fame = hambre, molta = mucha",
    hintEs: "fame = hambre, molta = mucha",
    verbs: ["avere"],
  },
  {
    es: "Ellos tienen dos hijos.",
    answer: "loro hanno due figli",
    accept: [
      "loro hanno due figli",
      "hanno due figli",
    ],
    hintIt: "figli = hijos, due = dos",
    hintEs: "figli = hijos, due = dos",
    verbs: ["avere"],
  },
  {
    es: "¿Tú tienes tiempo mañana?",
    answer: "tu hai tempo domani",
    accept: [
      "tu hai tempo domani",
      "hai tempo domani",
    ],
    hintIt: "tempo = tiempo, domani = mañana",
    hintEs: "tempo = tiempo, domani = mañana",
    verbs: ["avere"],
  },
  // potere
  {
    es: "Yo no puedo dormir.",
    answer: "io non posso dormire",
    accept: [
      "io non posso dormire",
      "non posso dormire",
    ],
    hintIt: "dormire = dormir",
    hintEs: "dormire = dormir",
    verbs: ["potere"],
  },
  {
    es: "¿Podemos salir esta noche?",
    answer: "possiamo uscire stasera",
    accept: [
      "possiamo uscire stasera",
      "noi possiamo uscire stasera",
    ],
    hintIt: "uscire = salir, stasera = esta noche",
    hintEs: "uscire = salir, stasera = esta noche",
    verbs: ["potere"],
  },
  {
    es: "Ellos no pueden venir.",
    answer: "loro non possono venire",
    accept: [
      "loro non possono venire",
      "non possono venire",
    ],
    hintIt: "venire = venir",
    hintEs: "venire = venir",
    verbs: ["potere"],
  },
  // volere
  {
    es: "Yo quiero aprender italiano.",
    answer: "io voglio imparare l'italiano",
    accept: [
      "io voglio imparare l'italiano",
      "voglio imparare l'italiano",
      "io voglio imparare italiano",
      "voglio imparare italiano",
    ],
    hintIt: "imparare = aprender",
    hintEs: "imparare = aprender",
    verbs: ["volere"],
  },
  {
    es: "Ella quiere un café.",
    answer: "lei vuole un caffè",
    accept: [
      "lei vuole un caffè",
      "vuole un caffè",
    ],
    hintIt: "caffè = café",
    hintEs: "caffè = café",
    verbs: ["volere"],
  },
  {
    es: "¿Qué quieres tú?",
    answer: "cosa vuoi tu",
    accept: [
      "cosa vuoi tu",
      "tu cosa vuoi",
      "cosa vuoi",
      "che cosa vuoi",
    ],
    hintIt: "cosa = qué",
    hintEs: "cosa = qué",
    verbs: ["volere"],
  },
  // dovere
  {
    es: "Yo debo trabajar mañana.",
    answer: "io devo lavorare domani",
    accept: [
      "io devo lavorare domani",
      "devo lavorare domani",
    ],
    hintIt: "lavorare = trabajar, domani = mañana",
    hintEs: "lavorare = trabajar, domani = mañana",
    verbs: ["dovere"],
  },
  {
    es: "Nosotros debemos estudiar.",
    answer: "noi dobbiamo studiare",
    accept: [
      "noi dobbiamo studiare",
      "dobbiamo studiare",
    ],
    hintIt: "studiare = estudiar",
    hintEs: "studiare = estudiar",
    verbs: ["dovere"],
  },
  {
    es: "Ellos deben pagar la cuenta.",
    answer: "loro devono pagare il conto",
    accept: [
      "loro devono pagare il conto",
      "devono pagare il conto",
    ],
    hintIt: "pagare = pagar, il conto = la cuenta",
    hintEs: "pagare = pagar, il conto = la cuenta",
    verbs: ["dovere"],
  },
];
