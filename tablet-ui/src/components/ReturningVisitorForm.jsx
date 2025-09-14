import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function ReturningVisitorForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    dateNaissance: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nom.trim() || !form.prenom.trim() || !form.dateNaissance) {
      setError('Veuillez remplir tous les champs');
      playBuzzerSound();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = getApiBaseUrl();

      // ✅ Search for returning visitor
      const response = await axios.get(`${apiUrl}/returning-visitors/search`, {
        params: {
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          dateNaissance: form.dateNaissance
        },
        timeout: 10000
      });

      if (response.data.success) {
        const visitor = response.data.visitor;
        playSuccessSound();

        console.log('🔄 Found returning visitor:', visitor);

        // ✅ Create presence directly (skip level/assurance pages)
        const presenceData = {
          type: 'non-adherent',
          nom: visitor.nom,
          prenom: visitor.prenom,
          dateNaissance: visitor.dateNaissance,
          email: visitor.email || '',
          telephone: visitor.telephone || '',
          niveau: visitor.lastNiveau || 'Débutant',
          assuranceAccepted: true, // Skip assurance for returning visitors
          isReturningVisitor: true
        };

        const presenceResponse = await axios.post(`${apiUrl}/presences-enhanced`, presenceData, {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' }
        });

        if (presenceResponse.data.success) {
          const presence = presenceResponse.data.presence;

          // ✅ Go directly to payment page with correct tariff
          navigate('/paiement', {
            state: {
              presenceId: presence.id,
              montant: presence.tarif, // ✅ FIXED: Use calculated tariff
              tarif: presence.tarif,
              nom: presence.nom,
              prenom: presence.prenom,
              age: presence.tarifCategory,
              tarifCategory: presence.tarifCategory,
              isReturningVisitor: true,
              previousVisits: visitor.visitCount,
              lastVisit: visitor.lastVisit
            }
          });
        } else {
          setError('Erreur lors de la création de la présence');
          playBuzzerSound();
        }
      } else {
        // ✅ Not found - show error with retry option
        setError('Aucune visite précédente trouvée pour ces informations.\n\nVérifiez l'orthographe ou utilisez "première visite".');
        playBuzzerSound();
      }
    } catch (err) {
      console.error('Returning visitor search error:', err);
      setError('Erreur de connexion. Veuillez réessayer.');
      playBuzzerSound();
    } finally {
      setLoading(false);
    }
  };

  const handleRetourAccueil = () => {
    navigate('/');
  };

  const handleBackToChoice = () => {
    navigate('/visitor-choice');
  };

  return (
    <div className="returning-visitor-form">
      <div className="header-section">
        <h2>Visiteur déjà enregistré</h2>
        <div className="header-buttons">
          <button onClick={handleRetourAccueil} className="btn-retour-accueil">
            🏠 Retour Accueil
          </button>
        </div>
      </div>

      <div className="info-message">
        <span className="info-icon">🔄</span>
        <div>
          <strong>Accès rapide</strong>
          <p>Entrez vos informations pour retrouver vos données précédentes et aller directement au paiement.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nom">Nom :</label>
          <input
            id="nom"
            type="text"
            value={form.nom}
            onChange={(e) => setForm({...form, nom: e.target.value})}
            placeholder="Votre nom (identique à la première visite)"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="prenom">Prénom :</label>
          <input
            id="prenom"
            type="text"
            value={form.prenom}
            onChange={(e) => setForm({...form, prenom: e.target.value})}
            placeholder="Votre prénom (identique à la première visite)"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="dateNaissance">Date de naissance :</label>
          <input
            id="dateNaissance"
            type="date"
            value={form.dateNaissance}
            onChange={(e) => setForm({...form, dateNaissance: e.target.value})}
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <div style={{ whiteSpace: 'pre-line' }}>{error}</div>
          </div>
        )}

        <div className="action-buttons">
          <button 
            type="button"
            onClick={handleBackToChoice}
            className="btn-retour-accueil"
            disabled={loading}
          >
            ← Retour au choix
          </button>

          <button 
            type="submit" 
            className="btn-verify"
            disabled={loading || !form.nom.trim() || !form.prenom.trim() || !form.dateNaissance}
          >
            {loading ? '⏳ Recherche...' : '🔍 Rechercher et continuer'}
          </button>
        </div>
      </form>

      <div className="help-section">
        <p><strong>Problème pour vous retrouver ?</strong></p>
        <p>Utilisez plutôt l'option "première visite" pour faire l'inscription complète.</p>
      </div>
    </div>
  );
}