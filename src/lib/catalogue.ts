import type { ActDefinition, Category } from "./types";
import { bailHabitation } from "./actes/bail-habitation";
import { reconnaissanceDette } from "./actes/reconnaissance-dette";
import { miseEnDemeure } from "./actes/mise-en-demeure";

export const CATEGORIES: Record<Category, { label: string; description: string; icon: string }> = {
  logement: { label: "Logement", description: "Baux, états des lieux, congés, reçus de loyer", icon: "🏠" },
  famille: { label: "Famille", description: "Mariage, dons, organisation familiale", icon: "👪" },
  argent: { label: "Argent et biens", description: "Prêts, dettes, ventes entre particuliers", icon: "💰" },
  travail: { label: "Travail et services", description: "Prestations, employés de maison, procurations", icon: "🧰" },
  litiges: { label: "Litiges et courriers", description: "Mises en demeure, réclamations, résiliations", icon: "✉️" },
  succession: { label: "Succession", description: "Testament, transmission de biens", icon: "🕊️" },
  entreprise: { label: "Création d'activité", description: "Statuts OHADA, SCI, entreprise individuelle", icon: "🏢" },
};

// Actes au catalogue mais pas encore disponibles en rédaction.
type Stub = Pick<ActDefinition, "id" | "title" | "category" | "summary" | "keywords" | "complexity"> &
  Partial<ActDefinition>;

function stub(s: Stub): ActDefinition {
  return {
    whenToUse: [],
    limits: [],
    prix: 0,
    minutes: 10,
    legalRefs: [],
    version: "0",
    ...s,
  };
}

const AVENIR: ActDefinition[] = [
  stub({ id: "bail-commercial", title: "Bail à usage professionnel", category: "logement", complexity: "complexe", summary: "Location d'un local pour un commerce, un atelier ou un bureau (Acte uniforme OHADA relatif au droit commercial général).", keywords: ["bail", "commercial", "boutique", "magasin", "local", "bureau", "professionnel"] }),
  stub({ id: "etat-des-lieux", title: "État des lieux", category: "logement", complexity: "simple", summary: "Description pièce par pièce de l'état du logement à l'entrée et à la sortie.", keywords: ["état des lieux", "entrée", "sortie", "logement"] }),
  stub({ id: "recu-loyer", title: "Reçu de loyer", category: "logement", complexity: "simple", summary: "Reçu attestant le paiement du loyer, de l'avance ou de la caution.", keywords: ["reçu", "quittance", "loyer", "paiement", "avance"] }),
  stub({ id: "conge-locataire", title: "Lettre de congé du locataire", category: "logement", complexity: "simple", summary: "Préavis de trois mois pour quitter un logement loué.", keywords: ["congé", "préavis", "quitter", "déménager", "résilier bail"] }),
  stub({ id: "conge-bailleur", title: "Congé du bailleur pour reprise", category: "logement", complexity: "intermediaire", summary: "Congé motivé donné au locataire avec un préavis de trois mois.", keywords: ["congé", "reprise", "expulser", "faire partir", "locataire"] }),
  stub({ id: "don-argent", title: "Acte de don d'argent", category: "famille", complexity: "simple", summary: "Acte constatant un don d'argent à un proche.", keywords: ["don", "donner", "cadeau", "argent", "enfant"] }),
  stub({ id: "convention-parentale", title: "Accord parental après séparation", category: "famille", complexity: "intermediaire", summary: "Accord entre parents séparés sur la garde des enfants et la pension alimentaire, à faire homologuer par le juge.", keywords: ["garde", "enfant", "pension alimentaire", "séparation"] }),
  stub({ id: "pret-particuliers", title: "Contrat de prêt entre particuliers", category: "argent", complexity: "simple", summary: "Contrat signé par le prêteur et l'emprunteur, plus complet qu'une reconnaissance de dette.", keywords: ["prêt", "prêter", "emprunter", "argent"] }),
  stub({ id: "vente-vehicule", title: "Contrat de vente de véhicule", category: "argent", complexity: "simple", summary: "Vente d'une voiture ou d'une moto d'occasion entre particuliers, avant la mutation de la carte grise.", keywords: ["vente", "voiture", "véhicule", "moto", "vendre", "occasion", "carte grise"] }),
  stub({ id: "vente-objet", title: "Contrat de vente d'un bien", category: "argent", complexity: "simple", summary: "Vente d'un bien de valeur (téléphone, matériel, bétail…) entre particuliers.", keywords: ["vente", "vendre", "acheter", "objet", "matériel"] }),
  stub({ id: "employe-maison", title: "Contrat de travail d'employé de maison", category: "travail", complexity: "intermediaire", summary: "Contrat pour une nounou, un gardien, un chauffeur ou un aide ménager (Code du travail).", keywords: ["nounou", "ménagère", "domestique", "gardien", "chauffeur", "employé", "maison", "bonne"] }),
  stub({ id: "prestation-services", title: "Contrat de prestation de services", category: "travail", complexity: "intermediaire", summary: "Encadre une prestation (travaux, construction, cours, événement) avec un prestataire.", keywords: ["prestation", "service", "travaux", "maçon", "construction", "prestataire"] }),
  stub({ id: "procuration", title: "Procuration", category: "travail", complexity: "simple", summary: "Autorise une personne à accomplir une démarche en votre nom (à faire légaliser en mairie).", keywords: ["procuration", "mandat", "pouvoir", "représenter"] }),
  stub({ id: "attestation-honneur", title: "Attestation sur l'honneur", category: "travail", complexity: "simple", summary: "Déclaration écrite certifiant l'exactitude d'une situation.", keywords: ["attestation", "honneur", "certifie", "déclaration"] }),
  stub({ id: "resiliation", title: "Lettre de résiliation", category: "litiges", complexity: "simple", summary: "Résilier un abonnement, une assurance ou un contrat.", keywords: ["résilier", "résiliation", "abonnement", "assurance", "contrat"] }),
  stub({ id: "testament-olographe", title: "Guide du testament olographe", category: "succession", complexity: "intermediaire", summary: "Modèle à recopier entièrement à la main, daté et signé.", keywords: ["testament", "héritage", "succession", "léguer"] }),
  stub({ id: "statuts-sarl", title: "Statuts de SARL (OHADA)", category: "entreprise", complexity: "complexe", summary: "Statuts d'une société à responsabilité limitée, à déposer au CEPICI.", keywords: ["sarl", "société", "statuts", "entreprise", "cepici", "créer"] }),
  stub({ id: "statuts-sci", title: "Statuts de SCI familiale", category: "entreprise", complexity: "complexe", summary: "Société civile immobilière pour détenir et transmettre un bien en famille.", keywords: ["sci", "société", "immobilier", "statuts"] }),
];

const PROFESSIONNELS: ActDefinition[] = [
  stub({ id: "vente-immobiliere", title: "Vente d'un terrain ou d'une maison", category: "logement", complexity: "complexe", summary: "Achat ou vente d'un terrain, d'une maison ou d'un appartement.", keywords: ["vendre", "vente", "acheter", "maison", "terrain", "lot", "acd", "appartement", "immobilier"], requiresProfessional: { who: "notaire", why: "Une vente immobilière doit être constatée par acte notarié pour être opposable et permettre la mutation du titre de propriété (ACD, titre foncier). Faites aussi vérifier par le notaire la situation foncière du terrain avant de payer." } }),
  stub({ id: "donation-immobiliere", title: "Donation d'un bien immobilier", category: "famille", complexity: "complexe", summary: "Donner un terrain ou une maison, par exemple à ses enfants.", keywords: ["donation", "donner", "maison", "terrain", "enfant"], requiresProfessional: { who: "notaire", why: "La donation d'un bien immobilier doit être établie par un notaire, puis publiée pour que le bénéficiaire devienne propriétaire." } }),
  stub({ id: "contrat-mariage", title: "Contrat de mariage", category: "famille", complexity: "complexe", summary: "Organiser vous-mêmes les règles de votre régime matrimonial.", keywords: ["mariage", "régime matrimonial", "séparation de biens", "communauté", "marier"], requiresProfessional: { who: "notaire", why: "Depuis la loi n° 2019-570 sur le mariage, les futurs époux peuvent choisir la communauté de biens ou la séparation de biens par simple déclaration devant l'officier d'état civil. S'ils veulent des règles sur mesure, le contrat de mariage doit être établi par un notaire." } }),
  stub({ id: "divorce", title: "Divorce", category: "famille", complexity: "complexe", summary: "Mettre fin à un mariage civil.", keywords: ["divorce", "divorcer", "séparation", "mariage"], requiresProfessional: { who: "avocat", why: "Le divorce est prononcé par le juge. L'assistance d'un avocat est fortement recommandée pour protéger vos droits sur les biens, la garde des enfants et la pension." } }),
  stub({ id: "testament-authentique", title: "Testament authentique", category: "succession", complexity: "complexe", summary: "Testament dicté au notaire, en présence de témoins.", keywords: ["testament", "notaire", "succession"], requiresProfessional: { who: "notaire", why: "Ce testament est, par définition, reçu par un notaire." } }),
];

export const ACTES_DISPONIBLES: ActDefinition[] = [bailHabitation, reconnaissanceDette, miseEnDemeure];
export const CATALOGUE: ActDefinition[] = [...ACTES_DISPONIBLES, ...AVENIR, ...PROFESSIONNELS];

export function getActe(id: string): ActDefinition | undefined {
  return CATALOGUE.find((a) => a.id === id);
}

export function isAvailable(a: ActDefinition): boolean {
  return Boolean(a.steps && a.document) && !a.requiresProfessional;
}

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ");
}

const STOP = new Set(["je", "veux", "un", "une", "le", "la", "les", "de", "du", "des", "a", "mon", "ma", "mes", "pour", "et", "en", "qui", "que", "il", "elle", "me", "m", "l", "d", "j", "ai", "est", "pas", "ne", "faire", "comment", "avec", "sur", "au", "aux"]);

/** Recherche plein texte simple (sera remplacée par l'IA en phase 3). */
export function rechercher(query: string): ActDefinition[] {
  const words = normalize(query).split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
  if (words.length === 0) return [];
  const scored = CATALOGUE.map((a) => {
    const kw = a.keywords.map(normalize);
    const title = normalize(a.title);
    const summary = normalize(a.summary);
    let score = 0;
    for (const w of words) {
      const stem = w.length > 5 ? w.slice(0, w.length - 2) : w;
      if (kw.some((k) => k === w || k.split(" ").includes(w))) score += 3;
      else if (kw.some((k) => k.includes(stem))) score += 2;
      if (title.includes(stem)) score += 2;
      if (summary.includes(stem)) score += 1;
    }
    return { a, score };
  });
  return scored
    .filter((s) => s.score >= 2)
    .sort((x, y) => Number(isAvailable(y.a)) - Number(isAvailable(x.a)) || y.score - x.score)
    .map((s) => s.a);
}
