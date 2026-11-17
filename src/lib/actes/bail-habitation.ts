import type { ActDefinition, Warning } from "../types";
import { parseMontant, formatMontant } from "../nombres";

export const bailHabitation: ActDefinition = {
  id: "bail-habitation",
  title: "Contrat de bail à usage d'habitation",
  category: "logement",
  summary:
    "Contrat de location d'une maison, d'un appartement, d'un studio ou d'une chambre, meublé ou non, conforme au Code de la construction et de l'habitat ivoirien.",
  whenToUse: [
    "Vous mettez en location une villa, un appartement, un studio ou une « entrer-coucher ».",
    "Vous êtes locataire et voulez un contrat écrit qui protège vos droits.",
    "Vous louez un logement meublé.",
  ],
  limits: [
    "Le bail d'habitation doit obligatoirement être écrit et enregistré auprès des impôts (DGI).",
    "Le bailleur ne peut pas exiger plus de 2 mois d'avance et 2 mois de caution, sous peine d'amende.",
    "Ne convient pas aux baux commerciaux ou professionnels, régis par l'Acte uniforme OHADA relatif au droit commercial général.",
  ],
  keywords: ["bail", "location", "louer", "locataire", "propriétaire", "bailleur", "maison", "villa", "appartement", "studio", "logement", "loyer", "caution", "avance", "meublé", "entrer coucher"],
  complexity: "intermediaire",
  prix: 10000,
  minutes: 12,
  legalRefs: [
    "Loi n° 2019-576 du 26 juin 2019 instituant le Code de la construction et de l'habitat (bail à usage d'habitation, notamment art. 414 à 416)",
    "Code civil (dispositions générales sur le louage, applicables sous réserve du Code de la construction et de l'habitat)",
    "Code général des impôts (enregistrement des baux)",
  ],
  version: "CI-1.0.0",
  steps: [
    {
      title: "Le bailleur",
      description: "Le propriétaire, ou la personne qui met le logement en location.",
      fields: [
        { name: "bailleur_nom", label: "Nom et prénoms du bailleur", type: "text", required: true, placeholder: "Kouassi Yao Jean" },
        { name: "bailleur_piece", label: "N° de pièce d'identité du bailleur (CNI, passeport, carte consulaire)", type: "text", required: true },
        { name: "bailleur_adresse", label: "Domicile du bailleur", type: "textarea", required: true, placeholder: "Commune, quartier, lot, îlot, repères" },
        { name: "bailleur_tel", label: "Téléphone du bailleur", type: "tel", required: true, placeholder: "07 07 12 34 56" },
      ],
    },
    {
      title: "Le locataire",
      fields: [
        { name: "locataire_nom", label: "Nom et prénoms du locataire", type: "text", required: true },
        { name: "locataire_piece", label: "N° de pièce d'identité du locataire", type: "text", required: true },
        { name: "locataire_profession", label: "Profession du locataire", type: "text" },
        { name: "locataire_tel", label: "Téléphone du locataire", type: "tel", required: true },
      ],
    },
    {
      title: "Le logement",
      fields: [
        {
          name: "logement_type",
          label: "Type de logement",
          type: "select",
          required: true,
          options: [
            { value: "une villa", label: "Villa / maison" },
            { value: "un appartement", label: "Appartement" },
            { value: "un studio", label: "Studio" },
            { value: "une chambre-salon", label: "Chambre-salon" },
            { value: "une entrée-coucher", label: "Entrée-coucher" },
            { value: "un logement en cour commune", label: "Logement en cour commune" },
          ],
        },
        { name: "pieces", label: "Nombre de pièces", type: "number", required: true, min: 1 },
        { name: "logement_adresse", label: "Situation du logement", type: "textarea", required: true, placeholder: "Commune de Cocody, Angré 8e tranche, lot 123, îlot 12, porte 4", help: "Commune, quartier, lot et îlot ou repères précis." },
        { name: "description", label: "Description (pièces, équipements, dépendances)", type: "textarea", placeholder: "2 chambres, un salon, une cuisine, 2 douches, une terrasse, un garage" },
        { name: "meuble", label: "Le logement est loué meublé", type: "checkbox", help: "Un inventaire du mobilier, signé par les deux parties, devra être annexé au bail." },
        {
          name: "compteurs",
          label: "Eau et électricité",
          type: "radio",
          required: true,
          default: "individuels",
          options: [
            { value: "individuels", label: "Compteurs individuels au nom du locataire (CIE / SODECI)" },
            { value: "communs", label: "Compteurs communs, consommation répartie entre locataires" },
            { value: "inclus", label: "Compris dans le loyer" },
          ],
        },
      ],
    },
    {
      title: "Durée",
      fields: [
        { name: "date_effet", label: "Date d'entrée dans les lieux", type: "date", required: true },
        {
          name: "duree_type",
          label: "Durée du bail",
          type: "radio",
          required: true,
          default: "determinee",
          options: [
            { value: "determinee", label: "Durée déterminée, renouvelable" },
            { value: "indeterminee", label: "Durée indéterminée" },
          ],
        },
        { name: "duree_mois", label: "Durée (en mois)", type: "number", required: true, min: 1, max: 120, default: "12", showIf: { field: "duree_type", equals: "determinee" } },
      ],
    },
    {
      title: "Loyer, avance et caution",
      fields: [
        { name: "loyer", label: "Loyer mensuel (FCFA)", type: "money", required: true, min: 1 },
        { name: "charges", label: "Charges mensuelles en plus du loyer (FCFA)", type: "money", min: 0, help: "Gardiennage, entretien des parties communes, ordures… Laissez vide s'il n'y en a pas." },
        { name: "avance_mois", label: "Nombre de mois de loyer payés d'avance", type: "number", required: true, min: 0, default: "2", help: "2 mois au maximum." },
        { name: "caution_mois", label: "Nombre de mois de caution (dépôt de garantie)", type: "number", required: true, min: 0, default: "2", help: "2 mois au maximum." },
        { name: "jour_paiement", label: "Le loyer est payé au plus tard le … de chaque mois", type: "number", required: true, min: 1, max: 28, default: "5" },
        {
          name: "mode_paiement",
          label: "Mode de paiement du loyer",
          type: "select",
          required: true,
          default: "mobile",
          options: [
            { value: "mobile", label: "Mobile Money (Orange Money, MTN MoMo, Moov Money, Wave)" },
            { value: "virement", label: "virement bancaire" },
            { value: "especes", label: "espèces contre reçu" },
          ],
        },
        { name: "numero_paiement", label: "Numéro ou compte sur lequel payer", type: "text", showIf: { field: "mode_paiement", notEquals: "especes" } },
      ],
    },
    {
      title: "Signature",
      fields: [
        { name: "lieu", label: "Fait à (ville)", type: "text", required: true, default: "Abidjan" },
        { name: "date_acte", label: "Date de signature", type: "date", required: true },
      ],
    },
  ],
  document: [
    { type: "title", text: "CONTRAT DE BAIL À USAGE D'HABITATION" },
    { type: "subtitle", text: "Loi n° 2019-576 du 26 juin 2019 instituant le Code de la construction et de l'habitat" },
    { type: "heading", text: "Entre les soussignés" },
    { type: "paragraph", text: "{{bailleur_nom}}, titulaire de la pièce d'identité n° {{bailleur_piece}}, demeurant à {{bailleur_adresse}}, joignable au {{bailleur_tel}}, ci-après dénommé « le bailleur »," },
    { type: "paragraph", text: "et {{locataire_nom}}, titulaire de la pièce d'identité n° {{locataire_piece}}, joignable au {{locataire_tel}}, ci-après dénommé « le locataire »," },
    { type: "paragraph", if: { field: "locataire_profession", filled: true }, text: "exerçant la profession de {{locataire_profession}}." },
    { type: "paragraph", text: "Il a été convenu ce qui suit." },
    { type: "heading", text: "Article 1 — Objet" },
    { type: "paragraph", text: "Le bailleur donne en location au locataire, qui accepte, {{logement_type}} de {{pieces}} pièce(s), situé(e) à l'adresse suivante : {{logement_adresse}}. Le logement est loué à usage exclusif d'habitation." },
    { type: "paragraph", if: { field: "description", filled: true }, text: "Le logement comprend : {{description}}." },
    { type: "paragraph", if: { field: "meuble", equals: true }, text: "Le logement est loué meublé. Le mobilier et les équipements mis à la disposition du locataire sont décrits dans un inventaire signé par les deux parties et annexé au présent contrat." },
    { type: "heading", text: "Article 2 — Durée" },
    { type: "paragraph", if: { field: "duree_type", equals: "determinee" }, text: "Le présent bail est consenti pour une durée de {{duree_mois}} mois à compter du {{date_effet|date}}. À son échéance, il est renouvelé aux mêmes conditions au profit du locataire de bonne foi, sauf congé délivré dans les conditions prévues à l'article 7." },
    { type: "paragraph", if: { field: "duree_type", equals: "indeterminee" }, text: "Le présent bail est consenti pour une durée indéterminée à compter du {{date_effet|date}}." },
    { type: "heading", text: "Article 3 — Loyer et charges" },
    { type: "paragraph", text: "Le loyer mensuel est fixé à {{loyer|montant}} ({{loyer|lettres}})." },
    { type: "paragraph", if: { field: "charges", filled: true }, text: "S'y ajoutent des charges mensuelles de {{charges|montant}} ({{charges|lettres}})." },
    { type: "paragraph", if: { field: "mode_paiement", notEquals: "especes" }, text: "Le loyer est payable d'avance, au plus tard le {{jour_paiement}} de chaque mois, par {{mode_paiement|option}} au numéro ou compte suivant : {{numero_paiement}}. La preuve de la transaction vaut justificatif de paiement." },
    { type: "paragraph", if: { field: "mode_paiement", equals: "especes" }, text: "Le loyer est payable d'avance, au plus tard le {{jour_paiement}} de chaque mois, en espèces. Le bailleur remet au locataire, à chaque paiement, un reçu daté et signé." },
    { type: "paragraph", if: { field: "compteurs", equals: "individuels" }, text: "Les consommations d'eau et d'électricité sont souscrites au nom du locataire et payées directement par lui aux fournisseurs." },
    { type: "paragraph", if: { field: "compteurs", equals: "communs" }, text: "Les consommations d'eau et d'électricité, relevées sur des compteurs communs, sont réparties entre les occupants selon une clé de répartition communiquée par écrit au locataire. Le bailleur présente les factures sur simple demande." },
    { type: "paragraph", if: { field: "compteurs", equals: "inclus" }, text: "Les consommations d'eau et d'électricité sont comprises dans le loyer." },
    { type: "heading", text: "Article 4 — Avance et caution" },
    { type: "paragraph", text: "À la signature, le locataire verse {{avance_mois}} mois de loyer d'avance, imputables sur les premiers mois de location, et une caution (dépôt de garantie) de {{caution_mois}} mois de loyer." },
    { type: "paragraph", text: "Conformément au Code de la construction et de l'habitat, l'avance et la caution ne peuvent excéder chacune deux mois de loyer. La caution ne produit pas d'intérêts. Elle est restituée au locataire dans un délai d'un mois à compter de la remise des clés, déduction faite des sommes dont il serait débiteur et des réparations locatives dûment justifiées." },
    { type: "heading", text: "Article 5 — État des lieux" },
    { type: "paragraph", text: "Un état des lieux écrit et contradictoire est établi et signé par les deux parties lors de la remise des clés, puis lors de leur restitution. À défaut d'état des lieux d'entrée, le locataire est présumé avoir reçu le logement en bon état." },
    { type: "heading", text: "Article 6 — Révision du loyer" },
    { type: "paragraph", text: "Le loyer ne peut être révisé, à la hausse ou à la baisse, qu'à l'expiration d'une période de trois ans à compter de la prise d'effet du bail ou de la dernière révision. La partie qui demande la révision notifie son intention à l'autre par écrit, au moins trois mois avant la date d'effet souhaitée." },
    { type: "heading", text: "Article 7 — Congé" },
    { type: "paragraph", text: "Le locataire peut mettre fin au bail en respectant un préavis de trois mois, notifié par écrit au bailleur." },
    { type: "paragraph", text: "Le bailleur peut donner congé en respectant un préavis de trois mois, par un écrit motivé, notamment pour reprendre le logement afin de l'occuper lui-même ou de le faire occuper par un proche, ou pour un motif légitime et sérieux tel que l'inexécution par le locataire de ses obligations." },
    { type: "paragraph", text: "Le congé est notifié par exploit de commissaire de justice, par lettre recommandée avec accusé de réception ou par lettre remise en main propre contre décharge." },
    { type: "heading", text: "Article 8 — Obligations des parties" },
    { type: "paragraph", text: "Le bailleur s'engage à délivrer un logement en bon état d'habitation, à assurer au locataire la jouissance paisible des lieux et à effectuer les grosses réparations." },
    { type: "paragraph", text: "Le locataire s'engage à payer le loyer et les charges aux échéances convenues, à user paisiblement des lieux suivant leur destination d'habitation, à les entretenir et à effectuer les menues réparations locatives, à ne pas transformer les lieux sans l'accord écrit du bailleur, et à ne pas sous-louer ni céder le bail sans cet accord." },
    { type: "heading", text: "Article 9 — Défaut de paiement" },
    { type: "paragraph", text: "À défaut de paiement d'un seul terme de loyer à son échéance, et après une mise en demeure restée sans effet, le bailleur pourra saisir la juridiction compétente pour obtenir la résiliation du bail, le paiement des sommes dues et, le cas échéant, l'expulsion du locataire." },
    { type: "heading", text: "Article 10 — Enregistrement et litiges" },
    { type: "paragraph", text: "Le présent contrat est soumis à la formalité de l'enregistrement auprès de l'administration fiscale, conformément au Code général des impôts. Les parties s'efforceront de régler à l'amiable tout différend né de son exécution. À défaut, le litige sera porté devant le tribunal de première instance ou la section de tribunal du lieu de situation du logement." },
    { type: "paragraph", text: "Fait à {{lieu}}, le {{date_acte|date}}, en trois exemplaires originaux, dont un pour l'enregistrement." },
    { type: "signature", text: "Le bailleur (« lu et approuvé », signature)|Le locataire (« lu et approuvé », signature)" },
  ],
  instructions: [
    "Imprimez le bail en trois exemplaires : un pour le bailleur, un pour le locataire, un pour l'enregistrement.",
    "Chaque partie paraphe chaque page, écrit « lu et approuvé » à la main et signe à la fin.",
    "Faites enregistrer le bail au centre des impôts (DGI) dont dépend le logement : c'est une obligation légale.",
    "Établissez l'état des lieux d'entrée le jour de la remise des clés, en présence des deux parties. Prenez des photos datées.",
    "Le bailleur remet un reçu pour l'avance et la caution versées à la signature.",
  ],
  checks: (d) => {
    const w: Warning[] = [];
    const avance = parseMontant(d.avance_mois);
    const caution = parseMontant(d.caution_mois);
    const loyer = parseMontant(d.loyer);
    if (avance > 2) {
      w.push({ level: "bloquant", message: `Une avance de ${avance} mois de loyer est illégale : la loi limite l'avance à 2 mois. Le bailleur s'expose à une amende (200 000 FCFA selon le service public ivoirien).` });
    }
    if (caution > 2) {
      w.push({ level: "bloquant", message: `Une caution de ${caution} mois de loyer est illégale : elle est limitée à 2 mois.` });
    }
    if (Number.isFinite(loyer) && Number.isFinite(avance) && Number.isFinite(caution) && avance + caution > 0) {
      w.push({ level: "info", message: `À verser à la signature : ${formatMontant(loyer * (avance + caution))} (${avance} mois d'avance + ${caution} mois de caution).` });
    }
    if (d.meuble === true) {
      w.push({ level: "info", message: "Logement meublé : pensez à rédiger l'inventaire du mobilier et à l'annexer au bail." });
    }
    return w;
  },
};
