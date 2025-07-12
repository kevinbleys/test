import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MemberCheck() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const attempts = location.state?.attempts || 0;

  const playSound = (soundPath) => {
    const audio = new Audio(soundPath);
    audio.play().catch((error) => {
      console.error('Erreur lors de la lecture du son :', error);
    });
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/check-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prenom })
      });

      if (response.ok) {
        playSound('/assets/correct.mp3'); // Son "correct"
        navigate('/confirmation');
      } else {
        playSound('/assets/buzzer.mp3'); // Son "buzzer"
        navigate('/error', { state: { attempts: attempts + 1, message: 'Membre non trouvé' } });
      }
    } catch (error) {
      playSound('/assets/buzzer.mp3'); // Son "buzzer" pour erreur
      navigate('/error', { state: { attempts: attempts + 1, message: 'Erreur de connexion au serveur' } });
    }
  };

  return (
    <div className="member-check">
      <h2>Vérification d'adhésion</h2>
      <form onSubmit={handleVerification}>
        <input
          type="text"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          required
        />
        <button type="submit">Vérifier</button>
      </form>
      <button onClick={() => navigate('/')}>Retour à l'accueil</button>
    </div>
  );
}
