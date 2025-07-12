import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { playBellSound } from '../utils/sound';

export default function ErrorScreen() {
  const navigate = useNavigate();
  const { state } = useLocation(); // Récupère les données transmises via navigate
  const attempts = state?.attempts || 0; // Nombre actuel de tentatives
  const maxAttempts = 1; // Limite maximale de tentatives

  const playBellSound = () => {
    const audio = new Audio('/assets/bell.mp3'); // Chemin vers le fichier audio
    audio.play();
  };

  const handleRetry = () => {
    if (attempts < maxAttempts) {
      navigate('/member-check', { state: { attempts: attempts + 1 } }); // Incrémente les tentatives
    }
  };

  return (
    <div className="error-screen">
      <div className="red-message">
        <h2>❌ Accès refusé</h2>
        <p>{state?.message || "Nous n'avons pas trouvé votre nom dans notre liste."}</p>
        <p>Tentatives restantes : {maxAttempts - attempts}</p>
      </div>

      <div className="button-group">
        {attempts < maxAttempts ? (
          <button onClick={handleRetry}>Réessayer</button>
        ) : (
    <button 
      className="emergency-button"
      onClick={() => {
        playBellSound(); // Utilisation directe
        }}
    >
      🆘 Appeler un bénévole
    </button>
        )}
        <button onClick={() => navigate('/')}>Retour à l'accueil</button>
      </div>
    </div>
  );
}
