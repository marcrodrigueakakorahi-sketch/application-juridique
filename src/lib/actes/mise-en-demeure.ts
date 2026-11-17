import type { ActDefinition, Condition, Warning } from "../types";

const AVEC_MONTANT: Condition = { any: [{ field: "motif", equals: "impaye" }, { field: "motif", equals: "caution" }] };
const SANS_MONTANT: Condition = { any: [{ field: "motif", equals: "livraison" }, { field: "motif", equals: "travaux" }, { field: "motif", equals: "autre" }] };

export const miseEnDemeure: ActDefinition = {
  id: "mise-en-demeure",
  title: "Mise en demeure",
  category: "litiges",
  summary:
    "Lettre formelle qui exige de quelqu'un qu'il respecte son obligation (payer, livrer, rembourser, rendre une caution, réparer) dans un délai précis, avant toute action en justice.",
  whenToUse: [
    "Quelqu'un ne vous rembourse pas l'argent qu'il vous doit.",
    "Votre ancien bailleur ne vous rend pas votre caution.",
    "Un vendeur, un artisan ou un prestataire ne respecte pas ses engagements.",
  ],
  limits: [
    "Pour pouvoir prouver son envoi, remettez-la contre décharge (signature et date sur votre copie), envoyez-la en recommandé avec accusé de réception, ou faites-la signifier par un commissaire de justice.",
    "Elle est la première étape avant de demander au tribunal une injonction de payer (procédure OHADA).",
  ],
  keywords: ["mise en demeure", "litige", "impayé", "rend", "rendre", "rembourse", "récupérer", "propriétaire", "bailleur", "paie", "payé", "réclamation", "caution", "artisan", "livraison", "travaux", "lettre", "recommandé", "dette"],
  complexity: "simple",
  prix: 0,
  minutes: 7,
  legalRefs: [
    "Code civil, art. 1139 (mise en demeure) et art. 1146 (dommages et intérêts)",
    "Code civil, art. 1153 (intérêts de retard au taux légal à compter de la sommation)",
    "Loi n° 2019-576 du 26 juin 2019 instituant le Code de la construction et de l'habitat (restitution de la caution)",
    "Acte uniforme OHADA portant organisation des procédures simplifiées de recouvrement et des voies d'exécution (injonction de payer, art. 1 et suivants)",
  ],
  version: "CI-1.0.0",
  steps: [
    {
      title: "Vous",
      fields: [
        { name: "exp_nom", label: "Vos nom et prénoms", type: "text", required: true },
        { name: "exp_adresse", label: "Votre domicile", type: "textarea", required: true, placeholder: "Commune, quartier, repères, boîte postale le cas échéant" },
        { name: "exp_tel", label: "Votre téléphone", type: "tel", required: true },
        { name: "exp_email", label: "Votre e-mail", type: "email" },
      ],
    },
    {
      title: "Le destinataire",
      fields: [
        { name: "dest_nom", label: "Nom du destinataire (personne ou entreprise)", type: "text", required: true },
        { name: "dest_adresse", label: "Adresse du destinataire", type: "textarea", required: true },
      ],
    },
    {
      title: "Le litige",
      fields: [
        {
          name: "motif",
          label: "Quel est le problème ?",
          type: "select",
          required: true,
          options: [
            { value: "impaye", label: "une somme d'argent qui ne m'a pas été remboursée ou payée" },
            { value: "caution", label: "la non-restitution de ma caution de loyer" },
            { value: "livraison", label: "la non-livraison d'un bien ou d'une prestation payée" },
            { value: "travaux", label: "des travaux non conformes ou inachevés" },
            { value: "autre", label: "le non-respect d'un autre engagement" },
          ],
        },
        { name: "date_faits", label: "Date du contrat, de la commande, du prêt ou des faits", type: "date", required: true },
        { name: "date_cles", label: "Date de remise des clés au bailleur", type: "date", required: true, showIf: { field: "motif", equals: "caution" } },
        { name: "montant", label: "Montant réclamé (FCFA)", type: "money", min: 1, required: true, showIf: AVEC_MONTANT },
        { name: "faits", label: "Décrivez les faits de façon précise et chronologique", type: "textarea", required: true, placeholder: "Ex. : Le 3 mars 2026, je vous ai remis 300 000 FCFA par Orange Money… Malgré mes relances des 10 et 24 mars…" },
        { name: "demande", label: "Ce que vous exigez précisément", type: "textarea", required: true, showIf: SANS_MONTANT, placeholder: "Ex. : me livrer le salon commandé ou me rembourser la somme de 450 000 FCFA versée" },
      ],
    },
    {
      title: "Délai et envoi",
      fields: [
        { name: "delai", label: "Délai accordé (en jours)", type: "number", required: true, min: 1, max: 60, default: "8", help: "Un délai de 8 à 15 jours est généralement considéré comme raisonnable." },
        {
          name: "envoi",
          label: "Mode d'envoi",
          type: "radio",
          required: true,
          default: "decharge",
          options: [
            { value: "decharge", label: "Remise en main propre contre décharge" },
            { value: "recommande", label: "Lettre recommandée avec accusé de réception" },
            { value: "commissaire", label: "Signification par commissaire de justice" },
          ],
        },
        { name: "lieu", label: "Fait à (ville)", type: "text", required: true, default: "Abidjan" },
        { name: "date_acte", label: "Date de la lettre", type: "date", required: true },
      ],
    },
  ],
  document: [
    { type: "paragraph", text: "{{exp_nom}}\n{{exp_adresse}}\nTél. : {{exp_tel}}" },
    { type: "paragraph", text: "À l'attention de :\n{{dest_nom}}\n{{dest_adresse}}" },
    { type: "paragraph", text: "{{lieu}}, le {{date_acte|date}}" },
    { type: "paragraph", if: { field: "envoi", equals: "recommande" }, text: "Lettre recommandée avec accusé de réception" },
    { type: "paragraph", if: { field: "envoi", equals: "decharge" }, text: "Lettre remise en main propre contre décharge" },
    { type: "heading", text: "Objet : mise en demeure" },
    { type: "paragraph", text: "Madame, Monsieur," },
    { type: "paragraph", text: "Je vous écris au sujet de {{motif|option}}, à la suite de nos relations débutées le {{date_faits|date}}." },
    { type: "paragraph", text: "{{faits}}" },
    { type: "paragraph", if: { field: "motif", equals: "caution" }, text: "Je vous ai restitué les clés du logement le {{date_cles|date}}. Le Code de la construction et de l'habitat vous imposait de me rembourser la caution dans un délai d'un mois à compter de cette date, déduction faite des seules sommes dues et justifiées. Ce délai est expiré et je n'ai reçu ni le remboursement ni aucun justificatif de retenue." },
    { type: "paragraph", if: AVEC_MONTANT, text: "En conséquence, je vous mets en demeure, par la présente, de me régler la somme de {{montant|lettres}} ({{montant|montant}}) dans un délai de {{delai}} jours à compter de la réception de ce courrier." },
    { type: "paragraph", if: SANS_MONTANT, text: "Je vous mets en demeure, par la présente, de procéder à ce qui suit dans un délai de {{delai}} jours à compter de la réception de ce courrier : {{demande}}" },
    { type: "paragraph", text: "La présente lettre vaut mise en demeure au sens des articles 1139 et 1153 du Code civil. Elle fait notamment courir les intérêts de retard au taux légal sur les sommes dues." },
    { type: "paragraph", if: AVEC_MONTANT, text: "À défaut de paiement dans ce délai, je saisirai sans autre avis la juridiction compétente d'une requête en injonction de payer, conformément à l'Acte uniforme OHADA portant organisation des procédures simplifiées de recouvrement et des voies d'exécution. Les frais de cette procédure pourront être mis à votre charge." },
    { type: "paragraph", if: SANS_MONTANT, text: "À défaut d'exécution dans ce délai, je saisirai sans autre avis la juridiction compétente afin d'obtenir l'exécution forcée de vos obligations ou la résolution du contrat, ainsi que des dommages et intérêts." },
    { type: "paragraph", text: "Je reste néanmoins disposé(e) à trouver une solution amiable si vous me contactez avant l'expiration de ce délai." },
    { type: "paragraph", text: "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées." },
    { type: "signature", text: "{{exp_nom}}" },
    { type: "note", if: { field: "envoi", equals: "decharge" }, text: "Reçu le ………………………… par ………………………………………… (nom, date et signature du destinataire)" },
  ],
  instructions: [
    "Imprimez la lettre en deux exemplaires, signez-les et gardez-en un.",
    "Remise contre décharge : faites dater et signer votre exemplaire par le destinataire. Recommandé : gardez le reçu de La Poste de Côte d'Ivoire et l'accusé de réception.",
    "En cas de refus de recevoir la lettre, faites-la signifier par un commissaire de justice : c'est la voie la plus sûre.",
    "Joignez des copies (jamais les originaux) des preuves : reconnaissance de dette, reçus, captures des transferts Mobile Money, contrat, état des lieux.",
    "Sans réponse dans le délai, vous pouvez déposer une requête en injonction de payer au greffe du tribunal de première instance ou de la section de tribunal compétente.",
  ],
  checks: (d) => {
    const w: Warning[] = [];
    if (d.motif === "caution" && typeof d.date_cles === "string" && d.date_cles) {
      const jours = (Date.now() - new Date(d.date_cles).getTime()) / 86400000;
      if (jours < 30) {
        w.push({ level: "attention", message: "Le bailleur dispose d'un mois après la remise des clés pour rendre la caution. Ce délai n'est peut-être pas encore écoulé." });
      }
    }
    if (d.motif === "impaye" || d.motif === "caution") {
      w.push({ level: "info", message: "Si le débiteur ne paie pas, l'injonction de payer OHADA est une procédure rapide et peu coûteuse pour une dette d'argent certaine, liquide et exigible." });
    }
    const delai = Number(d.delai);
    if (Number.isFinite(delai) && delai < 8) {
      w.push({ level: "info", message: "Un délai de moins de 8 jours pourrait être jugé déraisonnable." });
    }
    return w;
  },
};
