import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReturningVisitorForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    dateNaissance: ''
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.nom.trim() || !form.prenom.trim() || !form.dateNaissance) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    // ✅ SIMPLE: Just redirect to payment for now
    // TODO: Add returning visitor lookup later
    navigate('/paiement', {
      state: {
        presenceId: 'temp-id',
        montant: 10,
        nom: form.nom,
        prenom: form.prenom
      }
    });
  };

  const handleRetourAccueil = () => {
    navigate('/');
  };

  return (
    <div className="returning-visitor-form">
      <div className="header-section">
        <h2>Accès rapide</h2>
        <div className="header-buttons">
          <button onClick={handleRetourAccueil} className="btn-retour-accueil">
            🏠 Retour Accueil
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom :</label>
          <input
            type="text"
            value={form.nom}
            onChange={(e) => setForm({...form, nom: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Prénom :</label>
          <input
            type="text"
            value={form.prenom}
            onChange={(e) => setForm({...form, prenom: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Date de naissance :</label>
          <input
            type="date"
            value={form.dateNaissance}
            onChange={(e) => setForm({...form, dateNaissance: e.target.value})}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn-continue">
          Continuer
        </button>
      </form>
    </div>
  );
}