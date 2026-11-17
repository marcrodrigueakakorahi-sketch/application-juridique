export const metadata = { title: "Mentions légales et CGU — ActeFacile" };

export default function MentionsLegales() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-slate-700">
      <h1 className="text-3xl font-bold text-marine-900">Mentions légales et conditions d&apos;utilisation</h1>
      <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
        Page à compléter avec l&apos;éditeur, l&apos;hébergeur, le numéro RCCM, le compte contribuable et le directeur de publication, puis à faire valider par un avocat inscrit au Barreau de Côte d&apos;Ivoire avant la mise en ligne.
      </p>
      <section>
        <h2 className="text-xl font-semibold text-marine-900">Nature du service</h2>
        <p className="mt-2">
          ActeFacile est un outil d&apos;aide à la rédaction qui met à la disposition des utilisateurs des modèles d&apos;actes.
          Le document est généré automatiquement à partir des seules réponses saisies par l&apos;utilisateur, qui reste rédacteur et responsable de son contenu.
          ActeFacile ne délivre pas de consultation juridique et ne se substitue pas à un avocat, un notaire ou un commissaire de justice.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-marine-900">Données personnelles</h2>
        <p className="mt-2">
          Dans la version actuelle, les informations saisies sont enregistrées uniquement dans le navigateur de l&apos;utilisateur et ne sont transmises à aucun serveur.
          L&apos;utilisateur peut les supprimer à tout moment depuis la page « Mes documents ». Lorsque des comptes en ligne seront proposés, le traitement des données sera déclaré auprès de l&apos;ARTCI, conformément à la loi n° 2013-450 relative à la protection des données à caractère personnel.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-marine-900">Actes réservés aux professionnels</h2>
        <p className="mt-2">
          Certains actes (vente de terrain ou de maison, donation immobilière, contrat de mariage, divorce…) relèvent obligatoirement d&apos;un notaire ou d&apos;un avocat.
          ActeFacile ne les génère pas et oriente l&apos;utilisateur vers ces professionnels.
        </p>
      </section>
    </div>
  );
}
