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
- **Paiement Mobile Money** (Orange Money, MTN MoMo, Moov Money, Wave) via CinetPay : le document n'est généré par le serveur qu'après vérification du paiement.

## Sources juridiques utilisées

| Acte | Textes |
|---|---|
| Bail à usage d'habitation | Loi n° 2019-576 du 26 juin 2019 (Code de la construction et de l'habitat) : bail écrit et enregistré, avance ≤ 2 mois, caution ≤ 2 mois rendue sous 1 mois, révision du loyer tous les 3 ans, préavis de 3 mois |
| Reconnaissance de dette | Code civil, art. 1326 (« bon pour » manuscrit) et 1907 ; décision n° 19 du 29/12/2025 du Conseil des ministres de l'UMOA (usure : 14 % pour les banques) ; AUPSRVE OHADA (injonction de payer) |
| Mise en demeure | Code civil, art. 1139, 1146, 1153 ; AUPSRVE OHADA |

> Le texte intégral de la loi n° 2019-576 n'a pas pu être consulté directement : les règles ont été recoupées à partir du portail servicepublic.gouv.ci, du ministère de la Construction et de commentaires juridiques. **Les numéros d'articles et les modèles doivent être vérifiés par un avocat inscrit au Barreau de Côte d'Ivoire avant la mise en production.**

## Paiement Mobile Money (CinetPay)

### Fonctionnement

1. À l'étape « Vérification », l'utilisateur clique sur **Payer … FCFA par Mobile Money**.
2. Le serveur crée la transaction chez CinetPay avec le **prix du catalogue** (le navigateur ne peut pas le modifier) et redirige vers le guichet CinetPay.
3. Après le paiement, CinetPay ramène l'utilisateur sur `/paiement/retour`. Le serveur **revérifie la transaction auprès de CinetPay** (statut `ACCEPTED`, montant ≥ prix, devise XOF) puis délivre un **reçu signé** (HMAC-SHA256).
4. Le PDF et le Word sont fabriqués **par le serveur** (`/api/document`) uniquement sur présentation d'un reçu valide pour ce document et cet acte. Avant paiement, l'aperçu porte un filigrane et ne peut être ni copié ni imprimé.

Un paiement débloque **un document** : l'utilisateur peut le modifier et le retélécharger. Les actes gratuits (prix 0) se téléchargent sans paiement.

### Activer le vrai paiement

1. Ouvrez un compte marchand sur [cinetpay.com](https://cinetpay.com) et récupérez votre **API Key** et votre **Site ID** (menu Intégrations).
2. Dans Vercel : **Settings → Environment Variables**, ajoutez `CINETPAY_APIKEY`, `CINETPAY_SITE_ID` et `PAIEMENT_SECRET` (voir `.env.example`).
3. Redéployez (**Deployments → … → Redeploy**). Le bouton devient « Payer … FCFA par Mobile Money ».

Sans ces variables, l'application est en **mode démonstration** : le paiement est simulé et aucun argent n'est débité.

Les encaissements se suivent dans le tableau de bord CinetPay. Les notifications reçues sont visibles dans les logs Vercel (`[paiement] notification …`).

### Limites actuelles (sans base de données)

- Le reçu est conservé dans le navigateur de l'utilisateur : s'il change d'appareil ou vide ses données, il devra repayer. Les comptes utilisateurs (phase suivante) régleront ce point.
- L'historique des ventes n'est pas stocké par l'application : il se consulte chez CinetPay.

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
    documents.ts      Génération PDF (jsPDF) et DOCX (docx), côté serveur
    paiement/         CinetPay, reçus signés, configuration
    paiement-client.ts Appels du navigateur (payer, vérifier, télécharger)
    stockage.ts       Brouillons (localStorage, à remplacer par la base de données)
    actes/            Un fichier par acte : formulaire + modèle + contrôles
  components/         Wizard, aperçu, cartes, recherche
  app/                Pages (Next.js App Router)
  app/api/            Routes serveur : paiement/{config,initier,verifier,retour,notification}, document
tests/
```

### Ajouter un acte

1. Créer `src/lib/actes/mon-acte.ts` sur le modèle des actes existants (`steps`, `document`, `instructions`, `checks`).
2. L'ajouter à `ACTES_DISPONIBLES` dans `catalogue.ts`, et retirer son entrée de la liste `AVENIR`.
3. Lancer `npm test` : un test vérifie que chaque `{{champ}}` du modèle existe bien dans le formulaire.

Filtres disponibles dans les modèles : `montant`, `lettres`, `date`, `option`.

## Feuille de route

- **Phase 2** : comptes (connexion par numéro de téléphone + OTP), base PostgreSQL + Prisma, back-office d'édition des modèles, déclaration ARTCI (loi n° 2013-450).
- **Phase 3** : orientation par l'IA (API Claude), explication des clauses en langage clair, signature électronique (loi n° 2013-546 sur les transactions électroniques), partage par WhatsApp.
- **Phase 4** : les 18 actes restants, mise en relation avec des avocats partenaires.

> ⚠️ Les modèles doivent être relus par un avocat ivoirien avant toute mise en production.
