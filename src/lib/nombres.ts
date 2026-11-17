// Conversion des nombres en toutes lettres (orthographe traditionnelle française).

const UNITES = [
  "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
  "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
  "dix-sept", "dix-huit", "dix-neuf",
];
const DIZAINES = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante"];

function moinsDeCent(n: number): string {
  if (n < 20) return UNITES[n];
  const d = Math.floor(n / 10);
  const u = n % 10;
  if (d === 7 || d === 9) {
    const base = d === 7 ? "soixante" : "quatre-vingt";
    const reste = 10 + u;
    if (d === 7 && u === 1) return "soixante et onze";
    return `${base}-${UNITES[reste]}`;
  }
  if (d === 8) return u === 0 ? "quatre-vingts" : `quatre-vingt-${UNITES[u]}`;
  if (u === 0) return DIZAINES[d];
  if (u === 1) return `${DIZAINES[d]} et un`;
  return `${DIZAINES[d]}-${UNITES[u]}`;
}

function moinsDeMille(n: number, final: boolean): string {
  const c = Math.floor(n / 100);
  const r = n % 100;
  let out = "";
  if (c === 1) out = "cent";
  else if (c > 1) out = `${UNITES[c]} cent${r === 0 && final ? "s" : ""}`;
  if (r > 0) {
    let txt = moinsDeCent(r);
    // « quatre-vingts » perd son s s'il n'est pas en fin de nombre
    if (!final && txt === "quatre-vingts") txt = "quatre-vingt";
    out = out ? `${out} ${txt}` : txt;
  }
  return out;
}

export function entierEnLettres(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "";
  n = Math.floor(n);
  if (n === 0) return "zéro";
  const parts: string[] = [];
  const milliards = Math.floor(n / 1e9);
  const millions = Math.floor((n % 1e9) / 1e6);
  const milliers = Math.floor((n % 1e6) / 1e3);
  const reste = n % 1000;

  if (milliards) parts.push(`${moinsDeMille(milliards, true)} milliard${milliards > 1 ? "s" : ""}`);
  if (millions) parts.push(`${moinsDeMille(millions, true)} million${millions > 1 ? "s" : ""}`);
  if (milliers) parts.push(milliers === 1 ? "mille" : `${moinsDeMille(milliers, false)} mille`);
  if (reste) parts.push(moinsDeMille(reste, true));
  return parts.join(" ");
}

/** 1500000 -> « un million cinq cent mille francs CFA » (le franc CFA n'a pas de centimes). */
export function montantEnLettres(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "";
  const n = Math.round(value);
  const txt = entierEnLettres(n);
  const de = /(million|milliard)s?$/.test(txt) ? " de" : "";
  return `${txt}${de} franc${n > 1 ? "s" : ""} CFA`;
}

export function parseMontant(raw: string | boolean | undefined): number {
  if (typeof raw !== "string") return NaN;
  let cleaned = raw.replace(/f\s?cfa/gi, "").replace(/[\s\u00a0\u202f]/g, "");
  // « 150.000 » est une façon courante d'écrire les milliers en Côte d'Ivoire.
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) cleaned = cleaned.replace(/\./g, "");
  cleaned = cleaned.replace(",", ".");
  return cleaned === "" ? NaN : Number(cleaned);
}

/** 1500000 -> « 1 500 000 FCFA » */
export function formatMontant(value: number): string {
  const n = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(value));
  return `${n.replace(/[\u202f\u00a0]/g, " ")} FCFA`;
}
