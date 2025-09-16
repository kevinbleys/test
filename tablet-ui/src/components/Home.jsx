import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const handleMemberClick = () => {
    navigate('/member');
  };

  const handleNonMemberClick = () => {
    navigate('/visitor-choice');
  };

  return (
    <div className="home-page">
      <div className="header">
        <h1>🧗‍♀️ Bienvenue à l'Escalade</h1>
        <p>Système d'accès à la salle d'escalade</p>
      </div>

      {/* ✅ FIX: Removed success message display */}

      <div className="main-choices">
        <button 
          onClick={handleMemberClick}
          className="btn-main btn-member"
        >
          <div className="btn-icon">👤</div>
          <div className="btn-title">Je suis membre du club</div>
          <div className="btn-description">Vérification rapide avec votre adhésion</div>
        </button>

        <button 
          onClick={handleNonMemberClick}
          className="btn-main btn-non-member"
        >
          <div className="btn-icon">🎯</div>
          <div className="btn-title">Je ne suis pas membre du club</div>
          <div className="btn-description">Inscription visiteur</div>
        </button>
      </div>

      <div className="info-footer">
        <p><strong>ℹ️ Information :</strong></p>
        <p>Choisissez votre situation pour accéder à l'escalade.</p>
      </div>
    </div>
  );
}