"use client";
// Stockage local des brouillons et documents (phase 1, avant la base de données).
// Toutes les lectures/écritures sont protégées : le stockage peut être indisponible
// (navigation privée, cookies bloqués) et l'application doit continuer à fonctionner.

import type { FormData } from "./types";

export interface SavedDoc {
  id: string;
  actId: string;
  title: string;
  data: FormData;
  step: number;
  updatedAt: string;
  generatedAt?: string;
  /** Reçu de paiement signé par le serveur. */
  recu?: string;
  paidAt?: string;
}

const KEY = "actefacile.documents.v1";

export function listDocs(): SavedDoc[] {
  try {
    const raw = localStorage.getItem(KEY);
    const docs = raw ? (JSON.parse(raw) as SavedDoc[]) : [];
    return docs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export function getDoc(id: string): SavedDoc | undefined {
  return listDocs().find((d) => d.id === id);
}

export function saveDoc(doc: SavedDoc): void {
  try {
    const docs = listDocs().filter((d) => d.id !== doc.id);
    docs.push({ ...doc, updatedAt: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(docs));
  } catch {
    /* stockage indisponible : on ignore */
  }
}

export function deleteDoc(id: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(listDocs().filter((d) => d.id !== id)));
  } catch {
    /* ignore */
  }
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}
