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

          if (newStatus === 'Payé' && paymentStatus !== 'Payé') {
            playSuccessSound();
            setPaymentStatus(newStatus);

            // ✅ FEATURE 3: Enhanced success - longer display time (10 seconds)
            setTimeout(() => {
              navigate('/', {
                state: {
                  successMessage: '🎉 Paiement validé avec succès !\n\n✅ Votre session d\'escalade est confirmée\n🧗‍♀️ Équipez-vous et amusez-vous bien !\n\n🎯 Bonne grimpe !',
                  paymentConfirmed: true
                }
              });
            }, 10000); // Increased to 10 seconds

          } else if ((newStatus === 'Annulé' || newStatus === 'Cancelled') && paymentStatus !== 'Annulé' && paymentStatus !== 'Cancelled') {
            playBuzzerSound();
            setPaymentStatus(newStatus);

            setTimeout(() => {
              navigate('/', {
                state: {
                  errorMessage: '❌ Paiement annulé par le bénévole.\n\nContactez l\'accueil si vous avez des questions.',
                  paymentCancelled: true
                }
              });
            }, 4000);
          } else {
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
        <h2>💳 Paiement</h2>
      </div>

      <div className="payment-info">
        <div className="participant-info">
          <h3>👤 Participant</h3>
          <div><strong>Nom:</strong> {state.nom || 'N/A'}</div>
          <div><strong>Prénom:</strong> {state.prenom || 'N/A'}</div>
          {state.age && <div><strong>Catégorie:</strong> {state.tarifCategory || state.age}</div>}

          {/* Enhanced info for returning visitors */}
          {state.isReturningVisitor && (
            <div className="returning-visitor-info">
              <div><strong>🔄 Visiteur récurrent</strong></div>
              <div>Visite n° {state.previousVisits || 'N/A'}</div>
              {state.lastVisit && (
                <div>Dernière visite: {new Date(state.lastVisit).toLocaleDateString('fr-FR')}</div>
              )}
            </div>
          )}
        </div>

        <div className="amount-info">
          <h3>💰 Montant à régler</h3>
          <div className="amount-display">
            {(() => {
              // ✅ FIXED: Better tariff display logic
              const amount = state.montant || state.tarif || presenceInfo?.tarif || 0;
              return amount === 0 ? '🆓 GRATUIT' : `💶 ${amount}€`;
            })()}
          </div>
          {state.tarifCategory && (
            <div className="tarif-category">
              {state.tarifCategory}
            </div>
          )}
        </div>

        <div className="payment-status">
          {paymentStatus === 'pending' && (
            <div className="status-pending">
              <span className="status-icon">⏳</span>
              <div className="status-message">
                <strong>En attente de validation</strong>
                <p>Rendez-vous à l'accueil pour effectuer le paiement.</p>
                <p>Un bénévole validera votre paiement dans le système.</p>
                <p>Cette page se mettra à jour automatiquement.</p>
              </div>
            </div>
          )}

          {paymentStatus === 'Payé' && (
            <div className="status-paid-enhanced">
              <div className="success-animation">🎉</div>
              <div className="status-message">
                <h3>🎉 Paiement validé avec succès !</h3>
                <div className="success-details">
                  <p><strong>✅ Votre session d'escalade est confirmée !</strong></p>
                  <p>🧗‍♀️ Équipez-vous et amusez-vous bien !</p>

                  <div className="access-info">
                    <div>🎯 Accès autorisé à toutes les voies</div>
                    <div>🥾 Matériel disponible à l'accueil</div>
                    <div>🤝 N'hésitez pas à demander de l'aide si besoin</div>
                  </div>

                  <p><strong>Bonne grimpe ! 🎉</strong></p>
                </div>

                <div className="countdown">
                  <div className="countdown-bar"></div>
                  Redirection vers l'accueil dans quelques secondes...
                </div>
              </div>
            </div>
          )}

          {(paymentStatus === 'Annulé' || paymentStatus === 'Cancelled') && (
            <div className="status-cancelled">
              <span className="status-icon">❌</span>
              <div className="status-message">
                <strong>Paiement annulé</strong>
                <p>Le bénévole a annulé la transaction.</p>
                <p>Contactez l'accueil pour plus d'informations.</p>
                <p>Redirection vers l'accueil...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="info-section">
        <h4>📋 Instructions:</h4>
        <ol>
          <li><strong>Rendez-vous à l'accueil</strong> pour effectuer le paiement</li>
          <li><strong>Montrez cette page</strong> au bénévole si nécessaire</li>
          <li><strong>Le bénévole validera</strong> votre paiement dans le système</li>
          <li><strong>Cette page se mettra à jour</strong> automatiquement</li>
          <li><strong>Vous serez redirigé</strong> vers l'accueil une fois validé</li>
        </ol>
      </div>
    </div>
  );
}