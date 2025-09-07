import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playSuccessSound, playBuzzerSound } from '../utils/soundUtils';

// ✅ FIXED: Dynamic API URL detection
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

    try {
      const API_BASE_URL = getApiBaseUrl(); // ✅ FIXED: Dynamic API URL
      console.log('🌐 MemberCheck using API URL:', API_BASE_URL);

      const checkResponse = await axios.get(`${API_BASE_URL}/members/check`, {
        params: {
          nom: form.nom.trim(),
          prenom: form.prenom.trim()
        },
        timeout: 15000
      });

      if (checkResponse.data.success) {
        playSuccessSound();

        // Create presence for validated member
        const presenceData = {
          type: 'adherent',
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          niveau: 'Non spécifié'
        };

        const presenceResponse = await axios.post(`${API_BASE_URL}/presences`, presenceData, {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' }
        });

        if (presenceResponse.data.success) {
          navigate('/success', {
            state: {
              type: 'adherent',
              nom: form.nom,
              prenom: form.prenom,
              message: checkResponse.data.message
            }
          });
        } else {
          setError('Erreur lors de l\'enregistrement de la présence');
          playBuzzerSound();
        }
      } else {
        setError(checkResponse.data.error);
        playBuzzerSound();
      }
    } catch (err) {
      console.error('Member check error:', err);
      let errorMessage = 'Erreur de connexion';

      if (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') {
        errorMessage = `Erreur réseau. API: ${getApiBaseUrl()}`;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      setError(errorMessage);
      playBuzzerSound();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-check">
      {/* DEBUG INFO */}
      <div style={{padding: '10px', background: '#f0f8ff', marginBottom: '15px', borderRadius: '5px', fontSize: '12px'}}>
        <div><strong>🔧 MemberCheck DEBUG:</strong></div>
        <div>🌐 API URL: <strong>{getApiBaseUrl()}</strong></div>
        <div>📱 Host: <strong>{window.location.hostname}</strong></div>
      </div>

      <h2>Vérification Membre</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom de famille:</label>
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

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || !form.nom.trim() || !form.prenom.trim()}
        >
          {loading ? 'Vérification...' : 'Vérifier'}
        </button>
      </form>
    </div>
  );
}