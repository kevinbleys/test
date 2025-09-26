import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { playBuzzerSound } from '../utils/soundUtils';
import API_BASE_URL from '../services/apiService';

export default function AssurancePage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [assuranceAccepted, setAssuranceAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    console.log('🌐 AssurancePage using API URL:', API_BASE_URL);

    if (!state?.form) {
      console.error('No form data received, redirecting to home');
      navigate('/');
    }
  }, [state, navigate]);

  if (!state?.form) {
    return null;
  }

  const { form, age, tarif, tarifDescription, niveau } = state;

  const handleContinue = () => {
    if (!assuranceAccepted) {
      setError('Vous devez accepter les conditions d\'assurance pour continuer');
      playBuzzerSound();
      return;
    }

    navigate('/reglement', {
      state: {
        ...state,
        assuranceAccepted: true
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
        maxWidth: '700px'
      }}>
        <h1 style={{
          color: '#333',
          marginBottom: '20px',
          fontSize: '2rem',
          fontWeight: '300',
          textAlign: 'center'
        }}>
          Conditions d'assurance
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
          <small>Niveau: {['Débutant complet', 'Débutant', 'Intermédiaire', 'Confirmé', 'Expert'][parseInt(niveau)] || 'Non défini'}</small>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '25px',
          borderRadius: '15px',
          marginBottom: '30px',
          border: '2px solid #e9ecef'
        }}>
          <h3 style={{ color: '#495057', marginBottom: '20px', fontSize: '1.4rem' }}>
            🛡️ Important : Assurance et responsabilité
          </h3>

          <div style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#6c757d' }}>
            <p style={{ marginBottom: '15px' }}>
              <strong>La pratique de l'escalade présente des risques</strong> que vous acceptez en participant à cette activité.
            </p>

            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Vous pratiquez sous votre entière responsabilité</li>
              <li style={{ marginBottom: '8px' }}>Une assurance responsabilité civile est obligatoire</li>
              <li style={{ marginBottom: '8px' }}>Nous recommandons fortement une assurance individuelle accident</li>
              <li style={{ marginBottom: '8px' }}>Le club décline toute responsabilité en cas d'accident</li>
            </ul>

            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              padding: '15px',
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <strong>⚠️ Attention :</strong> Si vous n'avez pas d'assurance, vous pouvez en souscrire une temporaire 
              sur place ou reporter votre visite.
            </div>
          </div>
        </div>

        <div style={{
          background: assuranceAccepted ? '#d4edda' : '#f8d7da',
          border: `2px solid ${assuranceAccepted ? '#c3e6cb' : '#f1b0b7'}`,
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            <input
              type="checkbox"
              checked={assuranceAccepted}
              onChange={(e) => {
                setAssuranceAccepted(e.target.checked);
                setError('');
              }}
              style={{
                width: '20px',
                height: '20px',
                marginRight: '15px',
                cursor: 'pointer'
              }}
            />
            <span style={{ color: assuranceAccepted ? '#155724' : '#721c24' }}>
              ✅ Je confirme disposer d'une assurance responsabilité civile et j'accepte 
              de pratiquer sous ma propre responsabilité
            </span>
          </label>
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
            disabled={loading || !assuranceAccepted}
            style={{
              flex: 2,
              background: (!assuranceAccepted || loading) ? '#cccccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: (!assuranceAccepted || loading) ? 'not-allowed' : 'pointer',
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