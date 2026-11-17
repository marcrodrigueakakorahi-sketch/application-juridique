"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteDoc, listDocs, type SavedDoc } from "@/lib/stockage";
import { getActe } from "@/lib/catalogue";
import { completion } from "@/lib/moteur";

const fmt = (iso: string) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

export default function MesDocuments() {
  const [docs, setDocs] = useState<SavedDoc[] | null>(null);
  useEffect(() => setDocs(listDocs()), []);

  const remove = (id: string) => {
    if (!confirm("Supprimer définitivement ce document ?")) return;
    deleteDoc(id);
    setDocs(listDocs());
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-marine-900">Mes documents</h1>
      <p className="mt-2 text-sm text-slate-600">
        Vos brouillons sont enregistrés uniquement dans ce navigateur. La création d&apos;un compte, pour les retrouver sur tous vos appareils, arrive bientôt.
      </p>
      {docs === null ? null : docs.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          Aucun document pour l&apos;instant. <Link href="/actes" className="text-marine-700 underline">Commencer un acte</Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {docs.map((d) => {
            const act = getActe(d.actId);
            const pct = act ? completion(act, d.data) : 0;
            return (
              <li key={d.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-marine-900">
                    {d.title}
                    {d.recu && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Payé</span>}
                  </div>
                  <div className="text-xs text-slate-500">
                    Modifié le {fmt(d.updatedAt)} · {d.generatedAt ? `téléchargé le ${fmt(d.generatedAt)}` : `brouillon complété à ${pct} %`}
                  </div>
                </div>
                <Link href={`/actes/${d.actId}/rediger?doc=${d.id}`} className="rounded-lg bg-marine-800 px-4 py-2 text-sm text-white hover:bg-marine-700">
                  {d.generatedAt ? "Ouvrir" : "Reprendre"}
                </Link>
                <button type="button" onClick={() => remove(d.id)} className="text-sm text-rose-600 hover:underline">Supprimer</button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
