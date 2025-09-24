import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSuccessSound } from '../utils/soundUtils';

export default function Confirmation() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(6); // 6 seconden zoals gewenst (5-6 seconden)

  useEffect(() => {
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

    return () => clearInterval(countdownTimer);
  }, [navigate]);

  const handleRetourAccueil = () => {
    navigate('/');
  };

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

        {/* Hoofdbevestiging */}
        <h1 style={{ 
          color: '#2e7d32', 
          marginBottom: '25px', 
          fontSize: '2.5rem', 
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Adhésion Reconnue !
        </h1>

        <p style={{ 
          fontSize: '1.4rem', 
          marginBottom: '25px', 
          color: '#333',
          fontWeight: '500' 
        }}>
          Votre enregistrement est terminé avec succès.
        </p>

        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '30px', 
          color: '#2e7d32',
          fontWeight: '600' 
        }}>
          Bienvenue au club ! 🧗‍♀️
        </p>

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

        {/* Extra bevestigingsbericht */}
        <p style={{ 
          marginTop: '30px', 
          fontSize: '1rem', 
          color: '#666',
          fontStyle: 'italic' 
        }}>
          Votre adhésion a été vérifiée dans notre base de données.
        </p>
      </div>
    </div>
  );
}