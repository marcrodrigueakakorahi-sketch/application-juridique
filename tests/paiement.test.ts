import { test } from "node:test";
import assert from "node:assert/strict";
import { lireRecu, nouvelleTransaction, signerRecu, transactionDuDocument } from "../src/lib/paiement/recu.ts";

const SECRET = "x".repeat(40);
const recu = { docId: "doc-12345678", actId: "bail-habitation", transactionId: "AF123", montant: 10000, date: "2026-11-17T10:00:00Z", mode: "cinetpay" as const };

test("un reçu signé se relit à l'identique", () => {
  assert.deepEqual(lireRecu(signerRecu(recu, SECRET), SECRET), recu);
});

test("un reçu falsifié ou signé avec une autre clé est refusé", () => {
  const jeton = signerRecu(recu, SECRET);
  const [, sig] = jeton.split(".");
  const faux = Buffer.from(JSON.stringify({ ...recu, actId: "autre" })).toString("base64url");
  assert.equal(lireRecu(`${faux}.${sig}`, SECRET), null);
  assert.equal(lireRecu(jeton, "y".repeat(40)), null);
  assert.equal(lireRecu("n'importe quoi", SECRET), null);
  assert.equal(lireRecu(undefined, SECRET), null);
});

test("l'identifiant de transaction est lié au document", () => {
  const tx = nouvelleTransaction("doc-12345678", SECRET);
  assert.match(tx, /^AF[A-Z0-9]+$/, "lettres et chiffres uniquement");
  assert.ok(tx.length <= 40);
  assert.ok(transactionDuDocument(tx, "doc-12345678", SECRET));
  assert.ok(!transactionDuDocument(tx, "doc-autre-0000", SECRET));
  assert.notEqual(tx, nouvelleTransaction("doc-12345678", SECRET), "chaque paiement a un identifiant unique");
});
