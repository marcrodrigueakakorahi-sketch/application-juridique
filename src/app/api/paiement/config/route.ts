import { configPaiement } from "@/lib/paiement/config";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ mode: configPaiement().mode });
}
