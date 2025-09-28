import React from 'react';
import { useNavigate } from 'react-router-dom';
import { playSuccessSound } from '../utils/soundUtils';

export default function NonMemberTypePage() {
  const navigate = useNavigate();

  const handleFirstTime = () => {
    playSuccessSound();
    navigate('/non-member');
  };

  const handleReturning = () => {
    playSuccessSound();
    navigate('/quick-non-member');
  };

  const handleRetourAccueil = () => {
    navigate('/');
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
        maxWidth: '700px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          color: '#333', 
          marginBottom: '30px', 
          fontSize: '2rem', 
          fontWeight: '300' 
        }}>
          Inscription Non-Membre
        </h1>

        <p style={{
          fontSize: '1.2rem',
          marginBottom: '40px',
          color: '#666',
          lineHeight: '1.5'
        }}>
          Choisissez votre situation :
        </p>

        {/* Première inscription */}
        <div style={{
          marginBottom: '30px'
        }}>
          <button 
            onClick={handleFirstTime}
            style={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: 'white',
              border: 'none',
              padding: '30px 40px',
              borderRadius: '15px',
              fontSize: '1.3rem',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              maxWidth: '500px',
              marginBottom: '15px',
              transition: 'all 0.3s ease',
              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.3)';
            }}
          >
            ✨ C'est ma première inscription
          </button>
          <p style={{
            fontSize: '1rem',
            color: '#666',
            marginTop: '10px',
            fontStyle: 'italic'
          }}>
            Vous devrez remplir le formulaire complet
          </p>
        </div>

        {/* Déjà inscrit */}
        <div style={{
          marginBottom: '40px'
        }}>
          <button 
            onClick={handleReturning}
            style={{
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              color: 'white',
              border: 'none',
              padding: '30px 40px',
              borderRadius: '15px',
              fontSize: '1.3rem',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              maxWidth: '500px',
              marginBottom: '15px',
              transition: 'all 0.3s ease',
              boxShadow: '0 6px 20px rgba(33, 150, 243, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 8px 25px rgba(33, 150, 243, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.3)';
            }}
          >
            🔄 Je me suis déjà inscrit sur la tablette
          </button>
          <p style={{
            fontSize: '1rem',
            color: '#666',
            marginTop: '10px',
            fontStyle: 'italic'
          }}>
            Inscription rapide avec vos données sauvegardées
          </p>
        </div>

        {/* Retour bouton */}
        <button 
          onClick={handleRetourAccueil}
          style={{
            background: 'linear-gradient(135deg, #6b73ff 0%, #000dff 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 25px',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: '500',
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