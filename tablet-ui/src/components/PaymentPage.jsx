import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playSuccessSound, playBuzzerSound } from '../utils/soundUtils';

// ✅ FIXED: Dynamic API URL detection
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(state?.montant || 10);
  const [paymentMethod, setPaymentMethod] = useState('Espèces');

  useEffect(() => {
    const fetchPresenceInfo = async () => {
      if (state?.presenceId) {
        try {
          const API_BASE_URL = getApiBaseUrl(); // ✅ FIXED: Dynamic API URL
          console.log('🌐 PaymentPage using API URL:', API_BASE_URL);

          const res = await axios.get(`${API_BASE_URL}/presences/${state.presenceId}`);
          if (res.data.success) {
            setPresenceInfo(res.data.presence);
          }
        } catch (err) {
          console.error('Failed to fetch presence info:', err);
        }
      }
    };

    fetchPresenceInfo();
  }, [state]);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const API_BASE_URL = getApiBaseUrl(); // ✅ FIXED: Dynamic API URL

      const response = await axios.post(`${API_BASE_URL}/presences/${state.presenceId}/valider`, {
        montant: selectedAmount,
        methodePaiement: paymentMethod
      });

      if (response.data.success) {
        playSuccessSound();
        navigate('/success', {
          state: {
            type: 'payment',
            nom: state.nom,
            prenom: state.prenom,
            montant: selectedAmount,
            methodePaiement,
            message: 'Paiement validé avec succès'
          }
        });
      } else {
        setError(response.data.error || 'Erreur lors du paiement');
        playBuzzerSound();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(`Erreur de connexion. API: ${getApiBaseUrl()}`);
      playBuzzerSound();
    } finally {
      setLoading(false);
    }
  };

  if (!state?.presenceId) {
    return (
      <div className="payment-page">
        <div className="error-message">
          Erreur: Aucune information de paiement trouvée
        </div>
        <button onClick={() => navigate('/')}>
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="payment-page">
      {/* DEBUG INFO */}
      <div style={{padding: '10px', background: '#d4edda', marginBottom: '15px', borderRadius: '5px', fontSize: '12px'}}>
        <div><strong>🔧 PaymentPage DEBUG:</strong></div>
        <div>🌐 API URL: <strong>{getApiBaseUrl()}</strong></div>
        <div>📱 Host: <strong>{window.location.hostname}</strong></div>
      </div>

      <h2>Validation du Paiement</h2>

      <div className="payment-info">
        <h3>Informations</h3>
        <div><strong>Nom:</strong> {state.nom}</div>
        <div><strong>Prénom:</strong> {state.prenom}</div>
        {state.age && <div><strong>Âge:</strong> {state.age} ans</div>}
        {state.tarifCategory && <div><strong>Catégorie:</strong> {state.tarifCategory}</div>}
      </div>

      <div className="payment-form">
        <div className="form-group">
          <label>Montant (€):</label>
          <select
            value={selectedAmount}
            onChange={(e) => setSelectedAmount(Number(e.target.value))}
            disabled={loading}
          >
            <option value={0}>Gratuit</option>
            <option value={5}>5€</option>
            <option value={8}>8€</option>
            <option value={10}>10€</option>
            <option value={12}>12€</option>
            <option value={15}>15€</option>
          </select>
        </div>

        <div className="form-group">
          <label>Méthode de paiement:</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={loading}
          >
            <option value="Espèces">Espèces</option>
            <option value="Carte">Carte bancaire</option>
            <option value="Chèque">Chèque</option>
            <option value="Virement">Virement</option>
          </select>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="payment-buttons">
          <button 
            onClick={() => navigate('/')}
            disabled={loading}
            className="btn-secondary"
          >
            Annuler
          </button>

          <button 
            onClick={handlePayment}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Validation...' : `Valider ${selectedAmount}€`}
          </button>
        </div>
      </div>
    </div>
  );
}