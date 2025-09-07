import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { playSuccessSound, playBuzzerSound } from '../utils/soundUtils';

// ✅ KEEP: Dynamic API URL detection (WORKING!)
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

  // ✅ RESTORED: Redirect check
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

    setLoading(true);
    setError('');

    try {
      const apiUrl = getApiBaseUrl(); // ✅ KEEP: Dynamic API
      console.log('🌐 AssurancePage API URL:', apiUrl);

      // ✅ RESTORED: Create presence with calculated tarif
      const registrationData = {
        type: 'non-adherent',
        ...state.form,
        tarif: state.tarif,
        niveau: state.niveau,
        assuranceAccepted: true,
        status: 'pending'
      };

      console.log('Creating presence:', registrationData);

      const response = await axios.post(`${apiUrl}/presences`, registrationData, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false
      });

      if (response.data.success) {
        console.log('Presence created:', response.data.presence);
        playSuccessSound();

        // ✅ RESTORED: Navigate to payment page
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
        console.error('Registration failed:', response.data);
        setError(response.data.error || 'Erreur lors de l\'enregistrement');
        playBuzzerSound();
      }
    } catch (err) {
      console.error('Registration error:', err);

      let errorMessage = 'Erreur de connexion';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = `Erreur: ${err.message}`;
      }

      setError(errorMessage);
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
    <div className="assurance-page">
      {/* ✅ RESTORED: Original header */}
      <div className="header-section">
        <h2>Information relative à l'assurance du pratiquant</h2>
        <div className="header-buttons">
          <button onClick={handleRetourAccueil} className="btn-retour-accueil">
            🏠 Retour Accueil
          </button>
        </div>
      </div>

      {/* DEBUG INFO - Small and unobtrusive */}
      <div style={{ 
        fontSize: '12px', 
        color: '#666', 
        marginBottom: '15px',
        padding: '8px',
        background: '#f8f9fa',
        borderRadius: '4px',
        opacity: 0.7
      }}>
        API: {getApiBaseUrl()} | Host: {window.location.hostname}
      </div>

      {/* ✅ RESTORED: Tarif summary */}
      {state.tarif !== undefined && (
        <div className="tarif-summary">
          <h3>💰 Tarif à régler : {state.tarif === 0 ? 'GRATUIT' : `${state.tarif}€`}</h3>
          <div className="tarif-details">
            👤 {state.form?.nom} {state.form?.prenom} - {state.age} ans - Niveau {state.niveau}
          </div>
          <div className="tarif-description">
            {state.tarifDescription}
          </div>
        </div>
      )}

      {/* ✅ RESTORED: Assurance info text */}
      <div className="assurance-info">
        <p>
          Conformément à l'article L321-4 du Code du sport, le présent document vise à informer 
          le pratiquant des conditions d'assurance applicables dans le cadre de la pratique de 
          l'escalade au sein de la structure.
        </p>

        <h3>Assurance en Responsabilité Civile</h3>
        <p>
          La structure dispose d'un contrat d'assurance en responsabilité civile couvrant 
          les dommages causés à des tiers dans le cadre de la pratique de l'escalade.
        </p>

        <h3>Assurance Individuelle Accident</h3>
        <p>
          Cette assurance ne couvre pas les dommages corporels que le pratiquant pourrait 
          se causer à lui-même, en l'absence de tiers responsable identifié.
        </p>
        <p>
          L'assurance individuelle accident permet au pratiquant d'être indemnisé pour les 
          dommages corporels dont il pourrait être victime, y compris en l'absence de tiers 
          responsable.
        </p>
        <p>
          En l'absence de garantie individuelle accident, il est recommandé de souscrire 
          une couverture adaptée soit auprès de l'assureur de son choix, soit via une 
          licence FFME.
        </p>
      </div>

      {/* ✅ RESTORED: Checkbox list */}
      <div className="checkbox-list">
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
            className={`checkbox-item ${checks[key] ? 'checked' : ''}`}
            onClick={() => toggleCheck(key)}
          >
            <input 
              type="checkbox" 
              checked={checks[key]}
              onChange={() => {}}
            />
            <span className="checkbox-text">{text}</span>
          </div>
        ))}
      </div>

      {/* ✅ RESTORED: Error message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* ✅ RESTORED: Action buttons */}
      <div className="action-buttons">
        <button 
          onClick={handleRetourNiveau}
          className="btn-retour"
          disabled={loading}
        >
          ← Retour Niveau
        </button>

        <button 
          onClick={finish}
          disabled={!allChecked || loading}
          className="btn-continue"
        >
          {loading ? '⏳ Enregistrement...' : 'Continuer vers le paiement →'}
        </button>
      </div>
    </div>
  );
}