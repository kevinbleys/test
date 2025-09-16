import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  const [form, setForm] = useState({
    nom: '',
    prenom: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nom.trim() || !form.prenom.trim()) {
      setError('Nom et prénom sont requis');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const apiUrl = getApiBaseUrl();

      const response = await axios.get(`${apiUrl}/members/check`, {
        params: {
          nom: form.nom.trim(),
          prenom: form.prenom.trim()
        },
        timeout: 15000
      });

      if (response.data.success) {
        setSuccess('Membre vérifié avec succès !');

        // ✅ FIX: Return to home WITHOUT success message state
        setTimeout(() => {
          navigate('/');
        }, 2000);

      } else {
        setError(response.data.error);
      }
    } catch (err) {
      console.error('Member verification error:', err);
      setError('Erreur de connexion. Veuillez réessayer.');
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}

        <button 
          type="submit" 
          className="btn-verify"
          disabled={loading || !form.nom.trim() || !form.prenom.trim()}
        >
          {loading ? '⏳ Vérification...' : 'Vérifier mon adhésion'}
        </button>
      </form>
    </div>
  );
}