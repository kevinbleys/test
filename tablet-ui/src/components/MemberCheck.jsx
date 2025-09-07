import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playSuccessSound, playBuzzerSound } from '../utils/soundUtils';

// ✅ ONLY CHANGE: Dynamic API URL detection
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${protocol}//${hostname}:3001`;
  }
  return 'http://localhost:3001';
};

export default function MemberCheck() {
  const [form, setForm] = useState({
    nom: '',
    prenom: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nom.trim() || !form.prenom.trim()) {
      setError('Veuillez remplir tous les champs');
      playBuzzerSound();
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const apiUrl = getApiBaseUrl(); // ✅ ONLY CHANGE: Dynamic API

      const checkResponse = await axios.get(`${apiUrl}/members/check`, {
        params: {
          nom: form.nom.trim(),
          prenom: form.prenom.trim()
        },
        timeout: 15000
      });

      if (checkResponse.data.success) {
        playSuccessSound();
        setSuccess(`✅ Vérification réussie! Vous pouvez aller grimper. 🧗‍♀️`);

        // ✅ ORIGINAL: Create presence for validated member
        const presenceData = {
          type: 'adherent',
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          niveau: 'Adhérent vérifié'
        };

        await axios.post(`${apiUrl}/presences`, presenceData, {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' }
        });

        // ✅ ORIGINAL: Auto redirect to home after success
        setTimeout(() => {
          navigate('/', {
            state: {
              successMessage: `Bienvenue ${form.prenom} ${form.nom}!`,
              memberVerified: true
            }
          });
        }, 3000);

      } else {
        setError(checkResponse.data.error);
        playBuzzerSound();
      }
    } catch (err) {
      console.error('Member check error:', err);

      let errorMessage = 'Erreur de connexion';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
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

  return (
    <div className="member-check">
      <div className="header-section">
        <h2>Vérification Membre</h2>
        <div className="header-buttons">
          <button onClick={handleRetourAccueil} className="btn-retour-accueil">
            🏠 Retour Accueil
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom:</label>
          <input
            type="text"
            value={form.nom}
            onChange={(e) => setForm({...form, nom: e.target.value})}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Prénom:</label>
          <input
            type="text"
            value={form.prenom}
            onChange={(e) => setForm({...form, prenom: e.target.value})}
            disabled={loading}
          />
        </div>

        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {success}
            <div className="redirect-message">
              Redirection vers l'accueil dans quelques secondes...
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          className="btn-verify"
          disabled={loading || !form.nom.trim() || !form.prenom.trim()}
        >
          {loading ? '⏳ Vérification...' : '🔍 Vérifier'}
        </button>
      </form>
    </div>
  );
}