// Configuration du paiement, lue dans les variables d'environnement (côté serveur uniquement).
//
//   CINETPAY_APIKEY / CINETPAY_SITE_ID  identifiants du compte marchand CinetPay
//   PAIEMENT_SECRET                     clé secrète (32 caractères ou plus) qui signe les reçus
//   CINETPAY_CHANNELS                   MOBILE_MONEY (par défaut), ALL, CREDIT_CARD…
//   CINETPAY_API_URL                    à ne changer que pour les tests
//   SITE_URL                            adresse publique du site (sinon déduite de la requête)
//
// Sans identifiants CinetPay, l'application fonctionne en « mode démonstration » :
// le paiement est simulé, ce qui permet de tester le parcours sans compte marchand.

export type ModePaiement = "cinetpay" | "demo";

const SECRET_DEMO = "mode-demonstration-secret-non-confidentiel";

export function configPaiement() {
  const apikey = process.env.CINETPAY_APIKEY?.trim();
  const siteId = process.env.CINETPAY_SITE_ID?.trim();
  const mode: ModePaiement = apikey && siteId ? "cinetpay" : "demo";
  return {
    mode,
    apikey: apikey ?? "",
    siteId: siteId ?? "",
    apiUrl: (process.env.CINETPAY_API_URL ?? "https://api-checkout.cinetpay.com").replace(/\/$/, ""),
    channels: process.env.CINETPAY_CHANNELS?.trim() || "MOBILE_MONEY",
    siteUrl: process.env.SITE_URL?.replace(/\/$/, ""),
  };
}

export function secretPaiement(): string {
  const s = process.env.PAIEMENT_SECRET;
  if (s && s.length >= 32) return s;
  if (configPaiement().mode === "cinetpay") {
    throw new Error("PAIEMENT_SECRET doit contenir au moins 32 caractères quand CinetPay est activé.");
  }
  return SECRET_DEMO;
}
