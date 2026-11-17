import { getActe, isAvailable } from "@/lib/catalogue";
import { completion, renderDocument } from "@/lib/moteur";
import { buildDOCX, buildPDF, fileName } from "@/lib/documents";
import { secretPaiement } from "@/lib/paiement/config";
import { ID_VALIDE, lireRecu } from "@/lib/paiement/recu";
import { erreur, lireJson } from "@/lib/paiement/serveur";
import type { FormData } from "@/lib/types";

export const runtime = "nodejs";

function nettoyer(raw: unknown): FormData | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out: FormData = {};
  const entries = Object.entries(raw as Record<string, unknown>);
  if (entries.length > 200) return null;
  for (const [k, v] of entries) {
    if (!/^[a-zA-Z0-9_]{1,64}$/.test(k)) return null;
    if (typeof v === "boolean") out[k] = v;
    else if (typeof v === "string" && v.length <= 5000) out[k] = v;
    else return null;
  }
  return out;
}

/** Fabrique le document final, uniquement si l'acte est gratuit ou si un reçu valide est présenté. */
export async function POST(req: Request) {
  const body = await lireJson(req);
  const act = getActe(String(body?.actId ?? ""));
  const docId = String(body?.docId ?? "");
  const format = body?.format === "docx" ? "docx" : "pdf";
  const data = nettoyer(body?.data);
  if (!act || !isAvailable(act) || !ID_VALIDE.test(docId) || !data) return erreur("Demande invalide.");

  if (act.prix > 0) {
    const recu = lireRecu(body?.recu, secretPaiement());
    if (!recu || recu.docId !== docId || recu.actId !== act.id) return erreur("Paiement requis pour télécharger ce document.", 402);
  }

  if (completion(act, data) < 100) return erreur("Des informations obligatoires manquent.", 422);
  if ((act.checks?.(data) ?? []).some((w) => w.level === "bloquant")) {
    return erreur("Le document contient une erreur à corriger avant le téléchargement.", 422);
  }

  const blocks = renderDocument(act, data);
  const bytes = format === "pdf" ? buildPDF(blocks) : await buildDOCX(act, blocks);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileName(act, format)}"`,
      "Cache-Control": "no-store",
    },
  });
}
