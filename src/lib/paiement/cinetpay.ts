// Client minimal de l'API CinetPay (guichet de paiement v2).
// https://docs.cinetpay.com : initialisation (/v2/payment) et vérification (/v2/payment/check).

import { configPaiement } from "./config";

export interface InitParams {
  transactionId: string;
  montant: number;
  description: string;
  notifyUrl: string;
  returnUrl: string;
  metadata?: string;
}

export interface Statut {
  /** ACCEPTED (payé), REFUSED, WAITING_FOR_CUSTOMER… */
  statut: string;
  montant: number;
  devise: string;
  methode?: string;
  code?: string;
  message?: string;
}

async function appel(chemin: string, corps: Record<string, unknown>) {
  const { apiUrl } = configPaiement();
  const res = await fetch(`${apiUrl}${chemin}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(corps),
    signal: AbortSignal.timeout(20000),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as { code?: string; message?: string; description?: string; data?: Record<string, unknown> } | null;
  if (!json) throw new Error(`Réponse illisible de CinetPay (HTTP ${res.status})`);
  return json;
}

export async function initierPaiement(p: InitParams): Promise<string> {
  const { apikey, siteId, channels } = configPaiement();
  const json = await appel("/v2/payment", {
    apikey,
    site_id: siteId,
    transaction_id: p.transactionId,
    amount: p.montant,
    currency: "XOF",
    description: p.description,
    notify_url: p.notifyUrl,
    return_url: p.returnUrl,
    channels,
    lang: "fr",
    metadata: p.metadata,
  });
  const url = json.data?.payment_url;
  if (typeof url !== "string") {
    throw new Error(`CinetPay a refusé l'initialisation : ${json.code ?? "?"} ${json.message ?? ""} ${json.description ?? ""}`.trim());
  }
  return url;
}

export async function verifierPaiement(transactionId: string): Promise<Statut> {
  const { apikey, siteId } = configPaiement();
  const json = await appel("/v2/payment/check", { apikey, site_id: siteId, transaction_id: transactionId });
  const d = json.data ?? {};
  return {
    statut: typeof d.status === "string" ? d.status : json.message ?? "INCONNU",
    montant: Number(d.amount ?? 0),
    devise: String(d.currency ?? ""),
    methode: typeof d.payment_method === "string" ? d.payment_method : undefined,
    code: json.code,
    message: json.message,
  };
}
