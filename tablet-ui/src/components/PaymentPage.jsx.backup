import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playBellSound, playSuccessSound } from '../utils/soundUtils';

// ✅ GECORRIGEERDE API BASE URL - WAS 4000, NU 3001
const API_BASE_URL = 'http://localhost:3001';

export default function PaymentPage() {
    const { state } = useLocation(); // presenceId + montant
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [presenceData, setPresenceData] = useState(null);
    const [isValidated, setIsValidated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Poll elke 4 s of de betaling is gevalideerd
    useEffect(() => {
        if (!state?.presenceId) {
            navigate('/');
            return;
        }

        const checkPaymentStatus = async () => {
            try {
                // ✅ GECORRIGEERDE API URL
                const res = await axios.get(`${API_BASE_URL}/presences/${state.presenceId}`);
                if (res.data.success) {
                    setPresenceData(res.data.presence);
                    setLoading(false);

                    if (['Payé', 'Pay'].includes(res.data.presence.status)) {
                        if (!isValidated) {
                            setIsValidated(true);
                            playSuccessSound();
                            setTimeout(() => navigate('/'), 3000);
                        }
                    }
                }
            } catch (error) {
                console.error('Erreur vérification statut:', error);
                setError('Impossible de vérifier le statut du paiement');
                setLoading(false);
            }
        };

        // Vérification initiale
        checkPaymentStatus();

        // Vérification périodique
        const interval = setInterval(checkPaymentStatus, 4000);

        return () => clearInterval(interval);
    }, [state, navigate, isValidated]);

    const handleContactVolunteer = () => {
        playBellSound();
        // Optionnel: ajouter une logique pour notifier les bénévoles
    };

    const handleRetourAccueil = () => {
        navigate('/');
    };

    if (!state?.presenceId) return null;

    // Si le paiement est validé
    if (isValidated || presenceData?.status === 'Payé' || presenceData?.status === 'Pay') {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
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
                    maxWidth: '600px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
                    <h2 style={{ color: '#4CAF50', marginBottom: '20px', fontSize: '2rem' }}>
                        Paiement validé !
                    </h2>
                    <p style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#333' }}>
                        Votre paiement de <strong>{state.montant}€</strong> a été confirmé.
                    </p>
                    {presenceData?.methodePaiement && (
                        <p style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#666' }}>
                            Mode de paiement : <strong>{presenceData.methodePaiement}</strong>
                        </p>
                    )}
                    <div style={{
                        background: '#e8f5e8',
                        padding: '15px',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        color: '#2e7d32'
                    }}>
                        Redirection automatique vers la page d'accueil dans 3 secondes...
                    </div>
                    <button
                        onClick={handleRetourAccueil}
                        style={{
                            padding: '15px 30px',
                            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        🏠 Retour immédiat à l'accueil
                    </button>
                </div>
            </div>
        );
    }

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
                maxWidth: '700px',
                textAlign: 'center'
            }}>
                <h2 style={{
                    color: '#333',
                    marginBottom: '20px',
                    fontSize: '2rem',
                    fontWeight: '300'
                }}>
                    💰 Montant à régler : {state.montant}€
                </h2>

                <p style={{ fontSize: '1.2rem', marginBottom: '30px', color: '#666' }}>
                    En attente de validation par un bénévole
                </p>

                {/* Section simplifiée - pas de sélection de mode */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ color: '#667eea', marginBottom: '20px' }}>🏪 Présentez-vous à l'accueil</h3>

                    <div style={{
                        background: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '15px',
                        marginBottom: '20px'
                    }}>
                        <p style={{ marginBottom: '20px', color: '#333', lineHeight: '1.6' }}>
                            Un bénévole va vous aider à finaliser votre paiement avec l'un des modes suivants :
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '15px'
                        }}>
                            <div style={{
                                padding: '15px',
                                background: 'white',
                                borderRadius: '10px',
                                border: '2px solid #4CAF50'
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '5px' }}>💵</div>
                                <div style={{ fontWeight: '600' }}>Espèces</div>
                            </div>
                            <div style={{
                                padding: '15px',
                                background: 'white',
                                borderRadius: '10px',
                                border: '2px solid #2196F3'
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '5px' }}>💳</div>
                                <div style={{ fontWeight: '600' }}>Carte bancaire</div>
                            </div>
                            <div style={{
                                padding: '15px',
                                background: 'white',
                                borderRadius: '10px',
                                border: '2px solid #ff9500'
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '5px' }}>📝</div>
                                <div style={{ fontWeight: '600' }}>Chèque</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status de vérification */}
                <div style={{
                    background: '#e3f2fd',
                    padding: '15px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                }}>
                    {loading ? (
                        <>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                border: '2px solid #2196F3',
                                borderTop: '2px solid transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            <span>Vérification du statut du paiement en cours...</span>
                        </>
                    ) : (
                        <span>⏳ En attente de validation par un bénévole</span>
                    )}
                </div>

                {error && (
                    <div style={{
                        marginBottom: '20px',
                        padding: '15px',
                        background: '#ff6b6b',
                        color: 'white',
                        borderRadius: '10px'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleRetourAccueil}
                        style={{
                            flex: 1,
                            padding: '15px 30px',
                            background: 'transparent',
                            color: '#667eea',
                            border: '2px solid #667eea',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            minWidth: '150px'
                        }}
                    >
                        🏠 Retour à l'accueil
                    </button>

                    <button
                        onClick={handleContactVolunteer}
                        style={{
                            flex: 1,
                            padding: '15px 30px',
                            background: 'linear-gradient(135deg, #ff9500, #ff8c00)',
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

                {/* CSS Animation */}
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}
