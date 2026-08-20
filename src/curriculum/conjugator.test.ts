import { describe, expect, it } from "vitest";
import { PRONOUNS, conjugate, pastParticiple } from "./conjugator";
import { VERBS, getVerb } from "./verbs";
import { TENSES } from "./types";
import type { Tense, VerbEntry } from "./types";

// The conjugator is the highest-consequence pure code in the app: a wrong form
// teaches a learner wrong Italian. Expected tables below are written out in
// full rather than derived, so a rule change cannot silently "confirm" itself.

function forms(id: string, tense: Tense): string[] {
  const verb = getVerb(id);
  if (!verb) throw new Error(`test refers to a verb missing from the registry: ${id}`);
  return conjugate(verb, tense);
}

/**
 * Build a verb entry that is not in the registry. The -care/-gare and -ciare
 * spelling rules are implemented in the engine but no registry verb currently
 * exercises them (see docs/15-quality-and-testing.md work log), so they are
 * tested against synthetic entries to keep the rules from silently rotting.
 */
function synthetic(infinitive: string, group: VerbEntry["group"] = "are"): VerbEntry {
  return {
    id: `synthetic-${infinitive}`,
    infinitive,
    en: "(test)",
    es: "(test)",
    group,
    auxiliary: "avere",
    level: 1,
  };
}

describe("regular conjugation by group", () => {
  it("conjugates a regular -are verb in every taught tense", () => {
    expect(forms("parlare", "presente")).toEqual(["parlo", "parli", "parla", "parliamo", "parlate", "parlano"]);
    expect(forms("parlare", "imperfetto")).toEqual(["parlavo", "parlavi", "parlava", "parlavamo", "parlavate", "parlavano"]);
    expect(forms("parlare", "futuro_semplice")).toEqual(["parlerò", "parlerai", "parlerà", "parleremo", "parlerete", "parleranno"]);
    expect(forms("parlare", "passato_prossimo")).toEqual([
      "ho parlato", "hai parlato", "ha parlato", "abbiamo parlato", "avete parlato", "hanno parlato",
    ]);
  });

  it("conjugates a regular -ere verb", () => {
    expect(forms("credere", "presente")).toEqual(["credo", "credi", "crede", "crediamo", "credete", "credono"]);
    expect(forms("credere", "imperfetto")).toEqual(["credevo", "credevi", "credeva", "credevamo", "credevate", "credevano"]);
    expect(forms("credere", "futuro_semplice")).toEqual(["crederò", "crederai", "crederà", "crederemo", "crederete", "crederanno"]);
  });

  it("conjugates a regular -ire verb", () => {
    expect(forms("dormire", "presente")).toEqual(["dormo", "dormi", "dorme", "dormiamo", "dormite", "dormono"]);
    expect(forms("dormire", "imperfetto")).toEqual(["dormivo", "dormivi", "dormiva", "dormivamo", "dormivate", "dormivano"]);
    expect(forms("dormire", "futuro_semplice")).toEqual(["dormirò", "dormirai", "dormirà", "dormiremo", "dormirete", "dormiranno"]);
  });

  it("conjugates an -isc- type -ire verb", () => {
    expect(forms("capire", "presente")).toEqual(["capisco", "capisci", "capisce", "capiamo", "capite", "capiscono"]);
    // The -isc- infix belongs to the present only: other tenses are plain -ire.
    expect(forms("capire", "imperfetto")).toEqual(["capivo", "capivi", "capiva", "capivamo", "capivate", "capivano"]);
    expect(forms("capire", "futuro_semplice")).toEqual(["capirò", "capirai", "capirà", "capiremo", "capirete", "capiranno"]);
    expect(forms("finire", "presente")).toEqual(["finisco", "finisci", "finisce", "finiamo", "finite", "finiscono"]);
    expect(forms("preferire", "presente")).toEqual([
      "preferisco", "preferisci", "preferisce", "preferiamo", "preferite", "preferiscono",
    ]);
  });
});

describe("spelling rules", () => {
  it("-care and -gare insert h before i/e endings to keep the hard sound", () => {
    expect(conjugate(synthetic("giocare"), "presente")).toEqual([
      "gioco", "giochi", "gioca", "giochiamo", "giocate", "giocano",
    ]);
    expect(conjugate(synthetic("giocare"), "futuro_semplice")).toEqual([
      "giocherò", "giocherai", "giocherà", "giocheremo", "giocherete", "giocheranno",
    ]);
    expect(conjugate(synthetic("pagare"), "presente")).toEqual([
      "pago", "paghi", "paga", "paghiamo", "pagate", "pagano",
    ]);
    expect(conjugate(synthetic("pagare"), "futuro_semplice")[0]).toBe("pagherò");
    expect(conjugate(synthetic("cercare"), "presente")[1]).toBe("cerchi");
  });

  it("-iare collapses the doubled i at the stem boundary", () => {
    expect(forms("studiare", "presente")).toEqual(["studio", "studi", "studia", "studiamo", "studiate", "studiano"]);
    expect(forms("mangiare", "presente")).toEqual(["mangio", "mangi", "mangia", "mangiamo", "mangiate", "mangiano"]);
  });

  it("-ciare and -giare drop the i in the futuro stem", () => {
    // mangiare -> mangerò (not "mangierò").
    expect(forms("mangiare", "futuro_semplice")).toEqual([
      "mangerò", "mangerai", "mangerà", "mangeremo", "mangerete", "mangeranno",
    ]);
    // A plain -iare verb keeps its i: studiare -> studierò.
    expect(forms("studiare", "futuro_semplice")[0]).toBe("studierò");
    // -ciare behaves like -giare: cominciare -> comincerò (not "comincierò").
    expect(conjugate(synthetic("cominciare"), "futuro_semplice")[0]).toBe("comincerò");
    expect(conjugate(synthetic("cominciare"), "presente")).toEqual([
      "comincio", "cominci", "comincia", "cominciamo", "cominciate", "cominciano",
    ]);
  });
});

describe("irregular overrides from the registry", () => {
  it("uses the irregular presente table when present", () => {
    expect(forms("essere", "presente")).toEqual(["sono", "sei", "è", "siamo", "siete", "sono"]);
    expect(forms("avere", "presente")).toEqual(["ho", "hai", "ha", "abbiamo", "avete", "hanno"]);
    expect(forms("fare", "presente")).toEqual(["faccio", "fai", "fa", "facciamo", "fate", "fanno"]);
  });

  it("uses the irregular imperfetto table and imperfettoStem", () => {
    expect(forms("essere", "imperfetto")).toEqual(["ero", "eri", "era", "eravamo", "eravate", "erano"]);
    // fare and dire take a stem override, not a full table.
    expect(forms("fare", "imperfetto")).toEqual(["facevo", "facevi", "faceva", "facevamo", "facevate", "facevano"]);
    expect(forms("dire", "imperfetto")).toEqual(["dicevo", "dicevi", "diceva", "dicevamo", "dicevate", "dicevano"]);
  });

  it("uses futuroStem overrides", () => {
    expect(forms("essere", "futuro_semplice")).toEqual(["sarò", "sarai", "sarà", "saremo", "sarete", "saranno"]);
    expect(forms("avere", "futuro_semplice")[0]).toBe("avrò");
    expect(forms("andare", "futuro_semplice")[0]).toBe("andrò");
    expect(forms("volere", "futuro_semplice")[0]).toBe("vorrò");
    expect(forms("vivere", "futuro_semplice")[0]).toBe("vivrò");
    // dire has no override: the regular -ire rule already yields "dirò".
    expect(forms("dire", "futuro_semplice")[0]).toBe("dirò");
  });

  it("uses irregular participles", () => {
    expect(pastParticiple(getVerb("fare")!)).toBe("fatto");
    expect(pastParticiple(getVerb("dire")!)).toBe("detto");
    expect(pastParticiple(getVerb("scrivere")!)).toBe("scritto");
    expect(pastParticiple(getVerb("leggere")!)).toBe("letto");
    expect(pastParticiple(getVerb("prendere")!)).toBe("preso");
    expect(pastParticiple(getVerb("vivere")!)).toBe("vissuto");
  });

  it("derives regular participles by group", () => {
    expect(pastParticiple(getVerb("parlare")!)).toBe("parlato");
    expect(pastParticiple(getVerb("credere")!)).toBe("creduto");
    expect(pastParticiple(getVerb("dormire")!)).toBe("dormito");
    expect(pastParticiple(getVerb("capire")!)).toBe("capito");
  });
});

describe("passato prossimo auxiliary and agreement", () => {
  it("uses avere without participle agreement", () => {
    expect(forms("mangiare", "passato_prossimo")).toEqual([
      "ho mangiato", "hai mangiato", "ha mangiato", "abbiamo mangiato", "avete mangiato", "hanno mangiato",
    ]);
  });

  it("uses essere and agrees the participle in number", () => {
    // Masculine default by design (documented caveat): singular -o, plural -i.
    expect(forms("andare", "passato_prossimo")).toEqual([
      "sono andato", "sei andato", "è andato", "siamo andati", "siete andati", "sono andati",
    ]);
    expect(forms("partire", "passato_prossimo")).toEqual([
      "sono partito", "sei partito", "è partito", "siamo partiti", "siete partiti", "sono partiti",
    ]);
    // Irregular participle plus essere agreement.
    expect(forms("venire", "passato_prossimo")).toEqual([
      "sono venuto", "sei venuto", "è venuto", "siamo venuti", "siete venuti", "sono venuti",
    ]);
  });
});

describe("registry-wide invariants", () => {
  it("has six pronouns", () => {
    expect(PRONOUNS).toHaveLength(6);
  });

  it("produces six well-formed lowercase forms for every verb in every tense", () => {
    for (const verb of VERBS) {
      for (const tense of TENSES) {
        const result = conjugate(verb, tense);
        expect(result, `${verb.id}/${tense}`).toHaveLength(6);
        for (const form of result) {
          expect(typeof form, `${verb.id}/${tense}`).toBe("string");
          expect(form.trim(), `${verb.id}/${tense}`).not.toBe("");
          expect(form, `${verb.id}/${tense}`).not.toContain("undefined");
          expect(form, `${verb.id}/${tense}`).toBe(form.toLowerCase());
        }
      }
    }
  });

  it("gives every irregular override exactly six forms", () => {
    for (const verb of VERBS) {
      for (const [tense, table] of Object.entries(verb.irregular ?? {})) {
        expect(table, `${verb.id}/${tense}`).toHaveLength(6);
      }
    }
  });

  it("uses unique verb ids", () => {
    const ids = VERBS.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
