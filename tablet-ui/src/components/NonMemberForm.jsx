import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playBuzzerSound, preloadSounds } from '../utils/soundUtils';

export default function NonMemberForm() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
    adresse: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Pré-charger les sons au chargement du composant
  useEffect(() => {
    preloadSounds();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:4000/presences', {
        type: 'non-adherent',
        ...formData
      });

      if (response.data.success) {
        // Redirection vers la page de confirmation
        navigate('/confirmation');
      } else {
        setError("Erreur lors de l'enregistrement");
        playBuzzerSound(); // Jouer le son d'erreur
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.error || "Erreur lors de l'enregistrement");
      playBuzzerSound(); // Jouer le son d'erreur
    } finally {
      setLoading(false);
    }
  };

  const handleRetourAccueil = () => {
    navigate('/');
  };

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
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Prénom *</label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Téléphone</label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Date de naissance</label>
          <input
            type="date"
            name="dateNaissance"
            value={formData.dateNaissance}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Adresse</label>
          <textarea
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            disabled={loading}
            rows="3"
          />
        </div>
        
        <button type="submit" disabled={loading} className="btn-verify">
          {loading ? 'Enregistrement...' : 'S\'inscrire'}
        </button>
      </form>
      
      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          {error}
        </div>
      )}
    </div>
  );
}
