import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReturningVisitorChoice() {
  const navigate = useNavigate();

  const handleReturningVisitor = () => {
    navigate('/returning-visitor-form');
  };

  const handleFirstVisit = () => {
    navigate('/non-member');
  };

  const handleRetourAccueil = () => {
    navigate('/');
  };

  return (
    <div className="returning-visitor-choice">
      <div className="header-section">
        <h2>Inscription Visiteur</h2>
        <div className="header-buttons">
          <button onClick={handleRetourAccueil} className="btn-retour-accueil">
            🏠 Retour Accueil
          </button>
        </div>
      </div>

      <div className="choice-container">
        <div className="choice-section">
          <h3>Choisissez votre situation :</h3>

          <div className="choice-buttons">
            <button 
              onClick={handleReturningVisitor}
              className="btn-choice btn-returning"
            >
              <div className="choice-icon">🔄</div>
              <div className="choice-title">Je me suis déjà enregistré sur la tablette</div>
              <div className="choice-description">
                Accès rapide avec vos informations précédentes.<br/>
                Seulement nom, prénom et date de naissance requis.
              </div>
            </button>

            <button 
              onClick={handleFirstVisit}
              className="btn-choice btn-first-visit"
            >
              <div className="choice-icon">✨</div>
              <div className="choice-title">C'est ma première visite</div>
              <div className="choice-description">
                Inscription complète avec toutes les informations<br/>
                et procédure d'assurance.
              </div>
            </button>
          </div>
        </div>

        <div className="info-section">
          <p><strong>ℹ️ Information :</strong></p>
          <p>Si vous êtes déjà venu et avez utilisé cette tablette, choisissez l'option "déjà enregistré" pour un processus plus rapide.</p>
        </div>
      </div>
    </div>
  );
}