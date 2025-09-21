
// PremiereInscription.jsx - Formulaire première inscription avec SQL
import React, { useState, useEffect } from 'react';
import './PremiereInscription.css';

const PremiereInscription = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
    assuranceType: '',
    niveauEscalade: '',
    notes: ''
  });
  const [currentStep, setCurrentStep] = useState('form'); // 'form', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [tarifs, setTarifs] = useState({});

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  // Charger tarifs au chargement du composant
  useEffect(() => {
    const loadTarifs = async () => {
      try {
        const assuranceTypes = ['base', 'base+', 'base++'];
        const tarifsData = {};

        for (const type of assuranceTypes) {
          try {
            const response = await fetch(`${API_BASE_URL}/tarifs/${type}`);
            const result = await response.json();
            if (result.success) {
              tarifsData[type] = result.tarif;
            }
          } catch (error) {
            console.warn(`Erreur chargement tarif ${type}:`, error);
          }
        }

        setTarifs(tarifsData);
      } catch (error) {
        console.error('Erreur chargement tarifs:', error);
      }
    };

    loadTarifs();
  }, [API_BASE_URL]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Reset error when user types
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCurrentStep('loading');
    setErrorMessage('');

    // Validation côté client
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.email.trim() || 
        !formData.assuranceType || !formData.niveauEscalade) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires');
      setCurrentStep('form');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Veuillez saisir une adresse email valide');
      setCurrentStep('form');
      return;
    }

    try {
      const currentTarif = tarifs[formData.assuranceType];

      const payload = {
        ...formData,
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim(),
        telephone: formData.telephone.trim(),
        notes: formData.notes.trim(),
        montant: currentTarif ? currentTarif.montant : 15.00, // fallback
        typePaiement: 'carte' // default
      };

      console.log('Envoi données inscription:', payload);

      const response = await fetch(`${API_BASE_URL}/add-non-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('Réponse serveur:', result);

      if (result.success) {
        setCurrentStep('success');
        // Optionnel: reset form après succès
        // setTimeout(() => {
        //   resetForm();
        // }, 5000);
      } else {
        setErrorMessage(result.error || 'Erreur lors de l\'inscription');
        setCurrentStep('error');
      }

    } catch (error) {
      console.error('Erreur réseau:', error);
      setErrorMessage('Erreur de connexion au serveur. Veuillez réessayer.');
      setCurrentStep('error');
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '', prenom: '', email: '', telephone: '', dateNaissance: '',
      assuranceType: '', niveauEscalade: '', notes: ''
    });
    setCurrentStep('form');
    setErrorMessage('');
  };

  const getCurrentTarif = () => {
    return formData.assuranceType ? tarifs[formData.assuranceType] : null;
  };

  const renderForm = () => (
    <div className="premiere-inscription-container">
      <h2>Première Inscription Non-Membre</h2>
      <p className="form-description">
        Bienvenue ! Veuillez remplir ce formulaire pour votre première visite.
      </p>

      <form onSubmit={handleSubmit} className="inscription-form">
        <div className="form-section">
          <h3>Informations personnelles</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nom">Nom de famille *</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                disabled={currentStep === 'loading'}
                placeholder="Votre nom de famille"
              />
            </div>

            <div className="form-group">
              <label htmlFor="prenom">Prénom *</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                required
                disabled={currentStep === 'loading'}
                placeholder="Votre prénom"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Adresse email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={currentStep === 'loading'}
                placeholder="votre@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telephone">Téléphone</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                disabled={currentStep === 'loading'}
                placeholder="0123456789"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dateNaissance">Date de naissance</label>
            <input
              type="date"
              id="dateNaissance"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={handleInputChange}
              disabled={currentStep === 'loading'}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Informations escalade</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="assuranceType">Type d'assurance * <span className="info-tooltip" title="Assurance obligatoire pour la pratique de l'escalade">ℹ️</span></label>
              <select
                id="assuranceType"
                name="assuranceType"
                value={formData.assuranceType}
                onChange={handleInputChange}
                required
                disabled={currentStep === 'loading'}
              >
                <option value="">Sélectionner...</option>
                <option value="base">Base - Assurance minimale</option>
                <option value="base+">Base+ - Assurance étendue</option>
                <option value="base++">Base++ - Assurance complète</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="niveauEscalade">Niveau d'escalade *</label>
              <select
                id="niveauEscalade"
                name="niveauEscalade"
                value={formData.niveauEscalade}
                onChange={handleInputChange}
                required
                disabled={currentStep === 'loading'}
              >
                <option value="">Sélectionner...</option>
                <option value="debutant">Débutant - Première fois</option>
                <option value="intermediaire">Intermédiaire - Quelques mois de pratique</option>
                <option value="avance">Avancé - Pratique régulière</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optionnel)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              disabled={currentStep === 'loading'}
              placeholder="Informations complémentaires, allergies, etc."
              rows="3"
            />
          </div>
        </div>

        {getCurrentTarif() && (
          <div className="tarif-display">
            <h4>Tarif de la séance:</h4>
            <div className="price-info">
              <span className="price">€{getCurrentTarif().montant}</span>
              <span className="description">{getCurrentTarif().description}</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="error-message">
            ❌ {errorMessage}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={currentStep === 'loading'}
            className="btn-primary btn-large"
          >
            {currentStep === 'loading' ? (
              <>
                <span className="spinner"></span>
                Inscription en cours...
              </>
            ) : (
              'Confirmer l\'inscription'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderSuccess = () => (
    <div className="inscription-success">
      <div className="success-header">
        <span className="success-icon">🎉</span>
        <h3>Inscription réussie !</h3>
      </div>

      <div className="success-content">
        <p>Bienvenue <strong>{formData.prenom} {formData.nom}</strong> !</p>
        <p>Votre inscription a été enregistrée avec succès.</p>

        <div className="next-steps">
          <h4>Prochaines étapes:</h4>
          <ul>
            <li>✅ Vos informations sont sauvegardées</li>
            <li>🧗‍♂️ Vous pouvez maintenant accéder à la salle</li>
            <li>💳 Effectuer le paiement à l'accueil</li>
            <li>📧 Vous recevrez un email de confirmation</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button 
            onClick={resetForm}
            className="btn-primary"
          >
            Nouvelle inscription
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn-secondary"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="inscription-error">
      <div className="error-header">
        <span className="error-icon">❌</span>
        <h3>Erreur d'inscription</h3>
      </div>

      <div className="error-content">
        <p className="error-message">{errorMessage}</p>

        <div className="action-buttons">
          <button 
            onClick={() => setCurrentStep('form')}
            className="btn-primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="premiere-inscription">
      {currentStep === 'form' || currentStep === 'loading' ? renderForm() : null}
      {currentStep === 'success' ? renderSuccess() : null}
      {currentStep === 'error' ? renderError() : null}
    </div>
  );
};

export default PremiereInscription;
