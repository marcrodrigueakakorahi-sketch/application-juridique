"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getDoc, saveDoc } from "@/lib/stockage";
import { oublierPaiement, paiementEnCours, verifierPaiement, type PaiementEnCours } from "@/lib/paiement-client";

type Etat = "verification" | "paye" | "en_attente" | "echec" | "introuvable";

const MAX_ESSAIS = 15;

export default function RetourPaiementPage() {
  return (
    <Suspense fallback={<Cadre><p className="text-slate-600">Chargement…</p></Cadre>}>
      <RetourPaiement />
    </Suspense>
  );
}

function RetourPaiement() {
  const params = useSearchParams();
  const router = useRouter();
  const [etat, setEtat] = useState<Etat>("verification");
  const [detail, setDetail] = useState<string | null>(null);
  const [paiement, setPaiement] = useState<PaiementEnCours | null>(null);
  const essais = useRef(0);

  const verifier = useCallback(async (p: PaiementEnCours) => {
    setEtat("verification");
    try {
      const r = await verifierPaiement(p);
      if (r.statut === "paye" && r.recu) {
        const doc = getDoc(p.docId);
        if (doc) saveDoc({ ...doc, recu: r.recu, paidAt: new Date().toISOString() });
        oublierPaiement();
        setEtat("paye");
        setTimeout(() => router.push(`/actes/${p.actId}/rediger?doc=${p.docId}`), 2500);
      } else if (r.statut === "en_attente") {
        setEtat("en_attente");
        if (++essais.current < MAX_ESSAIS) setTimeout(() => verifier(p), 4000);
      } else {
        setEtat("echec");
        setDetail(r.detail ?? null);
      }
    } catch (e) {
      setEtat("echec");
      setDetail(e instanceof Error ? e.message : null);
    }
  }, [router]);

  useEffect(() => {
    const memorise = paiementEnCours();
    const tx = params.get("transaction_id") ?? memorise?.transactionId;
    const docId = params.get("doc") ?? memorise?.docId;
    const actId = params.get("acte") ?? memorise?.actId;
    if (!tx || !docId || !actId) {
      setEtat("introuvable");
      return;
    }
    const p = { transactionId: tx, docId, actId };
    setPaiement(p);
    verifier(p);
  }, [params, verifier]);

  const lienDocument = paiement ? `/actes/${paiement.actId}/rediger?doc=${paiement.docId}` : "/mes-documents";

  return (
    <Cadre>
      {etat === "verification" && (
        <>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-marine-100 border-t-marine-700" aria-hidden />
          <h1 className="mt-4 text-xl font-semibold text-marine-900">Vérification du paiement…</h1>
          <p className="mt-1 text-slate-600">Ne fermez pas cette page.</p>
        </>
      )}
      {etat === "paye" && (
        <>
          <div className="text-5xl" aria-hidden>✅</div>
          <h1 className="mt-3 text-xl font-semibold text-marine-900">Paiement confirmé</h1>
          <p className="mt-1 text-slate-600">Merci ! Votre document est prêt. Vous allez être redirigé…</p>
          <Link href={lienDocument} className="mt-6 inline-block rounded-lg bg-accent-500 px-6 py-3 font-semibold text-marine-900 hover:bg-accent-400">Télécharger mon document</Link>
        </>
      )}
      {etat === "en_attente" && (
        <>
          <div className="text-5xl" aria-hidden>📱</div>
          <h1 className="mt-3 text-xl font-semibold text-marine-900">Paiement en attente de confirmation</h1>
          <p className="mt-1 text-slate-600">Validez le paiement sur votre téléphone (code secret Mobile Money). Cette page se met à jour toute seule.</p>
          {paiement && <button type="button" onClick={() => { essais.current = 0; verifier(paiement); }} className="mt-6 rounded-lg bg-marine-800 px-5 py-2.5 font-medium text-white hover:bg-marine-700">J&apos;ai validé, vérifier à nouveau</button>}
        </>
      )}
      {etat === "echec" && (
        <>
          <div className="text-5xl" aria-hidden>⚠️</div>
          <h1 className="mt-3 text-xl font-semibold text-marine-900">Le paiement n&apos;a pas abouti</h1>
          <p className="mt-1 text-slate-600">Aucun montant n&apos;a été validé pour ce document. Vous pouvez réessayer.</p>
          {detail && <p className="mt-2 text-xs text-slate-400">Détail : {detail}</p>}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={lienDocument} className="rounded-lg bg-accent-500 px-5 py-2.5 font-semibold text-marine-900 hover:bg-accent-400">Revenir à mon document</Link>
            {paiement && <button type="button" onClick={() => verifier(paiement)} className="rounded-lg px-5 py-2.5 text-marine-700 hover:bg-marine-50">Vérifier à nouveau</button>}
          </div>
        </>
      )}
      {etat === "introuvable" && (
        <>
          <h1 className="text-xl font-semibold text-marine-900">Paiement introuvable</h1>
          <p className="mt-1 text-slate-600">Nous n&apos;avons pas retrouvé de paiement en cours sur cet appareil.</p>
          <Link href="/mes-documents" className="mt-6 inline-block rounded-lg bg-marine-800 px-5 py-2.5 text-white">Mes documents</Link>
        </>
      )}
    </Cadre>
  );
}

function Cadre({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">{children}</div>
    </div>
  );
}
