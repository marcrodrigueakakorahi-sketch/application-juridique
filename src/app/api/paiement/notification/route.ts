// Notification de CinetPay (serveur à serveur) après chaque changement de statut.
// Le statut n'est jamais cru sur parole : il est revérifié auprès de l'API CinetPay.
// Sans base de données, on se contente de journaliser ; le reçu est délivré au retour du client.

import { configPaiement } from "@/lib/paiement/config";
import { verifierPaiement } from "@/lib/paiement/cinetpay";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const tx = String(form?.get("cpm_trans_id") ?? "");
  if (tx && configPaiement().mode === "cinetpay") {
    try {
      const s = await verifierPaiement(tx);
      console.log("[paiement] notification", tx, s.statut, s.montant, s.methode ?? "");
    } catch (e) {
      console.error("[paiement] notification", tx, e);
    }
  }
  return new Response("OK", { status: 200 });
}

// CinetPay peut tester l'adresse en GET : elle doit répondre 200.
export function GET() {
  return new Response("OK", { status: 200 });
}
