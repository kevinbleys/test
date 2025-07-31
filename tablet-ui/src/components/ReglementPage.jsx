import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReglementPage() {
  const navigate = useNavigate();

  return (
    <div className="reglement-page">
      <div className="reglement-header">
        <h1>Règlement intérieur</h1>
        <button 
          className="btn-retour-close" 
          onClick={() => navigate(-1)}
          title="Fermer"
        >
          ✕
        </button>
      </div>
      
      <div className="reglement-content">
        <div className="reglement-section">
          <h2>Préambule</h2>
          <p>
            Il est indispensable de maîtriser les techniques de sécurité et de respecter les règles 
            de fonctionnement de la salle pour une pratique de l'escalade dans les meilleures 
            conditions de sécurité.
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 1 : Objet</h2>
          <p>
            Toute personne souhaitant utiliser les structures d'escalade doit, impérativement, 
            se rendre au préalable à l'accueil. La présentation d'un titre en cours de validité 
            ou le règlement d'un droit d'entrée est obligatoire avant l'accès aux installations.
          </p>
          <p>
            Lors d'une première visite, il est obligatoire de remplir la « Fiche » sur la tablette, 
            l'utilisateur indiquera notamment son degré d'autonomie et son niveau de maîtrise des 
            règles de sécurité en escalade.
          </p>
          <p>
            Les licenciés FFME doivent présenter leur licence fédérale en cours de validité pour 
            bénéficier des remises tarifaires qui leurs sont octroyées ainsi que, le cas échéant, 
            leur Passeport FFME Escalade pour prouver leur degré d'autonomie.
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 2 : Niveau d'autonomie</h2>
          
          <div className="autonomie-niveau">
            <h3>Autonome niveau 1 :</h3>
            <ul>
              <li>savoir mettre correctement son baudrier</li>
              <li>savoir s'encorder en utilisant un nœud de huit tressé avec un nœud d'arrêt</li>
              <li>savoir utiliser un système d'assurage pour assurer en moulinette</li>
              <li>savoir parer une chute</li>
            </ul>
          </div>

          <div className="autonomie-niveau">
            <h3>Autonome niveau 2 :</h3>
            <ul>
              <li>savoir mettre correctement son baudrier</li>
              <li>savoir s'encorder en utilisant un nœud de huit tressé avec un nœud d'arrêt</li>
              <li>savoir utiliser un système d'assurage pour assurer en moulinette et en tête</li>
              <li>savoir grimper en tête</li>
              <li>savoir parer une chute</li>
            </ul>
          </div>
        </div>

        <div className="reglement-section">
          <h2>Article 4 : Passeports FFME Escalade</h2>
          <p>
            La possibilité de grimper en tête ou en moulinette sur la SAE à cordes dépend du degré 
            d'autonomie déclaré. Les principales règles d'accès sont synthétisées ci-dessous :
          </p>

          <div className="access-conditions">
            <h3>CONDITIONS D'ACCÈS SELON L'ÂGE ET L'AUTONOMIE</h3>
            
            <div className="age-group">
              <h4>Moins de 14 ans :</h4>
              <ul>
                <li>Uniquement sous la responsabilité d'un adulte</li>
                <li>Doit présenter l'autorisation parentale</li>
                <li><strong>Accès :</strong> Même structures et même pratique que l'adulte responsable</li>
              </ul>
            </div>

            <div className="age-group">
              <h4>De 14 ans à 18 ans :</h4>
              <ul>
                <li>Doit présenter l'autorisation parentale</li>
                <li><strong>Non autonome :</strong> Structure Blocs uniquement</li>
                <li><strong>Passeport FFME blanc ou autonome niveau 1 :</strong> Blocs et Cordes en moulinette</li>
                <li><strong>Passeport FFME jaune ou autonome niveau 2 :</strong> Toutes structures et escalade en tête</li>
              </ul>
            </div>

            <div className="age-group">
              <h4>18 ans et plus :</h4>
              <ul>
                <li><strong>Se déclare non autonome :</strong> Structures Blocs uniquement</li>
                <li><strong>Passeport FFME blanc ou autonome niveau 1 :</strong> Blocs et Cordes en moulinette</li>
                <li><strong>Passeport FFME jaune ou autonome niveau 2 :</strong> Toutes structures et escalade en tête</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="reglement-section">
          <h2>Article 6 : Accès des mineurs</h2>
          <p>
            Les mineurs sont obligatoirement encadrés lors de leur présence dans la salle. 
            Le responsable de la séance fournit à l'avance la liste des personnes placées 
            sous sa responsabilité.
          </p>
          <p>
            Ces derniers devront justifier d'une assurance en responsabilité civile couvrant 
            la responsabilité de la personne morale, de ses membres et de ses préposés.
          </p>
          <p>
            Les responsables de la salle sont dans l'obligation d'interdire l'accès à la salle 
            lorsque le nombre d'utilisateurs atteint le chiffre réglementaire (80 personnes maximum).
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 9 : Location de matériel et propreté</h2>
          <p>Dans l'enceinte du bâtiment, il est interdit de :</p>
          <ul>
            <li>Dégrader le matériel</li>
            <li>Adopter un comportement dangereux</li>
            <li>Perturber les autres utilisateurs</li>
          </ul>
        </div>

        <div className="reglement-section">
          <h2>Article 10 : Responsabilité et sécurité</h2>
          <p>
            Tous les grimpeurs engagent leur responsabilité en cas d'accident causé à un tiers.
          </p>
          <p>
            Le bénévole se tient à la disposition des utilisateurs pour tout conseil et pour 
            répondre à toute question relative à la pratique de l'escalade dans la salle. 
            Il est susceptible d'intervenir auprès des utilisateurs ayant une attitude ou 
            un comportement inadapté ou dangereux.
          </p>
          <p>
            L'utilisateur de la salle doit être assuré personnellement en responsabilité civile.
          </p>
          <p>
            Le personnel de la salle se réserve le droit d'exclure, sans préavis ni indemnité, 
            toute personne dont l'attitude ou le comportement serait contraire aux règles de 
            sécurité, aux bonnes mœurs, ou gênant pour les autres membres.
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 11 : Premiers secours</h2>
          <p>
            Une trousse de premier secours est située dans le sas vers le local à prises.
          </p>
        </div>

        <div className="reglement-section">
          <h2>Article 17 : Fermeture exceptionnelle</h2>
          <p>
            En cas de fermeture exceptionnelle, la salle informera les utilisateurs par 
            affichage, note sur le site internet, etc.
          </p>
        </div>
      </div>
      
      <div className="reglement-footer">
        <button 
          className="btn-retour-accueil" 
          onClick={() => navigate(-1)}
        >
          Revenir
        </button>
      </div>
    </div>
  );
}
