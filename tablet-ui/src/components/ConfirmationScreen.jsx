import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ConfirmationScreen() {
  const navigate = useNavigate();
  const [correctSound] = useState(new Audio('/assets/correct.mp3'));

  useEffect(() => {
    // Jouer le son de confirmation au chargement du composant
    try {
      correctSound.play().catch(err => {
        console.error("Erreur lecture audio:", err);
      });
    } catch (error) {
      console.error("Erreur avec l'audio:", error);
    }

    // Cleanup function
    return () => {
      correctSound.pause();
      correctSound.currentTime = 0;
    };
  }, [correctSound]);

  return (
    <div className="confirmation-screen">
      <div className="confirmation-content">
        <h1>✅ Adhésion confirmée !</h1>
        <p>Votre statut de membre a été vérifié avec succès.</p>
        <p>Vous pouvez accéder à la salle d'escalade.</p>
        
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
