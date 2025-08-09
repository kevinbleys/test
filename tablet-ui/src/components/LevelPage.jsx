import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { playBuzzerSound, playSuccessSound } from '../utils/soundUtils';

export default function LevelPage() {
  const { state } = useLocation();
  const nav = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState('');
  const [error, setError] = useState('');

  if (!state?.form) {
    nav('/non-member');
    return null;
  }

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    setError(''); // Clear error when user selects an option
  };

  const continuer = () => {
    if (!selectedLevel) {
      setError('Veuillez sélectionner un niveau pour continuer');
      playBuzzerSound();
      return;
    }
    
    playSuccessSound();
    
    // **IMPORTANTE: Doorsturen van ALLE state data inclusief tarief info**
    nav('/assurance', { 
      state: { 
        ...state, // Spread alle bestaande state (form, age, tarif, etc.)
        niveau: selectedLevel 
      } 
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: 0, fontSize: '28px' }}>Je déclare :</h2>
      </div>

      {/* **NOUVELLE SECTION: Affichage du tarif calculé** */}
      {state.tarif !== undefined && (
        <div style={{
          background: state.tarif === 0 ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' :
                     state.tarif === 8 ? 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)' :
                     'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
          color: state.tarif === 8 ? 'black' : 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
            💰 Tarif applicable : {state.tarif === 0 ? 'GRATUIT' : `${state.tarif}€`}
          </h4>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
            👤 {state.form?.nom} {state.form?.prenom} - {state.age} ans
          </p>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
            {state.tarifDescription}
          </p>
        </div>
      )}

      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '30px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '15px', border: `2px solid ${selectedLevel === '0' ? '#007bff' : '#dee2e6'}`, borderRadius: '8px', marginBottom: '10px', transition: 'all 0.3s ease' }}>
              <input
                type="radio"
                name="niveau"
                value="0"
                checked={selectedLevel === '0'}
                onChange={() => handleLevelChange('0')}
                style={{ marginRight: '15px', transform: 'scale(1.2)' }}
              />
              <span style={{ fontSize: '16px', fontWeight: '500' }}>
                ne pas être un grimpeur autonome (*)
              </span>
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '15px', border: `2px solid ${selectedLevel === '1' ? '#007bff' : '#dee2e6'}`, borderRadius: '8px', marginBottom: '10px', transition: 'all 0.3s ease' }}>
              <input
                type="radio"
                name="niveau"
                value="1"
                checked={selectedLevel === '1'}
                onChange={() => handleLevelChange('1')}
                style={{ marginRight: '15px', transform: 'scale(1.2)' }}
              />
              <span style={{ fontSize: '16px', fontWeight: '500' }}>
                être grimpeur autonome de niveau 1 ou je possède un Passeport FFME Escalade blanc (**)
              </span>
            </label>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '15px', border: `2px solid ${selectedLevel === '2' ? '#007bff' : '#dee2e6'}`, borderRadius: '8px', marginBottom: '10px', transition: 'all 0.3s ease' }}>
              <input
                type="radio"
                name="niveau"
                value="2"
                checked={selectedLevel === '2'}
                onChange={() => handleLevelChange('2')}
                style={{ marginRight: '15px', transform: 'scale(1.2)' }}
              />
              <span style={{ fontSize: '16px', fontWeight: '500' }}>
                être grimpeur autonome de niveau 2 ou je possède un Passeport FFME Escalade jaune (***)
              </span>
            </label>
          </div>
        </div>

        {/* Niveau descriptions */}
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#495057', marginBottom: '10px' }}>(*) Niveau 0 - Grimpeur non autonome</h4>
            <p style={{ fontWeight: 'bold', color: '#dc3545' }}>Je n'ai accès qu'à la structure de blocs.</p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Je n'ai pas les compétences requises pour grimper sur le mur à cordes et je m'engage à ne pas 
              grimper sur les zones nécessitant un encordement. Je n'ai accès qu'à la structure de blocs.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#495057', marginBottom: '10px' }}>(**) Niveau 1 - Grimpeur autonome niveau 1</h4>
            <p style={{ fontWeight: 'bold', color: '#ffc107' }}>J'ai accès à la structure blocs et au mur à cordes en moulinette uniquement.</p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Je possède les compétences suivantes :
            </p>
            <ul style={{ fontSize: '14px', color: '#666', marginLeft: '20px' }}>
              <li>Je sais mettre correctement un baudrier</li>
              <li>Je sais m'encorder en utilisant un nœud de huit tressé avec un nœud d'arrêt</li>
              <li>Je sais utiliser un système d'assurage pour assurer en moulinette</li>
              <li>Je sais parer une chute</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#495057', marginBottom: '10px' }}>(**) Niveau 2 - Grimpeur autonome niveau 2</h4>
            <p style={{ fontWeight: 'bold', color: '#28a745' }}>J'ai accès à la structure blocs et au mur à cordes en tête.</p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Je possède toutes les compétences du niveau 1, plus :
            </p>
            <ul style={{ fontSize: '14px', color: '#666', marginLeft: '20px' }}>
              <li>Je suis autonome de niveau 1</li>
              <li>Je sais utiliser un système d'assurage pour assurer en tête</li>
              <li>Je sais grimper en tête</li>
            </ul>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            type="button"
            onClick={() => nav('/non-member')}
            style={{
              flex: 1,
              padding: '15px',
              background: '#f8f9fa',
              color: '#6c757d',
              border: '2px solid #dee2e6',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Retour
          </button>
          
          <button
            onClick={continuer}
            style={{
              flex: 1,
              padding: '15px',
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
            }}
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}
