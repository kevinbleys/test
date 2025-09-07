import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { playBuzzerSound } from '../utils/soundUtils';

export default function NonMemberForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { form: memberForm, memberCheckFailed, reason } = location.state || {};

  const [form, setForm] = useState({
    nom: memberForm?.nom || '',
    prenom: memberForm?.prenom || '',
    email: '',
    telephone: '',
    dateNaissance: ''
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.nom.trim() || !form.prenom.trim()) {
      setError('Nom et prénom sont requis');
      playBuzzerSound();
      return;
    }

    if (!form.dateNaissance) {
      setError('Date de naissance est requise pour calculer le tarif');
      playBuzzerSound();
      return;
    }

    navigate('/niveau', {
      state: {
        form: form,
        type: 'non-adherent'
      }
    });
  };

  const handleRetourAccueil = () => {
    navigate('/');
  };

  return (
    <div className="non-member-form">
      <div className="header-section">
        <h2>Inscription Visiteur</h2>
        <div className="header-buttons">
          <button onClick={handleRetourAccueil} className="btn-retour-accueil">
            🏠 Retour Accueil
          </button>
        </div>
      </div>

      {memberCheckFailed && (
        <div className="info-message">
          <span className="info-icon">ℹ️</span>
          Aucune adhésion trouvée. Veuillez vous inscrire comme visiteur.
          {reason && (
            <div className="info-detail">
              Détail: {reason}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nom">Nom:</label>
          <input
            id="nom"
            type="text"
            value={form.nom}
            onChange={(e) => setForm({...form, nom: e.target.value})}
            placeholder="Votre nom"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="prenom">Prénom:</label>
          <input
            id="prenom"
            type="text"
            value={form.prenom}
            onChange={(e) => setForm({...form, prenom: e.target.value})}
            placeholder="Votre prénom"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            placeholder="votre@email.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="telephone">Téléphone:</label>
          <input
            id="telephone"
            type="tel"
            value={form.telephone}
            onChange={(e) => setForm({...form, telephone: e.target.value})}
            placeholder="06 12 34 56 78"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dateNaissance">Date de naissance:</label>
          <input
            id="dateNaissance"
            type="date"
            value={form.dateNaissance}
            onChange={(e) => setForm({...form, dateNaissance: e.target.value})}
            required
          />
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* ✅ TRY: btn-primary class */}
        <button 
          type="submit" 
          className="btn-retour-accueil"
          disabled={!form.nom.trim() || !form.prenom.trim() || !form.dateNaissance}
        >
          Continuer
        </button>
      </form>

      <div className="info-section">
        <p><strong>Prochaines étapes:</strong></p>
        <ol>
          <li>Choisir votre niveau d'escalade</li>
          <li>Accepter les conditions d'assurance</li>
          <li>Finaliser le paiement</li>
        </ol>
      </div>
    </div>
  );
}