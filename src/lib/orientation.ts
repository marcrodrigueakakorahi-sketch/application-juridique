// Arbre de décision de l'assistant d'orientation.

export interface Choice {
  label: string;
  next?: string; // id de la question suivante
  result?: { acts: string[]; reason: string };
}

export interface Question {
  id: string;
  text: string;
  choices: Choice[];
}

export const QUESTIONS: Record<string, Question> = {
  start: {
    id: "start",
    text: "Votre besoin concerne principalement…",
    choices: [
      { label: "Un logement ou un local", next: "logement" },
      { label: "De l'argent (prêt, dette, don)", next: "argent" },
      { label: "Un problème avec quelqu'un", next: "litige" },
      { label: "Ma famille ou mon couple", next: "famille" },
      { label: "Un employé ou un prestataire", next: "travail" },
      { label: "Un terrain, une succession", next: "patrimoine" },
    ],
  },
  logement: {
    id: "logement",
    text: "Vous êtes…",
    choices: [
      { label: "Propriétaire et je veux louer un logement", result: { acts: ["bail-habitation", "etat-des-lieux"], reason: "Le bail d'habitation doit être écrit et enregistré. Avance et caution sont limitées à 2 mois chacune. Pensez à l'état des lieux d'entrée." } },
      { label: "Propriétaire et je veux louer un local commercial", result: { acts: ["bail-commercial"], reason: "Un local professionnel relève du bail à usage professionnel de l'OHADA, avec des règles différentes du bail d'habitation." } },
      { label: "Locataire et je veux partir", result: { acts: ["conge-locataire"], reason: "Le locataire donne congé par écrit, avec un préavis de trois mois." } },
      { label: "Ancien locataire, ma caution n'est pas rendue", result: { acts: ["mise-en-demeure"], reason: "Le bailleur doit rendre la caution dans le mois qui suit la remise des clés. La mise en demeure est la première étape pour la récupérer." } },
      { label: "Je veux acheter ou vendre un terrain ou une maison", result: { acts: ["vente-immobiliere"], reason: "Une vente immobilière passe obligatoirement par un notaire, qui vérifie aussi la situation foncière du terrain." } },
    ],
  },
  argent: {
    id: "argent",
    text: "Quelle est la situation ?",
    choices: [
      { label: "J'ai prêté ou je vais prêter de l'argent", result: { acts: ["reconnaissance-de-dette", "pret-particuliers"], reason: "La reconnaissance de dette, avec la somme écrite à la main par l'emprunteur, est la preuve la plus simple. Elle permet ensuite une injonction de payer si besoin." } },
      { label: "Quelqu'un me doit de l'argent et ne paie pas", result: { acts: ["mise-en-demeure"], reason: "La mise en demeure officialise votre demande et prépare la procédure d'injonction de payer OHADA." } },
      { label: "Je veux donner de l'argent à un proche", result: { acts: ["don-argent"], reason: "Un acte écrit évite les contestations, notamment lors d'une future succession." } },
      { label: "Je vends un véhicule ou un objet", result: { acts: ["vente-vehicule", "vente-objet"], reason: "Un contrat écrit protège l'acheteur comme le vendeur, en plus de la mutation de la carte grise pour un véhicule." } },
    ],
  },
  litige: {
    id: "litige",
    text: "Que voulez-vous faire ?",
    choices: [
      { label: "Exiger un paiement, une livraison ou une réparation", result: { acts: ["mise-en-demeure"], reason: "La mise en demeure est l'étape préalable indispensable avant toute action en justice." } },
      { label: "Mettre fin à un contrat ou un abonnement", result: { acts: ["resiliation"], reason: "Une lettre de résiliation, en respectant le préavis prévu par le contrat." } },
    ],
  },
  famille: {
    id: "famille",
    text: "Votre projet :",
    choices: [
      { label: "Se marier avec un régime sur mesure", result: { acts: ["contrat-mariage"], reason: "Communauté ou séparation de biens se choisissent devant l'officier d'état civil. Un régime sur mesure exige un contrat de mariage chez le notaire." } },
      { label: "Divorcer", result: { acts: ["divorce"], reason: "Le divorce est prononcé par le juge. Faites-vous assister par un avocat." } },
      { label: "Organiser la garde des enfants après une séparation", result: { acts: ["convention-parentale"], reason: "Un accord écrit entre parents peut ensuite être homologué par le juge." } },
    ],
  },
  travail: {
    id: "travail",
    text: "De qui s'agit-il ?",
    choices: [
      { label: "Une nounou, un gardien, un chauffeur, une aide ménagère", result: { acts: ["employe-maison"], reason: "Un employé de maison est un salarié : le contrat de travail fixe son salaire, ses horaires et ses congés." } },
      { label: "Un artisan, un maçon, un prestataire", result: { acts: ["prestation-services"], reason: "Un contrat de prestation précise les travaux, le prix, les délais et les paiements par étape." } },
      { label: "Quelqu'un qui doit faire une démarche à ma place", result: { acts: ["procuration"], reason: "Une procuration, à faire légaliser en mairie ou à la sous-préfecture." } },
    ],
  },
  patrimoine: {
    id: "patrimoine",
    text: "Vous souhaitez…",
    choices: [
      { label: "Rédiger mon testament moi-même", result: { acts: ["testament-olographe"], reason: "Le testament olographe doit être entièrement écrit à la main, daté et signé." } },
      { label: "Donner un terrain ou une maison de mon vivant", result: { acts: ["donation-immobiliere", "statuts-sci"], reason: "La donation d'un bien immobilier passe par un notaire. Une SCI peut faciliter la gestion en famille." } },
      { label: "Acheter un terrain", result: { acts: ["vente-immobiliere"], reason: "Avant de payer, faites vérifier par un notaire la situation foncière du terrain (ACD, titre foncier)." } },
    ],
  },
};
