import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../services/apiService';

export default function ReglementPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    console.log('🌐 ReglementPage using API URL:', API_BASE_URL);
  }, []);

  const handleRetourAssurance = () => {
    if (state) {
      navigate('/assurance', { state });
    } else {
      navigate('/');
    }
  };

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    setScrolled(scrollTop > 100);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>

        {/* Header */}
        <div style={{
          position: 'sticky',
          top: '-40px',
          background: 'rgba(255, 255, 255, 0.95)',
          paddingBottom: '20px',
          marginBottom: '20px',
          zIndex: 10,
          borderBottom: '2px solid #e9ecef'
        }}>
          <h1 style={{
            color: '#333',
            marginBottom: '10px',
            fontSize: '2.2rem',
            fontWeight: '300',
            textAlign: 'center'
          }}>
            Règlement Intérieur
          </h1>

          {state && (
            <div style={{
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}>
              <strong>{state.form?.prenom} {state.form?.nom}</strong> - {state.age} ans - Tarif: {state.tarif === 0 ? 'GRATUIT' : `${state.tarif}€`}
            </div>
          )}
        </div>

        {/* VOLLEDIGE REGLEMENT INHOUD - ALLE ARTIKELEN 1-17.3 LETTERLIJK */}
        <div 
          style={{
            fontSize: '0.9rem',
            lineHeight: '1.5',
            color: '#444',
            maxHeight: '60vh',
            overflow: 'auto',
            padding: '0 5px'
          }}
          onScroll={handleScroll}
        >

          {/* Préambule */}
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '25px',
            border: '2px solid #e9ecef'
          }}>
            <h3 style={{ color: '#495057', marginBottom: '15px', fontSize: '1.3rem', fontWeight: '600' }}>📋 Préambule</h3>
            <p>
              Il est indispensable de maîtriser les techniques de sécurité et de respecter les règles de fonctionnement 
              de la salle pour une pratique de l'escalade dans les meilleures conditions de sécurité.
            </p>
          </div>

          {/* Article 1 */}
          <h4 style={{ color: '#495057', marginTop: '20px', marginBottom: '10px', fontSize: '1.05rem', fontWeight: '600' }}>
            Article 1 : Objet
          </h4>
          <p style={{ marginBottom: '12px' }}>
            Le présent règlement a pour objet de définir les conditions d'accès et d'utilisation de la salle 
            et notamment des équipements d'escalade.<br />
            Toute personne entrant dans cette enceinte sportive accepte de se conformer à ce règlement intérieur.
          </p>

          {/* Article 2 */}
          <h4 style={{ color: '#495057', marginTop: '20px', marginBottom: '10px', fontSize: '1.05rem', fontWeight: '600' }}>
            Article 2 : Formalités d'accès
          </h4>
          <p style={{ marginBottom: '12px' }}>
            Toute personne souhaitant utiliser les structures d'escalade doit, impérativement, se rendre au préalable à l'accueil. 
            La présentation d'un titre en cours de validité ou le règlement d'un droit d'entrée est obligatoire avant l'accès aux installations.
          </p>
          <p style={{ marginBottom: '12px' }}>
            Lors d'une première visite, il est obligatoire de remplir la <strong>« Fiche »</strong> sur la tablette, 
            l'utilisateur indiquera notamment son degré d'autonomie et son niveau de maîtrise des règles de sécurité en escalade.
          </p>
          <p style={{ marginBottom: '12px' }}>
            En fonction des renseignements donnés, le personnel de la salle indiquera les conditions d'accès aux différentes structures d'escalade.
          </p>
          <p style={{ marginBottom: '12px' }}>
            Les licenciés FFME doivent présenter leur licence fédérale en cours de validité pour bénéficier des remises tarifaires 
            qui leur sont octroyées ainsi que, le cas échéant, leur Passeport FFME Escalade pour prouver leur degré d'autonomie.
          </p>

          {/* Article 3 */}
          <h4 style={{ color: '#495057', marginTop: '20px', marginBottom: '10px', fontSize: '1.05rem', fontWeight: '600' }}>
            Article 3 : Autonomie
          </h4>
          <p style={{ marginBottom: '8px' }}>
            Un grimpeur se déclarant <strong>« autonome de niveau 1 »</strong> sur la fiche de première visite s'engage à satisfaire aux obligations suivantes :
          </p>
          <ul style={{ paddingLeft: '18px', marginBottom: '12px', listStyle: 'none' }}>
            <li style={{ marginBottom: '2px' }}>■ savoir mettre correctement son baudrier</li>
            <li style={{ marginBottom: '2px' }}>■ savoir s'encorder en utilisant un nœud de huit tressé avec un nœud d'arrêt</li>
            <li style={{ marginBottom: '2px' }}>■ savoir utiliser un système d'assurage pour assurer en moulinette</li>
            <li style={{ marginBottom: '2px' }}>■ savoir parer une chute</li>
          </ul>
          <p style={{ marginBottom: '8px' }}>
            Un grimpeur se déclarant <strong>« autonome de niveau 2 »</strong> sur la fiche de première visite s'engage à satisfaire aux obligations suivantes :
          </p>
          <ul style={{ paddingLeft: '18px', marginBottom: '12px', listStyle: 'none' }}>
            <li style={{ marginBottom: '2px' }}>■ savoir mettre correctement son baudrier</li>
            <li style={{ marginBottom: '2px' }}>■ savoir s'encorder en utilisant un nœud de huit tressé avec un nœud d'arrêt</li>
            <li style={{ marginBottom: '2px' }}>■ savoir utiliser un système d'assurage pour assurer en moulinette et en tête</li>
            <li style={{ marginBottom: '2px' }}>■ savoir grimper en tête</li>
            <li style={{ marginBottom: '2px' }}>■ savoir parer une chute</li>
          </ul>

          {/* Article 4 */}
          <h4 style={{ color: '#495057', marginTop: '20px', marginBottom: '10px', fontSize: '1.05rem', fontWeight: '600' }}>
            Article 4 : Passeports FFME Escalade
          </h4>
          <p style={{ marginBottom: '10px' }}>
            Le Passeport FFME Escalade blanc atteste de l'autonomie de niveau 1 définie à l'article 3. 
            Le Passeport FFME Escalade jaune atteste de l'autonomie de niveau 2 définie à l'article 3.
          </p>
          <p style={{ marginBottom: '10px' }}>
            Les moniteurs de la salle sont habilités à délivrer les Passeports FFME Escalade.
          </p>
          <p style={{ marginBottom: '12px' }}>
            La formation nécessaire à l'obtention du Passeport Escalade Blanc et Jaune est dispensée lors des cours payants.
          </p>

          {/* Article 5 + TABEL */}
          <h4 style={{ color: '#495057', marginTop: '20px', marginBottom: '10px', fontSize: '1.05rem', fontWeight: '600' }}>
            Article 5 : Accès aux équipements de la salle BEM
          </h4>
          <p style={{ marginBottom: '10px' }}>
            L'autorisation d'accès aux différentes structures dépend de l'âge du pratiquant.
          </p>
          <p style={{ marginBottom: '12px' }}>
            La possibilité de grimper en tête ou en moulinette sur la SAE à cordes dépend du degré d'autonomie déclaré. 
            Les principales règles d'accès sont synthétisées dans le tableau ci-dessous :
          </p>

          {/* EXACTE TABEL */}
          <div style={{ overflowX: 'auto', marginBottom: '18px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '2px solid #495057',
              fontSize: '0.75rem'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#6c757d', color: 'white' }}>
                  <th style={{ border: '1px solid #495057', padding: '6px', fontWeight: '600', textAlign: 'center' }}>ÂGE</th>
                  <th style={{ border: '1px solid #495057', padding: '6px', fontWeight: '600', textAlign: 'center' }}>CONDITIONS GÉNÉRALES D'ACCÈS</th>
                  <th style={{ border: '1px solid #495057', padding: '6px', fontWeight: '600', textAlign: 'center' }}>AUTONOMIE / PASSEPORT</th>
                  <th style={{ border: '1px solid #495057', padding: '6px', fontWeight: '600', textAlign: 'center' }}>ACCÈS AUX STRUCTURES</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #495057', padding: '6px', fontWeight: '600', verticalAlign: 'top', backgroundColor: '#f8f9fa' }}>Moins de 14 ans</td>
                  <td style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top' }}>Uniquement sous la responsabilité d'un adulte. Doit présenter l'autorisation parentale.</td>
                  <td style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top', textAlign: 'center', color: '#666' }}>—</td>
                  <td style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top' }}>Même structures et même pratique (moulinette, en tête) que l'adulte responsable.</td>
                </tr>
                <tr>
                  <td rowSpan="3" style={{ border: '1px solid #495057', padding: '6px', fontWeight: '600', verticalAlign: 'top', backgroundColor: '#f8f9fa' }}>De 14 ans à 18 ans</td>
                  <td rowSpan="3" style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top' }}>Doit présenter l'autorisation parentale dans laquelle le responsable légal certifie le niveau d'autonomie de l'enfant ou la possession d'un Passeport FFME.</td>
                  <td style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top' }}>Non autonome</td>
                  <td style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top' }}>Structure Blocs uniquement</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top' }}>Passeport FFME Escalade blanc ou autonome niveau 1</td>
                  <td style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top' }}>Structures Blocs et Cordes en moulinette</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top' }}>Passeport FFME Escalade jaune ou autonome niveau 2</td>
                  <td style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top' }}>Toutes structures et escalade en tête sur le mur à cordes autorisée</td>
                </tr>
                <tr>
                  <td rowSpan="3" style={{ border: '1px solid #495057', padding: '6px', fontWeight: '600', verticalAlign: 'top', backgroundColor: '#f8f9fa' }}>18 ans et plus</td>
                  <td rowSpan="3" style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top', textAlign: 'center', color: '#666' }}>—</td>
                  <td style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top' }}>Se déclare non autonome</td>
                  <td style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top' }}>Structures Blocs uniquement</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top' }}>Passeport FFME Escalade blanc ou se déclare autonome de niveau 1</td>
                  <td style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top' }}>Structures Blocs et Cordes en moulinette</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top' }}>Passeport FFME Escalade jaune ou se déclare autonome de niveau 2</td>
                  <td style={{ border: '1px solid #495057', padding: '6px', verticalAlign: 'top' }}>Toutes structures et escalade en tête sur le mur à cordes autorisée</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ marginBottom: '15px' }}>
            En outre, quel que soit son âge, toute personne accompagnée et sous la responsabilité d'un grimpeur majeur 
            qui s'engage à en être responsable a accès aux mêmes structures et aux mêmes pratiques (moulinette ou en tête) que le responsable.
          </p>

          {/* Article 6-17.3 - ALLE OVERIGE ARTIKELEN */}
          <h4 style={{ color: '#495057', marginTop: '18px', marginBottom: '8px', fontSize: '1.05rem', fontWeight: '600' }}>Article 6 : Accès</h4>
          <p style={{ marginBottom: '8px' }}>Les adhérents sont soumis aux règles d'accès du présent règlement.</p>
          <p style={{ marginBottom: '8px' }}>Un responsable du club est obligatoirement présent.</p>
          <p style={{ marginBottom: '12px' }}>Les mineurs sont obligatoirement encadrés lors de leur présence dans la salle. Le responsable de la séance fournit à l'avance la liste des personnes placées sous sa responsabilité.</p>

          <h4 style={{ color: '#495057', marginTop: '18px', marginBottom: '8px', fontSize: '1.05rem', fontWeight: '600' }}>Article 7 : Utilisation par des groupes</h4>
          <p style={{ marginBottom: '6px' }}>Tous les organismes (associations, sociétés, scolaires, établissements, etc.) seront autorisés à utiliser les installations sportives de l'Usine après avoir :</p>
          <ul style={{ paddingLeft: '18px', marginBottom: '10px', listStyle: 'none' }}>
            <li style={{ marginBottom: '2px' }}>■ Réservé auprès de la direction un ou plusieurs créneaux</li>
            <li style={{ marginBottom: '2px' }}>■ Établi un contrat précisant à minima les conditions d'accès, les tarifs, les conditions d'encadrement.</li>
          </ul>
          <p style={{ marginBottom: '12px' }}>Ces derniers devront justifier d'une assurance en responsabilité civile couvrant la responsabilité de la personne morale, de ses membres et de ses préposés.</p>

          <h4 style={{ color: '#495057', marginTop: '18px', marginBottom: '8px', fontSize: '1.05rem', fontWeight: '600' }}>Article 8 : Effectif maximum dans la salle l'Usine</h4>
          <p style={{ marginBottom: '12px' }}>Les responsables de la salle l'Usine sont dans l'obligation d'interdire l'accès à la salle lorsque le nombre d'utilisateurs dans la salle atteint le chiffre réglementaire au regard de la réglementation ERP. (Ce chiffre est fixé à 80 personnes pour la salle BEM classée en 5ème catégorie).</p>

          <h4 style={{ color: '#495057', marginTop: '18px', marginBottom: '8px', fontSize: '1.05rem', fontWeight: '600' }}>Article 9 : Location de matériel</h4>
          <p style={{ marginBottom: '12px' }}>La salle BEM prête le matériel de base nécessaire à l'escalade : chaussons, baudrier, système d'assurage. Le dépôt d'une pièce d'identité est demandé.</p>

          <h4 style={{ color: '#495057', marginTop: '18px', marginBottom: '8px', fontSize: '1.05rem', fontWeight: '600' }}>Article 10 : Obligations des utilisateurs</h4>

          <h5 style={{ color: '#6c757d', marginTop: '10px', marginBottom: '5px', fontSize: '0.95rem', fontWeight: '600' }}>10.1 - Propreté</h5>
          <ul style={{ paddingLeft: '18px', marginBottom: '10px', listStyle: 'none' }}>
            <li style={{ marginBottom: '2px' }}>■ Utiliser des chaussons d'escalade dans la salle d'escalade (les chaussures de ville sont interdites dans la salle)</li>
            <li style={{ marginBottom: '2px' }}>■ Ne pas utiliser de chaussons d'escalade en dehors de la salle d'escalade (vestiaires, couloir, accueil)</li>
            <li style={{ marginBottom: '2px' }}>■ Laisser les sanitaires dans l'état de propreté trouvé.</li>
            <li style={{ marginBottom: '2px' }}>■ Signaler tout problème de propreté au bénévole de la salle.</li>
          </ul>

          <h5 style={{ color: '#6c757d', marginTop: '10px', marginBottom: '5px', fontSize: '0.95rem', fontWeight: '600' }}>10.2 - Utilisation des vestiaires</h5>
          <ul style={{ paddingLeft: '18px', marginBottom: '8px', listStyle: 'none' }}>
            <li style={{ marginBottom: '2px' }}>■ Utiliser impérativement les vestiaires pour changer de tenue.</li>
            <li style={{ marginBottom: '2px' }}>■ Utiliser les casiers de dépôts d'affaires mis à disposition dans l'espace de grimpe.</li>
            <li style={{ marginBottom: '2px' }}>■ Libérer en fin de séance tout casier utilisé.</li>
          </ul>
          <p style={{ marginBottom: '8px', fontSize: '0.85rem' }}>Le personnel de BEM se réserve le droit d'enlever, pour des raisons de sécurité et d'hygiène, tout casier non libéré.</p>
          <p style={{ marginBottom: '10px', fontSize: '0.85rem' }}>Le personnel de BEM ne peut être tenu responsable pour d'éventuels vols dans l'ensemble du bâtiment.</p>

          <h5 style={{ color: '#6c757d', marginTop: '10px', marginBottom: '5px', fontSize: '0.95rem', fontWeight: '600' }}>10.3 - Respect des lieux et d'autrui</h5>
          <p style={{ marginBottom: '6px' }}>Dans l'enceinte du bâtiment, il est interdit :</p>
          <ul style={{ paddingLeft: '18px', marginBottom: '12px', listStyle: 'none' }}>
            <li style={{ marginBottom: '2px' }}>■ De fumer</li>
            <li style={{ marginBottom: '2px' }}>■ De consommer de l'alcool et ou des stupéfiants</li>
            <li style={{ marginBottom: '2px' }}>■ De jeter des détritus</li>
            <li style={{ marginBottom: '2px' }}>■ De venir avec des animaux même tenus en laisse</li>
            <li style={{ marginBottom: '2px' }}>■ D'utiliser des rollers, skate, vélos, deux roues et tout engin motorisé</li>
            <li style={{ marginBottom: '2px' }}>■ De jouer avec de l'eau ou de la nourriture</li>
            <li style={{ marginBottom: '2px' }}>■ De crier, de hurler et de causer une gêne sonore pour les autres usagers</li>
            <li style={{ marginBottom: '2px' }}>■ De se déplacer ou de grimper dans une tenue indécente</li>
          </ul>

          <h4 style={{ color: '#495057', marginTop: '18px', marginBottom: '8px', fontSize: '1.05rem', fontWeight: '600' }}>Article 11 : Respects des règles de sécurité</h4>
          <p style={{ marginBottom: '10px' }}>Tous les grimpeurs engagent leur responsabilité en cas d'accident causé à un tiers.</p>
          <p style={{ marginBottom: '10px' }}>Il convient de veiller à sa sécurité, à celle de son partenaire d'escalade ainsi qu'à celle des autres utilisateurs.</p>
          <p style={{ marginBottom: '10px' }}>Au pied de toutes les structures d'escalade, des panneaux sécurité sont disposés afin de rappeler les points clés. Les écrans d'information diffusent également des conseils, tous les utilisateurs sont invités à en prendre régulièrement connaissance.</p>
          <p style={{ marginBottom: '10px' }}>Le bénévole se tient à la disposition des utilisateurs pour tout conseil et pour répondre à toute question relative à la pratique de l'escalade dans la salle. Il est susceptible d'intervenir auprès des utilisateurs ayant une attitude ou un comportement inadapté ou dangereux.</p>
          <p style={{ marginBottom: '10px' }}>Le non-respect des conseils et consignes entrainera l'exclusion immédiate de la salle. Les utilisateurs doivent :</p>
          <ul style={{ paddingLeft: '18px', marginBottom: '12px', listStyle: 'none' }}>
            <li style={{ marginBottom: '2px' }}>■ Signaler au responsable tout incident, tout comportement, toute anomalie, toute présence anormale pouvant représenter un danger ou une menace.</li>
            <li style={{ marginBottom: '2px' }}>■ Respecter les consignes de sécurité qui sont rappelées ci-dessous :</li>
          </ul>

          <h5 style={{ color: '#6c757d', marginTop: '10px', marginBottom: '5px', fontSize: '0.95rem', fontWeight: '600' }}>11.1 - Sécurité bloc</h5>
          <ul style={{ paddingLeft: '18px', marginBottom: '10px', listStyle: 'none' }}>
            <li style={{ marginBottom: '2px' }}>■ S'échauffer</li>
            <li style={{ marginBottom: '2px' }}>■ Vérifier que la surface de réception est totalement dégagée</li>
            <li style={{ marginBottom: '2px' }}>■ Priorité au grimpeur :</li>
            <li style={{ marginBottom: '2px' }}>■ Ne pas circuler, ne pas stationner au-dessous d'autrui</li>
            <li style={{ marginBottom: '2px' }}>■ Ne pas grimper au-dessus ou au-dessous d'autrui.</li>
            <li style={{ marginBottom: '2px' }}>■ Privilégier la désescalade, repérer un itinéraire de descente</li>
            <li style={{ marginBottom: '2px' }}>■ En cas de chute ou de saut, amortir avec les jambes</li>
            <li style={{ marginBottom: '2px' }}>■ Se faire parer si besoin</li>
          </ul>

          <h5 style={{ color: '#6c757d', marginTop: '10px', marginBottom: '5px', fontSize: '0.95rem', fontWeight: '600' }}>11.2 - Sécurité difficulté</h5>
          <ul style={{ paddingLeft: '18px', marginBottom: '8px', listStyle: 'none' }}>
            <li style={{ marginBottom: '2px' }}>■ En escalade en tête,</li>
            <li style={{ marginBottom: '2px' }}>■ Mousquetonner toutes les dégaines (dans le bon sens)</li>
            <li style={{ marginBottom: '2px' }}>■ Parer le grimpeur avant l'utilisation du premier point d'assurage</li>
            <li style={{ marginBottom: '2px' }}>■ Vérifier les points clés :</li>
            <li style={{ marginBottom: '2px', paddingLeft: '15px' }}>1. Nœud d'encordement : double nœud de huit et nœud d'arrêt</li>
            <li style={{ marginBottom: '2px', paddingLeft: '15px' }}>2. Installation correcte du système d'assurage</li>
            <li style={{ marginBottom: '2px', paddingLeft: '15px' }}>3. Nœud en bout de corde</li>
            <li style={{ marginBottom: '2px' }}>■ En moulinette</li>
            <li style={{ marginBottom: '2px' }}>■ Replacer la corde dans les dégaines à la descente</li>
            <li style={{ marginBottom: '2px' }}>■ Maîtriser la vitesse de descente du grimpeur</li>
            <li style={{ marginBottom: '2px' }}>■ Ne pas stationner sous les grimpeurs</li>
            <li style={{ marginBottom: '2px' }}>■ Ne pas grimper en solo (strictement interdit)</li>
            <li style={{ marginBottom: '2px' }}>■ Maintenir la surface de réception totalement dégagée</li>
            <li style={{ marginBottom: '2px' }}>■ Ne pas faire de traversées sur la partie basse du mur</li>
            <li style={{ marginBottom: '2px' }}>■ Rester concentré et anticiper les actions du grimpeur</li>
            <li style={{ marginBottom: '2px' }}>■ Ne pas assurer assis ou à une distance trop importante du pied de la structure</li>
            <li style={{ marginBottom: '2px' }}>■ Prévenir le personnel de toute anomalie sur la SAE : prises desserrées, maillons ou mousquetons usés, cordes endommagées...</li>
          </ul>

          <h5 style={{ color: '#6c757d', marginTop: '10px', marginBottom: '5px', fontSize: '0.95rem', fontWeight: '600' }}>11.3 - Manipulation du matériel d'assurage</h5>
          <ul style={{ paddingLeft: '18px', marginBottom: '12px', listStyle: 'none' }}>
            <li style={{ marginBottom: '2px' }}>■ Les cordes utilisées pour les moulinettes sont installées à demeure et doivent être remise en place</li>
            <li style={{ marginBottom: '2px' }}>■ L'escalade en moulinette est interdite dans la zone des grands dévers</li>
            <li style={{ marginBottom: '2px' }}>■ Les sangles des enrouleurs en place sur la SAE à cordes doivent systématiquement être attachées à l'aide des mousquetons au pied des voies dans les points prévus à cet effet</li>
            <li style={{ marginBottom: '2px' }}>■ L'utilisation des cordes non mises à disposition par la salle l'Usine est interdite pour l'escalade en tête et en moulinette</li>
            <li style={{ marginBottom: '2px' }}>■ Afin de préserver les cordes, il est interdit :</li>
            <li style={{ marginBottom: '2px' }}>■ D'assurer au demi-cabestan</li>
            <li style={{ marginBottom: '2px' }}>■ D'effectuer des chutes volontaires et répétées de manière excessive</li>
            <li style={{ marginBottom: '2px' }}>■ D'effectuer des remontées sur cordes (en dehors des sessions d'instruction militaire, de formation et d'ouvertures de voies)</li>
            <li style={{ marginBottom: '2px' }}>■ La mise en place de « via cordata » est interdite</li>
          </ul>

          <h4 style={{ color: '#495057', marginTop: '18px', marginBottom: '8px', fontSize: '1.05rem', fontWeight: '600' }}>Article 12 : Assurances</h4>
          <p style={{ marginBottom: '8px' }}>La FFME est assurée pour les dommages engageant sa responsabilité civile et celle de son personnel.</p>
          <p style={{ marginBottom: '8px' }}>La responsabilité de la FFME ne pourra être engagée en cas d'accident résultant de l'utilisation inappropriée des installations ou encore du non-respect des règles de sécurité en escalade.</p>
          <p style={{ marginBottom: '8px' }}>L'utilisateur de la salle doit être assuré personnellement en responsabilité civile.</p>
          <p style={{ marginBottom: '12px' }}>La salle recommande fortement à tous les utilisateurs de souscrire une assurance individuelle accident auprès de la compagnie de son choix.</p>

          <h4 style={{ color: '#495057', marginTop: '18px', marginBottom: '8px', fontSize: '1.05rem', fontWeight: '600' }}>Article 13 : Vidéo surveillance</h4>
          <p style={{ marginBottom: '8px' }}>Un système de vidéo surveillance est mis en place pour des raisons de sécurité. Aucun enregistrement n'est réalisé.</p>
          <p style={{ marginBottom: '12px' }}>Le personnel de BEM est susceptible d'intervenir quand la sécurité des utilisateurs est compromise.</p>

          <h4 style={{ color: '#495057', marginTop: '18px', marginBottom: '8px', fontSize: '1.05rem', fontWeight: '600' }}>Article 14 : Droit d'exclusion</h4>
          <p style={{ marginBottom: '12px' }}>Le personnel de la salle se réservent le droit d'exclure, sans préavis ni indemnité d'aucune sorte, toute personne dont l'attitude ou le comportement serait contraire aux règles de sécurité en escalade, aux bonnes mœurs, ou notoirement gênant pour les autres membres, ou non conforme au présent règlement, ainsi que toute personne se livrant à des dégradations intentionnelles ou non intentionnelles des installations ou du matériel de la salle.</p>

          <h4 style={{ color: '#495057', marginTop: '18px', marginBottom: '8px', fontSize: '1.05rem', fontWeight: '600' }}>Article 15 : Droit à l'image</h4>
          <p style={{ marginBottom: '12px' }}>Toutes les photos et vidéos prises lors de l'utilisation des équipements de la salle, par ses responsables et préposés sont susceptibles d'être affichées ou mises en ligne sur le site internet de BEM sauf si les personnes figurant sur ces supports ou leur responsable légal en font la demande par écrit pour les retirer.</p>

          <h4 style={{ color: '#495057', marginTop: '18px', marginBottom: '8px', fontSize: '1.05rem', fontWeight: '600' }}>Article 16 : Secours</h4>
          <p style={{ marginBottom: '8px' }}>Une trousse de premier secours est située dans le sas vers le local à prises.</p>
          <p style={{ marginBottom: '12px' }}>Tous les utilisateurs acceptent que le personnel de BEM prenne toute mesure utile en cas d'accident.</p>

          <h4 style={{ color: '#495057', marginTop: '18px', marginBottom: '8px', fontSize: '1.05rem', fontWeight: '600' }}>Article 17 : Divers</h4>

          <h5 style={{ color: '#6c757d', marginTop: '10px', marginBottom: '5px', fontSize: '0.95rem', fontWeight: '600' }}>17.1 - Initiation et enseignement</h5>
          <p style={{ marginBottom: '8px' }}>Il est fortement déconseillé d'initier des débutants si vous n'êtes pas un professionnel de l'enseignement de l'escalade.</p>
          <p style={{ marginBottom: '10px' }}>Seuls les salariés de BEM peuvent enseigner l'escalade contre rémunération dans la salle à l'exception des personnes encadrant les groupes mentionnés à l'article 7.</p>

          <h5 style={{ color: '#6c757d', marginTop: '10px', marginBottom: '5px', fontSize: '0.95rem', fontWeight: '600' }}>17.2 - Fermeture de la salle et modification des horaires</h5>
          <p style={{ marginBottom: '8px' }}>Les horaires d'ouverture de la salle sont indiqués à l'accueil et sur le site Web https://beyrede-escalade-montagne.pepsup.com/</p>
          <p style={{ marginBottom: '8px' }}>Le personnel de la salle se réserve le droit de modifier les horaires et/ou d'immobiliser tout ou partie des structures d'escalade pour des besoins particuliers d'exploitation (ouvertures, travaux, manifestations, etc.).</p>
          <p style={{ marginBottom: '8px' }}>En cas de fermeture exceptionnelle, la salle informera les utilisateurs préalablement par les moyens dont elle dispose : affichage, note sur le site internet, etc.</p>
          <p style={{ marginBottom: '10px' }}>Sauf mention contraire, les utilisateurs acceptent de recevoir des informations par mail de la part de la salle.</p>

          <h5 style={{ color: '#6c757d', marginTop: '10px', marginBottom: '5px', fontSize: '0.95rem', fontWeight: '600' }}>17.3 - Modification</h5>
          <p style={{ marginBottom: '15px' }}>Les responsables de la salle l'Usine Escalade se réservent le droit de modifier le présent Règlement Intérieur sans préavis.</p>

          {/* FINAL NOTE */}
          <div style={{
            background: '#fff3cd',
            border: '2px solid #ffc107',
            padding: '15px',
            borderRadius: '8px',
            marginTop: '20px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0', fontWeight: '600', color: '#856404' }}>
              Fait à Beyrède, le 30 juillet 2025<br />
              <strong>Beyrède Escalade Montagne : BEM</strong>
            </p>
          </div>

        </div>

        {/* Sticky bottom buttons */}
        <div style={{
          position: 'sticky',
          bottom: '-40px',
          background: 'rgba(255, 255, 255, 0.95)',
          paddingTop: '20px',
          marginTop: '20px',
          borderTop: '2px solid #e9ecef'
        }}>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={handleRetourAssurance}
              style={{
                flex: 1,
                maxWidth: '300px',
                background: 'linear-gradient(135deg, #6b73ff 0%, #000dff 100%)',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {state ? '← Retour à l\'assurance' : '🏠 Retour à l\'accueil'}
            </button>
          </div>

          {scrolled && (
            <div style={{
              textAlign: 'center',
              marginTop: '10px',
              fontSize: '0.85rem',
              color: '#666',
              fontStyle: 'italic'
            }}>
              📄 Règlement complet lu - {state ? 'Vous pouvez maintenant retourner à la page d\'assurance' : 'Merci d\'avoir pris connaissance du règlement'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}