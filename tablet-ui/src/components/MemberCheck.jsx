import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playBuzzerSound, playBellSound, playSuccessSound, preloadSounds } from '../utils/soundUtils';

export default function MemberCheck() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [benevoleCalled, setBenevoleCalled] = useState(false);
  const navigate = useNavigate();

  // Pré-charger les sons au chargement du composant
  useEffect(() => {
    preloadSounds();
  }, []);

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setBenevoleCalled(false);

    try {
      // Étape 1: Vérification de l'adhésion
      const checkResponse = await axios.get('http://localhost:4000/members/check', {
        params: { nom, prenom }
      });

      if (checkResponse.data.success) {
        // Membre valide et payé
        setMessage(checkResponse.data.message);
        
        // Jouer le son de succès (optionnel)
        playSuccessSound();
        
        // Étape 2: Enregistrement de la présence SANS tarif pour les adhérents valides
        const presenceResponse = await axios.post('http://localhost:4000/presences', {
          type: 'adherent',
          nom,
          prenom
          // BELANGRIJK: Geen tarif parameter voor adherents!
        });

        if (presenceResponse.data.success) {
          // Redirection après succès
          setTimeout(() => {
            navigate('/confirmation');
          }, 2000);
        } else {
          setError("Erreur lors de l'enregistrement de la présence");
          playBuzzerSound();
        }
      } else {
        // Membre non valide ou non payé - JOUER LE BUZZER
        const errorMessage = checkResponse.data.error || "Adhésion non valide";
        setError(errorMessage);
        
        // Jouer le son buzzer pour les erreurs
        playBuzzerSound();
      }

    } catch (error) {
      console.error('Erreur:', error);
      let errorMessage = "Erreur de connexion";
      
      if (error.response?.status === 404) {
        errorMessage = "Aucun membre trouvé avec ce nom et prénom";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Jouer le son buzzer pour toutes les erreurs
      playBuzzerSound();
    } finally {
      setLoading(false);
    }
  };

  const handleAppelerBenevole = () => {
    // Jouer le son de cloche
    playBellSound();
    
    // Marquer que le bénévole a été appelé
    setBenevoleCalled(true);
    
    // Afficher un message de confirmation
    setMessage("Un bénévole va arriver pour vous aider !");
    
    // Effacer le message après 5 secondes
    setTimeout(() => {
      if (benevoleCalled) {
        setMessage('');
        setBenevoleCalled(false);
      }
    }, 5000);
  };

  const handleRetourAccueil = () => {
    // Effacer les champs et messages avant de revenir à l'accueil
    setNom('');
    setPrenom('');
    setError('');
    setMessage('');
    setLoading(false);
    setBenevoleCalled(false);
    
    // Naviguer vers la page d'accueil
    navigate('/');
  };

  return (
    <div className="member-check">
      <div className="header-section">
        <h2>Vérification d'adhésion</h2>
        <div className="header-buttons">
          <button 
            type="button" 
            className="btn-appeler-benevole"
            onClick={handleAppelerBenevole}
            disabled={loading}
          >
            🔔 Appeler un bénévole
          </button>
          <button 
            type="button" 
            className="btn-retour-accueil"
            onClick={handleRetourAccueil}
            disabled={loading}
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
      
      <form onSubmit={handleVerification}>
        <div className="form-group">
          <label>Nom</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Prénom</label>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" disabled={loading} className="btn-verify">
          {loading ? 'Vérification...' : 'Vérifier'}
        </button>
      </form>
      
      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          {error}
        </div>
      )}
      
      {message && (
        <div className={benevoleCalled ? "benevole-message" : "success-message"}>
          <div className="success-icon">
            {benevoleCalled ? "🔔" : "✅"}
          </div>
          {message}
        </div>
      )}
    </div>
  );
}
