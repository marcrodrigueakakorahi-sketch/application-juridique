import { test } from "node:test";
import assert from "node:assert/strict";
import { entierEnLettres, montantEnLettres } from "../src/lib/nombres.ts";
import { renderDocument, plainText, validateStep, completion, defaultData } from "../src/lib/moteur.ts";
import { reconnaissanceDette } from "../src/lib/actes/reconnaissance-dette.ts";
import { bailHabitation } from "../src/lib/actes/bail-habitation.ts";
import { parseMontant, formatMontant } from "../src/lib/nombres.ts";
import { miseEnDemeure } from "../src/lib/actes/mise-en-demeure.ts";

test("nombres en lettres", () => {
  const cas: [number, string][] = [
    [0, "zéro"], [1, "un"], [17, "dix-sept"], [21, "vingt et un"], [71, "soixante et onze"],
    [80, "quatre-vingts"], [81, "quatre-vingt-un"], [91, "quatre-vingt-onze"], [99, "quatre-vingt-dix-neuf"],
    [100, "cent"], [200, "deux cents"], [201, "deux cent un"], [1000, "mille"], [1200, "mille deux cents"],
    [80000, "quatre-vingt mille"], [200000, "deux cent mille"], [1000000, "un million"], [2500000, "deux millions cinq cent mille"],
  ];
  for (const [n, s] of cas) assert.equal(entierEnLettres(n), s, `n=${n}`);
});

test("montants en francs CFA", () => {
  assert.equal(montantEnLettres(1), "un franc CFA");
  assert.equal(montantEnLettres(250000), "deux cent cinquante mille francs CFA");
  assert.equal(montantEnLettres(1000000), "un million de francs CFA");
  assert.equal(montantEnLettres(1500000), "un million cinq cent mille francs CFA");
  assert.equal(formatMontant(1500000), "1 500 000 FCFA");
  assert.equal(parseMontant("150.000"), 150000);
  assert.equal(parseMontant("150 000 FCFA"), 150000);
});

const dette = {
  ...defaultData(reconnaissanceDette),
  debiteur_nom: "Koné Aminata", debiteur_naissance: "1990-04-02", debiteur_lieu_naissance: "Bouaké", debiteur_piece: "CI001234567", debiteur_adresse: "Yopougon Maroc", debiteur_tel: "0707123456",
  creancier_nom: "Kouassi Yao", creancier_piece: "CI007654321", creancier_adresse: "Cocody Angré",
  montant: "600000", date_remise: "2026-10-01", modalite: "echeances", mensualite: "50000", nb_mensualites: "10", date_premiere: "2026-12-01",
  lieu: "Abidjan", date_acte: "2026-11-17",
};

test("rendu conditionnel et filtres", () => {
  const txt = renderDocument(reconnaissanceDette, dette).map(plainText).join("\n");
  assert.match(txt, /six cent mille francs CFA \(600 000 FCFA\)/);
  assert.match(txt, /10 mensualités/);
  assert.match(txt, /transfert Mobile Money/);
  assert.match(txt, /injonction de payer/);
  assert.match(txt, /1er octobre 2026/);
  assert.match(txt, /sans intérêts/);
  assert.doesNotMatch(txt, /en une seule fois/);
  assert.doesNotMatch(txt, /\[/, "aucun champ manquant");
  assert.equal(completion(reconnaissanceDette, dette), 100);
});

test("contrôles de cohérence", () => {
  const w = reconnaissanceDette.checks!(dette).map((x) => x.message).join(" ");
  assert.match(w, /totalisent/); // 10 x 50 000 = 500 000 ≠ 600 000
  const usure = reconnaissanceDette.checks!({ ...dette, interets: true, taux: "20" }).map((x) => x.message).join(" ");
  assert.match(usure, /usure/);
  const bail = bailHabitation.checks!({ loyer: "150000", avance_mois: "6", caution_mois: "3" });
  assert.equal(bail.filter((x) => x.level === "bloquant").length, 2);
  const ok = bailHabitation.checks!({ loyer: "150000", avance_mois: "2", caution_mois: "2" });
  assert.equal(ok.filter((x) => x.level === "bloquant").length, 0);
  assert.match(ok.map((x) => x.message).join(" "), /600 000 FCFA/);
});

test("validation des champs", () => {
  const errs = validateStep(reconnaissanceDette.steps![2], { montant: "abc", origine: "pret" });
  assert.ok(errs.montant);
  assert.match(validateStep(reconnaissanceDette.steps![2], { montant: "1500,5", origine: "pret" }).montant, /centimes/);
  assert.ok(validateStep(reconnaissanceDette.steps![0], { debiteur_tel: "12345" }).debiteur_tel);
  assert.equal(validateStep(reconnaissanceDette.steps![0], { debiteur_tel: "+225 07 07 12 34 56" }).debiteur_tel, undefined);
  assert.ok(errs.date_remise);
  assert.equal(validateStep(miseEnDemeure.steps![0], { exp_nom: "X", exp_adresse: "Y", exp_email: "pas-un-mail" }).exp_email, "Adresse e-mail invalide.");
});

test("chaque champ utilisé dans un modèle existe", () => {
  for (const act of [reconnaissanceDette, bailHabitation, miseEnDemeure]) {
    const names = new Set(act.steps!.flatMap((s) => s.fields.map((f) => f.name)));
    for (const b of act.document!) {
      for (const m of b.text.matchAll(/\{\{\s*([a-zA-Z0-9_]+)/g)) {
        if (m[1] !== "aujourdhui") assert.ok(names.has(m[1]), `${act.id}: champ inconnu ${m[1]}`);
      }
    }
  }
});

test("l'assistant d'orientation ne pointe que vers des actes existants", async () => {
  const { QUESTIONS } = await import("../src/lib/orientation.ts");
  const { getActe } = await import("../src/lib/catalogue.ts");
  for (const q of Object.values(QUESTIONS)) {
    for (const c of q.choices) {
      if (c.next) assert.ok(QUESTIONS[c.next], `question inconnue ${c.next}`);
      for (const id of c.result?.acts ?? []) assert.ok(getActe(id), `acte inconnu ${id}`);
    }
  }
});
