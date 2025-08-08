import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playBellSound, playSuccessSound } from '../utils/soundUtils';

export default function PaymentPage() {
  const { state } = useLocation(); // presenceId + montant
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [presenceData, setPresenceData] = useState(null);
  const [isValidated, setIsValidated] = useState(false);

  // Poll elke 4 s of de betaling is gevalideerd
  useEffect(() => {
    if (!state?.presenceId) return navigate('/');

    const checkPaymentStatus = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/presences/${state.presenceId}`);
        if (res.data.success) {
          setPresenceData(res.data.presence);
          
          if (['Payé', 'Pay'].includes(res.data.presence.status)) {
            if (!isValidated) {
              setIsValidated(true);
              playSuccessSound();
              setTimeout(() => navigate('/'), 2000);
            }
          }
        }
      } catch (error) {
        console.error('Erreur vérification statut:', error);
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
    // Optionnel: ajouter une logique pour notifier les bénévoles
  };

  if (!state?.presenceId) return null;

  // Si le paiement est validé
  if (isValidated || presenceData?.status === 'Payé' || presenceData?.status === 'Pay') {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '32px', marginBottom: '15px' }}>
            ✅ Paiement validé !
          </h2>
          <p style={{ fontSize: '18px' }}>
            Votre paiement de <strong>{state.montant}€</strong> a été confirmé.
          </p>
          {presenceData?.methodePaiement && (
            <p style={{ fontSize: '16px', marginTop: '10px' }}>
              Mode de paiement : <strong>{presenceData.methodePaiement}</strong>
            </p>
          )}
        </div>
        
        <p style={{ color: '#666', fontSize: '16px' }}>
          Redirection automatique vers la page d'accueil...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>
          💰 Montant à régler : {state.montant}€
        </h2>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          En attente de validation par un bénévole
        </p>
      </div>

      {/* **SECTION SIMPLIFIÉE - PAS DE SÉLECTION DE MODE** */}
      <div style={{
        background: '#e3f2fd',
        border: '2px solid #2196f3',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '30px'
      }}>
        <h3 style={{ color: '#1976d2', marginBottom: '20px', textAlign: 'center' }}>
          🏪 Présentez-vous à l'accueil
        </h3>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ color: '#1565c0', marginBottom: '15px', fontSize: '16px' }}>
            Un bénévole va vous aider à finaliser votre paiement avec l'un des modes suivants :
          </p>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            flexWrap: 'wrap', 
            gap: '15px',
            marginTop: '20px'
          }}>
            <div style={{ 
              padding: '15px 20px', 
              background: '#28a745', 
              color: 'white', 
              borderRadius: '8px', 
              minWidth: '100px',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>💵</div>
              <div style={{ fontWeight: 'bold' }}>Espèces</div>
            </div>
            <div style={{ 
              padding: '15px 20px', 
              background: '#007bff', 
              color: 'white', 
              borderRadius: '8px', 
              minWidth: '100px',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>💳</div>
              <div style={{ fontWeight: 'bold' }}>Carte bancaire</div>
            </div>
            <div style={{ 
              padding: '15px 20px', 
              background: '#ffc107', 
              color: 'black', 
              borderRadius: '8px', 
              minWidth: '100px',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>📝</div>
              <div style={{ fontWeight: 'bold' }}>Chèque</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <button
            onClick={handleContactVolunteer}
            style={{
              background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(23, 162, 184, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(23, 162, 184, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(23, 162, 184, 0.3)';
            }}
          >
            🔔 Appeler un bénévole
          </button>
        </div>
      </div>

      {/* Status de vérification */}
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        border: '1px solid #dee2e6'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #ffc107',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 15px'
        }}></div>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
          Vérification du statut du paiement en cours...
        </p>
      </div>

      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '8px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
