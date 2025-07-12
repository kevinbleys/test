import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function NonMemberConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, nom, prenom, dateNaissance, tarif, methodePaiement } = location.state || {};
  
  const [status, setStatus] = useState('pending');
  
  useEffect(() => {
    if (!id) return;
    
    // Fonction pour vérifier le statut du paiement
    const checkPaymentStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/presences/${id}`);
        if (response.data.success) {
          const presenceStatus = response.data.presence.status;
          if (presenceStatus === 'Payé' || presenceStatus === 'Annulé') {
            setStatus(presenceStatus);
            // Rediriger vers la page d'accueil après 2 secondes
            setTimeout(() => {
              navigate('/');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
      }
    };
    
    // Vérifier le statut toutes les 2 secondes
    const intervalId = setInterval(checkPaymentStatus, 2000);
    
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
    <div className="confirmation-container">
      <div className="confirmation-card">
        {status === 'Payé' ? (
          <>
            <h2 className="success-title">Paiement validé !</h2>
            <p>Votre paiement a été validé avec succès.</p>
            <p>Vous allez être redirigé vers la page d'accueil...</p>
          </>
        ) : status === 'Annulé' ? (
          <>
            <h2 className="canceled-title">Paiement annulé</h2>
            <p>Votre paiement a été annulé.</p>
            <p>Vous allez être redirigé vers la page d'accueil...</p>
          </>
        ) : (
          <>
            <h2>En attente de validation</h2>
            <p>Votre demande a été enregistrée et est en attente de validation par un bénévole.</p>
            <p className="highlight-text">Veuillez vous présenter à l'accueil pour finaliser votre paiement.</p>
          </>
        )}
        
        <div className="info-box">
          <h3>Récapitulatif</h3>
          <div className="info-row"><span>Nom :</span><span>{nom}</span></div>
          <div className="info-row"><span>Prénom :</span><span>{prenom}</span></div>
          <div className="info-row"><span>Date de naissance :</span><span>{formatDate(dateNaissance)}</span></div>
          <div className="info-row"><span>Tarif :</span><span>{tarif === 0 ? 'Gratuit' : `${tarif}€`}</span></div>
          <div className="info-row"><span>Méthode de paiement :</span><span>{methodePaiement}</span></div>
        </div>
      </div>
    </div>
  );
}
