import Link from "next/link";

export const metadata = { title: "Hors connexion — ActeFacile" };

export default function HorsLigne() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="text-5xl" aria-hidden>📶</div>
      <h1 className="mt-4 text-2xl font-bold text-marine-900">Pas de connexion internet</h1>
      <p className="mt-2 text-slate-600">
        Cette page n&apos;est pas disponible hors connexion. Vos brouillons restent enregistrés sur votre téléphone :
        vous pourrez les reprendre et les télécharger dès que la connexion reviendra.
      </p>
      <Link href="/mes-documents" className="mt-6 inline-block rounded-lg bg-marine-800 px-5 py-2.5 font-medium text-white">Mes documents</Link>
    </div>
  );
}
