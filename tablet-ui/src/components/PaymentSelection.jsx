import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PaymentSelection.css';

export default function PaymentSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { nom, prenom, dateNaissance, age, tarif, tarifDescription, tarifCategory } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Vérifier si des données ont été passées
  if (!nom || !prenom || !dateNaissance || age === undefined || tarif === undefined) {
    // Rediriger vers le formulaire si pas de données
    navigate('/non-member');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    
    try {
      console.log('=== PAYMENT CONFIRMATION SUBMISSION ===');
      console.log('Calculated tarif:', tarif);
      console.log('Age:', age);
      console.log('Category:', tarifCategory);
      
      // **DATA STRUCTURE WITH CALCULATED TARIF**
      const presenceData = {
        type: 'non-adherent',
        nom: nom.trim(),
        prenom: prenom.trim(),
        dateNaissance,
        tarif, // **CALCULATED TARIF BASED ON AGE**
        // Pas de methodePaiement - sera défini par l'admin
        // Extra velden uit het originele form
        email: location.state?.email || '',
        telephone: location.state?.telephone || '',
        adresse: location.state?.adresse || ''
      };
      
      console.log('Sending presence data with calculated tarif:', presenceData);
      
      // Enregistrement d'une présence non-adhérent
      const presenceResponse = await axios.post('http://localhost:4000/presences', presenceData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Presence response:', presenceResponse.data);
      
      // Si l'enregistrement de présence a fonctionné
      if (presenceResponse.data.success) {
        console.log('=== PRESENCE REGISTERED WITH CALCULATED TARIF ===');
        console.log('Final presence object:', presenceResponse.data.presence);
        
        // Redirection vers la page de confirmation
        navigate('/non-member-confirmation', { 
          state: { 
            id: presenceResponse.data.presence.id,
            nom, 
            prenom, 
            dateNaissance, 
            age,
            tarif,
            tarifDescription,
            tarifCategory
            // Pas de methodePaiement
          } 
        });
      } else {
        setError("Erreur lors de l'enregistrement");
      }
    } catch (err) {
      console.error('=== ERROR IN PAYMENT CONFIRMATION ===');
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

  const getTarifDisplayColor = () => {
    switch (tarifCategory) {
      case 'enfant': return { bg: '#28a745', color: 'white' };
      case 'mineur': return { bg: '#ffc107', color: 'black' };
      case 'adulte': return { bg: '#007bff', color: 'white' };
      default: return { bg: '#6c757d', color: 'white' };
    }
  };

  const tarifColors = getTarifDisplayColor();

  return (
    <div className="payment-selection">
      <div className="payment-header">
        <h2>Confirmation du tarif</h2>
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
            <div 
              className="tarif-display"
              style={{
                background: `linear-gradient(135deg, ${tarifColors.bg} 0%, ${tarifColors.bg}dd 100%)`,
                color: tarifColors.color
              }}
            >
              {tarif === 0 ? 'GRATUIT' : `${tarif}€`}
            </div>
            <div className="tarif-info">
              <strong>{tarifDescription}</strong>
            </div>
            
            {/* **BREAKDOWN DES TARIFS** */}
            <div style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              marginTop: '15px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ marginBottom: '10px', color: '#495057' }}>📋 Grille tarifaire:</h4>
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>👶 Moins de 8 ans:</span>
                  <strong style={{ color: '#28a745' }}>GRATUIT</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>🧑 De 8 à 17 ans:</span>
                  <strong style={{ color: '#ffc107' }}>8€</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>👨 18 ans et plus:</span>
                  <strong style={{ color: '#007bff' }}>10€</strong>
                </div>
              </div>
            </div>
          </div>
          
          {/* **SECTION SIMPLIFIÉE - PAS DE CHOIX DE PAIEMENT** */}
          <div className="payment-info-section">
            <div className="info-box">
              <h3>💳 Mode de paiement</h3>
              <p>Le mode de paiement sera choisi avec un bénévole à l'accueil.</p>
              <p><strong>Modes acceptés :</strong> Espèces, Carte bancaire, Chèque</p>
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
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Confirmer et continuer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
