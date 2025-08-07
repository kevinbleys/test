import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function NonMemberConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, nom, prenom, dateNaissance, tarif } = location.state || {};
  
  const [status, setStatus] = useState('pending');
  const [presenceData, setPresenceData] = useState(null);
  
  useEffect(() => {
    if (!id) return;
    
    // Fonction pour vérifier le statut du paiement
    const checkPaymentStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/presences/${id}`);
        if (response.data.success) {
          const presence = response.data.presence;
          setPresenceData(presence);
          
          const presenceStatus = presence.status;
          if (presenceStatus === 'Payé' || presenceStatus === 'Annulé') {
            setStatus(presenceStatus);
            // Rediriger vers la page d'accueil après 3 secondes
            setTimeout(() => {
              navigate('/');
            }, 3000);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
      }
    };
    
    // Vérifier le statut toutes les 2 secondes
    const intervalId = setInterval(checkPaymentStatus, 2000);
    
    // Vérification initiale
    checkPaymentStatus();
    
    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, [id, navigate]);
  
  // Rediriger si les données sont manquantes
  if (!id || !nom || !prenom) {
    navigate('/non-member');
    return null;
  }
  
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {status === 'Payé' ? (
        <>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ color: '#28a745', fontSize: '32px', marginBottom: '15px' }}>
              ✅ Paiement validé !
            </h2>
            <p style={{ fontSize: '18px', color: '#666' }}>
              Votre paiement a été validé avec succès.
            </p>
            <p style={{ fontSize: '16px', color: '#666' }}>
              Vous allez être redirigé vers la page d'accueil...
            </p>
          </div>
        </>
      ) : status === 'Annulé' ? (
        <>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ color: '#dc3545', fontSize: '32px', marginBottom: '15px' }}>
              ❌ Paiement annulé
            </h2>
            <p style={{ fontSize: '18px', color: '#666' }}>
              Votre paiement a été annulé.
            </p>
            <p style={{ fontSize: '16px', color: '#666' }}>
              Vous allez être redirigé vers la page d'accueil...
            </p>
          </div>
        </>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ color: '#ffc107', fontSize: '32px', marginBottom: '15px' }}>
              ⏳ En attente de validation
            </h2>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
              Votre demande a été enregistrée et est en attente de validation par un bénévole.
            </p>
            <p style={{ fontSize: '16px', color: '#666', fontWeight: 'bold' }}>
              Veuillez vous présenter à l'accueil pour finaliser votre paiement.
            </p>
          </div>
          
          {/* **NOUVELLE SECTION: Instructions de paiement** */}
          <div style={{
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            border: '2px solid #2196f3',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>💳 Modes de paiement acceptés</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ padding: '10px', background: '#28a745', color: 'white', borderRadius: '6px', minWidth: '80px' }}>
                💵 Espèces
              </div>
              <div style={{ padding: '10px', background: '#007bff', color: 'white', borderRadius: '6px', minWidth: '80px' }}>
                💳 CB
              </div>
              <div style={{ padding: '10px', background: '#ffc107', color: 'black', borderRadius: '6px', minWidth: '80px' }}>
                📝 Chèque
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Récapitulatif */}
      <div style={{
        background: '#f8f9fa',
        padding: '25px',
        borderRadius: '12px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>📋 Récapitulatif</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
            <strong>Nom :</strong>
            <span>{nom}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
            <strong>Prénom :</strong>
            <span>{prenom}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
            <strong>Date de naissance :</strong>
            <span>{formatDate(dateNaissance)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
            <strong>Tarif :</strong>
            <span style={{ 
              color: tarif === 0 ? '#28a745' : '#333',
              fontWeight: 'bold'
            }}>
              {tarif === 0 ? 'Gratuit' : `${tarif}€`}
            </span>
          </div>
          
          {/* **NOUVELLE LIGNE: Méthode de paiement (si disponible)** */}
          {presenceData?.methodePaiement && (
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
              <strong>Mode de paiement :</strong>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                background: presenceData.methodePaiement === 'Especes' ? '#28a745' : 
                           presenceData.methodePaiement === 'CB' ? '#007bff' : '#ffc107',
                color: presenceData.methodePaiement === 'Cheque' ? 'black' : 'white'
              }}>
                {presenceData.methodePaiement}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Loading indicator pour en attente */}
      {status === 'pending' && (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #ffc107',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '15px', color: '#666', fontSize: '14px' }}>
            Vérification du statut en cours...
          </p>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
