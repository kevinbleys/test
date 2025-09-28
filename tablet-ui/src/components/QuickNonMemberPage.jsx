import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playBuzzerSound, playSuccessSound } from '../utils/soundUtils';
import { calculateAgeAndTarif } from '../utils/ageCalculation';
import API_BASE_URL from '../services/apiService';

export default function QuickNonMemberPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    dateNaissance: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    console.log('🌐 QuickNonMemberPage using API URL:', API_BASE_URL);
  }, []);

  // Format datum input automatisch (DD/MM/YYYY)
  const formatDateInput = (value) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2);
    } else if (numbers.length <= 8) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2, 4) + '/' + numbers.slice(4, 8);
    } else {
      return numbers.slice(0, 2) + '/' + numbers.slice(2, 4) + '/' + numbers.slice(4, 8);
    }
  };

  // Converteer DD/MM/YYYY naar YYYY-MM-DD
  const convertToISODate = (dateString) => {
    if (!dateString || dateString.length < 8) return '';
    const parts = dateString.split('/');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    if (day && month && year && year.length === 4) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return '';
  };

  // Valideer datum
  const isValidDate = (dateString) => {
    if (!dateString || dateString.length !== 10) return false;
    const parts = dateString.split('/');
    if (parts.length !== 3) return false;
    const [day, month, year] = parts.map(Number);
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
      return false;
    }
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    if (isLeapYear) daysInMonth[1] = 29;
    return day <= daysInMonth[month - 1];
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dateNaissance') {
      const formattedValue = formatDateInput(value);
      setForm({ ...form, [name]: formattedValue });
    } else {
      setForm({ ...form, [name]: value });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.nom || !form.prenom || !form.dateNaissance) {
      setError('Tous les champs sont obligatoires');
      playBuzzerSound();
      setLoading(false);
      return;
    }

    if (!isValidDate(form.dateNaissance)) {
      setError('Format de date invalide. Utilisez JJ/MM/AAAA (ex: 15/03/1990)');
      playBuzzerSound();
      setLoading(false);
      return;
    }

    try {
      console.log('=== QUICK NON-MEMBER LOOKUP ===');
      console.log('Recherche:', form);

      // Converteer datum voor lookup
      const isoDate = convertToISODate(form.dateNaissance);

      // Zoek in opgeslagen niet-leden
      const response = await fetch(`${API_BASE_URL}/quick-non-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          dateNaissance: isoDate
        })
      });

      const result = await response.json();

      if (response.ok && result.success && result.nonMember) {
        console.log('✅ Non-member gevonden:', result.nonMember);

        // Herbereken tarief op basis van huidige leeftijd
        const { age, tarif, description, category } = calculateAgeAndTarif(result.nonMember.dateNaissance);

        console.log('Nieuw tarief berekend:', { age, tarif, description });

        // Registreer presence met opgeslagen gegevens + nieuw tarief
        const presenceData = {
          type: 'non-adherent',
          nom: result.nonMember.nom,
          prenom: result.nonMember.prenom,
          email: result.nonMember.email,
          telephone: result.nonMember.telephone,
          dateNaissance: result.nonMember.dateNaissance,
          niveau: result.nonMember.niveau,
          assuranceAccepted: result.nonMember.assuranceAccepted,
          tarif: tarif, // Nieuw berekend tarief
          status: 'pending',
          age: age, // Nieuwe berekende leeftijd
          quickRegistration: true // Flag dat dit een snelle registratie is
        };

        console.log('Registratie data:', presenceData);

        const presenceResponse = await fetch(`${API_BASE_URL}/presences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(presenceData)
        });

        const presenceResult = await presenceResponse.json();

        if (presenceResponse.ok && presenceResult.success) {
          console.log('✅ Quick registration successful');
          playSuccessSound();

          // Ga direct naar payment page
          navigate('/paiement', {
            state: {
              presenceId: presenceResult.presence.id,
              montant: tarif,
              nom: result.nonMember.nom,
              prenom: result.nonMember.prenom,
              age: age,
              quickRegistration: true
            }
          });
        } else {
          throw new Error(presenceResult.error || 'Erreur lors de l\'enregistrement');
        }

      } else {
        // Niet gevonden
        setError(result.message || 'Aucune inscription trouvée avec ces données. Vérifiez l\'orthographe ou utilisez "Première inscription".');
        playBuzzerSound();
      }

    } catch (err) {
      console.error('Quick lookup error:', err);
      setError('Erreur de connexion. Veuillez réessayer.');
      playBuzzerSound();
    } finally {
      setLoading(false);
    }
  };

  const handleRetourType = () => {
    navigate('/non-member-type');
  };

  const handleRetourAccueil = () => {
    navigate('/');
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
          Inscription Rapide
        </h1>

        <p style={{
          fontSize: '1.1rem',
          marginBottom: '30px',
          color: '#666',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          Entrez vos données pour retrouver votre inscription précédente
        </p>

        <form onSubmit={handleSubmit}>

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
              placeholder="Votre nom de famille"
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #ddd',
                borderRadius: '10px',
                fontSize: '1.1rem',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box',
                marginBottom: '20px'
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
              placeholder="Votre prénom"
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #ddd',
                borderRadius: '10px',
                fontSize: '1.1rem',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box',
                marginBottom: '20px'
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
              type="text"
              name="dateNaissance"
              value={form.dateNaissance}
              onChange={onChange}
              placeholder="JJ/MM/AAAA (ex: 15/03/1990)"
              required
              disabled={loading}
              inputMode="numeric"
              maxLength="10"
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #ddd',
                borderRadius: '10px',
                fontSize: '1.1rem',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box',
                marginBottom: '10px'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <small style={{ 
              color: '#666', 
              fontSize: '0.9rem', 
              display: 'block',
              marginBottom: '20px'
            }}>
              Tapez les chiffres: jour, mois, année
            </small>
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

          <button 
            type="submit"
            disabled={loading || !form.nom || !form.prenom || !form.dateNaissance}
            style={{
              background: loading ? '#cccccc' : 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              marginBottom: '15px',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? '⏳ Recherche...' : '🔍 Rechercher mon inscription'}
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button"
              onClick={handleRetourType}
              disabled={loading}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1
              }}
            >
              ← Retour au choix
            </button>

            <button 
              type="button"
              onClick={handleRetourAccueil}
              disabled={loading}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #6b73ff 0%, #000dff 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1
              }}
            >
              🏠 Accueil
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}