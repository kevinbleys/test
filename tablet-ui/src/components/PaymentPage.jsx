import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playSuccessSound, playBuzzerSound } from '../utils/soundUtils';

const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${protocol}//${hostname}:3001`;
  }
  return 'http://localhost:3001';
};

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  const [presenceInfo, setPresenceInfo] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state?.presenceId) {
      navigate('/');
      return;
    }

    const fetchPresenceInfo = async () => {
      try {
        const apiUrl = getApiBaseUrl();
        const response = await axios.get(`${apiUrl}/presences/${state.presenceId}`);

        if (response.data.success) {
          setPresenceInfo(response.data.presence);
          setPaymentStatus(response.data.presence.status);
        }
      } catch (err) {
        console.error('Failed to fetch presence info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPresenceInfo();

    const pollInterval = setInterval(async () => {
      try {
        const apiUrl = getApiBaseUrl();
        const response = await axios.get(`${apiUrl}/presences/${state.presenceId}`);

        if (response.data.success) {
          const newStatus = response.data.presence.status;

          // Handle payment success
          if (newStatus === 'Payé' && paymentStatus !== 'Payé') {
            playSuccessSound();
            setPaymentStatus(newStatus);

            setTimeout(() => {
              navigate('/', {
                state: {
                  successMessage: 'Paiement validé! Vous pouvez aller grimper. 🧗‍♀️',
                  paymentConfirmed: true
                }
              });
            }, 2000);
          }
          // Handle payment cancellation
          else if ((newStatus === 'Annulé' || newStatus === 'Cancelled') && paymentStatus !== 'Annulé' && paymentStatus !== 'Cancelled') {
            playBuzzerSound();
            setPaymentStatus(newStatus);

            setTimeout(() => {
              navigate('/', {
                state: {
                  errorMessage: 'Paiement annulé par le bénévole.',
                  paymentCancelled: true
                }
              });
            }, 2000);
          }
          else {
            setPaymentStatus(newStatus);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [state, navigate, paymentStatus]);

  if (loading) {
    return (
      <div className="payment-page">
        <div className="loading-message">
          <span className="loading-icon">⏳</span>
          Chargement des informations de paiement...
        </div>
      </div>
    );
  }

  if (!state?.presenceId) {
    return (
      <div className="payment-page">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          Erreur: Aucune information de paiement trouvée
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="header-section">
        <h2>Paiement</h2>
      </div>

      <div className="payment-info">
        <div className="participant-info">
          <h3>👤 Participant</h3>
          <div><strong>Nom:</strong> {state.nom || 'N/A'}</div>
          <div><strong>Prénom:</strong> {state.prenom || 'N/A'}</div>
          {state.age && <div><strong>Âge:</strong> {state.age} ans</div>}
          {state.tarifCategory && <div><strong>Catégorie:</strong> {state.tarifCategory}</div>}
        </div>

        <div className="amount-info">
          <h3>💰 Montant à régler</h3>
          <div className="amount-display">
            {(() => {
              const amount = state.montant ?? state.tarif ?? presenceInfo?.tarif ?? 0;
              return amount === 0 ? 'GRATUIT' : `${amount}€`;
            })()}
          </div>
          {/* ✅ REMOVED: Debug info no longer displayed */}
        </div>

        <div className="payment-status">
          {paymentStatus === 'pending' && (
            <div className="status-pending">
              <span className="status-icon">⏳</span>
              <div className="status-message">
                <strong>En attente de validation</strong>
                <p>Veuillez patienter qu'un bénévole valide votre paiement.</p>
                <p>La page se mettra à jour automatiquement.</p>
              </div>
            </div>
          )}

          {paymentStatus === 'Payé' && (
            <div className="status-paid">
              <span className="status-icon">✅</span>
              <div className="status-message">
                <strong>Paiement validé!</strong>
                <p>Vous pouvez maintenant aller grimper. 🧗‍♀️</p>
                <p>Redirection vers l'accueil...</p>
              </div>
            </div>
          )}

          {/* Cancellation status */}
          {(paymentStatus === 'Annulé' || paymentStatus === 'Cancelled') && (
            <div className="status-cancelled">
              <span className="status-icon">❌</span>
              <div className="status-message">
                <strong>Paiement annulé</strong>
                <p>Le bénévole a annulé la transaction.</p>
                <p>Redirection vers l'accueil...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="info-section">
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Rendez-vous à l'accueil pour effectuer le paiement</li>
          <li>Un bénévole validera votre paiement dans le système</li>
          <li>Cette page se mettra à jour automatiquement</li>
          <li>Vous serez redirigé vers l'accueil une fois validé ou annulé</li>
        </ol>
      </div>
    </div>
  );
}