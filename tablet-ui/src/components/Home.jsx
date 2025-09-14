import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { successMessage, errorMessage, paymentConfirmed, memberVerified, paymentCancelled } = location.state || {};

  const handleMemberClick = () => {
    navigate('/member');
  };

  const handleNonMemberClick = () => {
    // ✅ FEATURE 2: Redirect to visitor choice instead of direct non-member
    navigate('/visitor-choice');
  };

  return (
    <div className="home-page">
      <div className="header">
        <h1>🧗‍♀️ Bienvenue à l'Escalade</h1>
        <p>Système d'accès à la salle d'escalade</p>
      </div>

      {/* ✅ FEATURE 3: Enhanced success/error messages */}
      {successMessage && (
        <div className={`success-message-home ${memberVerified ? 'member-verified' : ''} ${paymentConfirmed ? 'payment-confirmed' : ''}`}>
          <div className="success-icon">🎉</div>
          <div className="success-content">
            <strong>Parfait !</strong>
            <div style={{ whiteSpace: 'pre-line', fontSize: '16px', lineHeight: '1.4' }}>
              {successMessage}
            </div>
            {memberVerified && <div className="badge">✅ Adhérent vérifié</div>}
            {paymentConfirmed && <div className="badge">💳 Paiement confirmé</div>}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className={`error-message-home ${paymentCancelled ? 'payment-cancelled' : ''}`}>
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <div style={{ whiteSpace: 'pre-line', fontSize: '15px', lineHeight: '1.4' }}>
              {errorMessage}
            </div>
          </div>
        </div>
      )}

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
          <div className="btn-description">Inscription visiteur • Accès rapide si déjà venu</div>
        </button>
      </div>

      <div className="info-footer">
        <p><strong>ℹ️ Information :</strong></p>
        <p>Si vous avez une adhésion active, choisissez "membre du club". Sinon, choisissez "visiteur" - vous aurez une option rapide si vous êtes déjà venu.</p>
      </div>
    </div>
  );
}