import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${protocol}//${hostname}:3001`;
  }
  return 'http://localhost:3001';
};

export default function AssurancePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { nom, prenom, dateNaissance, email, telephone, niveau } = location.state || {};

  const [assuranceAccepted, setAssuranceAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ FIXED: Calculate tariff on frontend for immediate display
  const calculateTarif = (dateNaissance) => {
    if (!dateNaissance) return 12;

    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) return 8;      // Jeune
    if (age < 26) return 10;     // Étudiant  
    if (age >= 65) return 10;    // Senior
    return 12;                   // Adulte
  };

  const getTarifCategory = (dateNaissance) => {
    if (!dateNaissance) return 'Adulte (26-64 ans)';

    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) return `Jeune (${age} ans)`;
    if (age < 26) return `Étudiant (${age} ans)`;
    if (age >= 65) return `Senior (${age} ans)`;
    return `Adulte (${age} ans)`;
  };

  // ✅ FIXED: Calculate tariff immediately
  const tarif = calculateTarif(dateNaissance);
  const tarifCategory = getTarifCategory(dateNaissance);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!assuranceAccepted) {
      setError('Vous devez accepter les conditions d\'assurance pour continuer');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = getApiBaseUrl();

      // ✅ FIXED: Use enhanced endpoint with proper tariff calculation
      const presenceData = {
        type: 'non-adherent',
        nom,
        prenom,
        dateNaissance,
        email,
        telephone,
        niveau,
        assuranceAccepted,
        // ✅ DON'T pass tarif - let backend calculate it
      };

      console.log('🔄 Creating presence with data:', presenceData);

      const response = await axios.post(`${apiUrl}/presences-enhanced`, presenceData, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const presence = response.data.presence;

        console.log('✅ Presence created:', presence);
        console.log('💰 Calculated tariff:', presence.tarif);

        // Navigate to payment with backend-calculated tariff
        navigate('/paiement', {
          state: {
            presenceId: presence.id,
            montant: presence.tarif, // ✅ Use backend-calculated tarif
            tarif: presence.tarif,
            nom: presence.nom,
            prenom: presence.prenom,
            age: presence.tarifCategory,
            tarifCategory: presence.tarifCategory,
            niveau: presence.niveau
          }
        });
      } else {
        setError(response.data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (err) {
      console.error('Error creating presence:', err);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetourAccueil = () => {
    navigate('/');
  };

  const handleRetour = () => {
    navigate(-1);
  };

  // Don't render if missing required data
  if (!nom || !prenom || !dateNaissance) {
    return (
      <div className="assurance-page">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          Données manquantes. Veuillez recommencer l'inscription.
        </div>
        <button onClick={handleRetourAccueil} className="btn-retour-accueil">
          🏠 Retour Accueil
        </button>
      </div>
    );
  }

  return (
    <div className="assurance-page">
      <div className="header-section">
        <h2>Assurance & Finalisation</h2>
        <div className="header-buttons">
          <button onClick={handleRetourAccueil} className="btn-retour-accueil">
            🏠 Retour Accueil
          </button>
        </div>
      </div>

      <div className="summary-info">
        <h3>📋 Récapitulatif de votre inscription</h3>
        <div className="info-grid">
          <div><strong>Nom:</strong> {nom}</div>
          <div><strong>Prénom:</strong> {prenom}</div>
          <div><strong>Date de naissance:</strong> {new Date(dateNaissance).toLocaleDateString('fr-FR')}</div>
          <div><strong>Email:</strong> {email || 'Non renseigné'}</div>
          <div><strong>Téléphone:</strong> {telephone || 'Non renseigné'}</div>
          <div><strong>Niveau:</strong> {niveau}</div>
        </div>

        {/* ✅ FIXED: Show calculated tariff immediately */}
        <div className="tarif-display">
          <div className="tarif-amount">💰 Tarif: <strong>{tarif}€</strong></div>
          <div className="tarif-category">📊 Catégorie: {tarifCategory}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="assurance-section">
          <h3>📄 Conditions d'assurance</h3>
          <div className="assurance-text">
            <p>En cochant cette case, je déclare :</p>
            <ul>
              <li>Être en bonne santé physique pour pratiquer l'escalade</li>
              <li>Pratiquer cette activité sous ma propre responsabilité</li>
              <li>Avoir pris connaissance des règles de sécurité</li>
              <li>Accepter que le club ne puisse être tenu responsable des accidents</li>
            </ul>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={assuranceAccepted}
                onChange={(e) => setAssuranceAccepted(e.target.checked)}
                disabled={loading}
              />
              <span className="checkmark"></span>
              J'accepte les conditions d'assurance et de responsabilité
            </label>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="action-buttons">
          <button 
            type="button"
            onClick={handleRetour}
            className="btn-retour-accueil"
            disabled={loading}
          >
            ← Retour
          </button>

          <button 
            type="submit" 
            className="btn-continue"
            disabled={loading || !assuranceAccepted}
          >
            {loading ? '⏳ Enregistrement...' : `Continuer vers le paiement (${tarif}€)`}
          </button>
        </div>
      </form>

      <div className="info-section">
        <p><strong>ℹ️ Information :</strong></p>
        <p>Après validation, vous serez dirigé vers la page de paiement où un bénévole confirmera votre règlement.</p>
      </div>
    </div>
  );
}