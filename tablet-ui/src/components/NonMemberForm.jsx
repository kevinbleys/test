import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playBuzzerSound } from '../utils/soundUtils';
import { calculateAgeAndTarif } from '../utils/ageCalculation';
import API_BASE_URL from '../services/apiService';

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
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    console.log('🌐 NonMemberForm using API URL:', API_BASE_URL);
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Preview du tarif en temps réel
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

  const next = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');

    if (!form.nom || !form.prenom || !form.email) {
      setErr('Champs obligatoires manquants');   
      playBuzzerSound();   
      setLoading(false);
      return;
    }

    if (!form.dateNaissance) {
      setErr('La date de naissance est obligatoire pour calculer le tarif');
      playBuzzerSound();
      setLoading(false);
      return;
    }

    try {
      // Calcul du tarif basé sur l'âge
      const { age, tarif, description, category } = calculateAgeAndTarif(form.dateNaissance);
      console.log('=== TARIF CALCULATION ===');
      console.log('Date de naissance:', form.dateNaissance);
      console.log('Âge calculé:', age);
      console.log('Tarif calculé:', tarif);
      console.log('Catégorie:', category);

      // Optioneel: Sauvegarder dans non-members voor tracking
      const nonMemberData = {
        ...form,
        age,
        tarif,
        tarifDescription: description,
        tarifCategory: category,
        status: 'form_completed'
      };

      try {
        const response = await fetch(`${API_BASE_URL}/non-members`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(nonMemberData)
        });

        if (response.ok) {
          console.log('✅ Non-member data saved for tracking');
        } else {
          console.warn('⚠️ Could not save non-member data, but continuing...');
        }
      } catch (saveError) {
        console.warn('⚠️ Save error, but continuing...', saveError);
      }

      // Navigation naar niveau pagina met alle data
      nav('/niveau', {   
        state: {   
          form,
          age,
          tarif,
          tarifDescription: description,
          tarifCategory: category
        }
      });

    } catch (error) {
      console.error('Error in form processing:', error);
      setErr('Erreur lors du traitement du formulaire');
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
        maxWidth: '600px'
      }}>
        <h1 style={{ 
          color: '#333', 
          marginBottom: '30px', 
          fontSize: '2rem', 
          fontWeight: '300', 
          textAlign: 'center' 
        }}>
          Inscription non-membre
        </h1>

        <form onSubmit={next}>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '1.1rem',
                color: '#555',
                fontWeight: '500'
              }}>
                Nom *
              </label>
              <input 
                type="text"
                name="nom"
                value={form.nom}
                onChange={onChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '2px solid #ddd',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '1.1rem',
                color: '#555',
                fontWeight: '500'
              }}>
                Prénom *
              </label>
              <input 
                type="text"
                name="prenom"
                value={form.prenom}
                onChange={onChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '2px solid #ddd',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>

          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '1.1rem',
              color: '#555',
              fontWeight: '500'
            }}>
              Email *
            </label>
            <input 
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #ddd',
                borderRadius: '10px',
                fontSize: '1.1rem',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '1.1rem',
                color: '#555',
                fontWeight: '500'
              }}>
                Téléphone
              </label>
              <input 
                type="tel"
                name="telephone"
                value={form.telephone}
                onChange={onChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '2px solid #ddd',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '1.1rem',
                color: '#555',
                fontWeight: '500'
              }}>
                Date de naissance *
              </label>
              <input 
                type="date"
                name="dateNaissance"
                value={form.dateNaissance}
                onChange={onChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '2px solid #ddd',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>

          </div>

          {/* Tarif Preview */}
          {tarifPreview && (
            <div style={{
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              padding: '20px',
              borderRadius: '15px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>
                Tarif calculé : {tarifPreview.tarif === 0 ? 'GRATUIT' : `${tarifPreview.tarif}€`}
              </h4>

              <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>
                Âge : {tarifPreview.age} ans
              </p>

              <p style={{ margin: '5px 0', fontSize: '1rem' }}>
                {tarifPreview.description}
              </p>

            </div>
          )}

          {err && (
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              background: '#ff6b6b',
              color: 'white',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              {err}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading || !form.nom || !form.prenom || !form.email || !form.dateNaissance}
            style={{
              background: loading ? '#cccccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              marginBottom: '20px',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? '⏳ Traitement...' : '➡️ Continuer'}
          </button>

          <button 
            type="button"
            onClick={() => nav('/')}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #6b73ff 0%, #000dff 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.6 : 1
            }}
          >
            🏠 Retour à l'accueil
          </button>

          {/* Debug info */}
          <div style={{ 
            marginTop: '20px', 
            fontSize: '0.8rem', 
            color: '#666',
            textAlign: 'center'
          }}>
            API: {API_BASE_URL}
          </div>

        </form>
      </div>
    </div>
  );
}