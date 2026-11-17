"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { rechercher } from "@/lib/catalogue";
import { Badge } from "./ActCard";

const EXEMPLES = ["j'ai prêté 300 000 FCFA à un ami", "mon bailleur ne rend pas ma caution", "je veux louer ma villa à Cocody"];

export function SearchBox() {
  const [q, setQ] = useState("");
  const results = useMemo(() => rechercher(q).slice(0, 5), [q]);
  return (
    <div className="w-full max-w-2xl">
      <label htmlFor="recherche" className="sr-only">Décrivez votre situation</label>
      <input
        id="recherche"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Décrivez votre situation en quelques mots…"
        className="w-full rounded-xl border-0 bg-white px-5 py-4 text-base text-slate-900 shadow-lg outline-none ring-2 ring-transparent focus:ring-accent-400"
      />
      {q.trim().length > 1 && (
        <ul className="mt-2 overflow-hidden rounded-xl bg-white text-left text-slate-900 shadow-lg">
          {results.length === 0 && (
            <li className="px-5 py-3 text-sm text-slate-600">
              Aucun acte ne correspond. <Link href="/orientation" className="font-medium text-marine-700 underline">Laissez-vous guider</Link>.
            </li>
          )}
          {results.map((a) => (
            <li key={a.id} className="border-t border-slate-100 first:border-0">
              <Link href={`/actes/${a.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-marine-50">
                <span>
                  <span className="font-medium">{a.title}</span>
                  <span className="block text-xs text-slate-500">{a.summary}</span>
                </span>
                <Badge act={a} />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {EXEMPLES.map((e) => (
          <button key={e} type="button" onClick={() => setQ(e)} className="rounded-full bg-white/10 px-3 py-1 text-marine-100 hover:bg-white/20">
            « {e} »
          </button>
        ))}
      </div>
    </div>
  );
}
