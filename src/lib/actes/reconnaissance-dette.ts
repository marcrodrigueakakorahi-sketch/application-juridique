import type { ActDefinition, Warning } from "../types";
import { parseMontant, formatMontant } from "../nombres";

export const reconnaissanceDette: ActDefinition = {
  id: "reconnaissance-de-dette",
  title: "Reconnaissance de dette",
  category: "argent",
  summary:
    "Document par lequel une personne reconnaît devoir une somme d'argent à une autre et s'engage à la rembourser selon des modalités précises.",
  whenToUse: [
    "Vous avez prêté de l'argent à un proche, un collègue ou un ami et voulez une preuve écrite.",
    "Quelqu'un vous doit de l'argent (avance, marchandise, dépense payée pour lui).",
    "Vous voulez fixer un calendrier de remboursement clair.",
  ],
  limits: [
    "Le débiteur doit écrire de sa main, à côté de sa signature, un « bon pour » ou « approuvé » portant la somme en toutes lettres (article 1326 du Code civil).",
    "Elle permet de demander au tribunal une injonction de payer (procédure OHADA) si le débiteur ne rembourse pas.",
  ],
  keywords: ["dette", "prêt", "prêter", "argent", "rembourser", "remboursement", "emprunt", "doit", "avance", "créance", "tontine", "dépanner"],
  complexity: "simple",
  prix: 3000,
  minutes: 5,
  legalRefs: [
    "Code civil, art. 1326 (mention manuscrite de la somme)",
    "Code civil, art. 1907 (intérêts conventionnels fixés par écrit)",
    "Décision n° 19 du 29 décembre 2025 du Conseil des ministres de l'UMOA fixant le taux de l'usure",
    "Acte uniforme OHADA portant organisation des procédures simplifiées de recouvrement et des voies d'exécution (injonction de payer)",
  ],
  version: "CI-1.0.0",
  steps: [
    {
      title: "Le débiteur",
      description: "La personne qui doit l'argent.",
      fields: [
        { name: "debiteur_nom", label: "Nom et prénoms du débiteur", type: "text", required: true, placeholder: "Koné Aminata" },
        { name: "debiteur_naissance", label: "Date de naissance du débiteur", type: "date", required: true },
        { name: "debiteur_lieu_naissance", label: "Lieu de naissance du débiteur", type: "text", required: true },
        { name: "debiteur_piece", label: "N° de pièce d'identité du débiteur (CNI, passeport, carte consulaire)", type: "text", required: true },
        { name: "debiteur_adresse", label: "Domicile du débiteur", type: "textarea", required: true, placeholder: "Commune, quartier, repères" },
        { name: "debiteur_tel", label: "Téléphone du débiteur", type: "tel", required: true },
      ],
    },
    {
      title: "Le créancier",
      description: "La personne à qui l'argent est dû.",
      fields: [
        { name: "creancier_nom", label: "Nom et prénoms du créancier", type: "text", required: true },
        { name: "creancier_piece", label: "N° de pièce d'identité du créancier", type: "text", required: true },
        { name: "creancier_adresse", label: "Domicile du créancier", type: "textarea", required: true },
        { name: "creancier_tel", label: "Téléphone du créancier", type: "tel" },
      ],
    },
    {
      title: "La somme due",
      fields: [
        { name: "montant", label: "Montant dû (FCFA)", type: "money", required: true, min: 1, help: "Il sera écrit automatiquement en chiffres et en lettres dans le document." },
        {
          name: "origine",
          label: "Origine de la dette",
          type: "radio",
          required: true,
          default: "pret",
          options: [
            { value: "pret", label: "Un prêt d'argent" },
            { value: "marchandise", label: "Une marchandise ou un service non payé" },
            { value: "autre", label: "Autre" },
          ],
        },
        { name: "date_remise", label: "Date de remise de l'argent", type: "date", required: true, showIf: { field: "origine", equals: "pret" } },
        {
          name: "mode_remise",
          label: "Mode de remise de l'argent",
          type: "select",
          showIf: { field: "origine", equals: "pret" },
          default: "mobile",
          options: [
            { value: "mobile", label: "transfert Mobile Money" },
            { value: "virement", label: "virement bancaire" },
            { value: "cheque", label: "chèque" },
            { value: "especes", label: "espèces" },
          ],
          help: "Gardez la preuve du transfert (SMS de confirmation, relevé) : elle renforce la valeur de la reconnaissance de dette.",
        },
        { name: "origine_detail", label: "Précisez l'origine de la dette", type: "textarea", required: true, showIf: { field: "origine", notEquals: "pret" }, placeholder: "Ex. : livraison de 20 sacs de riz de 25 kg le 3 mars 2026, non payés" },
      ],
    },
    {
      title: "Remboursement",
      fields: [
        {
          name: "modalite",
          label: "Comment la somme sera-t-elle remboursée ?",
          type: "radio",
          required: true,
          default: "unique",
          options: [
            { value: "unique", label: "En une seule fois" },
            { value: "echeances", label: "Par mensualités" },
          ],
        },
        { name: "date_echeance", label: "Date limite de remboursement", type: "date", required: true, showIf: { field: "modalite", equals: "unique" } },
        { name: "mensualite", label: "Montant de chaque mensualité (FCFA)", type: "money", required: true, min: 1, showIf: { field: "modalite", equals: "echeances" } },
        { name: "nb_mensualites", label: "Nombre de mensualités", type: "number", required: true, min: 1, max: 360, showIf: { field: "modalite", equals: "echeances" } },
        { name: "date_premiere", label: "Date de la première mensualité", type: "date", required: true, showIf: { field: "modalite", equals: "echeances" } },
        { name: "interets", label: "La somme porte des intérêts", type: "checkbox", help: "Sans taux fixé par écrit, aucun intérêt n'est dû (art. 1907 du Code civil)." },
        { name: "taux", label: "Taux d'intérêt annuel (%)", type: "number", required: true, min: 0, max: 50, showIf: { field: "interets", equals: true } },
      ],
    },
    {
      title: "Signature",
      fields: [
        { name: "lieu", label: "Fait à (ville)", type: "text", required: true, default: "Abidjan" },
        { name: "date_acte", label: "Date de signature", type: "date", required: true },
        { name: "temoin", label: "Ajouter un témoin", type: "checkbox", help: "Facultatif, mais utile en cas de contestation." },
        { name: "temoin_nom", label: "Nom et prénoms du témoin", type: "text", required: true, showIf: { field: "temoin", equals: true } },
        { name: "temoin_piece", label: "N° de pièce d'identité du témoin", type: "text", required: true, showIf: { field: "temoin", equals: true } },
      ],
    },
  ],
  document: [
    { type: "title", text: "RECONNAISSANCE DE DETTE" },
    { type: "paragraph", text: "Je soussigné(e) {{debiteur_nom}}, né(e) le {{debiteur_naissance|date}} à {{debiteur_lieu_naissance}}, titulaire de la pièce d'identité n° {{debiteur_piece}}, demeurant à {{debiteur_adresse}}, joignable au {{debiteur_tel}}," },
    { type: "paragraph", text: "reconnais devoir à {{creancier_nom}}, titulaire de la pièce d'identité n° {{creancier_piece}}, demeurant à {{creancier_adresse}}," },
    { type: "paragraph", text: "la somme de {{montant|lettres}} ({{montant|montant}})." },
    { type: "heading", text: "Origine de la dette" },
    { type: "paragraph", if: { field: "origine", equals: "pret" }, text: "Cette somme correspond à un prêt que m'a consenti {{creancier_nom}} et que j'ai reçu le {{date_remise|date}} par {{mode_remise|option}}." },
    { type: "paragraph", if: { field: "origine", equals: "marchandise" }, text: "Cette somme correspond au prix d'une marchandise ou d'un service fourni par {{creancier_nom}} et non encore payé : {{origine_detail}}." },
    { type: "paragraph", if: { field: "origine", equals: "autre" }, text: "Cette somme a pour origine : {{origine_detail}}." },
    { type: "heading", text: "Modalités de remboursement" },
    { type: "paragraph", if: { field: "modalite", equals: "unique" }, text: "Je m'engage à rembourser cette somme en une seule fois, au plus tard le {{date_echeance|date}}." },
    { type: "paragraph", if: { field: "modalite", equals: "echeances" }, text: "Je m'engage à rembourser cette somme en {{nb_mensualites}} mensualités de {{mensualite|montant}} ({{mensualite|lettres}}) chacune, la première échéance étant fixée au {{date_premiere|date}}, puis le même jour de chaque mois suivant." },
    { type: "paragraph", if: { field: "interets", equals: true }, text: "Cette somme porte intérêts au taux conventionnel de {{taux}} % l'an, calculés sur le capital restant dû." },
    { type: "paragraph", if: { field: "interets", equals: false }, text: "Ce prêt est consenti sans intérêts." },
    { type: "paragraph", text: "Chaque paiement donnera lieu à un reçu signé par le créancier ou sera effectué par un moyen laissant une trace écrite (Mobile Money, virement)." },
    { type: "paragraph", text: "À défaut de paiement d'une seule échéance à sa date, la totalité des sommes restant dues deviendra immédiatement exigible, quinze jours après une mise en demeure restée sans effet. Le créancier pourra alors en poursuivre le recouvrement, notamment par la procédure d'injonction de payer prévue par l'Acte uniforme OHADA." },
    { type: "paragraph", text: "Fait à {{lieu}}, le {{date_acte|date}}, en deux exemplaires originaux, dont un remis au créancier." },
    { type: "note", text: "Mention à écrire à la main par le débiteur, juste au-dessus de sa signature : « Bon pour reconnaissance de dette de la somme de {{montant|lettres}} ({{montant|montant}}). »" },
    { type: "signature", text: "Signature du débiteur" },
    { type: "paragraph", if: { field: "temoin", equals: true }, text: "En présence de {{temoin_nom}}, titulaire de la pièce d'identité n° {{temoin_piece}}, témoin." },
    { type: "signature", if: { field: "temoin", equals: true }, text: "Signature du témoin" },
  ],
  instructions: [
    "Imprimez le document en deux exemplaires.",
    "Le débiteur écrit à la main la mention « Bon pour reconnaissance de dette… » avec la somme en toutes lettres et en chiffres, puis signe.",
    "Joignez une copie de la pièce d'identité du débiteur et gardez la preuve de remise de l'argent (SMS Mobile Money, relevé bancaire).",
    "Pour donner une date certaine à l'acte, vous pouvez le faire enregistrer au centre des impôts (DGI) ou faire légaliser la signature du débiteur en mairie.",
    "En cas de non-paiement : envoyez une mise en demeure, puis demandez une injonction de payer au tribunal.",
  ],
  checks: (d) => {
    const w: Warning[] = [];
    const montant = parseMontant(d.montant);
    if (d.origine === "pret" && d.mode_remise === "especes" && montant >= 500000) {
      w.push({ level: "attention", message: "Une remise importante en espèces est difficile à prouver. Privilégiez un transfert Mobile Money ou un virement, ou faites signer un témoin." });
    }
    if (d.interets === true) {
      const taux = parseMontant(d.taux);
      if (taux > 14) {
        w.push({ level: "attention", message: `Un taux de ${taux} % dépasse le taux de l'usure fixé à 14 % l'an pour les banques dans l'UEMOA (décision du 29 décembre 2025). Un taux usuraire est illégal et peut être réduit par le juge.` });
      }
    }
    if (d.modalite === "echeances" && d.interets !== true) {
      const total = parseMontant(d.mensualite) * parseMontant(d.nb_mensualites);
      if (Number.isFinite(total) && Number.isFinite(montant) && total !== montant) {
        w.push({ level: "attention", message: `Les mensualités totalisent ${formatMontant(total)}, mais la somme due est de ${formatMontant(montant)}. Vérifiez le montant ou le nombre de mensualités.` });
      }
    }
    return w;
  },
};
