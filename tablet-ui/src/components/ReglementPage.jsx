import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Styles.css';      // ← laat staan als Styles.css al wordt geïmporteerd in App

export default function ReglementPage() {
  const navigate = useNavigate();

  /*  volledige, letterlijke inhoud  --------------------------------------- */
  const txt = `
RÈGLEMENT INTÉRIEUR

PRÉAMBULE :
Il est indispensable de maîtriser les techniques de sécurité et de respecter les règles de fonctionnement de la salle pour une pratique de l'escalade dans les meilleures conditions de sécurité.


ARTICLE 1 : OBJET

Le présent règlement a pour objet de définir les conditions d'accès et d'utilisation de la salle et notamment des équipements d'escalade.
Toute personne entrant dans cette enceinte sportive accepte de se conformer à ce règlement intérieur.

Article 2 : Formalités d'accès
  
Toute personne souhaitant utiliser les structures d'escalade doit, impérativement, se rendre au préalable à l'accueil.  
La présentation d'un titre en cours de validité ou le règlement d'un droit d'entrée est obligatoire avant l'accès aux installations.  

Lors d'une première visite, il est obligatoire de remplir la « Fiche » sur la tablette ; l'utilisateur indiquera notamment son degré d'autonomie et son niveau de maîtrise des règles de sécurité en escalade.  

Les licenciés FFME doivent présenter leur licence fédérale en cours de validité pour bénéficier des remises tarifaires qui leur sont octroyées ainsi que, le cas échéant, leur Passeport FFME Escalade pour prouver leur degré d'autonomie.  

Article 3 : Autonomie

Un grimpeur se déclarant « autonome de niveau 1 » sur la fiche de première visite s'engage à satisfaire aux obligations suivantes :
• savoir mettre correctement son baudrier  
• savoir s'encorder en utilisant un nœud de huit tressé avec un nœud d'arrêt  
• savoir utiliser un système d'assurage pour assurer en moulinette  
• savoir parer une chute  

Un grimpeur se déclarant « autonome de niveau 2 » sur la fiche de première visite s'engage à satisfaire aux obligations suivantes :
• savoir mettre correctement son baudrier  
• savoir s'encorder en utilisant un nœud de huit tressé avec un nœud d'arrêt  
• savoir utiliser un système d'assurage pour assurer en moulinette **et** en tête  
• savoir grimper en tête  
• savoir parer une chute  


ARTICLE 4 : PASSEPORTS FFME ESCALADE

Le Passeport FFME Escalade blanc atteste de l'autonomie de niveau 1 définie à l'article 3. Le Passeport FFME Escalade jaune atteste de l'autonomie de niveau 2 définie à l'article 3.
Les moniteurs de la salle sont habilités à délivrer les Passeports FFME Escalade.
La formation nécessaire à l'obtention du Passeport Escalade Blanc et Jaune est dispensée lors des cours payants.

Article 5 : Accès aux équipements de la salle BEM

L'autorisation d'accès aux différentes structures dépend de l'âge du pratiquant.
  
La possibilité de grimper en tête ou en moulinette sur la SAE à cordes dépend du degré d'autonomie déclaré.  
Les principales règles d'accès sont synthétisées dans le tableau ci-dessous :

╔══════════════════════╦═════════════════════════════════════════════════════════════════════════════════════════════════════════════╦══════════════════════════════════════════════════════════╦══════════════════════════════════════════════════════════╗
║ ÂGE                 ║ CONDITIONS GÉNÉRALES D'ACCÈS                                                                                 ║ AUTONOMIE / PASSEPORT                                    ║ ACCÈS AUX STRUCTURES                                     ║
╠══════════════════════╬═════════════════════════════════════════════════════════════════════════════════════════════════════════════╬══════════════════════════════════════════════════════════╬══════════════════════════════════════════════════════════╣
║ Moins de 14 ans      ║ Uniquement sous la responsabilité d'un adulte. Doit présenter l'autorisation parentale.                     ║                                                          ║ Même structures et même pratique (moulinette, en tête)   ║
║                      ║                                                                                                             ║                                                          ║ que l'adulte responsable.                                ║
╠──────────────────────╫─────────────────────────────────────────────────────────────────────────────────────────────────────────────╫──────────────────────────────────────────────────────────╫──────────────────────────────────────────────────────────╣
║ 14 – 18 ans          ║ Autorisation parentale dans laquelle le responsable légal certifie le niveau d'autonomie ou le Passeport.   ║ Non autonome                                             ║ Blocs uniquement                                         ║
║                      ║                                                                                                             ║ Passeport FFME blanc / autonome niveau 1                 ║ Blocs + Cordes en moulinette                              ║
║                      ║                                                                                                             ║ Passeport FFME jaune / autonome niveau 2                 ║ Toutes structures + escalade en tête                      ║
╠──────────────────────╫─────────────────────────────────────────────────────────────────────────────────────────────────────────────╫──────────────────────────────────────────────────────────╫──────────────────────────────────────────────────────────╣
║ 18 ans et plus       ║                                                                                                             ║ Se déclare non autonome                                  ║ Blocs uniquement                                         ║
║                      ║                                                                                                             ║ Passeport FFME blanc / autonome niveau 1                 ║ Blocs + Cordes en moulinette                              ║
║                      ║                                                                                                             ║ Passeport FFME jaune / autonome niveau 2                 ║ Toutes structures + escalade en tête                      ║
╚══════════════════════╩═════════════════════════════════════════════════════════════════════════════════════════════════════════════╩══════════════════════════════════════════════════════════╩══════════════════════════════════════════════════════════╝

En outre, quel que soit son âge, toute personne accompagnée et sous la responsabilité d'un grimpeur majeur qui s'engage à en être responsable a accès aux mêmes structures et aux mêmes pratiques (moulinette ou en tête) que le responsable.

ARTICLE 6 : ACCÈS  

Les adhérents sont soumis aux règles d'accès du présent règlement.

Un responsable du club est obligatoirement présent.

Les mineurs sont obligatoirement encadrés lors de leur présence dans la salle.  
Le responsable de séance fournit à l'avance la liste des personnes placées sous sa responsabilité.  

Article 7 : Utilisation par des groupes

Tous les organismes (associations, sociétés, scolaires, établissements, etc.) seront autorisés à utiliser les installations sportives de l'Usine après avoir :
■ Réservé auprès de la direction un ou plusieurs créneaux
■ Établi un contrat précisant à minima les conditions d'accès, les tarifs, les conditions d'encadrement.

Ces dernières doivent justifier d'une assurance en responsabilité civile couvrant la personne morale, ses membres et ses préposés.  

Article 8 : Effectif maximum dans la salle d'escalade

Les responsables de la salle « l'Usine » sont dans l'obligation d'interdire l'accès lorsque le nombre d'utilisateurs atteint la jauge ERP : 80 personnes (salle BEM – 5ᵉ cat.).  

ARTICLE 9 : LOCATION DE MATÉRIEL  

La salle BEM prête le matériel de base nécessaire à l'escalade : chaussons, baudrier, système d'assurage. Le dépôt d'une pièce d'identité est demandé.

Article 10 : Obligations des utilisateurs

10.1 – PROPRETÉ  
■ Utiliser des chaussons d'escalade dans la salle d'escalade (les chaussures de ville sont interdites dans la salle)
■ Ne pas utiliser de chaussons d'escalade en dehors de la salle d'escalade (vestiaires, couloir, accueil)
■ Laisser les sanitaires dans l'état de propreté trouvé.
■ Signaler tout problème de propreté au bénévole de la salle.

10.2 – Utilisation des vestiaires
■ Utiliser impérativement les vestiaires pour changer de tenue.
■ Utiliser les casiers de dépôts d'affaires mis à disposition dans l'espace de grimpe.
■ Libérer en fin de séance tout Le personnel de BEM se réserve le droit d'enlever, pour des raisons de sécurité et d'hygiène, tout casier non libéré.
Le personnel de BEM ne peut être tenu responsable pour d'éventuels vols dans l'ensemble du bâtiment.

10.3 – Respect des lieux et d'autrui
Dans l'enceinte du bâtiment, il est interdit :
■ De fumer
■ De consommer de l'alcool et ou des stupéfiants
■ De jeter des détritus,
■ De venir avec des animaux même tenus en laisse
■ D'utiliser des rollers, skate, vélos, deux roues et tout engin motorisé
■ De jouer avec de l'eau ou de la nourriture
■ De crier, de hurler et de causer une gêne sonore pour les autres usagers
■ De se déplacer ou de grimper dans une tenue indécente

Article 11 : Respects des règles de sécurité

Tous les grimpeurs engagent leur responsabilité en cas d'accident causé à un tiers.  

Au pied de toutes les structures d'escalade, des panneaux sécurité sont disposés afin de rappeler les points clés. Les écrans d'information diffusent également des conseils, tous les utilisateurs sont invités à en prendre régulièrement connaissance.

Le bénévole se tient à la disposition des utilisateurs pour tout conseil.  
Il peut intervenir auprès des usagers en cas de comportement inadapté ou dangereux.  

Le non-respect des conseils et consignes entrainera l'exclusion immédiate de la salle. Les utilisateurs doivent :
■ Signaler au responsable tout incident, tout comportement, toute anomalie, toute présence
Anormale pouvant représenter un danger ou une menace.
■ Respecter les consignes de sécurité qui sont rappelées ci-dessous :

11.1- Sécurité bloc
■ S'échauffer
■ Vérifier que la surface de réception est totalement dégagée
■ Priorité au grimpeur :
■ Ne pas circuler, ne pas stationner au-dessous d'autrui
■ Ne pas grimper au-dessus ou au-dessous d'autrui.
■ Privilégier la désescalade, repérer un itinéraire de descente
■ En cas de chute ou de saut, amortir avec les jambes
■ Se faire parer si besoin

11.2- Sécurité difficulté
■ En escalade en tête,
■ Mousquetonner toutes les dégaines (dans le bon sens)
■ Parer le grimpeur avant l'utilisation du premier point d'assurage
■ Vérifier les points clés :
1. Nœud d'encordement : double nœud de huit et nœud d'arrêt
2. Installation correcte du système d'assurage
3. Nœud en bout de corde
■ En moulinette
■ Replacer la corde dans les dégaines à la descente
■ Maîtriser la vitesse de descente du grimpeur au
■ Ne pas stationner sous les grimpeurs
■ Ne pas grimper en solo (strictement interdit)
■ Maintenir la surface de réception totalement dégagée
■ Ne pas faire de traversées sur la partie basse du mur
■ Rester concentré et anticiper les actions du grimpeur
■ Ne pas assurer assis ou à une distance trop importante du pied de la structure
■ Prévenir le personnel de toute anomalie sur la SAE : prises desserrées, maillons ou mousquetons usés, cordes endommagées…

11.3- Manipulation du matériel d'assurage
■ Les cordes utilisées pour les moulinettes sont installées à demeure et doivent être remise en place dans le
■ L'escalade en moulinette est interdite dans la zone des grands dévers
■ Les sangles des enrouleurs en place sur la SAE à cordes doivent systématiquement être attachées à l'aide des mousquetons au pied des voies dans les points prévus à cet
■ L'utilisation des cordes non mises à disposition par la salle l'Usine est interdite pour l'escalade en tête et en
■ Afin de préserver les cordes, il est interdit :
■ D'assurer au demi-cabestan
■ D'effectuer des chutes volontaires et répétées de manière
■ D'effectuer des remontées sur cordes (en dehors des sessions d'instruction militaire, de formation et d'ouvertures de voies)
■ La mise en place de « via cordata » est interdite

Article 12 : Assurances

La FFME est assurée pour les dommages engageant sa responsabilité civile et celle de son personnel.
La responsabilité de la FFME ne pourra être engagée en cas d'accident résultant de l'utilisation inappropriée des installations ou encore du non-respect des règles de sécurité en escalade.
L'utilisateur de la salle doit être assuré personnellement en responsabilité civile.
La salle recommande fortement à tous les utilisateurs de souscrire une assurance individuelle accident auprès de la compagnie de son choix.

Article 13 : Vidéo surveillance

Un système de vidéo surveillance est mis en place pour des raisons de sécurité. Aucun enregistrement n'est réalisé.
Le personnel de BEM est susceptible d'intervenir quand la sécurité des utilisateurs est compromise.

Article 14 : Droit d'exclusion

Le personnel de la salle a se réservent le droit d'exclure, sans préavis ni indemnité d'aucune sorte, toute personne dont l'attitude ou le comportement serait contraire aux règles de sécurité en escalade, aux bonnes mœurs, ou notoirement gênant pour les autres membres, ou non conforme au présent règlement, ainsi que toute personne se livrant à des dégradations intentionnelles ou non intentionnelles des installations ou du matériel de la salle.

Article 15 : Droit à l'image

Toutes les photos et vidéos prises lors de l'utilisation des équipements de la salle, par ses responsables et préposés sont susceptibles d'être affichées ou mises en ligne sur le site internet de BEM sauf si les personnes figurant sur ces supports ou leur responsable légal en font la demande par écrit pour les retirer.

Article 16 : Secours

Une trousse de premier secours est située dans le sas vers le local a prises.
Tous les utilisateurs acceptent que le personnel de BEM prenne toute mesure utile en cas d'accident.

Article 17 : Divers

17.1- Initiation et enseignement
Il est fortement déconseillé d'initier des débutants si vous n'êtes pas un professionnel de l'enseignement de l'escalade.
Seuls les salariés de BEM peuvent enseigner l'escalade contre rémunération dans la salle à l'exception des personnes encadrant les groupes mentionnés à l'article 7.

17.2- Fermeture de la salle et modification des horaires
Les horaires d'ouverture de la salle sont indiqués à l'accueil et sur le site Web https://beyrede-escalade-montagne.pepsup.com/
Le personnel de la salle se réserve le droit de modifier les horaires et/ou d'immobiliser tout ou partie des structures d'escalade pour des besoins particuliers d'exploitation (ouvertures, travaux, manifestations, etc.).
En cas de fermeture exceptionnelle, la salle informera les utilisateurs préalablement par les moyens dont elle dispose : affichage, note sur le site internet, etc.
Sauf mention contraire, les utilisateurs acceptent de recevoir des informations par mail de la part de la salle.

17.3- Modification
Les responsables de la salle l'Usine Escalade se réservent le droit de modifier le présent Règlement Intérieur sans préavis.
Fait à Beyrède, le 30 juillet 2025
Beyrède Escalade Montagne : BEM
  
  `;

  /*  --------------------------------------------------------------------- */

  return (
    <div className="reglement-page">
      <header className="reglement-header">
        <h1>Règlement intérieur</h1>
        <button
          className="btn-close"
          onClick={() => navigate(-1)}
          title="Fermer"
        >
          ✕
        </button>
      </header>

      {/* scrollbar voor lange tekst */}
      <pre className="reglement-body">{txt}</pre>

      <footer className="reglement-footer">
        <button className="btn-retour-accueil" onClick={() => navigate(-1)}>
          Revenir
        </button>
      </footer>
    </div>
  );
}
