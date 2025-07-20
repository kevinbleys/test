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
      console.log('=== STARTING MEMBER VERIFICATION ===');
      console.log('Checking member:', nom, prenom);
      
      // Étape 1: Vérification de l'adhésion
      const checkResponse = await axios.get('http://localhost:4000/members/check', {
        params: { nom, prenom }
      });

      console.log('Member check response:', checkResponse.data);

      if (checkResponse.data.success) {
        // Membre valide et payé
        setMessage(checkResponse.data.message);
        playSuccessSound();
        
        console.log('=== MEMBER VALIDATED - REGISTERING PRESENCE ===');
        
        // Étape 2: KRITIEKE AANPASSING - Minimale data voor adherents
        const presenceData = {
          type: 'adherent',
          nom: nom.trim(),
          prenom: prenom.trim()
          // EXPLICIET: Geen andere velden voor adherents
        };
        
        console.log('Sending presence data:', presenceData);
        
        const presenceResponse = await axios.post('http://localhost:4000/presences', presenceData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Presence response:', presenceResponse.data);

        if (presenceResponse.data.success) {
          console.log('=== PRESENCE REGISTERED SUCCESSFULLY ===');
          console.log('Final presence object:', presenceResponse.data.presence);
          
          // Check if tarif was wrongly added
          if (presenceResponse.data.presence.tarif !== undefined) {
            console.error('ERROR: Tarif was added to adherent!', presenceResponse.data.presence.tarif);
          } else {
            console.log('SUCCESS: No tarif field in adherent presence');
          }
          
          setTimeout(() => {
            navigate('/confirmation');
          }, 2000);
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
        errorMessage = error.message;
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
