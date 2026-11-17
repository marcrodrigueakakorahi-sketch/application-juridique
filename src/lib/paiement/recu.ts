// Reçus de paiement signés (HMAC-SHA256). Un reçu prouve, sans base de données,
// qu'un document précis (docId) d'un acte précis (actId) a été payé.

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { ModePaiement } from "./config";

export interface Recu {
  docId: string;
  actId: string;
  transactionId: string;
  montant: number;
  date: string;
  mode: ModePaiement;
}

const b64 = (buf: Buffer) => buf.toString("base64url");

export function signerRecu(recu: Recu, secret: string): string {
  const payload = b64(Buffer.from(JSON.stringify(recu)));
  const sig = b64(createHmac("sha256", secret).update(payload).digest());
  return `${payload}.${sig}`;
}

export function lireRecu(jeton: unknown, secret: string): Recu | null {
  if (typeof jeton !== "string" || jeton.length > 2000) return null;
  const [payload, sig] = jeton.split(".");
  if (!payload || !sig) return null;
  const attendu = createHmac("sha256", secret).update(payload).digest();
  const recu = Buffer.from(sig, "base64url");
  if (recu.length !== attendu.length || !timingSafeEqual(recu, attendu)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Recu;
  } catch {
    return null;
  }
}

/** Empreinte du document, intégrée à l'identifiant de transaction. */
function empreinte(docId: string, secret: string): string {
  return createHash("sha256").update(`${secret}:${docId}`).digest("hex").slice(0, 10).toUpperCase();
}

/**
 * Identifiant de transaction lié au document : « AF » + empreinte + horodatage + aléa.
 * Uniquement des lettres et des chiffres (CinetPay déconseille les caractères spéciaux).
 */
export function nouvelleTransaction(docId: string, secret: string): string {
  const alea = randomBytes(3).toString("hex").toUpperCase();
  return `AF${empreinte(docId, secret)}${Date.now().toString(36).toUpperCase()}${alea}`;
}

export function transactionDuDocument(transactionId: string, docId: string, secret: string): boolean {
  return transactionId.startsWith(`AF${empreinte(docId, secret)}`);
}

export const ID_VALIDE = /^[A-Za-z0-9-]{8,64}$/;
