import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NonMemberForm.css';

export default function NonMemberForm() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [age, setAge] = useState(null);
  const [tarif, setTarif] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Calcul de l'âge et du tarif en fonction de la date de naissance
  useEffect(() => {
    if (dateNaissance) {
      const today = new Date();
      const birthDate = new Date(dateNaissance);
      const ageCalc = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Ajustement si l'anniversaire n'est pas encore passé cette année
      const adjustedAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) 
        ? ageCalc - 1 
        : ageCalc;

      setAge(adjustedAge);

      if (adjustedAge < 6) {
        setTarif(0); // Gratuit pour moins de 6 ans
      } else if (adjustedAge < 18) {
        setTarif(8); // 8€ pour 6-18 ans
      } else {
        setTarif(10); // 10€ pour adultes
      }
    } else {
      setAge(null);
      setTarif(null);
    }
  }, [dateNaissance]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!nom || !prenom || !dateNaissance) {
      setError("Tous les champs sont obligatoires");
      return;
    }
    
    // Redirection vers la page de sélection de paiement avec les données
    navigate('/payment-selection', {
      state: {
        nom,
        prenom,
        dateNaissance,
        age,
        tarif
      }
    });
  };

  return (
    <div className="non-member-form">
      <h2>Formulaire pour Non-Adhérents</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nom">Nom*</label>
          <input
            id="nom"
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="prenom">Prénom*</label>
          <input
            id="prenom"
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dateNaissance">Date de naissance*</label>
          <input
            id="dateNaissance"
            type="date"
            value={dateNaissance}
            onChange={(e) => setDateNaissance(e.target.value)}
            required
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="buttons-container">
          <button 
            type="button" 
            className="back-button"
            onClick={() => navigate('/')}
          >
            Retour à l'accueil
          </button>
          <button 
            type="submit" 
            className="submit-button"
          >
            Continuer
          </button>
        </div>
      </form>
    </div>
  );
}
