// Moteur de rendu des modèles d'actes.
// Syntaxe dans les textes :
//   {{champ}}                 valeur brute
//   {{champ|montant}}         1 200 000 FCFA
//   {{champ|lettres}}         un million deux cent mille francs CFA
//   {{champ|date}}            17 novembre 2026
//   {{champ|option}}          libellé de l'option choisie (select / radio)
//   {{aujourdhui}}            date du jour
// Un champ vide est rendu sous forme de « [Libellé du champ] » pour l'aperçu.

import type { ActDefinition, Block, Condition, Field, FormData, Step } from "./types";
import { formatMontant, montantEnLettres, parseMontant } from "./nombres";

export function evalCondition(c: Condition | undefined, d: FormData): boolean {
  if (!c) return true;
  if ("all" in c) return c.all.every((x) => evalCondition(x, d));
  if ("any" in c) return c.any.some((x) => evalCondition(x, d));
  const v = d[c.field];
  if ("equals" in c) return (v ?? false) === c.equals;
  if ("notEquals" in c) return (v ?? false) !== c.notEquals;
  if ("filled" in c) return v !== undefined && v !== "" && v !== false;
  return true;
}

export function allFields(act: ActDefinition): Field[] {
  return (act.steps ?? []).flatMap((s) => s.fields);
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const txt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(d);
  return d.getDate() === 1 ? txt.replace(/^1 /, "1er ") : txt;
}

export function defaultData(act: ActDefinition): FormData {
  const d: FormData = {};
  for (const f of allFields(act)) {
    if (f.default !== undefined) d[f.name] = f.default;
    else if (f.type === "checkbox") d[f.name] = false;
  }
  return d;
}

export interface RenderedBlock {
  type: Block["type"];
  /** Segments : `missing` = champ non rempli (surligné dans l'aperçu). */
  segments: { text: string; missing?: boolean }[];
}

export function renderText(text: string, d: FormData, fields: Field[]): RenderedBlock["segments"] {
  const segments: RenderedBlock["segments"] = [];
  const re = /\{\{\s*([a-zA-Z0-9_]+)(?:\|([a-z]+))?\s*\}\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) segments.push({ text: text.slice(last, m.index) });
    const [, name, filter] = m;
    segments.push(resolve(name, filter, d, fields));
    last = re.lastIndex;
  }
  if (last < text.length) segments.push({ text: text.slice(last) });
  return segments;
}

function resolve(name: string, filter: string | undefined, d: FormData, fields: Field[]) {
  if (name === "aujourdhui") {
    return { text: formatDate(new Date().toISOString().slice(0, 10)) };
  }
  const field = fields.find((f) => f.name === name);
  const raw = d[name];
  if (raw === undefined || raw === "" || raw === false) {
    return { text: `[${field?.label ?? name}]`, missing: true };
  }
  const str = String(raw);
  switch (filter) {
    case "montant": {
      const n = parseMontant(str);
      return Number.isNaN(n) ? { text: str } : { text: formatMontant(n) };
    }
    case "lettres": {
      const n = parseMontant(str);
      return Number.isNaN(n) ? { text: str } : { text: montantEnLettres(n) };
    }
    case "date":
      return { text: formatDate(str) };
    case "option":
      return { text: field?.options?.find((o) => o.value === str)?.label ?? str };
    default:
      return { text: str };
  }
}

export function renderDocument(act: ActDefinition, d: FormData): RenderedBlock[] {
  const fields = allFields(act);
  return (act.document ?? [])
    .filter((b) => evalCondition(b.if, d))
    .map((b) => ({ type: b.type, segments: renderText(b.text, d, fields) }));
}

export function plainText(block: RenderedBlock): string {
  return block.segments.map((s) => s.text).join("");
}

export function visibleFields(step: Step, d: FormData): Field[] {
  return step.fields.filter((f) => evalCondition(f.showIf, d));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Numéros ivoiriens à 10 chiffres (depuis 2021), avec ou sans indicatif +225.
const TEL_RE = /^(?:\+225|00225)?\d{10}$/;

export function validateField(f: Field, v: string | boolean | undefined): string | null {
  const empty = v === undefined || v === "" || v === false;
  if (empty) return f.required ? "Ce champ est obligatoire." : null;
  if (typeof v !== "string") return null;
  if (f.type === "money" || f.type === "number") {
    const n = parseMontant(v);
    if (Number.isNaN(n)) return "Indiquez un nombre (ex. : 1200 ou 1200,50).";
    if (f.type === "money" && !Number.isInteger(n)) return "Le franc CFA n'a pas de centimes : indiquez un montant entier.";
    if (f.min !== undefined && n < f.min) return `La valeur minimale est ${f.min}.`;
    if (f.max !== undefined && n > f.max) return `La valeur maximale est ${f.max}.`;
  }
  if (f.type === "email" && !EMAIL_RE.test(v)) return "Adresse e-mail invalide.";
  if (f.type === "tel" && !TEL_RE.test(v.replace(/[\s.-]/g, ""))) return "Numéro invalide : 10 chiffres, par exemple 07 07 12 34 56.";
  if (f.type === "date" && Number.isNaN(new Date(v).getTime())) return "Date invalide.";
  return null;
}

export function validateStep(step: Step, d: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of visibleFields(step, d)) {
    const e = validateField(f, d[f.name]);
    if (e) errors[f.name] = e;
  }
  return errors;
}

export function completion(act: ActDefinition, d: FormData): number {
  const req = (act.steps ?? []).flatMap((s) => visibleFields(s, d)).filter((f) => f.required);
  if (req.length === 0) return 100;
  const ok = req.filter((f) => validateField(f, d[f.name]) === null).length;
  return Math.round((ok / req.length) * 100);
}
