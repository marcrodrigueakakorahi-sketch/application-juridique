// Adresse de retour donnée à CinetPay. Selon les cas, le client revient en GET ou en POST :
// on récupère l'identifiant de transaction puis on redirige vers la page de confirmation.

export const runtime = "nodejs";

async function rediriger(req: Request) {
  const url = new URL(req.url);
  let tx = url.searchParams.get("transaction_id") ?? "";
  if (!tx && req.method === "POST") {
    const form = await req.formData().catch(() => null);
    tx = String(form?.get("transaction_id") ?? form?.get("cpm_trans_id") ?? "");
  }
  const cible = new URL("/paiement/retour", url.origin);
  if (tx) cible.searchParams.set("transaction_id", tx);
  for (const k of ["doc", "acte"]) {
    const v = url.searchParams.get(k);
    if (v) cible.searchParams.set(k, v);
  }
  return Response.redirect(cible, 303);
}

export const GET = rediriger;
export const POST = rediriger;
