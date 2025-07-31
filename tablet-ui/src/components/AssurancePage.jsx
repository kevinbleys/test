import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { playSuccessSound, playBuzzerSound } from '../utils/soundUtils';

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

    try {
      const response = await axios.post('http://localhost:4000/presences', {
        type: 'non-adherent',
        ...state.form
      });

      if (response.data.success) {
        playSuccessSound();
        navigate('/paiement', {
          state: {
            presenceId: response.data.presence.id,
            montant: response.data.presence.tarif || 10
          }
        });
      } else {
        setError('Erreur lors de l\'enregistrement');
        playBuzzerSound();
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion');
      playBuzzerSound();
    }
  };

  return (
    <div className="assurance-page">
      <h1>INFORMATION RELATIVE À L'ASSURANCE DU PRATIQUANT</h1>
      
      <p className="intro-text">
        Conformément à l'article L321-4 du Code du sport, le présent document vise à informer 
        le pratiquant des conditions d'assurance applicables dans le cadre de la pratique de 
        l'escalade au sein de la structure.
      </p>

      <div className="assurance-section">
        <h2>Assurance en Responsabilité Civile</h2>
        <p>
          La structure dispose d'un contrat d'assurance en responsabilité civile couvrant 
          les dommages causés à des tiers dans le cadre de la pratique de l'escalade.
        </p>
      </div>

      <div className="assurance-section">
        <h2>Assurance Individuelle Accident</h2>
        <p className="warning-text">
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

      <div className="checkbox-section">
        <div className="checkbox-item">
          <label>
            <input 
              type="checkbox" 
              checked={checks.c1} 
              onChange={() => toggleCheck('c1')} 
            />
            <span className="checkbox-text">
              Je reconnais avoir été informé(e) des conditions d'assurance applicables 
              dans le cadre de la pratique de l'escalade au sein de cette structure.
            </span>
          </label>
        </div>

        <div className="checkbox-item">
          <label>
            <input 
              type="checkbox" 
              checked={checks.c2} 
              onChange={() => toggleCheck('c2')} 
            />
            <span className="checkbox-text">
              Je reconnais avoir été informé(e) de l'existence et de l'intérêt d'une 
              assurance individuelle accident.
            </span>
          </label>
        </div>

        <div className="checkbox-item">
          <label>
            <input 
              type="checkbox" 
              checked={checks.c3} 
              onChange={() => toggleCheck('c3')} 
            />
            <span className="checkbox-text">
              Je reconnais avoir été informé(e) de la possibilité de souscrire une 
              assurance complémentaire adaptée à mes besoins, notamment via une 
              licence FFME en club ou hors club.
            </span>
          </label>
        </div>

        <div className="checkbox-item">
          <label>
            <input 
              type="checkbox" 
              checked={checks.c4} 
              onChange={() => toggleCheck('c4')} 
            />
            <span className="checkbox-text">
              J'ai pris connaissance du{' '}
              <Link to="/reglement" className="reglement-link">
                Règlement intérieur
              </Link>
              {' '}et je m'engage à le respecter.
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="button-section">
        <button 
          disabled={!allChecked} 
          onClick={finish} 
          className={`btn-verify ${!allChecked ? 'disabled' : ''}`}
        >
          Continuer vers paiement
        </button>
        
        <button 
          className="btn-retour-accueil" 
          onClick={() => navigate('/')}
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
