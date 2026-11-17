"use client";
// Appels du navigateur vers les routes de paiement et de génération de documents.

import type { FormData } from "./types";

export type ModePaiement = "cinetpay" | "demo";

export interface PaiementEnCours {
  transactionId: string;
  docId: string;
  actId: string;
}

const CLE_EN_COURS = "actefacile.paiement.encours";

export function memoriserPaiement(p: PaiementEnCours) {
  try {
    localStorage.setItem(CLE_EN_COURS, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function paiementEnCours(): PaiementEnCours | null {
  try {
    const raw = localStorage.getItem(CLE_EN_COURS);
    return raw ? (JSON.parse(raw) as PaiementEnCours) : null;
  } catch {
    return null;
  }
}

export function oublierPaiement() {
  try {
    localStorage.removeItem(CLE_EN_COURS);
  } catch {
    /* ignore */
  }
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { erreur?: string }).erreur ?? `Erreur ${res.status}`);
  return json as T;
}

export async function modePaiement(): Promise<ModePaiement> {
  try {
    const res = await fetch("/api/paiement/config", { cache: "no-store" });
    return ((await res.json()) as { mode: ModePaiement }).mode;
  } catch {
    return "demo";
  }
}

export function initierPaiement(actId: string, docId: string) {
  return post<{ mode: ModePaiement; transactionId: string; url?: string; recu?: string }>("/api/paiement/initier", { actId, docId });
}

export function verifierPaiement(p: PaiementEnCours) {
  return post<{ statut: "paye" | "en_attente" | "echec"; recu?: string; detail?: string }>("/api/paiement/verifier", p);
}

export async function telecharger(actId: string, docId: string, data: FormData, recu: string | undefined, format: "pdf" | "docx") {
  const res = await fetch("/api/document", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actId, docId, data, recu, format }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { erreur?: string }).erreur ?? `Erreur ${res.status}`);
  }
  const blob = await res.blob();
  const nom = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? `${actId}.${format}`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nom;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
