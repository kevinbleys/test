import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playBuzzerSound, playBellSound, playSuccessSound, preloadSounds } from '../utils/soundUtils';

// ✅ GECORRIGEERDE API BASE URL - WAS 4000, NU 3001
const API_BASE_URL = 'http://localhost:3001';

export default function MemberCheck() {
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [benevoleCalled, setBenevoleCalled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        preloadSounds();
    }, []);

    const handleVerification = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        setBenevoleCalled(false);

        try {
            console.log('=== STARTING MEMBER VERIFICATION ===');
            console.log('Checking member:', nom, prenom);

            // Étape 1: Vérification de l'adhésion - GECORRIGEERDE URL
            const checkResponse = await axios.get(`${API_BASE_URL}/members/check`, {
                params: { nom, prenom }
            });

            console.log('Member check response:', checkResponse.data);

            if (checkResponse.data.success) {
                // Membre valide et payé
                setMessage(checkResponse.data.message);
                playSuccessSound();

                console.log('=== MEMBER VALIDATED - REGISTERING PRESENCE ===');

                // Étape 2: Enregistrement présence adherent - GECORRIGEERDE URL
                const presenceData = {
                    type: 'adherent',
                    nom: nom.trim(),
                    prenom: prenom.trim()
                    // Expliciet: geen andere velden voor adherents
                };

                console.log('Sending presence data:', presenceData);

                const presenceResponse = await axios.post(`${API_BASE_URL}/presences`, presenceData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Presence response:', presenceResponse.data);

                if (presenceResponse.data.success) {
                    console.log('=== PRESENCE REGISTERED SUCCESSFULLY ===');
                    console.log('Final presence object:', presenceResponse.data.presence);

                    // Verificatie dat geen tarif werd toegevoegd
                    if (presenceResponse.data.presence.tarif !== undefined) {
                        console.error('ERROR: Tarif was added to adherent!', presenceResponse.data.presence.tarif);
                    } else {
                        console.log('SUCCESS: No tarif field in adherent presence');
                    }

                    setTimeout(() => {
                        navigate('/confirmation');
                    }, 2000);
                } else {
                    setError("Erreur lors de l'enregistrement de la présence");
                    playBuzzerSound();
                }
            } else {
                // Membre non valide ou non payé
                console.log('Member validation failed:', checkResponse.data.error);
                setError(checkResponse.data.error || "Adhésion non valide");
                playBuzzerSound();
            }

        } catch (error) {
            console.error('=== ERROR IN VERIFICATION ===');
            console.error('Error details:', error);

            let errorMessage = "Erreur de connexion";

            if (error.response?.status === 404) {
                errorMessage = "Aucun membre trouvé avec ce nom et prénom";
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            playBuzzerSound();
        } finally {
            setLoading(false);
        }
    };

    const handleAppelerBenevole = () => {
        playBellSound();
        setBenevoleCalled(true);
        setMessage("Un bénévole va arriver pour vous aider !");

        setTimeout(() => {
            setMessage('');
            setBenevoleCalled(false);
        }, 5000);
    };

    const handleRetourAccueil = () => {
        setNom('');
        setPrenom('');
        setError('');
        setMessage('');
        setLoading(false);
        setBenevoleCalled(false);
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
                maxWidth: '500px',
                textAlign: 'center'
            }}>
                <h2 style={{
                    color: '#333',
                    marginBottom: '30px',
                    fontSize: '2rem',
                    fontWeight: '300'
                }}>
                    Vérification d'adhésion
                </h2>

                <form onSubmit={handleVerification} style={{ marginBottom: '20px' }}>
                    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '1.1rem',
                            color: '#555',
                            fontWeight: '500'
                        }}>
                            Nom
                        </label>
                        <input
                            type="text"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
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

                    <div style={{ marginBottom: '30px', textAlign: 'left' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '1.1rem',
                            color: '#555',
                            fontWeight: '500'
                        }}>
                            Prénom
                        </label>
                        <input
                            type="text"
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
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

                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '15px 30px',
                                background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                minWidth: '150px'
                            }}
                        >
                            {loading ? 'Vérification...' : 'Vérifier'}
                        </button>

                        <button
                            type="button"
                            onClick={handleAppelerBenevole}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '15px 30px',
                                background: '#ff6b6b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                minWidth: '150px'
                            }}
                        >
                            🔔 Appeler bénévole
                        </button>
                    </div>
                </form>

                <button
                    onClick={handleRetourAccueil}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: 'transparent',
                        color: '#667eea',
                        border: '2px solid #667eea',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        marginTop: '10px'
                    }}
                >
                    ← Retour à l'accueil
                </button>

                {error && (
                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        background: '#ff6b6b',
                        color: 'white',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {message && (
                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        background: benevoleCalled ? '#ff9500' : '#4CAF50',
                        color: 'white',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>
                            {benevoleCalled ? "🔔" : "✅"}
                        </span>
                        <span>{message}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
