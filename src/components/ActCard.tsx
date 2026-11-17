import Link from "next/link";
import type { ActDefinition } from "@/lib/types";
import { CATEGORIES, isAvailable } from "@/lib/catalogue";
import { formatMontant } from "@/lib/nombres";

const COMPLEXITE = { simple: "Simple", intermediaire: "Intermédiaire", complexe: "Complexe" } as const;

export function Badge({ act }: { act: ActDefinition }) {
  if (act.requiresProfessional)
    return <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800">Avec un {act.requiresProfessional.who}</span>;
  if (!isAvailable(act))
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">Bientôt disponible</span>;
  return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Disponible</span>;
}

export function ActCard({ act }: { act: ActDefinition }) {
  const available = isAvailable(act);
  return (
    <Link
      href={`/actes/${act.id}`}
      className={`group flex flex-col rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md hover:border-marine-200 ${available ? "border-slate-200" : "border-dashed border-slate-300"}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-500">
        <span>{CATEGORIES[act.category].icon} {CATEGORIES[act.category].label}</span>
        <Badge act={act} />
      </div>
      <h3 className="text-lg font-semibold text-marine-900 group-hover:text-marine-700">{act.title}</h3>
      <p className="mt-1 flex-1 text-sm text-slate-600">{act.summary}</p>
      {available && (
        <p className="mt-4 flex gap-3 text-xs text-slate-500">
          <span>{COMPLEXITE[act.complexity]}</span>
          <span>≈ {act.minutes} min</span>
          <span className="font-semibold text-marine-700">{act.prix === 0 ? "Gratuit" : formatMontant(act.prix)}</span>
        </p>
      )}
    </Link>
  );
}
