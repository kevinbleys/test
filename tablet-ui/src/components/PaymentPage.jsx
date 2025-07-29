import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playBellSound, playSuccessSound } from '../utils/soundUtils';

export default function PaymentPage() {
  const { state } = useLocation();           // presenceId + montant
  const navigate  = useNavigate();
  const [mode, setMode]   = useState('');
  const [error, setError] = useState('');

  // Poll elke 4 s of de betaling is gevalideerd
  useEffect(() => {
    if (!state?.presenceId) return navigate('/');

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:4000/presences/${state.presenceId}`);
        if (res.data.success && ['Payé', 'Pay'].includes(res.data.presence.status)) {
          playSuccessSound();
          clearInterval(interval);
          setTimeout(() => navigate('/'), 1500);
        }
      } catch { /* stilhouden */ }
    }, 4000);

    return () => clearInterval(interval);
  }, [state, navigate]);

  const selectMode = m => {
    setMode(m);
    playBellSound();
  };

  if (!state?.presenceId) return null;

  return (
    <div className="payment-page">
      <h2>Montant à régler : <span className="amount">{state.montant} €</span></h2>

      <h3>Choisissez votre mode de paiement :</h3>
      <div className="btn-group">
        {['Cash','Chèque','CB'].map(m => (
          <button key={m}
                  onClick={() => selectMode(m)}
                  className={mode === m ? 'selected-btn' : 'pay-btn'}>
            {m}
          </button>
        ))}
      </div>

      {mode && <p className="info">Un bénévole va confirmer votre paiement <strong>{mode}</strong>.</p>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
