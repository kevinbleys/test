import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { playSuccessSound, playBuzzerSound } from '../utils/soundUtils';

// ✅ ADD: Bell sound function
const playBellSound = () => {
  try {
    const audio = new Audio('/assets/bell.mp3');
    audio.volume = 0.7;
    audio.play().catch(err => console.log('Bell sound failed:', err));
  } catch (err) {
    console.log('Bell sound not available:', err);
  }
};

const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${protocol}//${hostname}:3001`;
  }
  return 'http://localhost:3001';
};

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

  if (!state?.form) {
    navigate('/non-member');
    return null;
  }

  const allChecked = Object.values(checks).every(Boolean);

  const toggleCheck = (key) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
    setError('');
  };

  const finish = async () => {
    if (!allChecked) {
      setError('Veuillez cocher toutes les cases pour continuer.');
      playBuzzerSound();
      return;
    }

    // ✅ ADD: Play bell sound when continuing to payment
    playBellSound();

    setLoading(true);
    setError('');

    try {
      const apiUrl = getApiBaseUrl();

      const registrationData = {
        type: 'non-adherent',
        ...state.form,
        tarif: state.tarif,
        niveau: state.niveau,
        assuranceAccepted: true,
        status: 'pending'
      };

      const response = await axios.post(`${apiUrl}/presences`, registrationData, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        playSuccessSound();
        navigate('/paiement', {
          state: {
            presenceId: response.data.presence.id,
            montant: state.tarif,
            nom: state.form.nom,
            prenom: state.form.prenom,
            age: state.age,
            tarifCategory: state.tarifCategory
          }
        });
      } else {
        setError(response.data.error || 'Erreur lors de l\'enregistrement');
        playBuzzerSound();
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Erreur de connexion');
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
      maxWidth: '900px', 
      margin: '20px auto', 
      padding: '30px', 
      background: 'white', 
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>

      <div className="header-section">
        <h2>INFORMATION RELATIVE À L'ASSURANCE DU PRATIQUANT</h2>
        <div className="header-buttons">
          <button onClick={handleRetourAccueil} className="btn-retour-accueil">
            🏠 Retour Accueil
          </button>
        </div>
      </div>

      {/* Rappel du tarif */}
      {state.tarif !== undefined && (
        <div style={{
          background: '#f8f9fa',
          padding: '25px',
          borderRadius: '8px',
          marginBottom: '25px',
          textAlign: 'center',
          border: '2px solid #4CAF50'
        }}>
          <h4 style={{ color: '#2E7D32', marginBottom: '15px' }}>
            💰 Tarif à régler : {state.tarif === 0 ? '🆓 GRATUIT' : `💶 ${state.tarif}€`}
          </h4>
          <div style={{ fontSize: '16px', marginBottom: '10px' }}>
            👤 <strong>{state.form?.nom} {state.form?.prenom}</strong> - {state.age} ans - Niveau {state.niveau}
          </div>
          <div style={{ fontStyle: 'italic', color: '#666' }}>
            {state.tarifDescription}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '30px', lineHeight: '1.6', fontSize: '15px' }}>
        Conformément à l'article L321-4 du Code du sport, le présent document vise à informer 
        le pratiquant des conditions d'assurance applicables dans le cadre de la pratique de 
        l'escalade au sein de la structure.
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Assurance en Responsabilité Civile</h3>
        <p style={{ fontSize: '15px', lineHeight: '1.5' }}>
          La structure dispose d'un contrat d'assurance en responsabilité civile couvrant 
          les dommages causés à des tiers dans le cadre de la pratique de l'escalade.
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>Assurance Individuelle Accident</h3>
        <p style={{ fontSize: '15px', lineHeight: '1.5' }}>
          Cette assurance ne couvre pas les dommages corporels que le pratiquant pourrait 
          se causer à lui-même, en l'absence de tiers responsable identifié.
        </p>
        <p style={{ fontSize: '15px', lineHeight: '1.5' }}>
          L'assurance individuelle accident permet au pratiquant d'être indemnisé pour les 
          dommages corporels dont il pourrait être victime, y compris en l'absence de tiers 
          responsable.
        </p>
        <p style={{ fontSize: '15px', lineHeight: '1.5' }}>
          En l'absence de garantie individuelle accident, il est recommandé de souscrire 
          une couverture adaptée soit auprès de l'assureur de son choix, soit via une 
          licence FFME.
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
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
                <Link to="/reglement" target="_blank" rel="noopener noreferrer">
                  Règlement intérieur
                </Link>
                {' '}et je m'engage à le respecter.
              </>
            )
          }
        ].map(({ key, text }) => (
          <div 
            key={key} 
            onClick={() => toggleCheck(key)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '20px',
              cursor: 'pointer',
              padding: '20px',
              border: '3px solid #e0e0e0',
              borderRadius: '10px',
              background: checks[key] ? '#e3f2fd' : 'white',
              borderColor: checks[key] ? '#2196F3' : '#e0e0e0',
              transition: 'all 0.3s ease',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'manipulation',
              minHeight: '80px'
            }}
          >
            <input 
              type="checkbox" 
              checked={checks[key]}
              onChange={() => {}}
              style={{ 
                marginRight: '20px', 
                marginTop: '5px', 
                transform: 'scale(1.5)',
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
            />
            <span style={{ 
              cursor: 'pointer', 
              flex: 1, 
              fontSize: '16px',
              lineHeight: '1.4'
            }}>{text}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="error-message" style={{
          marginBottom: '25px',
          padding: '20px',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '8px',
          border: '3px solid #f44336',
          whiteSpace: 'pre-line',
          fontSize: '15px',
          lineHeight: '1.4'
        }}>
          <span className="error-icon">⚠️</span>
          <div style={{ marginLeft: '10px' }}>{error}</div>
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        justifyContent: 'space-between',
        marginTop: '40px' 
      }}>
        <button 
          onClick={handleRetourNiveau}
          className="btn-retour-accueil"
          style={{ 
            flex: 1,
            padding: '15px 25px',
            fontSize: '16px',
            minHeight: '60px'
          }}
          disabled={loading}
        >
          ← Retour Niveau
        </button>

        <button 
          onClick={finish}
          disabled={!allChecked || loading}
          className="btn-verify"
          style={{ 
            flex: 2,
            opacity: (!allChecked || loading) ? 0.6 : 1,
            cursor: (!allChecked || loading) ? 'not-allowed' : 'pointer',
            padding: '15px 25px',
            fontSize: '16px',
            minHeight: '60px',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ Enregistrement en cours...' : 'Continuer vers le paiement →'}
        </button>
      </div>
    </div>
  );
}