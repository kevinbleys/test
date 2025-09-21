
// NonMemberVerification.jsx - SQL backend versie
import React, { useState, useEffect } from 'react';
import './NonMemberVerification.css';

const NonMemberVerification = () => {
  const [currentStep, setCurrentStep] = useState('input'); // 'input', 'loading', 'found', 'not_found', 'error'
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: ''
  });
  const [userData, setUserData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [tarif, setTarif] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Reset errors when user types
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const verifyNonMember = async (e) => {
    e.preventDefault();
    setCurrentStep('loading');
    setErrorMessage('');

    try {
      console.log('Envoi données vérification:', formData);

      const response = await fetch(`${API_BASE_URL}/verify-non-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: formData.nom.trim(),
          prenom: formData.prenom.trim(),
          email: formData.email.trim()
        })
      });

      const result = await response.json();
      console.log('Réponse serveur:', result);

      if (result.success) {
        if (result.userExists) {
          setUserData(result.userData);

          // Récupérer tarif pour ce type d'assurance
          try {
            const tarifResponse = await fetch(`${API_BASE_URL}/tarifs/${result.userData.assuranceType}`);
            const tarifResult = await tarifResponse.json();
            if (tarifResult.success) {
              setTarif(tarifResult.tarif);
            }
          } catch (tarifError) {
            console.warn('Erreur récupération tarif:', tarifError);
          }

          setCurrentStep('found');
        } else {
          setCurrentStep('not_found');
        }
      } else {
        setErrorMessage(result.error || 'Erreur de vérification');
        setCurrentStep('error');
      }

    } catch (error) {
      console.error('Erreur réseau:', error);
      setErrorMessage('Erreur de connexion au serveur. Veuillez réessayer.');
      setCurrentStep('error');
    }
  };

  const proceedToPayment = async () => {
    if (!userData || !tarif) {
      setErrorMessage('Données manquantes pour le paiement');
      return;
    }

    try {
      // Ajouter la visite à la base de données
      const response = await fetch(`${API_BASE_URL}/add-visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          montant: tarif.montant,
          typePaiement: 'carte', // Default, peut être modifié
          notes: 'Visite via système de vérification'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Redirect vers confirmation ou système de paiement externe
        alert(`Visite confirmée! Montant: €${tarif.montant}`);

        // Reset form pour nouvelle utilisation
        resetForm();
      } else {
        setErrorMessage(result.error || 'Erreur lors de l\'enregistrement de la visite');
        setCurrentStep('error');
      }

    } catch (error) {
      console.error('Erreur paiement:', error);
      setErrorMessage('Erreur lors du traitement du paiement');
      setCurrentStep('error');
    }
  };

  const goToFirstRegistration = () => {
    // Redirect vers première inscription
    window.location.href = '/premiere-inscription';
  };

  const resetForm = () => {
    setFormData({ nom: '', prenom: '', email: '', telephone: '' });
    setUserData(null);
    setTarif(null);
    setErrorMessage('');
    setCurrentStep('input');
  };

  const renderInputForm = () => (
    <div className="verification-form-container">
      <h2>Vérification Non-Membre</h2>
      <p className="form-description">
        Saisissez vos informations pour vérifier si vous êtes déjà enregistré dans notre système.
      </p>

      <form onSubmit={verifyNonMember} className="verification-form">
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
              autoComplete="family-name"
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
              autoComplete="given-name"
            />
          </div>
        </div>

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
            autoComplete="email"
          />
        </div>

        {errorMessage && (
          <div className="error-message">
            ❌ {errorMessage}
          </div>
        )}

        <button 
          type="submit" 
          disabled={currentStep === 'loading'}
          className="btn-primary btn-verify"
        >
          {currentStep === 'loading' ? (
            <>
              <span className="spinner"></span>
              Vérification en cours...
            </>
          ) : (
            'Vérifier mes informations'
          )}
        </button>
      </form>
    </div>
  );

  const renderFoundResult = () => (
    <div className="verification-success">
      <div className="success-header">
        <span className="success-icon">✅</span>
        <h3>Utilisateur trouvé !</h3>
      </div>

      <div className="user-details-card">
        <h4>Vos informations enregistrées:</h4>
        <div className="user-info-grid">
          <div className="info-item">
            <span className="label">Nom:</span>
            <span className="value">{userData.nom} {userData.prenom}</span>
          </div>
          <div className="info-item">
            <span className="label">Email:</span>
            <span className="value">{userData.email}</span>
          </div>
          <div className="info-item">
            <span className="label">Téléphone:</span>
            <span className="value">{userData.telephone || 'Non renseigné'}</span>
          </div>
          <div className="info-item">
            <span className="label">Assurance:</span>
            <span className="value">{userData.assuranceType}</span>
          </div>
          <div className="info-item">
            <span className="label">Niveau:</span>
            <span className="value">{userData.niveauEscalade}</span>
          </div>
          <div className="info-item">
            <span className="label">Visites:</span>
            <span className="value">{userData.nombreVisites}</span>
          </div>
          <div className="info-item">
            <span className="label">Membre depuis:</span>
            <span className="value">{new Date(userData.dateInscription).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>

      {tarif && (
        <div className="tarif-info">
          <h4>Tarif de la séance:</h4>
          <div className="price-display">
            <span className="price">€{tarif.montant}</span>
            <span className="price-description">{tarif.description}</span>
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button 
          onClick={proceedToPayment}
          className="btn-primary btn-large"
          disabled={!tarif}
        >
          Procéder au Paiement
        </button>
        <button 
          onClick={resetForm}
          className="btn-secondary"
        >
          Vérifier un autre utilisateur
        </button>
      </div>
    </div>
  );

  const renderNotFoundResult = () => (
    <div className="verification-not-found">
      <div className="not-found-header">
        <span className="warning-icon">⚠️</span>
        <h3>Utilisateur non trouvé</h3>
      </div>

      <div className="not-found-content">
        <p>Aucun enregistrement trouvé avec ces informations dans notre base de données.</p>

        <div className="possible-causes">
          <h4>Causes possibles:</h4>
          <ul>
            <li>C'est votre première visite à la salle</li>
            <li>Vous avez utilisé des informations différentes lors de votre inscription</li>
            <li>Votre compte a été désactivé</li>
            <li>Erreur de saisie dans vos informations</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button 
            onClick={resetForm}
            className="btn-secondary"
          >
            Réessayer avec d'autres informations
          </button>
          <button 
            onClick={goToFirstRegistration}
            className="btn-primary"
          >
            Procéder à une première inscription
          </button>
        </div>
      </div>
    </div>
  );

  const renderErrorResult = () => (
    <div className="verification-error">
      <div className="error-header">
        <span className="error-icon">❌</span>
        <h3>Erreur de vérification</h3>
      </div>

      <div className="error-content">
        <p className="error-message">{errorMessage}</p>

        <div className="action-buttons">
          <button 
            onClick={resetForm}
            className="btn-primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="non-member-verification">
      {currentStep === 'input' || currentStep === 'loading' ? renderInputForm() : null}
      {currentStep === 'found' ? renderFoundResult() : null}
      {currentStep === 'not_found' ? renderNotFoundResult() : null}
      {currentStep === 'error' ? renderErrorResult() : null}
    </div>
  );
};

export default NonMemberVerification;
