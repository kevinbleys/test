import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playSuccessSound, playBuzzerSound } from '../utils/soundUtils';
import API_BASE_URL from '../services/apiService';

export default function ReglementPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [reglementAccepted, setReglementAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    console.log('🌐 ReglementPage using API URL:', API_BASE_URL);

    if (!state?.form) {
      console.error('No form data received, redirecting to home');
      navigate('/');
    }
  }, [state, navigate]);

  if (!state?.form) {
    return null;
  }

  const { form, age, tarif, tarifDescription, niveau, assuranceAccepted } = state;

  const handleFinalSubmit = async () => {
    if (!reglementAccepted) {
      setError('Vous devez accepter le règlement pour continuer');
      playBuzzerSound();
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('=== FINAL NON-MEMBER REGISTRATION ===');
      console.log('API URL:', API_BASE_URL);

      // Prepare final data
      const finalData = {
        type: 'non-adherent',
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        telephone: form.telephone,
        dateNaissance: form.dateNaissance,
        niveau: niveau.toString(),
        assuranceAccepted,
        reglementAccepted: true,
        tarif,
        status: 'pending',
        age
      };

      console.log('Final registration data:', finalData);

      // Register presence
      const response = await axios.post(`${API_BASE_URL}/presences`, finalData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Registration response:', response.data);

      if (response.data.success) {
        console.log('✅ NON-MEMBER REGISTRATION SUCCESSFUL');
        playSuccessSound();

        // Navigate to payment page with presence ID
        navigate('/paiement', {
          state: {
            presenceId: response.data.presence.id,
            montant: tarif,
            form,
            age,
            niveau
          }
        });
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }

    } catch (error) {
      console.error('❌ REGISTRATION ERROR:', error);
      let errorMessage = 'Erreur lors de l\'enregistrement';

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = `Erreur réseau: ${error.message}`;
      }

      setError(errorMessage);
      playBuzzerSound();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h1 style={{
          color: '#333',
          marginBottom: '20px',
          fontSize: '2rem',
          fontWeight: '300',
          textAlign: 'center'
        }}>
          Règlement du club
        </h1>

        <div style={{
          background: 'linear-gradient(135deg, #4CAF50, #45a049)',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <strong>{form.prenom} {form.nom}</strong> - {age} ans - Tarif: {tarif === 0 ? 'GRATUIT' : `${tarif}€`}
          <br />
          <small>Niveau: {['Débutant complet', 'Débutant', 'Intermédiaire', 'Confirmé', 'Expert'][parseInt(niveau)] || 'Non défini'}</small>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '25px',
          borderRadius: '15px',
          marginBottom: '30px',
          border: '2px solid #e9ecef',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          <h3 style={{ color: '#495057', marginBottom: '20px', fontSize: '1.4rem' }}>
            📋 Règlement intérieur - À lire attentivement
          </h3>

          <div style={{ fontSize: '1rem', lineHeight: '1.6', color: '#6c757d' }}>

            <h4 style={{ color: '#495057', marginTop: '20px', marginBottom: '10px' }}>🕐 Horaires</h4>
            <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
              <li>Respecter les horaires d'ouverture</li>
              <li>Évacuation 15 minutes avant la fermeture</li>
            </ul>

            <h4 style={{ color: '#495057', marginTop: '20px', marginBottom: '10px' }}>👥 Encadrement</h4>
            <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
              <li>Les mineurs doivent être accompagnés d'un adulte responsable</li>
              <li>Suivre les consignes des encadrants</li>
              <li>Demander conseil en cas de doute</li>
            </ul>

            <h4 style={{ color: '#495057', marginTop: '20px', marginBottom: '10px' }}>🧗 Escalade</h4>
            <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
              <li>Vérifier systématiquement son matériel et celui de son partenaire</li>
              <li>Porter des chaussons d'escalade (location disponible)</li>
              <li>Respecter les voies et leur cotation</li>
              <li>Ne pas grimper seul sans autorisation</li>
            </ul>

            <h4 style={{ color: '#495057', marginTop: '20px', marginBottom: '10px' }}>🚫 Interdictions</h4>
            <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
              <li>Alcool et substances interdites</li>
              <li>Nourriture dans l'espace d'escalade</li>
              <li>Téléphones portables pendant l'assurage</li>
              <li>Comportement dangereux ou irrespectueux</li>
            </ul>

            <h4 style={{ color: '#495057', marginTop: '20px', marginBottom: '10px' }}>🧹 Respect des lieux</h4>
            <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
              <li>Maintenir la propreté des espaces</li>
              <li>Ranger le matériel après utilisation</li>
              <li>Respecter les autres usagers</li>
            </ul>

            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              padding: '15px',
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <strong>⚠️ Important :</strong> Le non-respect du règlement peut entraîner l'exclusion temporaire ou définitive du club.
            </div>
          </div>
        </div>

        <div style={{
          background: reglementAccepted ? '#d4edda' : '#f8d7da',
          border: `2px solid ${reglementAccepted ? '#c3e6cb' : '#f1b0b7'}`,
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            <input
              type="checkbox"
              checked={reglementAccepted}
              onChange={(e) => {
                setReglementAccepted(e.target.checked);
                setError('');
              }}
              style={{
                width: '20px',
                height: '20px',
                marginRight: '15px',
                cursor: 'pointer'
              }}
            />
            <span style={{ color: reglementAccepted ? '#155724' : '#721c24' }}>
              ✅ J'ai lu et j'accepte le règlement intérieur du club
            </span>
          </label>
        </div>

        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#ff6b6b',
            color: 'white',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={() => navigate(-1)}
            disabled={loading}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #6b73ff 0%, #000dff 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.6 : 1
            }}
          >
            ← Retour
          </button>

          <button
            onClick={handleFinalSubmit}
            disabled={loading || !reglementAccepted}
            style={{
              flex: 2,
              background: (!reglementAccepted || loading) ? '#cccccc' : 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: (!reglementAccepted || loading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? '⏳ Enregistrement...' : '💳 Finaliser l\'inscription'}
          </button>
        </div>

        {/* Debug info */}
        <div style={{ 
          marginTop: '20px', 
          fontSize: '0.8rem', 
          color: '#666',
          textAlign: 'center'
        }}>
          API: {API_BASE_URL}
        </div>
      </div>
    </div>
  );
}