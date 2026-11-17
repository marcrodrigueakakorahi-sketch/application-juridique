// Outils partagés par les routes de paiement.
import { configPaiement } from "./config";

export function origine(req: Request): string {
  return configPaiement().siteUrl ?? new URL(req.url).origin;
}

export function erreur(message: string, status = 400) {
  return Response.json({ erreur: message }, { status });
}

export async function lireJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
