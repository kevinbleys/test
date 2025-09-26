import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { playBuzzerSound } from '../utils/soundUtils';
import API_BASE_URL from '../services/apiService';

export default function LevelPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    console.log('🌐 LevelPage using API URL:', API_BASE_URL);

    if (!state?.form) {
      console.error('No form data received, redirecting to home');
      navigate('/');
    }
  }, [state, navigate]);

  if (!state?.form) {
    return null; // Redirect will happen in useEffect
  }

  const { form, age, tarif, tarifDescription } = state;

  const levels = [
    { id: '0', label: 'Débutant complet', desc: 'Première fois en escalade' },
    { id: '1', label: 'Débutant', desc: 'Quelques séances en salle' },
    { id: '2', label: 'Intermédiaire', desc: 'À l\'aise en 5a-5c' },
    { id: '3', label: 'Confirmé', desc: 'Grimpe en 6a et plus' },
    { id: '4', label: 'Expert', desc: 'Niveau 7a et plus' }
  ];

  const handleContinue = () => {
    if (!selectedLevel) {
      setError('Veuillez sélectionner votre niveau');
      playBuzzerSound();
      return;
    }

    navigate('/assurance', {
      state: {
        ...state,
        niveau: selectedLevel
      }
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '600px'
      }}>
        <h1 style={{
          color: '#333',
          marginBottom: '20px',
          fontSize: '2rem',
          fontWeight: '300',
          textAlign: 'center'
        }}>
          Quel est votre niveau ?
        </h1>

        <div style={{
          background: 'linear-gradient(135deg, #4CAF50, #45a049)',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <strong>{form.prenom} {form.nom}</strong> - {age} ans - Tarif: {tarif === 0 ? 'GRATUIT' : `${tarif}€`}
          <br />
          <small>{tarifDescription}</small>
        </div>

        <div style={{ marginBottom: '30px' }}>
          {levels.map((level) => (
            <div
              key={level.id}
              onClick={() => setSelectedLevel(level.id)}
              style={{
                padding: '20px',
                border: selectedLevel === level.id ? '3px solid #667eea' : '2px solid #ddd',
                borderRadius: '10px',
                marginBottom: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: selectedLevel === level.id ? '#f0f4ff' : 'white'
              }}
            >
              <div style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: selectedLevel === level.id ? '#667eea' : '#333',
                marginBottom: '5px'
              }}>
                {level.label}
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#666'
              }}>
                {level.desc}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#ff6b6b',
            color: 'white',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={() => navigate(-1)}
            disabled={loading}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #6b73ff 0%, #000dff 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.6 : 1
            }}
          >
            ← Retour
          </button>

          <button
            onClick={handleContinue}
            disabled={loading || !selectedLevel}
            style={{
              flex: 2,
              background: (!selectedLevel || loading) ? '#cccccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: (!selectedLevel || loading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? '⏳ Traitement...' : 'Continuer →'}
          </button>
        </div>

        {/* Debug info */}
        <div style={{ 
          marginTop: '20px', 
          fontSize: '0.8rem', 
          color: '#666',
          textAlign: 'center'
        }}>
          API: {API_BASE_URL}
        </div>
      </div>
    </div>
  );
}