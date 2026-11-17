import { getActe, isAvailable } from "@/lib/catalogue";
import { configPaiement, secretPaiement } from "@/lib/paiement/config";
import { initierPaiement } from "@/lib/paiement/cinetpay";
import { ID_VALIDE, nouvelleTransaction, signerRecu } from "@/lib/paiement/recu";
import { erreur, lireJson, origine } from "@/lib/paiement/serveur";

export const runtime = "nodejs";

/** Démarre un paiement. Le prix vient toujours du catalogue, jamais du navigateur. */
export async function POST(req: Request) {
  const body = await lireJson(req);
  const actId = String(body?.actId ?? "");
  const docId = String(body?.docId ?? "");
  const act = getActe(actId);
  if (!act || !isAvailable(act)) return erreur("Acte inconnu.");
  if (!ID_VALIDE.test(docId)) return erreur("Document invalide.");

  const cfg = configPaiement();
  const secret = secretPaiement();
  const transactionId = nouvelleTransaction(docId, secret);
  const date = new Date().toISOString();

  // Acte gratuit ou mode démonstration : reçu délivré immédiatement.
  if (act.prix === 0 || cfg.mode === "demo") {
    const recu = { docId, actId, transactionId, montant: act.prix, date, mode: cfg.mode };
    return Response.json({ mode: cfg.mode, recu: signerRecu(recu, secret), transactionId });
  }

  const base = origine(req);
  try {
    const url = await initierPaiement({
      transactionId,
      montant: act.prix,
      description: `ActeFacile ${act.title}`.replace(/[#/$_&]/g, " ").slice(0, 100),
      notifyUrl: `${base}/api/paiement/notification`,
      returnUrl: `${base}/api/paiement/retour?doc=${encodeURIComponent(docId)}&acte=${encodeURIComponent(actId)}`,
      metadata: `${actId}`,
    });
    return Response.json({ mode: cfg.mode, url, transactionId });
  } catch (e) {
    console.error("[paiement] initialisation", e);
    return erreur("Le service de paiement est momentanément indisponible. Réessayez dans quelques instants.", 502);
  }
}
