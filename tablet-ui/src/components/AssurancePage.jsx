import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { playSuccessSound, playBuzzerSound } from '../utils/soundUtils';

export default function AssurancePage() {
  const state = useLocation().state;
  const navigate = useNavigate();
  
  const [checks, setChecks] = useState({
    c1: false,
    c2: false,
    c3: false,
    c4: false
  });
  const [error, setError] = useState('');

  // Redirect si aucune donnée de formulaire n'est disponible
  if (!state?.form) {
    navigate('/non-member');
    return null;
  }

  const allChecked = Object.values(checks).every(Boolean);

  const toggleCheck = (key) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
    setError(''); // Effacer l'erreur lors de l'interaction utilisateur
  };

  const finish = async () => {
    if (!allChecked) {
      setError('Veuillez cocher toutes les cases pour continuer.');
      playBuzzerSound();
      return;
    }

    try {
      console.log('=== ASSURANCE PAGE SUBMISSION ===');
      console.log('State data:', state);
      
      // **IMPORTANTE: Utiliser le tarif calculé basé sur l'âge**
      const registrationData = {
        type: 'non-adherent',
        ...state.form,
        tarif: state.tarif, // **UTILISE LE TARIF CALCULÉ**
        niveau: state.niveau
      };
      
      console.log('Submitting with calculated tarif:', registrationData);

      const response = await axios.post('http://localhost:4000/presences', registrationData);

      if (response.data.success) {
        console.log('=== REGISTRATION SUCCESS ===');
        console.log('Registered presence:', response.data.presence);
        
        playSuccessSound();
        navigate('/paiement', {
          state: {
            presenceId: response.data.presence.id,
            montant: state.tarif, // **UTILISE LE CALCULÉ TARIF**
            nom: state.form.nom,
            prenom: state.form.prenom,
            age: state.age,
            tarifCategory: state.tarifCategory
          }
        });
      } else {
        setError('Erreur lors de l\'enregistrement');
        playBuzzerSound();
      }
    } catch (err) {
      console.error('=== REGISTRATION ERROR ===');
      console.error('Error details:', err);
      setError('Erreur de connexion');
      playBuzzerSound();
    }
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
        <h2 style={{ margin: 0, fontSize: '28px' }}>INFORMATION RELATIVE À L'ASSURANCE DU PRATIQUANT</h2>
      </div>

      {/* **NOUVELLE SECTION: Rappel du tarif** */}
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
            💰 Tarif à régler : {state.tarif === 0 ? 'GRATUIT' : `${state.tarif}€`}
          </h4>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
            👤 {state.form?.nom} {state.form?.prenom} - {state.age} ans - Niveau {state.niveau}
          </p>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
            {state.tarifDescription}
          </p>
        </div>
      )}

      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px' }}>
          Conformément à l'article L321-4 du Code du sport, le présent document vise à informer 
          le pratiquant des conditions d'assurance applicables dans le cadre de la pratique de 
          l'escalade au sein de la structure.
        </p>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#495057', marginBottom: '15px' }}>Assurance en Responsabilité Civile</h3>
          <p style={{ fontSize: '14px', color: '#666', background: '#e3f2fd', padding: '15px', borderRadius: '6px' }}>
            La structure dispose d'un contrat d'assurance en responsabilité civile couvrant 
            les dommages causés à des tiers dans le cadre de la pratique de l'escalade.
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#495057', marginBottom: '15px' }}>Assurance Individuelle Accident</h3>
          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
            <p style={{ fontSize: '14px', color: '#856404', margin: 0 }}>
              Cette assurance ne couvre pas les dommages corporels que le pratiquant pourrait 
              se causer à lui-même, en l'absence de tiers responsable identifié.
            </p>
          </div>
          
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            L'assurance individuelle accident permet au pratiquant d'être indemnisé pour les 
            dommages corporels dont il pourrait être victime, y compris en l'absence de tiers 
            responsable.
          </p>
          
          <p style={{ fontSize: '14px', color: '#666' }}>
            En l'absence de garantie individuelle accident, il est recommandé de souscrire 
            une couverture adaptée soit auprès de l'assureur de son choix, soit via une 
            licence FFME.
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checks.c1}
                onChange={() => toggleCheck('c1')} 
                style={{ marginRight: '15px', marginTop: '3px', transform: 'scale(1.2)' }}
              />
              <span style={{ fontSize: '14px' }}>
                Je reconnais avoir été informé(e) des conditions d'assurance applicables 
                dans le cadre de la pratique de l'escalade au sein de cette structure.
              </span>
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checks.c2}
                onChange={() => toggleCheck('c2')} 
                style={{ marginRight: '15px', marginTop: '3px', transform: 'scale(1.2)' }}
              />
              <span style={{ fontSize: '14px' }}>
                Je reconnais avoir été informé(e) de l'existence et de l'intérêt d'une 
                assurance individuelle accident.
              </span>
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checks.c3}
                onChange={() => toggleCheck('c3')} 
                style={{ marginRight: '15px', marginTop: '3px', transform: 'scale(1.2)' }}
              />
              <span style={{ fontSize: '14px' }}>
                Je reconnais avoir été informé(e) de la possibilité de souscrire une 
                assurance complémentaire adaptée à mes besoins, notamment via une 
                licence FFME en club ou hors club.
              </span>
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checks.c4}
                onChange={() => toggleCheck('c4')} 
                style={{ marginRight: '15px', marginTop: '3px', transform: 'scale(1.2)' }}
              />
              <span style={{ fontSize: '14px' }}>
                J'ai pris connaissance du{' '}
                <Link to="/reglement" style={{ color: '#007bff' }}>
                  Règlement intérieur
                </Link>
                {' '}et je m'engage à le respecter.
              </span>
            </label>
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
            onClick={() => navigate('/niveau')}
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
            onClick={finish}
            disabled={!allChecked}
            style={{
              flex: 1,
              padding: '15px',
              background: allChecked ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: allChecked ? 'pointer' : 'not-allowed',
              boxShadow: allChecked ? '0 4px 12px rgba(40, 167, 69, 0.3)' : 'none'
            }}
          >
            Terminer
          </button>
        </div>
      </div>
    </div>
  );
}
