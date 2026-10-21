import type { Persona, ChatMessage, CulturalStory } from '../types/conversation';

export const INITIAL_PERSONAS: Persona[] = [
  {
    id: 'matteo',
    name: 'Matteo',
    fullName: 'Matteo Rossi',
    age: 28,
    city: 'Firenze',
    region: 'Toscana',
    role: 'Barista & Guida Enogastronomica',
    cefrLevel: 'A1',
    levelLabel: 'A1-A2 · Principiante',
    dialectSpecialty: 'Italiano Standard & Fiorentino amichevole',
    bio: 'Nato e cresciuto tra le vie di Santo Spirito a Firenze. Prepara il miglior espresso della città e adora spiegare la cucina toscana con parole semplici e chiare.',
    topics: ['Caffè e colazione', 'Ordinare al ristorante', 'Meteo e saluti', 'Passeggiate a Firenze'],
    nativeSaying: "Meno male che c'è il caffè!",
    nativeSayingTranslation: 'Thank goodness there is coffee!',
    voiceId: 'Fenrir - Warm Tuscan',
    voiceGender: 'male',
    isOnline: true,
    unreadCount: 1,
    lastMessageSnippet: 'Ciao! Ti va un caffè al banco stamattina? Dimmi come ti chiami!',
    lastMessageTime: '09:42',
    sampleAudioText: 'Ciao carissimo! Benvenuto a Firenze. Ti insegno io come ordinare un caffè perfetto al banco!',
    personaPrompt: 'Sei Matteo Rossi, un barista toscano solare e accogliente di 28 anni a Firenze. Parli un italiano chiaro e incoraggiante per principianti A1/A2. Usa frasi quotidiane brevi, spiega le parole nuove con pazienza e trasmetti il calore del bar italiano.'
  },
  {
    id: 'sofia',
    name: 'Sofia',
    fullName: 'Sofia De Luca',
    age: 32,
    city: 'Roma',
    region: 'Lazio',
    role: "Storica dell'Arte & Curatrice",
    cefrLevel: 'B1',
    levelLabel: 'B1-B2 · Intermedio',
    dialectSpecialty: 'Italiano Espressivo & Modi di dire romani',
    bio: 'Lavora tra i Musei Capitolini e Villa Borghese. È una miniera di storie su Caravaggio, fontane nascoste e vita notturna a Trastevere.',
    topics: ['Arte e musei', 'Architettura romana', 'Cinema italiano', 'Consigli di viaggio'],
    nativeSaying: "Daje, Roma non è stata costruita in un giorno!",
    nativeSayingTranslation: "Come on, Rome wasn't built in a day!",
    voiceId: 'Aoede - Expressive Roman',
    voiceGender: 'female',
    isOnline: true,
    unreadCount: 2,
    lastMessageSnippet: 'Hai mai visto la volta della Cappella Sistina dal vivo? Che meraviglia...',
    lastMessageTime: '11:15',
    sampleAudioText: "Ciao! Che bello sentirti. Oggi a Roma c'è una luce magnifica sui fori imperiali. Di che cosa vogliamo parlare?",
    personaPrompt: "Sei Sofia De Luca, curatrice d'arte di 32 anni a Roma. Hai una parlata vivace, elegante con tocchi di calore romanesco educato. Aiuti lo studente con costruzioni grammaticali più ricche (congiuntivo, pronomi combinati) parlando di bellezza, cultura e viaggi."
  }
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  matteo: [
    {
      id: 'm1',
      sender: 'persona',
      personaId: 'matteo',
      text: 'Ciao! Benvenuto al mio bar qui a Firenze! ☕ Come stai oggi?',
      translation: 'Hello! Welcome to my coffee shop here in Florence! How are you doing today?',
      grammarNotes: [
        {
          wordOrPhrase: 'Benvenuto',
          explanation: 'Welcome (masculine singular). If speaking to a female, Italians say "Benvenuta".',
          category: 'grammar'
        },
        {
          wordOrPhrase: 'Come stai',
          explanation: 'Informal "How are you?" (from the verb stare - to be/stay).',
          category: 'verb'
        }
      ],
      audioDuration: '0:04',
      timestamp: '09:40',
      isVoiceNote: true
    },
    {
      id: 'm2',
      sender: 'persona',
      personaId: 'matteo',
      text: 'Se vuoi ordinare, puoi dire semplicemente: "Un caffè espresso per favore, grazie!". Ti va di provare?',
      translation: 'If you want to order, you can simply say: "An espresso coffee please, thank you!". Would you like to try?',
      grammarNotes: [
        {
          wordOrPhrase: 'per favore',
          explanation: 'Classic courteous phrase for "please". You can also hear "per piacere".',
          category: 'vocabulary'
        },
        {
          wordOrPhrase: 'Ti va di provare?',
          explanation: 'Idiomatic expression meaning "Do you feel like trying?" (andare a qualcuno + infinitive).',
          category: 'idiom'
        }
      ],
      timestamp: '09:42'
    }
  ],
  sofia: [
    {
      id: 's1',
      sender: 'persona',
      personaId: 'sofia',
      text: "Buongiorno da Roma! Mi trovo proprio davanti alla Fontana di Trevi. C'è un'atmosfera magica stamattina.",
      translation: 'Good morning from Rome! I am right in front of the Trevi Fountain. There is a magical atmosphere this morning.',
      grammarNotes: [
        {
          wordOrPhrase: 'Mi trovo',
          explanation: 'Reflexive verb "trovarsi" meaning "to find oneself / to be located". Very natural in Italian.',
          category: 'verb'
        },
        {
          wordOrPhrase: "C'è",
          explanation: 'Contraction of "ci è", meaning "there is". (Plural: "ci sono").',
          category: 'grammar'
        }
      ],
      audioDuration: '0:06',
      timestamp: '11:10',
      isVoiceNote: true
    },
    {
      id: 's2',
      sender: 'persona',
      personaId: 'sofia',
      text: 'Hai mai visitato Roma o stai programmando un viaggio in Italia?',
      translation: 'Have you ever visited Rome or are you planning a trip to Italy?',
      grammarNotes: [
        {
          wordOrPhrase: 'Hai mai visitato',
          explanation: 'Passato prossimo tense with "mai" (ever). Formed with auxiliary avere + past participle.',
          category: 'grammar'
        },
        {
          wordOrPhrase: 'stai programmando',
          explanation: 'Present progressive tense: stare + gerund (-ando/-endo). Meaning "are you planning".',
          category: 'verb'
        }
      ],
      timestamp: '11:15'
    }
  ]
};

export const CULTURAL_STORIES: CulturalStory[] = [
  {
    id: 'story-1',
    personaId: 'matteo',
    title: 'Il Caffè Sospeso',
    subtitle: 'Nobile tradizione napoletana e italiana',
    snippet: 'Quando ordini due caffè e ne lasci uno pagato per chi ne ha bisogno.',
    duration: '1:12'
  },
  {
    id: 'story-2',
    personaId: 'sofia',
    title: 'I Gesti Parlanti',
    subtitle: 'Come parlare con le mani senza dire una parola',
    snippet: 'La gestualità italiana non è solo movimento, è una seconda grammatica!',
    duration: '0:58'
  }
];

export const ITALIAN_PRACTICE_PHRASES = [
  { it: "Vorrei un cappuccino con latte d'avena, per favore.", en: 'I would like an oat milk cappuccino, please.' },
  { it: 'Che cosa mi consigli di tipico da assaggiare qui?', en: 'What typical specialty do you recommend I taste here?' },
  { it: 'Scusa, sai a che ora chiudono i musei oggi?', en: 'Excuse me, do you know what time the museums close today?' },
  { it: "Puoi parlare un po' più lentamente? Sto imparando!", en: 'Can you speak a little slower? I am learning!' },
  { it: 'Come si dice questa parola in italiano corretto?', en: 'How do you say this word in proper Italian?' }
];

export function generatePersonaFallbackMessage(persona: Persona, userText: string): ChatMessage {
  const lower = userText.toLowerCase();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (persona.id === 'matteo') {
    if (lower.includes('caffè') || lower.includes('ordinare') || lower.includes('bar')) {
      return {
        id: `b-${Date.now()}`,
        sender: 'persona',
        personaId: 'matteo',
        text: 'A Firenze diciamo: "Prendo un caffè al volo, grazie!". "Al volo" significa fare qualcosa in fretta. Vuoi provare a usarlo?',
        translation: 'In Florence we say: "I\'ll take a quick coffee on the fly, thanks!". "Al volo" means doing something quickly. Would you like to try using it?',
        grammarNotes: [
          {
            wordOrPhrase: 'Al volo',
            explanation: 'Italian idiom meaning "on the fly / quickly / in a rush".',
            category: 'idiom'
          },
          {
            wordOrPhrase: 'Prendo',
            explanation: 'Present tense of prendere (to take), used when ordering.',
            category: 'verb'
          }
        ],
        timestamp: time
      };
    }

    return {
      id: `b-${Date.now()}`,
      sender: 'persona',
      personaId: 'matteo',
      text: 'Bravissimo! Mi fa sempre piacere chiacchierare in italiano. Ti va se ti spiego come descrivere la colazione tipica italiana?',
      translation: "Very good! It's always a pleasure to chat in Italian. How about I explain how to describe a typical Italian breakfast?",
      grammarNotes: [
        {
          wordOrPhrase: 'chiacchierare',
          explanation: 'To chat / have a friendly conversation.',
          category: 'verb'
        }
      ],
      timestamp: time
    };
  }

  return {
    id: `b-${Date.now()}`,
    sender: 'persona',
    personaId: persona.id,
    text: 'Che bella frase! In Italia apprezziamo molto la spontaneità nella conversazione. Come posso aiutarti oggi?',
    translation: 'What a nice sentence! In Italy we really appreciate spontaneity in conversation. How can I help you today?',
    grammarNotes: [
      {
        wordOrPhrase: 'spontaneità',
        explanation: 'Natural spontaneity in spoken expression.',
        category: 'vocabulary'
      }
    ],
    timestamp: time
  };
}

export function generateCallFallback(persona: Persona, userText: string): { it: string; en: string } {
  const lower = userText.toLowerCase();

  if (persona.id === 'matteo') {
    if (lower.includes('caffè') || lower.includes('ordinare')) {
      return {
        it: 'Ottima pronuncia! Al banco a Firenze diciamo "Un espresso macchiato caldo, per favore". Prova a ripeterlo!',
        en: 'Great pronunciation! At the counter in Florence we say "A warm espresso macchiato, please". Try repeating it!'
      };
    }
    return {
      it: 'Ti sento forte e chiaro! Hai usato una bellissima espressione. Vuoi fare un altro tentativo di conversazione?',
      en: 'I hear you loud and clear! You used a wonderful expression. Want to make another conversation attempt?'
    };
  }

  if (persona.id === 'sofia') {
    return {
      it: 'Bravissimo! A Roma apprezziamo tanto chi parla con questa naturalezza. Continua pure!',
      en: 'Well done! In Rome we really appreciate those who speak with such natural ease. Keep going!'
    };
  }

  return {
    it: "Molto bene! Ricordati di scandire bene le vocali finali. Stai migliorando a vista d'occhio!",
    en: 'Very good! Remember to enunciate the ending vowels well. You are improving visibly!'
  };
}
