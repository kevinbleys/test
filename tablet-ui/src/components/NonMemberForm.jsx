import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playBuzzerSound } from '../utils/soundUtils';
import { calculateAgeAndTarif } from '../utils/ageCalculation';

export default function NonMemberForm() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    nom: '', 
    prenom: '', 
    email: '',
    telephone: '', 
    dateNaissance: ''
  });
  const [err, setErr] = useState('');
  const [tarifPreview, setTarifPreview] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // **NOUVELLE FONCTIONNALITÉ: Preview du tarif en temps réel**
    if (name === 'dateNaissance' && value) {
      try {
        const { age, tarif, description } = calculateAgeAndTarif(value);
        setTarifPreview({ age, tarif, description });
      } catch (error) {
        setTarifPreview(null);
      }
    } else if (name === 'dateNaissance' && !value) {
      setTarifPreview(null);
    }
  };

  const next = (e) => {
    e.preventDefault();
    
    if (!form.nom || !form.prenom || !form.email) {
      setErr('Champs obligatoires manquants'); 
      playBuzzerSound(); 
      return;
    }

    if (!form.dateNaissance) {
      setErr('La date de naissance est obligatoire pour calculer le tarif');
      playBuzzerSound();
      return;
    }

    // **CALCUL DU TARIF BASÉ SUR L'ÂGE**
    const { age, tarif, description, category } = calculateAgeAndTarif(form.dateNaissance);

    console.log('=== TARIF CALCULATION ===');
    console.log('Date de naissance:', form.dateNaissance);
    console.log('Âge calculé:', age);
    console.log('Tarif calculé:', tarif);
    console.log('Catégorie:', category);

    // Navigation avec toutes les données nécessaires
    nav('/niveau', { 
      state: { 
        form,
        age,
        tarif,
        tarifDescription: description,
        tarifCategory: category
      }
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: 0, fontSize: '28px' }}>Inscription non-membre</h2>
      </div>

      <form onSubmit={next} style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Nom *
          </label>
          <input
            type="text"
            name="nom"
            value={form.nom}
            onChange={onChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #dee2e6',
              borderRadius: '6px',
              fontSize: '16px',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Prénom *
          </label>
          <input
            type="text"
            name="prenom"
            value={form.prenom}
            onChange={onChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #dee2e6',
              borderRadius: '6px',
              fontSize: '16px',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #dee2e6',
              borderRadius: '6px',
              fontSize: '16px',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Téléphone
          </label>
          <input
            type="tel"
            name="telephone"
            value={form.telephone}
            onChange={onChange}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #dee2e6',
              borderRadius: '6px',
              fontSize: '16px',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Date de naissance *
          </label>
          <input
            type="date"
            name="dateNaissance"
            value={form.dateNaissance}
            onChange={onChange}
            required
            max={new Date().toISOString().split('T')[0]} // Pas de dates futures
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #dee2e6',
              borderRadius: '6px',
              fontSize: '16px',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
          />
        </div>

        {/* **NOUVELLE SECTION: Preview du tarif** */}
        {tarifPreview && (
          <div style={{
            background: tarifPreview.tarif === 0 ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' :
                       tarifPreview.tarif === 8 ? 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)' :
                       'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
            color: tarifPreview.tarif === 8 ? 'black' : 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
              Tarif calculé : {tarifPreview.tarif === 0 ? 'GRATUIT' : `${tarifPreview.tarif}€`}
            </h4>
            <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
              Âge : {tarifPreview.age} ans
            </p>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
              {tarifPreview.description}
            </p>
          </div>
        )}

        {err && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            {err}
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            type="button"
            onClick={() => nav('/')}
            style={{
              flex: 1,
              padding: '15px',
              background: '#f8f9fa',
              color: '#6c757d',
              border: '2px solid #dee2e6',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#e9ecef';
              e.target.style.borderColor = '#adb5bd';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#f8f9fa';
              e.target.style.borderColor = '#dee2e6';
            }}
          >
            Annuler
          </button>
          
          <button
            type="submit"
            style={{
              flex: 1,
              padding: '15px',
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(0, 123, 255, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
            }}
          >
            Continuer
          </button>
        </div>
      </form>
    </div>
  );
}
