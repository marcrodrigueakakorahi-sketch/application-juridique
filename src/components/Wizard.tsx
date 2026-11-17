"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getActe } from "@/lib/catalogue";
import { formatMontant } from "@/lib/nombres";
import { completion, defaultData, renderDocument, validateStep, visibleFields } from "@/lib/moteur";
import { getDoc, newId, saveDoc } from "@/lib/stockage";
import { initierPaiement, memoriserPaiement, modePaiement, telecharger, type ModePaiement } from "@/lib/paiement-client";
import type { ActDefinition, Field, FormData, Warning } from "@/lib/types";
import { DocumentPreview } from "./DocumentPreview";

export function Wizard({ actId }: { actId: string }) {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Chargement…</div>}>
      <WizardInner actId={actId} />
    </Suspense>
  );
}

function WizardInner({ actId }: { actId: string }) {
  const act = getActe(actId) as ActDefinition;
  const steps = act.steps!;
  const router = useRouter();
  const params = useSearchParams();

  const [docId, setDocId] = useState<string | null>(null);
  const [data, setData] = useState<FormData>(() => defaultData(act));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const [busy, setBusy] = useState<"pdf" | "docx" | "payer" | null>(null);
  const [recu, setRecu] = useState<string | undefined>(undefined);
  const [paidAt, setPaidAt] = useState<string | undefined>(undefined);
  const [generatedAt, setGeneratedAt] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<ModePaiement | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    modePaiement().then(setMode);
  }, []);

  // Reprise d'un brouillon (?doc=…) ou création d'un nouveau document.
  useEffect(() => {
    const existing = params.get("doc");
    const saved = existing ? getDoc(existing) : undefined;
    if (saved && saved.actId === act.id) {
      setDocId(saved.id);
      setData({ ...defaultData(act), ...saved.data });
      setStep(Math.min(saved.step, steps.length));
      setRecu(saved.recu);
      setPaidAt(saved.paidAt);
      setGeneratedAt(saved.generatedAt);
    } else {
      const id = newId();
      setDocId(id);
      router.replace(`/actes/${act.id}/rediger?doc=${id}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sauvegarde automatique.
  useEffect(() => {
    if (!docId) return;
    saveDoc({ id: docId, actId: act.id, title: act.title, data, step, updatedAt: "", recu, paidAt, generatedAt });
  }, [docId, data, step, act, recu, paidAt, generatedAt]);

  const blocks = useMemo(() => renderDocument(act, data), [act, data]);
  const warnings = useMemo(() => act.checks?.(data) ?? [], [act, data]);
  const pct = completion(act, data);
  const isReview = step === steps.length;
  const blocking = warnings.some((w) => w.level === "bloquant");

  const update = (name: string, value: string | boolean) => {
    setData((d) => ({ ...d, [name]: value }));
    setErrors((e) => {
      if (!e[name]) return e;
      const { [name]: _removed, ...rest } = e;
      return rest;
    });
  };

  const next = () => {
    const errs = validateStep(steps[step], data);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goTo = (i: number) => {
    // On ne peut sauter en avant que si les étapes précédentes sont valides.
    for (let k = 0; k < i && k < steps.length; k++) {
      const errs = validateStep(steps[k], data);
      if (Object.keys(errs).length) {
        setStep(k);
        setErrors(errs);
        return;
      }
    }
    setErrors({});
    setStep(i);
  };

  const download = async (kind: "pdf" | "docx") => {
    if (!docId) return;
    setBusy(kind);
    setErreur(null);
    try {
      await telecharger(act.id, docId, data, recu, kind);
      setGeneratedAt(new Date().toISOString());
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Le téléchargement a échoué.");
    } finally {
      setBusy(null);
    }
  };

  const payer = async () => {
    if (!docId) return;
    setBusy("payer");
    setErreur(null);
    try {
      const r = await initierPaiement(act.id, docId);
      if (r.recu) {
        setRecu(r.recu);
        setPaidAt(new Date().toISOString());
        setBusy(null);
      } else if (r.url) {
        // Le brouillon est déjà sauvegardé ; on mémorise la transaction pour la page de retour.
        memoriserPaiement({ transactionId: r.transactionId, docId, actId: act.id });
        window.location.assign(r.url);
      }
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Le paiement n'a pas pu démarrer.");
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/actes/${act.id}`} className="text-sm text-marine-700 hover:underline">← {act.title}</Link>
          <h1 className="text-2xl font-bold text-marine-900">{act.title}</h1>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div className="font-medium text-marine-800">Complété à {pct} %</div>
          <div>Brouillon enregistré automatiquement sur cet appareil</div>
        </div>
      </div>

      {/* Étapes */}
      <ol className="mb-6 flex gap-1 overflow-x-auto pb-1 text-xs">
        {[...steps.map((s) => s.title), "Vérification"].map((t, i) => (
          <li key={t} className="min-w-24 flex-1">
            <button type="button" onClick={() => goTo(i)} className="w-full text-left">
              <div className={`h-1.5 rounded-full ${i < step ? "bg-marine-500" : i === step ? "bg-accent-500" : "bg-slate-200"}`} />
              <div className={`mt-1 truncate ${i === step ? "font-semibold text-marine-900" : "text-slate-500"}`}>{i + 1}. {t}</div>
            </button>
          </li>
        ))}
      </ol>

      {/* Bascule mobile */}
      <div className="mb-4 grid grid-cols-2 rounded-lg bg-slate-200 p-1 text-sm lg:hidden">
        {(["form", "preview"] as const).map((v) => (
          <button key={v} type="button" onClick={() => setMobileView(v)} className={`rounded-md py-1.5 ${mobileView === v ? "bg-white font-medium shadow-sm" : "text-slate-600"}`}>
            {v === "form" ? "Formulaire" : "Aperçu du document"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className={mobileView === "preview" ? "hidden lg:block" : ""}>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {!isReview ? (
              <>
                <h2 className="text-xl font-semibold text-marine-900">{steps[step].title}</h2>
                {steps[step].description && <p className="mt-1 text-sm text-slate-600">{steps[step].description}</p>}
                <div className="mt-5 space-y-5">
                  {visibleFields(steps[step], data).map((f) => (
                    <FieldInput key={f.name} field={f} value={data[f.name]} error={errors[f.name]} onChange={(v) => update(f.name, v)} />
                  ))}
                </div>
                <div className="mt-8 flex justify-between gap-3">
                  <button type="button" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="rounded-lg px-4 py-2 text-marine-700 hover:bg-marine-50 disabled:invisible">
                    ← Précédent
                  </button>
                  <button type="button" onClick={next} className="rounded-lg bg-marine-800 px-5 py-2 font-medium text-white hover:bg-marine-700">
                    Continuer →
                  </button>
                </div>
              </>
            ) : (
              <Review act={act} pct={pct} warnings={warnings} blocking={blocking} busy={busy} paye={act.prix === 0 || Boolean(recu)} mode={mode} erreur={erreur} onPay={payer} onDownload={download} onBack={() => setStep(steps.length - 1)} />
            )}
          </div>
          {!isReview && <Warnings warnings={warnings} className="mt-4" />}
        </div>

        <div className={mobileView === "form" ? "hidden lg:block" : ""}>
          <div className="lg:sticky lg:top-4">
            <DocumentPreview blocks={blocks} filigrane={act.prix > 0 && !recu} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldInput({ field: f, value, error, onChange }: { field: Field; value: string | boolean | undefined; error?: string; onChange: (v: string | boolean) => void }) {
  const id = `f-${f.name}`;
  const base = `mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-marine-200 ${error ? "border-rose-400" : "border-slate-300"}`;
  const str = typeof value === "string" ? value : "";

  if (f.type === "checkbox") {
    return (
      <div>
        <label htmlFor={id} className="flex items-start gap-3">
          <input id={id} type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-marine-700" />
          <span className="text-sm text-slate-800">{f.label}</span>
        </label>
        {f.help && <p className="ml-7 mt-1 text-xs text-slate-500">{f.help}</p>}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {f.label} {f.required && <span className="text-rose-600" aria-hidden>*</span>}
      </label>
      {f.type === "textarea" ? (
        <textarea id={id} rows={3} value={str} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} className={base} />
      ) : f.type === "select" ? (
        <select id={id} value={str} onChange={(e) => onChange(e.target.value)} className={`${base} bg-white`}>
          <option value="">— Choisir —</option>
          {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : f.type === "radio" ? (
        <div role="radiogroup" aria-labelledby={id} className="mt-2 grid gap-2">
          {f.options?.map((o) => (
            <label key={o.value} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm ${str === o.value ? "border-marine-500 bg-marine-50" : "border-slate-200 hover:border-slate-300"}`}>
              <input type="radio" name={f.name} value={o.value} checked={str === o.value} onChange={() => onChange(o.value)} className="accent-marine-700" />
              {o.label}
            </label>
          ))}
        </div>
      ) : (
        <div className="relative">
          <input
            id={id}
            type={f.type === "date" ? "date" : f.type === "email" ? "email" : f.type === "tel" ? "tel" : "text"}
            inputMode={f.type === "money" || f.type === "number" ? "numeric" : f.type === "tel" ? "tel" : undefined}
            value={str}
            placeholder={f.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`${base} ${f.type === "money" ? "pr-16" : ""}`}
          />
          {f.type === "money" && <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-sm text-slate-400">FCFA</span>}
        </div>
      )}
      {f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
      {error && <p className="mt-1 text-sm text-rose-600" role="alert">{error}</p>}
    </div>
  );
}

const WARN_STYLE: Record<Warning["level"], string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  attention: "border-amber-200 bg-amber-50 text-amber-900",
  bloquant: "border-rose-300 bg-rose-50 text-rose-900",
};
const WARN_LABEL: Record<Warning["level"], string> = { info: "Bon à savoir", attention: "Attention", bloquant: "Problème à corriger" };

function Warnings({ warnings, className = "" }: { warnings: Warning[]; className?: string }) {
  if (warnings.length === 0) return null;
  return (
    <div className={`space-y-2 ${className}`}>
      {warnings.map((w) => (
        <div key={w.message} className={`rounded-lg border px-4 py-3 text-sm ${WARN_STYLE[w.level]}`}>
          <strong>{WARN_LABEL[w.level]} : </strong>
          {w.message}
        </div>
      ))}
    </div>
  );
}

interface ReviewProps {
  act: ActDefinition;
  pct: number;
  warnings: Warning[];
  blocking: boolean;
  busy: "pdf" | "docx" | "payer" | null;
  paye: boolean;
  mode: ModePaiement | null;
  erreur: string | null;
  onPay: () => void;
  onDownload: (k: "pdf" | "docx") => void;
  onBack: () => void;
}

function Review({ act, pct, warnings, blocking, busy, paye, mode, erreur, onPay, onDownload, onBack }: ReviewProps) {
  const ready = pct === 100 && !blocking;
  return (
    <div>
      <h2 className="text-xl font-semibold text-marine-900">Vérification et téléchargement</h2>
      <p className="mt-1 text-sm text-slate-600">Relisez attentivement l&apos;aperçu avant de télécharger votre document.</p>
      <Warnings warnings={warnings} className="mt-4" />
      {pct < 100 && <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">Certaines informations obligatoires manquent ({pct} % complété). Elles sont surlignées en jaune dans l&apos;aperçu.</p>}

      {paye ? (
        <>
          {act.prix > 0 && (
            <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              ✓ Paiement reçu. Vous pouvez modifier vos réponses et retélécharger ce document autant de fois que nécessaire.
            </p>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button type="button" disabled={!ready || busy !== null} onClick={() => onDownload("pdf")} className="rounded-lg bg-accent-500 px-4 py-3 font-semibold text-marine-900 hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50">
              {busy === "pdf" ? "Génération…" : "Télécharger en PDF"}
            </button>
            <button type="button" disabled={!ready || busy !== null} onClick={() => onDownload("docx")} className="rounded-lg border border-marine-800 px-4 py-3 font-semibold text-marine-800 hover:bg-marine-50 disabled:cursor-not-allowed disabled:opacity-50">
              {busy === "docx" ? "Génération…" : "Télécharger en Word"}
            </button>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-marine-200 bg-marine-50 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-semibold text-marine-900">Prix de ce document</span>
            <span className="text-2xl font-bold text-marine-900">{formatMontant(act.prix)}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">Paiement unique, en PDF et en Word, modifiable et retéléchargeable à volonté.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {["Orange Money", "MTN MoMo", "Moov Money", "Wave"].map((m) => (
              <span key={m} className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-700 ring-1 ring-slate-200">{m}</span>
            ))}
          </div>
          <button type="button" disabled={!ready || busy !== null || mode === null} onClick={onPay} className="mt-4 w-full rounded-lg bg-accent-500 px-4 py-3 font-semibold text-marine-900 hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50">
            {busy === "payer" ? "Redirection vers le paiement…" : mode === "demo" ? `Simuler le paiement de ${formatMontant(act.prix)}` : `Payer ${formatMontant(act.prix)} par Mobile Money`}
          </button>
          {mode === "demo" && (
            <p className="mt-2 text-xs text-amber-800">Mode démonstration : aucun argent n&apos;est débité. Le vrai paiement s&apos;active dès que les clés CinetPay sont configurées.</p>
          )}
          {mode === "cinetpay" && <p className="mt-2 text-xs text-slate-500">Paiement sécurisé par CinetPay. Vous serez redirigé vers la page de paiement, puis ramené ici.</p>}
        </div>
      )}
      {erreur && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">{erreur}</p>}

      {act.instructions && (
        <div className="mt-8">
          <h3 className="font-semibold text-marine-900">Et maintenant ?</h3>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-slate-700">{act.instructions.map((i) => <li key={i}>{i}</li>)}</ol>
        </div>
      )}

      <p className="mt-6 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
        Ce document est un modèle généré à partir de vos réponses. Il ne remplace pas le conseil d&apos;un professionnel du droit.
        Pour une situation particulière, faites-le relire par un avocat.
      </p>
      <button type="button" onClick={onBack} className="mt-6 rounded-lg px-4 py-2 text-marine-700 hover:bg-marine-50">← Modifier mes réponses</button>
    </div>
  );
}
