import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playBellSound, playSuccessSound } from '../utils/soundUtils';
import API_BASE_URL from '../services/apiService';

export default function PaymentPage() {
  const { state } = useLocation(); // presenceId + montant
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [presenceData, setPresenceData] = useState(null);
  const [isValidated, setIsValidated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5); // 5 seconden countdown
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    console.log('🌐 PaymentPage using API URL:', API_BASE_URL);
  }, []);

  // Poll elke 4 s of de betaling is gevalideerd  
  useEffect(() => {
    if (!state?.presenceId) {
      navigate('/');
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/presences/${state.presenceId}`);
        if (res.data.success) {
          setPresenceData(res.data.presence);
          setLoading(false);

          if (['Payé', 'Pay'].includes(res.data.presence.status)) {
            if (!isValidated) {
              setIsValidated(true);
              setShowConfirmation(true);
              playSuccessSound();

              // Start countdown timer
              const countdownTimer = setInterval(() => {
                setCountdown((prev) => {
                  if (prev <= 1) {
                    clearInterval(countdownTimer);
                    navigate('/');
                    return 0;
                  }
                  return prev - 1;
                });
              }, 1000);
            }
          }
        }
      } catch (error) {
        console.error('Erreur vérification statut:', error);
        setError('Impossible de vérifier le statut du paiement');
        setLoading(false);
      }
    };

    // Vérification initiale
    checkPaymentStatus();

    // Vérification périodique
    const interval = setInterval(checkPaymentStatus, 4000);
    return () => clearInterval(interval);
  }, [state, navigate, isValidated]);

  const handleContactVolunteer = () => {
    playBellSound();
  };

  const handleRetourAccueil = () => {
    navigate('/');
  };

  if (!state?.presenceId) return null;

  // Si le paiement est validé - VERBETERDE CONFIRMATIE
  if (isValidated || presenceData?.status === 'Payé' || presenceData?.status === 'Pay') {
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
          padding: '50px',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          width: '100%',
          maxWidth: '700px',
          textAlign: 'center'
        }}>
          {/* Grote groene checkmark */}
          <div style={{ 
            fontSize: '120px', 
            color: '#4CAF50',
            marginBottom: '30px',
            textShadow: '0 4px 8px rgba(76, 175, 80, 0.3)'
          }}>
            ✅
          </div>

          {/* Hoofdbevestiging - in het Frans zoals gewenst */}
          <h1 style={{ 
            color: '#2e7d32', 
            marginBottom: '25px', 
            fontSize: '2.5rem', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            Paiement Accepté !
          </h1>

          <p style={{ 
            fontSize: '1.3rem', 
            marginBottom: '25px', 
            color: '#333',
            fontWeight: '500' 
          }}>
            Votre paiement de <strong style={{ color: '#4CAF50' }}>{state.montant}€</strong> a été confirmé avec succès.
          </p>

          {presenceData?.methodePaiement && (
            <p style={{ fontSize: '1.1rem', marginBottom: '30px', color: '#666' }}>
              Mode de paiement : <strong>{presenceData.methodePaiement}</strong>
            </p>
          )}

          {/* Verbeterde countdown met meer visueel gewicht */}
          <div style={{
            background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
            padding: '25px',
            borderRadius: '15px',
            marginBottom: '30px',
            border: '2px solid #4CAF50'
          }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#2e7d32' }}>
              🏠 Redirection automatique vers la page d'accueil
            </div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#4CAF50',
              textShadow: '0 2px 4px rgba(76, 175, 80, 0.3)' 
            }}>
              {countdown} seconde{countdown !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Optionele terugknop */}
          <button 
            onClick={handleRetourAccueil}
            style={{
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(33, 150, 243, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.3)';
            }}
          >
            🏠 Retour immédiat à l'accueil
          </button>

          {/* Bedankbericht */}
          <p style={{ 
            marginTop: '30px', 
            fontSize: '1rem', 
            color: '#666',
            fontStyle: 'italic' 
          }}>
            Merci et bonne escalade ! 🧗‍♀️
          </p>

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

  // Originele wachtscherm blijft hetzelfde
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
        maxWidth: '700px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#333', marginBottom: '20px', fontSize: '2rem', fontWeight: '300' }}>
          💰 Montant à régler : {state.montant}€
        </h1>

        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
          En attente de validation par un bénévole
        </p>

        {/* Section simplifiée - pas de sélection de mode */}

        <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
          🏪 Présentez-vous à l'accueil
        </h3>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px'
        }}>

          <p style={{ marginBottom: '15px' }}>
            Un bénévole va vous aider à finaliser votre paiement avec l'un des modes suivants :
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px'
          }}>
            <div style={{
              padding: '15px',
              background: 'white',
              borderRadius: '10px',
              border: '2px solid #4CAF50'
            }}>
              💵<br />Espèces
            </div>
            <div style={{
              padding: '15px',
              background: 'white',
              borderRadius: '10px',
              border: '2px solid #2196F3'
            }}>
              💳<br />Carte bancaire
            </div>
            <div style={{
              padding: '15px',
              background: 'white',
              borderRadius: '10px',
              border: '2px solid #ff9500'
            }}>
              📝<br />Chèque
            </div>
          </div>
        </div>

        {/* Status de vérification */}
        <div style={{
          background: '#e3f2fd',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          {loading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #2196F3',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Vérification du statut du paiement en cours...
            </>
          ) : (
            '⏳ En attente de validation par un bénévole'
          )}
        </div>

        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#ff6b6b',
            color: 'white',
            borderRadius: '10px'
          }}>
            {error}
          </div>
        )}

        <button 
          onClick={handleContactVolunteer}
          style={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '10px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginRight: '15px',
            transition: 'all 0.3s ease'
          }}
        >
          🔔 Appeler un bénévole
        </button>

        <button 
          onClick={handleRetourAccueil}
          style={{
            background: 'linear-gradient(135deg, #6b73ff 0%, #000dff 100%)',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '10px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          🏠 Retour à l'accueil
        </button>

        {/* Debug info */}
        <div style={{ 
          marginTop: '20px', 
          fontSize: '0.8rem', 
          color: '#666',
          textAlign: 'center'
        }}>
          API: {API_BASE_URL}
        </div>

        {/* CSS Animation */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}