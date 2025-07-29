import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playBellSound, playSuccessSound } from '../utils/soundUtils';

export default function PaymentPage() {
  const { state } = useLocation();                 // bevat presenceId + montant
  const navigate   = useNavigate();
  const [mode, setMode] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [error, setError]   = useState('');

  // Poll elke 4 s of de vrijwilliger betaling heeft gevalideerd
  useEffect(() => {
    if (!state?.presenceId) navigate('/');         // safety-net

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:4000/presences/${state.presenceId}`);
        if (res.data.success && (res.data.presence.status === 'Payé' || res.data.presence.status === 'Pay')) {
          playSuccessSound();
          clearInterval(interval);
          setTimeout(() => navigate('/'), 1500);    // terug naar accueil
        }
      } catch (_) {/* stilhouden */}
    }, 4000);

    return () => clearInterval(interval);
  }, [state, navigate]);

  const handleSelect = m => setMode(m);

  /* pure UI, betaling wordt op backend bevestigd door vrijwilliger */
  return (
    <div className="payment-page">
      <h2>Montant à régler : <span className="amount">{state?.montant || 10} €</span></h2>

      <h3>Choisissez votre mode de paiement :</h3>
      <div className="btn-group">
        {['Cash', 'Chèque', 'CB'].map(m => (
          <button key={m} onClick={() => handleSelect(m)} className={mode===m?'selected-btn':'pay-btn'}>
            {m}
          </button>
        ))}
      </div>

      {mode && (
        <div className="info">
          Merci ! Veuillez appeler un bénévole pour confirmer le paiement <strong>{mode}</strong>.
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
