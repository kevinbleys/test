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
    // Rediriger vers le formulier si pas de données
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
      console.log('=== PAYMENT SELECTION FORM SUBMISSION ===');
      
      // **AANGEPASTE DATA STRUCTURE MET BETALINGSMETHODE**
      const presenceData = {
        type: 'non-adherent',
        nom: nom.trim(),
        prenom: prenom.trim(),
        dateNaissance,
        tarif,
        methodePaiement, // **NIEUWE VELD**
        // Extra velden uit het originele form
        email: location.state?.email || '',
        telephone: location.state?.telephone || '',
        adresse: location.state?.adresse || ''
      };
      
      console.log('Sending presence data with payment method:', presenceData);
      
      // Enregistrement d'une présence non-adhérent
      const presenceResponse = await axios.post('http://localhost:4000/presences', presenceData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Presence response:', presenceResponse.data);
      
      // Si l'enregistrement de présence a fonctionné
      if (presenceResponse.data.success) {
        console.log('=== PRESENCE WITH PAYMENT METHOD REGISTERED ===');
        console.log('Final presence object:', presenceResponse.data.presence);
        
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
      } else {
        setError("Erreur lors de l'enregistrement");
      }
    } catch (err) {
      console.error('=== ERROR IN PAYMENT SELECTION ===');
      console.error('Error details:', err);
      
      let errorMessage = "Erreur lors de l'enregistrement";
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = "Vérifiez votre connexion au serveur";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-selection">
      <div className="payment-header">
        <h2>Sélection du tarif et du mode de paiement</h2>
      </div>
      
      <div className="payment-body">
        <div className="user-info">
          <p><strong>Nom :</strong> {nom}</p>
          <p><strong>Prénom :</strong> {prenom}</p>
          <p><strong>Date de naissance :</strong> {new Date(dateNaissance).toLocaleDateString('fr-FR')}</p>
          <p><strong>Âge :</strong> {age} ans</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="tarif-section">
            <h3>Tarif applicable</h3>
            <div className="tarif-display">
              {tarif === 0 ? 'Gratuit' : `${tarif}€`}
            </div>
            <div className="tarif-info">
              {tarif === 0 && 'Entrée gratuite pour les enfants de moins de 6 ans.'}
              {tarif === 8 && 'Tarif réduit pour les mineurs (6-18 ans).'}
              {tarif === 10 && 'Tarif normal pour les adultes.'}
            </div>
          </div>
          
          <div className="payment-method-section">
            <h3>Méthode de paiement</h3>
            
            <div className="payment-options">
              <div className="payment-option">
                <input
                  type="radio"
                  id="cb"
                  name="methodePaiement"
                  value="CB"
                  checked={methodePaiement === 'CB'}
                  onChange={(e) => setMethodePaiement('CB')}
                  required
                />
                <label htmlFor="cb">Carte Bancaire</label>
              </div>
              
              <div className="payment-option">
                <input
                  type="radio"
                  id="cheque"
                  name="methodePaiement"
                  value="Cheque"
                  checked={methodePaiement === 'Cheque'}
                  onChange={(e) => setMethodePaiement('Cheque')}
                />
                <label htmlFor="cheque">Chèque</label>
              </div>
              
              <div className="payment-option">
                <input
                  type="radio"
                  id="especes"
                  name="methodePaiement"
                  value="Especes"
                  checked={methodePaiement === 'Especes'}
                  onChange={(e) => setMethodePaiement('Especes')}
                />
                <label htmlFor="especes">Espèces</label>
              </div>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/non-member')}
              disabled={loading}
            >
              Retour
            </button>
            
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !methodePaiement}
            >
              {loading ? 'Enregistrement...' : 'Confirmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
