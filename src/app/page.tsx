import Link from "next/link";
import { ACTES_DISPONIBLES, CATALOGUE, CATEGORIES } from "@/lib/catalogue";
import { ActCard } from "@/components/ActCard";
import { SearchBox } from "@/components/SearchBox";
import { BandeauInstallation } from "@/components/Installation";
import type { Category } from "@/lib/types";

export default function Home() {
  return (
    <>
      <BandeauInstallation />
      <section className="bg-gradient-to-b from-marine-900 to-marine-800 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center sm:py-20">
          <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
            Le bon acte juridique, rédigé <span className="text-accent-400">en quelques minutes</span>
          </h1>
          <p className="mt-4 max-w-2xl text-marine-100 sm:text-lg">
            Bail, reconnaissance de dette, mise en demeure… Répondez à quelques questions simples :
            votre document est prêt, conforme au droit ivoirien et OHADA.
          </p>
          <div className="mt-8 flex w-full justify-center">
            <SearchBox />
          </div>
          <Link href="/orientation" className="mt-6 text-sm font-medium text-accent-400 underline underline-offset-4">
            Je ne sais pas de quel acte j&apos;ai besoin →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-marine-900">Disponibles dès maintenant</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACTES_DISPONIBLES.map((a) => <ActCard key={a.id} act={a} />)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="text-2xl font-bold text-marine-900">Parcourir par thème</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(CATEGORIES) as Category[]).map((c) => (
            <Link key={c} href={`/actes?categorie=${c}`} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-marine-200 hover:shadow-sm">
              <div className="text-2xl">{CATEGORIES[c].icon}</div>
              <div className="mt-1 font-semibold text-marine-900">{CATEGORIES[c].label}</div>
              <div className="text-sm text-slate-500">{CATEGORIES[c].description}</div>
              <div className="mt-2 text-xs text-slate-400">{CATALOGUE.filter((a) => a.category === c).length} actes</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
          {[
            ["1. Trouvez", "Décrivez votre situation ou répondez à quelques questions : nous vous indiquons l'acte adapté."],
            ["2. Remplissez", "Un formulaire guidé, sans jargon, avec l'aperçu de votre document en direct et des alertes si quelque chose cloche."],
            ["3. Téléchargez", "Votre acte en PDF ou Word, avec une notice qui explique comment le signer, le faire enregistrer ou légaliser."],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="text-lg font-semibold text-marine-900">{t}</h3>
              <p className="mt-1 text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
