import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playBuzzerSound, playBellSound, playSuccessSound, preloadSounds } from '../utils/soundUtils';
import API_BASE_URL from '../services/apiService';

export default function MemberCheck() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [benevoleCalled, setBenevoleCalled] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    preloadSounds();
    console.log('🌐 MemberCheck using API URL:', API_BASE_URL);
  }, []);

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setBenevoleCalled(false);
    setIsValidated(false);

    try {
      console.log('=== STARTING MEMBER VERIFICATION ===');
      console.log('API URL:', API_BASE_URL);
      console.log('Checking member:', nom, prenom);

      // Étape 1: Vérification de l'adhésion
      const checkResponse = await axios.get(`${API_BASE_URL}/members/check`, {
        params: { nom, prenom }
      });

      console.log('Member check response:', checkResponse.data);

      if (checkResponse.data.success) {
        // Membre valide et payé
        setMessage(checkResponse.data.message);
        setIsValidated(true);
        playSuccessSound();

        console.log('=== MEMBER VALIDATED - REGISTERING PRESENCE ===');

        // Étape 2: Enregistrement présence adherent
        const presenceData = {
          type: 'adherent',
          nom: nom.trim(),
          prenom: prenom.trim()
        };

        console.log('Sending presence data:', presenceData);

        const presenceResponse = await axios.post(`${API_BASE_URL}/presences`, presenceData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Presence response:', presenceResponse.data);

        if (presenceResponse.data.success) {
          console.log('=== PRESENCE REGISTERED SUCCESSFULLY ===');
          console.log('Final presence object:', presenceResponse.data.presence);

          // Start countdown voor betere UX ervaring
          const countdownTimer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownTimer);
                navigate('/confirmation');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

        } else {
          setError("Erreur lors de l'enregistrement de la présence");
          playBuzzerSound();
        }
      } else {
        // Membre non valide ou non payé
        console.log('Member validation failed:', checkResponse.data.error);
        setError(checkResponse.data.error || "Adhésion non valide");
        playBuzzerSound();
      }
    } catch (error) {
      console.error('=== ERROR IN VERIFICATION ===');
      console.error('Error details:', error);

      let errorMessage = "Erreur de connexion";
      if (error.response?.status === 404) {
        errorMessage = "Aucun membre trouvé avec ce nom et prénom";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = `Erreur réseau: ${error.message}`;
      }

      setError(errorMessage);
      playBuzzerSound();
    } finally {
      setLoading(false);
    }
  };

  const handleAppelerBenevole = () => {
    playBellSound();
    setBenevoleCalled(true);
    setMessage("Un bénévole va arriver pour vous aider !");
    setTimeout(() => {
      setMessage('');
      setBenevoleCalled(false);
    }, 5000);
  };

  const handleRetourAccueil = () => {
    setNom('');
    setPrenom('');
    setError('');
    setMessage('');
    setLoading(false);
    setBenevoleCalled(false);
    setIsValidated(false);
    setCountdown(3);
    navigate('/');
  };

  // Als lid succesvol gevalideerd is, toon voorbereidende bevestiging
  if (isValidated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
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
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '80px', color: '#4CAF50', marginBottom: '20px' }}>
            ✅
          </div>

          <h1 style={{ 
            color: '#2e7d32', 
            marginBottom: '20px', 
            fontSize: '2rem', 
            fontWeight: '600' 
          }}>
            Membre Trouvé !
          </h1>

          <p style={{ fontSize: '1.2rem', marginBottom: '25px', color: '#333' }}>
            {message}
          </p>

          <div style={{
            background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '20px',
            border: '2px solid #4CAF50'
          }}>
            <div style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#2e7d32' }}>
              🔄 Finalisation de votre enregistrement...
            </div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#4CAF50' 
            }}>
              {countdown} seconde{countdown !== 1 ? 's' : ''}
            </div>
          </div>

          <button 
            onClick={handleRetourAccueil}
            style={{
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🏠 Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Originele formulier
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
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          color: '#333', 
          marginBottom: '30px', 
          fontSize: '2rem', 
          fontWeight: '300' 
        }}>
          Vérification d'adhésion
        </h1>

        <form onSubmit={handleVerification}>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '1.1rem',
              color: '#555',
              fontWeight: '500'
            }}>
              Nom
            </label>
            <input 
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #ddd',
                borderRadius: '10px',
                fontSize: '1.1rem',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '1.1rem',
              color: '#555',
              fontWeight: '500'
            }}>
              Prénom
            </label>
            <input 
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #ddd',
                borderRadius: '10px',
                fontSize: '1.1rem',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !nom || !prenom}
            style={{
              background: loading ? '#cccccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              marginBottom: '20px',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? '🔍 Vérification...' : '✓ Vérifier l\'adhésion'}
          </button>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button"
              onClick={handleAppelerBenevole}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1
              }}
            >
              🔔 Appeler un bénévole
            </button>

            <button 
              type="button"
              onClick={handleRetourAccueil}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #6b73ff 0%, #000dff 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1
              }}
            >
              🏠 Retour à l'accueil
            </button>
          </div>

        </form>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#ff6b6b',
            color: 'white',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            {error}
          </div>
        )}

        {message && !isValidated && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: benevoleCalled ? '#ff9500' : '#4CAF50',
            color: 'white',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.2rem' }}>
              {benevoleCalled ? "🔔" : "✅"}
            </span>
            {message}
          </div>
        )}

      </div>
    </div>
  );
}