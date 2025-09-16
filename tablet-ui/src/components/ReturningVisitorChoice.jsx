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

      <h3>Choisissez votre situation :</h3>

      <div className="choice-buttons">
        <button 
          onClick={handleReturningVisitor}
          className="btn-choice btn-returning"
        >
          <div className="choice-icon">🔄</div>
          <div className="choice-title">Déjà enregistré</div>
          <div className="choice-description">Accès rapide</div>
        </button>

        <button 
          onClick={handleFirstVisit}
          className="btn-choice btn-first-visit"
        >
          <div className="choice-icon">✨</div>
          <div className="choice-title">Première visite</div>
          <div className="choice-description">Inscription complète</div>
        </button>
      </div>
    </div>
  );
}