import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// ✅ Sound utils fallback
const playSuccessSound = () => console.log('✅ Success sound');
const playBuzzerSound = () => console.log('❌ Error sound');

const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${protocol}//${hostname}:3001`;
  }
  return 'http://localhost:3001';
};

export default function MemberPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { successMessage } = location.state || {};

  const [form, setForm] = useState({
    nom: '',
    prenom: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nom.trim() || !form.prenom.trim()) {
      setError('Nom et prénom sont requis');
      playBuzzerSound();
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const apiUrl = getApiBaseUrl();

      // ✅ Try enhanced endpoint first, fallback to original
      let endpoint = '/members/check-enhanced';
      let response;

      try {
        response = await axios.get(`${apiUrl}${endpoint}`, {
          params: {
            nom: form.nom.trim(),
            prenom: form.prenom.trim()
          },
          timeout: 15000
        });
      } catch (enhancedError) {
        // Fallback to original endpoint
        console.log('Enhanced endpoint failed, using original');
        endpoint = '/members/check';
        response = await axios.get(`${apiUrl}${endpoint}`, {
          params: {
            nom: form.nom.trim(),
            prenom: form.prenom.trim()
          },
          timeout: 15000
        });
      }

      if (response.data.success) {
        playSuccessSound();

        // ✅ FEATURE 3: Enhanced success message - longer and clearer
        setSuccessMsg('✅ Vérification réussie ! Votre adhésion est valide.\n\n🧗‍♀️ Vous pouvez maintenant accéder à l\'escalade.\n\nÉquipez-vous et amusez-vous bien !');

        // ✅ FEATURE 3: Longer display time - 8 seconds instead of 2
        setTimeout(() => {
          navigate('/', {
            state: {
              successMessage: '🎉 Membre vérifié avec succès !\n\nProfitez bien de votre session d\'escalade ! Bonne grimpe ! 🧗‍♀️',
              memberVerified: true
            }
          });
        }, 8000); // 8 seconds

      } else {
        // Enhanced error messages
        let errorMsg = response.data.error;

        if (response.data.paymentIncomplete) {
          errorMsg += '\n\n🤝 Un bénévole peut vous aider à résoudre ce problème à l\'accueil.';
        } else {
          errorMsg += '\n\n💡 Vérifiez l\'orthographe de votre nom et prénom.\n\n🤝 Si le problème persiste, contactez un bénévole.';
        }

        setError(errorMsg);
        playBuzzerSound();
      }
    } catch (err) {
      console.error('Member verification error:', err);
      setError('❌ Erreur de connexion.\n\nVeuillez réessayer ou contacter un bénévole à l\'accueil.');
      playBuzzerSound();
    } finally {
      setLoading(false);
    }
  };

  const handleRetourAccueil = () => {
    navigate('/');
  };

  return (
    <div className="member-page">
      <div className="header-section">
        <h2>Vérification Adhérent</h2>
        <div className="header-buttons">
          <button onClick={handleRetourAccueil} className="btn-retour-accueil">
            🏠 Retour Accueil
          </button>
        </div>
      </div>

      {/* Enhanced success message display */}
      {successMessage && (
        <div className="success-message-home">
          <span className="success-icon">🎉</span>
          <div className="success-content">
            <strong>Bienvenue !</strong>
            <div style={{ whiteSpace: 'pre-line' }}>{successMessage}</div>
          </div>
        </div>
      )}

      {/* ✅ FEATURE 3: Enhanced in-page success message */}
      {successMsg && (
        <div className="success-message-enhanced">
          <div className="success-animation">✅</div>
          <div className="success-content">
            <h3>Vérification réussie !</h3>
            <div style={{ whiteSpace: 'pre-line', fontSize: '16px', lineHeight: '1.5' }}>
              {successMsg}
            </div>
            <div className="countdown">
              <div className="countdown-bar"></div>
              Redirection automatique dans quelques secondes...
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nom">Nom :</label>
          <input
            id="nom"
            type="text"
            value={form.nom}
            onChange={(e) => setForm({...form, nom: e.target.value})}
            placeholder="Votre nom de famille"
            required
            disabled={loading || successMsg}
            autoComplete="family-name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="prenom">Prénom :</label>
          <input
            id="prenom"
            type="text"
            value={form.prenom}
            onChange={(e) => setForm({...form, prenom: e.target.value})}
            placeholder="Votre prénom"
            required
            disabled={loading || successMsg}
            autoComplete="given-name"
          />
        </div>

        {error && (
          <div className="error-message-enhanced">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <div style={{ whiteSpace: 'pre-line', fontSize: '15px', lineHeight: '1.4' }}>
                {error}
              </div>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="btn-verify"
          disabled={loading || !form.nom.trim() || !form.prenom.trim() || successMsg}
        >
          {loading ? '⏳ Vérification...' : successMsg ? '✅ Vérifié' : 'Vérifier mon adhésion'}
        </button>
      </form>

      <div className="info-section">
        <p><strong>ℹ️ Information :</strong></p>
        <p>Entrez votre nom et prénom exactement comme lors de votre inscription au club.</p>
      </div>
    </div>
  );
}