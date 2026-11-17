"use client";
import { useState } from "react";
import Link from "next/link";
import { QUESTIONS, type Choice } from "@/lib/orientation";
import { getActe } from "@/lib/catalogue";
import { ActCard } from "@/components/ActCard";

export default function Orientation() {
  const [path, setPath] = useState<string[]>(["start"]);
  const [result, setResult] = useState<Choice["result"] | null>(null);
  const current = QUESTIONS[path[path.length - 1]];

  const choose = (c: Choice) => {
    if (c.result) setResult(c.result);
    else if (c.next) setPath((p) => [...p, c.next!]);
  };
  const back = () => {
    if (result) setResult(null);
    else setPath((p) => (p.length > 1 ? p.slice(0, -1) : p));
  };
  const restart = () => {
    setResult(null);
    setPath(["start"]);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-marine-900">Trouver le bon acte</h1>
      <p className="mt-2 text-slate-600">Quelques questions suffisent pour vous orienter.</p>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {!result ? (
          <>
            <p className="text-xs uppercase tracking-wide text-slate-400">Question {path.length}</p>
            <h2 className="mt-1 text-xl font-semibold text-marine-900">{current.text}</h2>
            <div className="mt-5 grid gap-2">
              {current.choices.map((c) => (
                <button key={c.label} type="button" onClick={() => choose(c)} className="rounded-lg border border-slate-200 px-4 py-3 text-left hover:border-marine-500 hover:bg-marine-50">
                  {c.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-marine-900">Notre recommandation</h2>
            <p className="mt-2 text-slate-700">{result.reason}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {result.acts.map((id) => {
                const a = getActe(id);
                return a ? <ActCard key={id} act={a} /> : null;
              })}
            </div>
          </>
        )}
        <div className="mt-6 flex gap-4 text-sm">
          {(path.length > 1 || result) && <button type="button" onClick={back} className="text-marine-700 hover:underline">← Retour</button>}
          {(path.length > 1 || result) && <button type="button" onClick={restart} className="text-slate-500 hover:underline">Recommencer</button>}
        </div>
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Votre situation ne correspond à aucun choix ? <Link href="/actes" className="text-marine-700 underline">Parcourez le catalogue complet</Link>.
      </p>
    </div>
  );
}
