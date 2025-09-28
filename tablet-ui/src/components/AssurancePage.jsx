import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { playSuccessSound, playBuzzerSound } from '../utils/soundUtils';
import API_BASE_URL from '../services/apiService';

export default function AssurancePage() {
  const state = useLocation().state;
  const navigate = useNavigate();
  const [checks, setChecks] = useState({
    c1: false,
    c2: false,
    c3: false,
    c4: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect si aucune donnée de formulaire n'est disponible
  if (!state?.form) {
    navigate('/non-member');
    return null;
  }

  const allChecked = Object.values(checks).every(Boolean);

  const toggleCheck = (key) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
    setError(''); // Effacer l'erreur lors de l'interaction utilisateur
  };

  const finish = async () => {
    if (!allChecked) {
      setError('Veuillez cocher toutes les cases pour continuer.');
      playBuzzerSound();
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('=== ASSURANCE PAGE SUBMISSION ===');
      console.log('State data:', state);

      // Utiliser le tarif calculé basé sur l'âge ET assurance status
      const registrationData = {
        type: 'non-adherent',
        ...state.form,
        tarif: state.tarif, // Utilise le tarif calculé
        niveau: state.niveau,
        assuranceAccepted: true, // Gebruiker heeft alle checkboxes aangevinkt
        status: 'pending' // Default status for non-members
      };

      console.log('Submitting with calculated tarif and assurance:', registrationData);

      // ✅ GECORRIGEERDE API URL - NU DYNAMISCH
      const response = await axios.post(`${API_BASE_URL}/presences`, registrationData);

      if (response.data.success) {
        console.log('=== REGISTRATION SUCCESS ===');
        console.log('Registered presence:', response.data.presence);

        // ✅ NIEUWE FUNCTIONALITEIT: Sla niet-lid op voor toekomstige snelle registratie
        try {
          const saveNonMemberData = {
            nom: state.form.nom,
            prenom: state.form.prenom,
            email: state.form.email,
            telephone: state.form.telephone,
            dateNaissance: state.form.dateNaissance,
            niveau: state.niveau,
            assuranceAccepted: true,
            age: state.age,
            tarif: state.tarif
          };

          console.log('Saving non-member for future quick registration:', saveNonMemberData);

          const saveResponse = await axios.post(`${API_BASE_URL}/save-non-member`, saveNonMemberData);

          if (saveResponse.data.success) {
            console.log('✅ Non-member saved for quick registration');
          } else {
            console.warn('⚠️ Could not save non-member, but continuing...');
          }
        } catch (saveError) {
          console.warn('⚠️ Save non-member error, but continuing...', saveError);
        }

        playSuccessSound();

        navigate('/paiement', {
          state: {
            presenceId: response.data.presence.id,
            montant: state.tarif, // Utilise le calculé tarif
            nom: state.form.nom,
            prenom: state.form.prenom,
            age: state.age,
            tarifCategory: state.tarifCategory
          }
        });
      } else {
        setError('Erreur lors de l\'enregistrement');
        playBuzzerSound();
      }

    } catch (err) {
      console.error('=== REGISTRATION ERROR ===');
      console.error('Error details:', err);

      if (err.response?.status === 500) {
        setError('Erreur du serveur. Veuillez réessayer.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erreur de connexion. Vérifiez que le serveur fonctionne.');
      }
      playBuzzerSound();
    } finally {
      setLoading(false);
    }
  };

  const handleRetourAccueil = () => {
    navigate('/');
  };

  const handleRetourNiveau = () => {
    navigate('/niveau', { state });
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
        maxWidth: '800px'
      }}>
        <h1 style={{
          color: '#333',
          marginBottom: '30px',
          fontSize: '2rem',
          fontWeight: '300',
          textAlign: 'center'
        }}>
          INFORMATION RELATIVE À L'ASSURANCE DU PRATIQUANT
        </h1>

        {/* Rappel du tarif */}
        {state.tarif !== undefined && (
          <div style={{
            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
            color: 'white',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>
              💰 Tarif à régler : {state.tarif === 0 ? 'GRATUIT' : `${state.tarif}€`}
            </h4>
            <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>
              👤 {state.form?.nom} {state.form?.prenom} - {state.age} ans - Niveau {state.niveau}
            </p>
            <p style={{ margin: '5px 0', fontSize: '1rem' }}>
              {state.tarifDescription}
            </p>
          </div>
        )}

        <p style={{ marginBottom: '20px', lineHeight: '1.6', color: '#666' }}>
          Conformément à l'article L321-4 du Code du sport, le présent document vise à informer 
          le pratiquant des conditions d'assurance applicables dans le cadre de la pratique de 
          l'escalade au sein de la structure.
        </p>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '1.3rem' }}>
            Assurance en Responsabilité Civile
          </h3>
          <p style={{ marginBottom: '15px', lineHeight: '1.6', color: '#666' }}>
            La structure dispose d'un contrat d'assurance en responsabilité civile couvrant 
            les dommages causés à des tiers dans le cadre de la pratique de l'escalade.
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '1.3rem' }}>
            Assurance Individuelle Accident
          </h3>
          <p style={{ marginBottom: '15px', lineHeight: '1.6', color: '#666' }}>
            Cette assurance ne couvre pas les dommages corporels que le pratiquant pourrait 
            se causer à lui-même, en l'absence de tiers responsable identifié.
          </p>
          <p style={{ marginBottom: '15px', lineHeight: '1.6', color: '#666' }}>
            L'assurance individuelle accident permet au pratiquant d'être indemnisé pour les 
            dommages corporels dont il pourrait être victime, y compris en l'absence de tiers 
            responsable.
          </p>
          <p style={{ marginBottom: '15px', lineHeight: '1.6', color: '#666' }}>
            En l'absence de garantie individuelle accident, il est recommandé de souscrire 
            une couverture adaptée soit auprès de l'assureur de son choix, soit via une 
            licence FFME.
          </p>
        </div>

        {[
          {
            key: 'c1',
            text: "Je reconnais avoir été informé(e) des conditions d'assurance applicables dans le cadre de la pratique de l'escalade au sein de cette structure."
          },
          {
            key: 'c2', 
            text: "Je reconnais avoir été informé(e) de l'existence et de l'intérêt d'une assurance individuelle accident."
          },
          {
            key: 'c3',
            text: "Je reconnais avoir été informé(e) de la possibilité de souscrire une assurance complémentaire adaptée à mes besoins, notamment via une licence FFME en club ou hors club."
          },
          {
            key: 'c4',
            text: (
              <>
                J'ai pris connaissance du{' '}
                <Link 
                  to="/reglement" 
                  state={state}
                  style={{ 
                    color: '#667eea', 
                    textDecoration: 'underline',
                    fontWeight: '500'
                  }}
                >
                  Règlement intérieur
                </Link>
                {' '}et je m'engage à le respecter.
              </>
            )
          }
        ].map(({ key, text }) => (
          <div key={key} style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: '20px',
            padding: '15px',
            border: '2px solid #ddd',
            borderRadius: '10px',
            backgroundColor: checks[key] ? '#e8f5e8' : '#fff',
            borderColor: checks[key] ? '#4CAF50' : '#ddd',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }} onClick={() => toggleCheck(key)}>
            <input
              type="checkbox"
              checked={checks[key]}
              onChange={() => toggleCheck(key)} 
              style={{ marginRight: '15px', marginTop: '3px', transform: 'scale(1.2)' }}
            />
            <span style={{ lineHeight: '1.5', color: '#333' }}>
              {text}
            </span>
          </div>
        ))}

        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#ff6b6b',
            color: 'white',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={handleRetourNiveau}
            disabled={loading}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #6b73ff 0%, #000dff 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.6 : 1
            }}
          >
            ← Retour
          </button>

          <button
            onClick={finish}
            disabled={loading || !allChecked}
            style={{
              flex: 2,
              background: (!allChecked || loading) ? '#cccccc' : 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: (!allChecked || loading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? '⏳ Enregistrement...' : 'Finaliser l\'inscription'}
          </button>

          <button
            onClick={handleRetourAccueil}
            disabled={loading}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #6b73ff 0%, #000dff 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.6 : 1
            }}
          >
            🏠 Accueil
          </button>
        </div>
      </div>
    </div>
  );
}