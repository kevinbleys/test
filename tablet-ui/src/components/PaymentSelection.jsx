import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PaymentSelection.css';

export default function PaymentSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { nom, prenom, dateNaissance, age, tarif } = location.state || {};
  
  const [methodePaiement, setMethodePaiement] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Vérifier si des données ont été passées
  if (!nom || !prenom || !dateNaissance) {
    // Rediriger vers le formulaire si pas de données
    navigate('/non-member');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!methodePaiement) {
      setError("Veuillez sélectionner une méthode de paiement");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Enregistrement d'une présence non-adhérent
      const presenceResponse = await axios.post('http://localhost:4000/presences', {
        type: 'non-adherent',
        nom,
        prenom,
        dateNaissance,
        tarif,
        methodePaiement
      });
      
      // Si l'enregistrement de présence a fonctionné
      if (presenceResponse.data.success) {
        // Redirection vers la page de confirmation
        navigate('/non-member-confirmation', { 
          state: { 
            id: presenceResponse.data.presence.id,
            nom, 
            prenom, 
            dateNaissance, 
            tarif, 
            methodePaiement 
          } 
        });
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError("Erreur lors de l'enregistrement. Vérifiez votre connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-selection">
      <h2>Sélection du tarif et du mode de paiement</h2>
      
      <div className="user-info">
        <p><strong>Nom :</strong> {nom}</p>
        <p><strong>Prénom :</strong> {prenom}</p>
        <p><strong>Date de naissance :</strong> {new Date(dateNaissance).toLocaleDateString('fr-FR')}</p>
        <p><strong>Âge :</strong> {age} ans</p>
      </div>
      
      <div className="tarif-box">
        <h3>Tarif applicable</h3>
        <div className="tarif-amount">
          {tarif === 0 ? 'Gratuit' : `${tarif}€`}
        </div>
        <p className="tarif-explanation">
          {tarif === 0 && 'Entrée gratuite pour les enfants de moins de 6 ans.'}
          {tarif === 8 && 'Tarif réduit pour les mineurs (6-18 ans).'}
          {tarif === 10 && 'Tarif normal pour les adultes.'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="payment-methods">
          <h3>Méthode de paiement</h3>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="methodePaiement"
                value="CB"
                checked={methodePaiement === 'CB'}
                onChange={() => setMethodePaiement('CB')}
                required
              />
              Carte Bancaire
            </label>
            <label>
              <input
                type="radio"
                name="methodePaiement"
                value="Cheque"
                checked={methodePaiement === 'Cheque'}
                onChange={() => setMethodePaiement('Cheque')}
              />
              Chèque
            </label>
            <label>
              <input
                type="radio"
                name="methodePaiement"
                value="Especes"
                checked={methodePaiement === 'Especes'}
                onChange={() => setMethodePaiement('Especes')}
              />
              Espèces
            </label>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="buttons-container">
          <button 
            type="button" 
            className="back-button"
            onClick={() => navigate('/non-member')}
          >
            Retour
          </button>
          <button 
            type="submit" 
            className="continue-button" 
            disabled={loading || !methodePaiement}
          >
            {loading ? 'Traitement...' : 'Continuer'}
          </button>
        </div>
      </form>
    </div>
  );
}
