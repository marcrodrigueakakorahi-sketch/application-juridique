import { getActe } from "@/lib/catalogue";
import { configPaiement, secretPaiement } from "@/lib/paiement/config";
import { verifierPaiement } from "@/lib/paiement/cinetpay";
import { ID_VALIDE, signerRecu, transactionDuDocument } from "@/lib/paiement/recu";
import { erreur, lireJson } from "@/lib/paiement/serveur";

export const runtime = "nodejs";

/** Vérifie une transaction auprès de CinetPay et, si elle est payée, délivre un reçu signé. */
export async function POST(req: Request) {
  const body = await lireJson(req);
  const transactionId = String(body?.transactionId ?? "");
  const docId = String(body?.docId ?? "");
  const act = getActe(String(body?.actId ?? ""));
  if (!act || !ID_VALIDE.test(docId) || !/^AF[A-Z0-9]{10,40}$/.test(transactionId)) return erreur("Demande invalide.");

  const secret = secretPaiement();
  if (!transactionDuDocument(transactionId, docId, secret)) return erreur("Cette transaction ne correspond pas à ce document.", 403);
  if (configPaiement().mode !== "cinetpay") return erreur("Paiement en ligne non configuré.", 409);

  try {
    const s = await verifierPaiement(transactionId);
    if (s.statut === "ACCEPTED") {
      if (s.montant < act.prix || (s.devise && s.devise !== "XOF")) {
        console.error("[paiement] montant incohérent", transactionId, s);
        return erreur("Le montant payé ne correspond pas au prix de cet acte.", 402);
      }
      const recu = { docId, actId: act.id, transactionId, montant: s.montant, date: new Date().toISOString(), mode: "cinetpay" as const };
      return Response.json({ statut: "paye", recu: signerRecu(recu, secret), methode: s.methode });
    }
    if (s.statut === "WAITING_FOR_CUSTOMER" || s.statut === "PENDING") return Response.json({ statut: "en_attente" });
    return Response.json({ statut: "echec", detail: s.message ?? s.statut });
  } catch (e) {
    console.error("[paiement] vérification", e);
    return erreur("Impossible de vérifier le paiement pour le moment.", 502);
  }
}
