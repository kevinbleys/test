import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function MemberCheck() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Étape 1: Vérification de l'adhésion
      const checkResponse = await axios.get('http://localhost:4000/members/check', {
        params: { nom, prenom }
      });

      if (!checkResponse.data.success) {
        throw new Error(checkResponse.data.error || "Adhésion non valide");
      }

      // Étape 2: Enregistrement de la présence
      const presenceResponse = await axios.post('http://localhost:4000/presences', {
        type: 'adherent',
        nom,
        prenom
      });

      if (!presenceResponse.data.success) {
        throw new Error("Erreur lors de l'enregistrement");
      }

      // Redirection après succès
      navigate('/confirmation');

    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-check">
      <h2>Vérification d'adhésion</h2>
      
      <form onSubmit={handleVerification}>
        <div className="form-group">
          <label>Nom</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Prénom</label>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className={loading ? 'loading-button' : ''}>
          {loading ? 'Vérification en cours...' : 'Vérifier'}
        </button>

        {error && <div className="error-message">{error}</div>}
      </form>
      
      <div className="buttons-container">
        <button 
          onClick={() => navigate('/')}
          className="back-button"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
