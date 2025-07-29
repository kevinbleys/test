import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playBuzzerSound, playSuccessSound, preloadSounds } from '../utils/soundUtils';

export default function NonMemberForm() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateNaissance: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => preloadSounds(), []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      /* 1. registreer aanwezigheid (status = pending, tarif = 10) */
      const resp = await axios.post('http://localhost:4000/presences', {
        type: 'non-adherent',
        ...formData    // bevat géén adresse meer
      });

      if (resp.data.success) {
        playSuccessSound();
        /* 2. navigeer naar betaalpagina en geef presence-id + tarief door */
        navigate('/paiement', {
          state: {
            presenceId: resp.data.presence.id,
            montant: resp.data.presence.tarif || 10
          }
        });
      } else {
        setError("Erreur lors de l'enregistrement");
        playBuzzerSound();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Erreur de connexion');
      playBuzzerSound();
    } finally {
      setLoading(false);
    }
  };

  const handleRetourAccueil = () => navigate('/');

  return (
    <div className="non-member-form">
      <div className="header-section">
        <h2>Inscription non-membre</h2>
        <button
          type="button"
          className="btn-retour-accueil"
          onClick={handleRetourAccueil}
          disabled={loading}
        >
          ← Retour à l'accueil
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom *</label>
          <input name="nom" value={formData.nom} onChange={handleChange} required disabled={loading}/>
        </div>
        <div className="form-group">
          <label>Prénom *</label>
          <input name="prenom" value={formData.prenom} onChange={handleChange} required disabled={loading}/>
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={loading}/>
        </div>
        <div className="form-group">
          <label>Téléphone</label>
          <input name="telephone" value={formData.telephone} onChange={handleChange} disabled={loading}/>
        </div>
        <div className="form-group">
          <label>Date de naissance</label>
          <input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} disabled={loading}/>
        </div>

        <button type="submit" disabled={loading} className="btn-verify">
          {loading ? "Enregistrement..." : "S'inscrire"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
