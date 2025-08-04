import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Styles.css';

export default function ReglementPage() {
  const navigate = useNavigate();

  return (
    <div className="reglement-page">
      <div className="reglement-header">
        <h1>Règlement intérieur</h1>
        <button
          className="btn-close"
          onClick={() => navigate(-1)}
          title="Fermer"
        >
          ✕
        </button>
      </div>

      <div className="reglement-body-responsive">
        <div className="reglement-section">
          <h2>PRÉAMBULE</h2>
          <p>
            Il est indispensable de maîtriser les techniques de sécurité et de respecter les règles 
            de fonctionnement de la salle pour une pratique de l'escalade dans les meilleures 
            conditions de sécurité.
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 1 : Objet</h2>
          <p>
            Le présent règlement a pour objet de définir les conditions d'accès et d'utilisation 
            de la salle et notamment des équipements d'escalade.
          </p>
          <p>
            Toute personne entrant dans cette enceinte sportive accepte de se conformer à ce 
            règlement intérieur.
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 2 : Formalités d'accès</h2>
          <p>
            Toute personne souhaitant utiliser les structures d'escalade doit, impérativement, 
            se rendre au préalable à l'accueil. La présentation d'un titre en cours de validité 
            ou le règlement d'un droit d'entrée est obligatoire avant l'accès aux installations.
          </p>
          <p>
            Lors d'une première visite, il est obligatoire de remplir la « Fiche » sur la tablette ; 
            l'utilisateur indiquera notamment son degré d'autonomie et son niveau de maîtrise des 
            règles de sécurité en escalade.
          </p>
          <p>
            Les licenciés FFME doivent présenter leur licence fédérale en cours de validité pour 
            bénéficier des remises tarifaires qui leur sont octroyées ainsi que, le cas échéant, 
            leur Passeport FFME Escalade pour prouver leur degré d'autonomie.
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 3 : Autonomie</h2>
          <div className="autonomie-niveau">
            <h3>Un grimpeur se déclarant « autonome de niveau 1 » s'engage à satisfaire aux obligations suivantes :</h3>
            <ul>
              <li>savoir mettre correctement son baudrier</li>
              <li>savoir s'encorder en utilisant un nœud de huit tressé avec un nœud d'arrêt</li>
              <li>savoir utiliser un système d'assurage pour assurer en moulinette</li>
              <li>savoir parer une chute</li>
            </ul>
          </div>
          
          <div className="autonomie-niveau">
            <h3>Un grimpeur se déclarant « autonome de niveau 2 » s'engage à satisfaire aux obligations suivantes :</h3>
            <ul>
              <li>savoir mettre correctement son baudrier</li>
              <li>savoir s'encorder en utilisant un nœud de huit tressé avec un nœud d'arrêt</li>
              <li>savoir utiliser un système d'assurage pour assurer en moulinette <strong>et</strong> en tête</li>
              <li>savoir grimper en tête</li>
              <li>savoir parer une chute</li>
            </ul>
          </div>
        </div>

        <div className="reglement-section">
          <h2>Article 4 : Passeports FFME escalade</h2>
          <p>
            Le Passeport FFME Escalade blanc atteste de l'autonomie de niveau 1 définie à l'article 3. 
            Le Passeport FFME Escalade jaune atteste de l'autonomie de niveau 2 définie à l'article 3.
          </p>
          <p>
            Les moniteurs de la salle sont habilités à délivrer les Passeports FFME Escalade.
            La formation nécessaire à l'obtention du Passeport Escalade Blanc et Jaune est dispensée lors des cours payants.
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 5 : Accès aux équipements de la salle BEM</h2>
          <p>
            L'autorisation d'accès aux différentes structures dépend de l'âge du pratiquant.
            La possibilité de grimper en tête ou en moulinette sur la SAE à cordes dépend du degré d'autonomie déclaré.
          </p>
          <p>Les principales règles d'accès sont synthétisées dans le tableau ci-dessous :</p>
          
          <div className="access-table">
            <div className="table-section">
              <h4>Moins de 14 ans</h4>
              <div className="table-content">
                <p><strong>Conditions générales :</strong> Uniquement sous la responsabilité d'un adulte. Doit présenter l'autorisation parentale.</p>
                <p><strong>Accès aux structures :</strong> Même structures et même pratique (moulinette, en tête) que l'adulte responsable.</p>
              </div>
            </div>
            
            <div className="table-section">
              <h4>De 14 ans à 18 ans</h4>
              <div className="table-content">
                <p><strong>Conditions générales :</strong> Doit présenter l'autorisation parentale dans laquelle le responsable légal certifie le niveau d'autonomie de l'enfant ou la possession d'un Passeport FFME.</p>
                <div className="autonomy-options">
                  <div className="autonomy-option">
                    <span className="autonomy-level">Non autonome</span>
                    <span className="access-rights">→ Structure Blocs uniquement</span>
                  </div>
                  <div className="autonomy-option">
                    <span className="autonomy-level">Passeport FFME Escalade blanc ou autonome niveau 1</span>
                    <span className="access-rights">→ Structures Blocs et Cordes en moulinette</span>
                  </div>
                  <div className="autonomy-option">
                    <span className="autonomy-level">Passeport FFME Escalade jaune ou autonome niveau 2</span>
                    <span className="access-rights">→ Toutes structures et escalade en tête sur le mur à cordes autorisée</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="table-section">
              <h4>18 ans et plus</h4>
              <div className="table-content">
                <div className="autonomy-options">
                  <div className="autonomy-option">
                    <span className="autonomy-level">Se déclare non autonome</span>
                    <span className="access-rights">→ Structures Blocs uniquement</span>
                  </div>
                  <div className="autonomy-option">
                    <span className="autonomy-level">Passeport FFME Escalade blanc ou se déclare autonome de niveau 1</span>
                    <span className="access-rights">→ Structures Blocs et Cordes en moulinette</span>
                  </div>
                  <div className="autonomy-option">
                    <span className="autonomy-level">Passeport FFME Escalade jaune ou se déclare autonome de niveau 2</span>
                    <span className="access-rights">→ Toutes structures et escalade en tête sur le mur à cordes autorisée</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <p>
            En outre, quel que soit son âge, toute personne accompagnée et sous la responsabilité d'un grimpeur majeur 
            qui s'engage à en être responsable a accès aux mêmes structures et aux mêmes pratiques (moulinette ou en tête) 
            que le responsable.
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 6 : Accès</h2>
          <p>Les adhérents sont soumis aux règles d'accès du présent règlement.</p>
          <p>Un responsable du club est obligatoirement présent.</p>
          <p>
            Les mineurs sont obligatoirement encadrés lors de leur présence dans la salle. 
            Le responsable de séance fournit à l'avance la liste des personnes placées sous sa responsabilité.
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 7 : Utilisation par des groupes</h2>
          <p>
            Tous les organismes (associations, sociétés, scolaires, établissements, etc.) seront autorisés à utiliser 
            les installations sportives de l'Usine après avoir :
          </p>
          <ul>
            <li>Réservé auprès de la direction un ou plusieurs créneaux</li>
            <li>Établi un contrat précisant à minima les conditions d'accès, les tarifs, les conditions d'encadrement.</li>
          </ul>
          <p>
            Ces dernières doivent justifier d'une assurance en responsabilité civile couvrant la personne morale, 
            ses membres et ses préposés.
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 8 : Effectif maximum dans la salle d'escalade</h2>
          <p>
            Les responsables de la salle « l'Usine » sont dans l'obligation d'interdire l'accès lorsque le nombre 
            d'utilisateurs atteint la jauge ERP : 80 personnes (salle BEM – 5ᵉ cat.).
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 9 : Location de matériel</h2>
          <p>
            La salle BEM prête le matériel de base nécessaire à l'escalade : chaussons, baudrier, système d'assurage. 
            Le dépôt d'une pièce d'identité est demandé.
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 10 : Obligations des utilisateurs</h2>
          
          <div className="sub-section">
            <h3>10.1 – Propreté</h3>
            <ul>
              <li>Utiliser des chaussons d'escalade dans la salle d'escalade (les chaussures de ville sont interdites dans la salle)</li>
              <li>Ne pas utiliser de chaussons d'escalade en dehors de la salle d'escalade (vestiaires, couloir, accueil)</li>
              <li>Laisser les sanitaires dans l'état de propreté trouvé.</li>
              <li>Signaler tout problème de propreté au bénévole de la salle.</li>
            </ul>
          </div>

          <div className="sub-section">
            <h3>10.2 – Utilisation des vestiaires</h3>
            <ul>
              <li>Utiliser impérativement les vestiaires pour changer de tenue.</li>
              <li>Utiliser les casiers de dépôts d'affaires mis à disposition dans l'espace de grimpe.</li>
              <li>Libérer en fin de séance tout casier utilisé.</li>
            </ul>
            <p>
              Le personnel de BEM se réserve le droit d'enlever, pour des raisons de sécurité et d'hygiène, 
              tout casier non libéré. Le personnel de BEM ne peut être tenu responsable pour d'éventuels vols 
              dans l'ensemble du bâtiment.
            </p>
          </div>

          <div className="sub-section">
            <h3>10.3 – Respect des lieux et d'autrui</h3>
            <p>Dans l'enceinte du bâtiment, il est interdit :</p>
            <ul>
              <li>De fumer</li>
              <li>De consommer de l'alcool et ou des stupéfiants</li>
              <li>De jeter des détritus</li>
              <li>De venir avec des animaux même tenus en laisse</li>
              <li>D'utiliser des rollers, skate, vélos, deux roues et tout engin motorisé</li>
              <li>De jouer avec de l'eau ou de la nourriture</li>
              <li>De crier, de hurler et de causer une gêne sonore pour les autres usagers</li>
              <li>De se déplacer ou de grimper dans une tenue indécente</li>
            </ul>
          </div>
        </div>

        <div className="reglement-section">
          <h2>Article 11 : Respects des règles de sécurité</h2>
          <p>Tous les grimpeurs engagent leur responsabilité en cas d'accident causé à un tiers.</p>
          <p>
            Au pied de toutes les structures d'escalade, des panneaux sécurité sont disposés afin de rappeler les points clés. 
            Les écrans d'information diffusent également des conseils, tous les utilisateurs sont invités à en prendre 
            régulièrement connaissance.
          </p>
          <p>
            Le bénévole se tient à la disposition des utilisateurs pour tout conseil. 
            Il peut intervenir auprès des usagers en cas de comportement inadapté ou dangereux.
          </p>
          <p>
            Le non-respect des conseils et consignes entraînera l'exclusion immédiate de la salle. Les utilisateurs doivent :
          </p>
          <ul>
            <li>Signaler au responsable tout incident, tout comportement, toute anomalie, toute présence anormale pouvant représenter un danger ou une menace.</li>
            <li>Respecter les consignes de sécurité qui sont rappelées ci-dessous :</li>
          </ul>

          <div className="sub-section">
            <h3>11.1- Sécurité bloc</h3>
            <ul>
              <li>S'échauffer</li>
              <li>Vérifier que la surface de réception est totalement dégagée</li>
              <li>Priorité au grimpeur :</li>
              <li>Ne pas circuler, ne pas stationner au-dessous d'autrui</li>
              <li>Ne pas grimper au-dessus ou au-dessous d'autrui.</li>
              <li>Privilégier la désescalade, repérer un itinéraire de descente</li>
              <li>En cas de chute ou de saut, amortir avec les jambes</li>
              <li>Se faire parer si besoin</li>
            </ul>
          </div>

          <div className="sub-section">
            <h3>11.2- Sécurité difficulté</h3>
            <p><strong>En escalade en tête :</strong></p>
            <ul>
              <li>Mousquetonner toutes les dégaines (dans le bon sens)</li>
              <li>Parer le grimpeur avant l'utilisation du premier point d'assurage</li>
            </ul>
            <p><strong>Vérifier les points clés :</strong></p>
            <ol>
              <li>Nœud d'encordement : double nœud de huit et nœud d'arrêt</li>
              <li>Installation correcte du système d'assurage</li>
              <li>Nœud en bout de corde</li>
            </ol>
            <p><strong>En moulinette :</strong></p>
            <ul>
              <li>Replacer la corde dans les dégaines à la descente</li>
              <li>Maîtriser la vitesse de descente du grimpeur</li>
              <li>Ne pas stationner sous les grimpeurs</li>
              <li>Ne pas grimper en solo (strictement interdit)</li>
              <li>Maintenir la surface de réception totalement dégagée</li>
              <li>Ne pas faire de traversées sur la partie basse du mur</li>
              <li>Rester concentré et anticiper les actions du grimpeur</li>
              <li>Ne pas assurer assis ou à une distance trop importante du pied de la structure</li>
              <li>Prévenir le personnel de toute anomalie sur la SAE : prises desserrées, maillons ou mousquetons usés, cordes endommagées…</li>
            </ul>
          </div>

          <div className="sub-section">
            <h3>11.3- Manipulation du matériel d'assurage</h3>
            <ul>
              <li>Les cordes utilisées pour les moulinettes sont installées à demeure et doivent être remises en place</li>
              <li>L'escalade en moulinette est interdite dans la zone des grands dévers</li>
              <li>Les sangles des enrouleurs en place sur la SAE à cordes doivent systématiquement être attachées à l'aide des mousquetons au pied des voies dans les points prévus à cet effet</li>
              <li>L'utilisation des cordes non mises à disposition par la salle l'Usine est interdite pour l'escalade en tête et en moulinette</li>
            </ul>
            <p><strong>Afin de préserver les cordes, il est interdit :</strong></p>
            <ul>
              <li>D'assurer au demi-cabestan</li>
              <li>D'effectuer des chutes volontaires et répétées de manière excessive</li>
              <li>D'effectuer des remontées sur cordes (en dehors des sessions d'instruction militaire, de formation et d'ouvertures de voies)</li>
              <li>La mise en place de « via cordata » est interdite</li>
            </ul>
          </div>
        </div>

        <div className="reglement-section">
          <h2>Article 12 : Assurances</h2>
          <p>
            La FFME est assurée pour les dommages engageant sa responsabilité civile et celle de son personnel.
            La responsabilité de la FFME ne pourra être engagée en cas d'accident résultant de l'utilisation 
            inappropriée des installations ou encore du non-respect des règles de sécurité en escalade.
          </p>
          <p>L'utilisateur de la salle doit être assuré personnellement en responsabilité civile.</p>
          <p>
            La salle recommande fortement à tous les utilisateurs de souscrire une assurance individuelle accident 
            auprès de la compagnie de son choix.
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 13 : Vidéo surveillance</h2>
          <p>
            Un système de vidéo surveillance est mis en place pour des raisons de sécurité. Aucun enregistrement n'est réalisé.
            Le personnel de BEM est susceptible d'intervenir quand la sécurité des utilisateurs est compromise.
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 14 : Droit d'exclusion</h2>
          <p>
            Le personnel de la salle se réserve le droit d'exclure, sans préavis ni indemnité d'aucune sorte, 
            toute personne dont l'attitude ou le comportement serait contraire aux règles de sécurité en escalade, 
            aux bonnes mœurs, ou notoirement gênant pour les autres membres, ou non conforme au présent règlement, 
            ainsi que toute personne se livrant à des dégradations intentionnelles ou non intentionnelles des 
            installations ou du matériel de la salle.
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 15 : Droit à l'image</h2>
          <p>
            Toutes les photos et vidéos prises lors de l'utilisation des équipements de la salle, par ses responsables 
            et préposés sont susceptibles d'être affichées ou mises en ligne sur le site internet de BEM sauf si les 
            personnes figurant sur ces supports ou leur responsable légal en font la demande par écrit pour les retirer.
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 16 : Secours</h2>
          <p>Une trousse de premier secours est située dans le sas vers le local à prises.</p>
          <p>Tous les utilisateurs acceptent que le personnel de BEM prenne toute mesure utile en cas d'accident.</p>
        </div>

        <div className="reglement-section">
          <h2>Article 17 : Divers</h2>
          
          <div className="sub-section">
            <h3>17.1- Initiation et enseignement</h3>
            <p>
              Il est fortement déconseillé d'initier des débutants si vous n'êtes pas un professionnel de l'enseignement 
              de l'escalade. Seuls les salariés de BEM peuvent enseigner l'escalade contre rémunération dans la salle à 
              l'exception des personnes encadrant les groupes mentionnés à l'article 7.
            </p>
          </div>

          <div className="sub-section">
            <h3>17.2- Fermeture de la salle et modification des horaires</h3>
            <p>
              Les horaires d'ouverture de la salle sont indiqués à l'accueil et sur le site Web 
              https://beyrede-escalade-montagne.pepsup.com/
            </p>
            <p>
              Le personnel de la salle se réserve le droit de modifier les horaires et/ou d'immobiliser tout ou partie 
              des structures d'escalade pour des besoins particuliers d'exploitation (ouvertures, travaux, manifestations, etc.).
            </p>
            <p>
              En cas de fermeture exceptionnelle, la salle informera les utilisateurs préalablement par les moyens dont 
              elle dispose : affichage, note sur le site internet, etc.
            </p>
            <p>
              Sauf mention contraire, les utilisateurs acceptent de recevoir des informations par mail de la part de la salle.
            </p>
          </div>

          <div className="sub-section">
            <h3>17.3- Modification</h3>
            <p>
              Les responsables de la salle l'Usine Escalade se réservent le droit de modifier le présent Règlement 
              Intérieur sans préavis.
            </p>
            <p><strong>Fait à Beyrède, le 30 juillet 2025</strong></p>
            <p><strong>Beyrède Escalade Montagne : BEM</strong></p>
          </div>
        </div>
      </div>

      <div className="reglement-footer">
        <button className="btn-retour-accueil" onClick={() => navigate(-1)}>
          Revenir
        </button>
      </div>
    </div>
  );
}
