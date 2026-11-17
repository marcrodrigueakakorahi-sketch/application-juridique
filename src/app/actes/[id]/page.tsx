import Link from "next/link";
import { notFound } from "next/navigation";
import { CATALOGUE, CATEGORIES, getActe, isAvailable } from "@/lib/catalogue";
import { Badge } from "@/components/ActCard";
import { formatMontant } from "@/lib/nombres";

export function generateStaticParams() {
  return CATALOGUE.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const act = getActe((await params).id);
  return { title: act ? `${act.title} — ActeFacile` : "Acte introuvable" };
}

export default async function FicheActe({ params }: { params: Promise<{ id: string }> }) {
  const act = getActe((await params).id);
  if (!act) notFound();
  const available = isAvailable(act);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href={`/actes?categorie=${act.category}`} className="text-sm text-marine-700 hover:underline">
        ← {CATEGORIES[act.category].label}
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold text-marine-900">{act.title}</h1>
        <Badge act={act} />
      </div>
      <p className="mt-3 text-lg text-slate-700">{act.summary}</p>

      {act.requiresProfessional && (
        <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-6">
          <h2 className="font-semibold text-rose-900">Cet acte doit être établi par un {act.requiresProfessional.who}</h2>
          <p className="mt-2 text-rose-900/90">{act.requiresProfessional.why}</p>
          <p className="mt-4 text-sm text-rose-900/80">
            Pour trouver un professionnel, adressez-vous à{" "}
            {act.requiresProfessional.who === "notaire" ? "la Chambre des notaires de Côte d'Ivoire" : "l'Ordre des avocats du Barreau de Côte d'Ivoire"}.
            La mise en relation avec nos partenaires arrivera prochainement.
          </p>
        </div>
      )}

      {!available && !act.requiresProfessional && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-marine-900">Ce modèle arrive bientôt</h2>
          <p className="mt-2 text-slate-600">Nos juristes finalisent ce modèle. En attendant, <Link href="/orientation" className="text-marine-700 underline">l&apos;assistant d&apos;orientation</Link> peut vous proposer une alternative.</p>
        </div>
      )}

      {available && (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-4 rounded-xl bg-marine-50 p-5">
            <div className="flex-1 text-sm text-marine-900">
              <div><strong>Durée :</strong> environ {act.minutes} minutes</div>
              <div><strong>Prix :</strong> {act.prix === 0 ? "gratuit" : formatMontant(act.prix)}</div>
              <div><strong>Formats :</strong> PDF et Word</div>
            </div>
            <Link href={`/actes/${act.id}/rediger`} className="rounded-lg bg-accent-500 px-6 py-3 font-semibold text-marine-900 shadow hover:bg-accent-400">
              Rédiger mon document
            </Link>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <section>
              <h2 className="text-lg font-semibold text-marine-900">Quand l&apos;utiliser ?</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">{act.whenToUse.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-marine-900">À savoir</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">{act.limits.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
          </div>
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-marine-900">Références légales</h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">{act.legalRefs.map((x) => <li key={x}>• {x}</li>)}</ul>
            <p className="mt-2 text-xs text-slate-400">Version du modèle : {act.version}</p>
          </section>
        </>
      )}
    </div>
  );
}
