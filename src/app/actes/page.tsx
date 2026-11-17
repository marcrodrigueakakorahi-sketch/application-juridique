import Link from "next/link";
import { CATALOGUE, CATEGORIES, isAvailable } from "@/lib/catalogue";
import { ActCard } from "@/components/ActCard";
import type { Category } from "@/lib/types";

export const metadata = { title: "Catalogue des actes — ActeFacile" };

export default async function Catalogue({ searchParams }: { searchParams: Promise<{ categorie?: string }> }) {
  const { categorie } = await searchParams;
  const cat = categorie && categorie in CATEGORIES ? (categorie as Category) : undefined;
  const actes = CATALOGUE.filter((a) => !cat || a.category === cat).sort(
    (a, b) => Number(isAvailable(b)) - Number(isAvailable(a)),
  );
  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-sm border ${active ? "bg-marine-800 text-white border-marine-800" : "bg-white text-slate-700 border-slate-200 hover:border-marine-200"}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-marine-900">Catalogue des actes</h1>
      <p className="mt-2 text-slate-600">
        {CATALOGUE.filter(isAvailable).length} actes disponibles, d&apos;autres arrivent bientôt.
        Les actes marqués « avec un notaire » ou « avec un avocat » ne peuvent légalement pas être rédigés seul.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/actes" className={chip(!cat)}>Tous</Link>
        {(Object.keys(CATEGORIES) as Category[]).map((c) => (
          <Link key={c} href={`/actes?categorie=${c}`} className={chip(cat === c)}>
            {CATEGORIES[c].icon} {CATEGORIES[c].label}
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actes.map((a) => <ActCard key={a.id} act={a} />)}
      </div>
    </div>
  );
}
