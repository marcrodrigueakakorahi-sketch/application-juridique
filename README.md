# application-juridique — ActeFacile

Application qui collecte et propose des actes juridiques aux particuliers. Plateforme qui aide les particuliers à trouver et rédiger leurs actes juridiques, **en droit ivoirien et OHADA**.

## Fonctionnalités (V1)

- **Catalogue** de 26 actes en 7 thèmes : 3 disponibles (bail à usage d'habitation, reconnaissance de dette, mise en demeure), 18 à venir, 5 réservés à un notaire ou un avocat, avec orientation vers ces professionnels.
- **Recherche en langage courant** (« mon bailleur ne rend pas ma caution ») et **assistant d'orientation** par questions.
- **Adapté à la Côte d'Ivoire** : montants en francs CFA (chiffres et lettres, sans centimes), « 150.000 » accepté, téléphones à 10 chiffres, pièces d'identité, adresses par commune/quartier/lot/îlot, paiement Mobile Money.
- **Formulaire pas à pas** : validation en temps réel, champs conditionnels, aide contextuelle.
- **Aperçu du document en direct**, avec les champs manquants surlignés.
- **Contrôles juridiques automatiques** : avance ou caution supérieure à 2 mois de loyer (bloquant), montant total à verser à la signature, taux d'intérêt au-delà du taux de l'usure UEMOA, échéancier incohérent, délai de restitution de la caution, etc.
- **Export PDF et Word**, avec la notice « Et maintenant ? ».
- **Brouillons enregistrés automatiquement** dans le navigateur, et page « Mes documents ».

## Sources juridiques utilisées

| Acte | Textes |
|---|---|
| Bail à usage d'habitation | Loi n° 2019-576 du 26 juin 2019 (Code de la construction et de l'habitat) : bail écrit et enregistré, avance ≤ 2 mois, caution ≤ 2 mois rendue sous 1 mois, révision du loyer tous les 3 ans, préavis de 3 mois |
| Reconnaissance de dette | Code civil, art. 1326 (« bon pour » manuscrit) et 1907 ; décision n° 19 du 29/12/2025 du Conseil des ministres de l'UMOA (usure : 14 % pour les banques) ; AUPSRVE OHADA (injonction de payer) |
| Mise en demeure | Code civil, art. 1139, 1146, 1153 ; AUPSRVE OHADA |

> Le texte intégral de la loi n° 2019-576 n'a pas pu être consulté directement : les règles ont été recoupées à partir du portail servicepublic.gouv.ci, du ministère de la Construction et de commentaires juridiques. **Les numéros d'articles et les modèles doivent être vérifiés par un avocat inscrit au Barreau de Côte d'Ivoire avant la mise en production.**

## Lancer le projet

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # tests du moteur
npm run build      # build de production
```

## Architecture

```
src/
  lib/
    types.ts          Modèle de données d'un acte (étapes, champs, blocs, conditions)
    moteur.ts         Rendu des modèles ({{champ|filtre}}), conditions, validation
    nombres.ts        Montants en toutes lettres
    catalogue.ts      Catalogue, catégories, recherche
    orientation.ts    Arbre de décision de l'assistant
    export.ts         Génération PDF (jsPDF) et DOCX (docx)
    stockage.ts       Brouillons (localStorage, à remplacer par la base de données)
    actes/            Un fichier par acte : formulaire + modèle + contrôles
  components/         Wizard, aperçu, cartes, recherche
  app/                Pages (Next.js App Router)
tests/
```

### Ajouter un acte

1. Créer `src/lib/actes/mon-acte.ts` sur le modèle des actes existants (`steps`, `document`, `instructions`, `checks`).
2. L'ajouter à `ACTES_DISPONIBLES` dans `catalogue.ts`, et retirer son entrée de la liste `AVENIR`.
3. Lancer `npm test` : un test vérifie que chaque `{{champ}}` du modèle existe bien dans le formulaire.

Filtres disponibles dans les modèles : `montant`, `lettres`, `date`, `option`.

## Feuille de route

- **Phase 2** : comptes (connexion par numéro de téléphone + OTP), base PostgreSQL + Prisma, paiement Mobile Money (CinetPay, PayDunya ou Wave), back-office d'édition des modèles, déclaration ARTCI (loi n° 2013-450).
- **Phase 3** : orientation par l'IA (API Claude), explication des clauses en langage clair, signature électronique (loi n° 2013-546 sur les transactions électroniques), partage par WhatsApp.
- **Phase 4** : les 18 actes restants, mise en relation avec des avocats partenaires.

> ⚠️ Les modèles doivent être relus par un avocat ivoirien avant toute mise en production.
