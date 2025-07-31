import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { playBuzzerSound, playSuccessSound } from '../utils/soundUtils';

export default function LevelPage() {
  const { state } = useLocation();
  const nav = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState('');
  const [error, setError] = useState('');

  if (!state?.form) {
    nav('/non-member');
    return null;
  }

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    setError(''); // Clear error when user selects an option
  };

  const continuer = () => {
    if (!selectedLevel) {
      setError('Veuillez sélectionner un niveau pour continuer');
      playBuzzerSound();
      return;
    }
    
    playSuccessSound();
    nav('/assurance', { 
      state: { 
        form: state.form, 
        niveau: selectedLevel 
      } 
    });
  };

  return (
    <div className="niveau-page">
      <h2>Je déclare :</h2>

      <div className="niveau-options">
        <div className="niveau-option">
          <label className="radio-label">
            <input
              type="radio"
              name="niveau"
              value="0"
              checked={selectedLevel === '0'}
              onChange={() => handleLevelChange('0')}
            />
            <span className="radio-text">ne pas être un grimpeur autonome (*)</span>
          </label>
        </div>

        <div className="niveau-option">
          <label className="radio-label">
            <input
              type="radio"
              name="niveau"
              value="1"
              checked={selectedLevel === '1'}
              onChange={() => handleLevelChange('1')}
            />
            <span className="radio-text">être grimpeur autonome de niveau 1 ou je possède un Passeport FFME Escalade blanc (**)</span>
          </label>
        </div>

        <div className="niveau-option">
          <label className="radio-label">
            <input
              type="radio"
              name="niveau"
              value="2"
              checked={selectedLevel === '2'}
              onChange={() => handleLevelChange('2')}
            />
            <span className="radio-text">être grimpeur autonome de niveau 2 ou je possède un Passeport FFME Escalade jaune (***)</span>
          </label>
        </div>
      </div>

      <div className="niveau-explanations">
        <div className="explanation-block">
          <h3>(*) Niveau 0 - Grimpeur non autonome</h3>
          <p><strong>Je n'ai accès qu'à la structure de blocs.</strong></p>
          <p>
            Je n'ai pas les compétences requises pour grimper sur le mur à cordes et je m'engage à ne pas 
            grimper sur les zones nécessitant un encordement. Je n'ai accès qu'à la structure de blocs.
          </p>
        </div>

        <div className="explanation-block">
          <h3>(**) Niveau 1 - Grimpeur autonome niveau 1</h3>
          <p><strong>J'ai accès à la structure blocs et au mur à cordes en moulinette uniquement.</strong></p>
          <div className="competences-list">
            <p>Je possède les compétences suivantes :</p>
            <ul>
              <li>Je sais mettre correctement un baudrier</li>
              <li>Je sais m'encorder en utilisant un nœud de huit tressé avec un nœud d'arrêt</li>
              <li>Je sais utiliser un système d'assurage pour assurer en moulinette</li>
              <li>Je sais parer une chute</li>
            </ul>
          </div>
        </div>

        <div className="explanation-block">
          <h3>(***) Niveau 2 - Grimpeur autonome niveau 2</h3>
          <p><strong>J'ai accès à la structure blocs et au mur à cordes en tête.</strong></p>
          <div className="competences-list">
            <p>Je possède toutes les compétences du niveau 1, plus :</p>
            <ul>
              <li>Je suis autonome de niveau 1</li>
              <li>Je sais utiliser un système d'assurage pour assurer en tête</li>
              <li>Je sais grimper en tête</li>
            </ul>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="button-section">
        <button 
          onClick={continuer} 
          className={`btn-verify ${!selectedLevel ? 'disabled' : ''}`}
          disabled={!selectedLevel}
        >
          Poursuivre
        </button>
        <button 
          className="btn-retour-accueil" 
          onClick={() => nav('/')}
        >
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
