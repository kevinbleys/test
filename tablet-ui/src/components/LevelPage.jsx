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

        // Doorsturen van ALLE state data inclusief tarief info
        nav('/assurance', { 
            state: { 
                ...state, // Spread alle bestaande state (form, age, tarif, etc.)
                niveau: selectedLevel 
            } 
        });
    };

    const handleRetourAccueil = () => {
        nav('/');
    };

    const handleRetourForm = () => {
        nav('/non-member', { state });
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
                maxWidth: '900px'
            }}>
                <h2 style={{
                    color: '#333',
                    marginBottom: '30px',
                    fontSize: '2rem',
                    fontWeight: '300',
                    textAlign: 'center'
                }}>
                    Je déclare :
                </h2>

                {/* Affichage du tarif calculé */}
                {state.tarif !== undefined && (
                    <div style={{
                        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                        color: 'white',
                        padding: '20px',
                        borderRadius: '15px',
                        marginBottom: '30px',
                        textAlign: 'center'
                    }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>
                            💰 Tarif applicable : {state.tarif === 0 ? 'GRATUIT' : `${state.tarif}€`}
                        </h4>
                        <p style={{ margin: '5px 0', opacity: 0.9 }}>
                            👤 {state.form?.nom} {state.form?.prenom} - {state.age} ans
                        </p>
                        <p style={{ margin: '5px 0', opacity: 0.9 }}>
                            {state.tarifDescription}
                        </p>
                    </div>
                )}

                <div style={{ marginBottom: '30px' }}>
                    {[
                        {
                            level: '0',
                            title: 'ne pas être un grimpeur autonome (*)',
                            description: 'Niveau 0 - Grimpeur non autonome',
                            details: [
                                "Je n'ai accès qu'à la structure de blocs.",
                                "Je n'ai pas les compétences requises pour grimper sur le mur à cordes et je m'engage à ne pas grimper sur les zones nécessitant un encordement. Je n'ai accès qu'à la structure de blocs."
                            ]
                        },
                        {
                            level: '1',
                            title: 'être grimpeur autonome de niveau 1 ou je possède un Passeport FFME Escalade blanc (**)',
                            description: 'Niveau 1 - Grimpeur autonome niveau 1',
                            details: [
                                "J'ai accès à la structure blocs et au mur à cordes en moulinette uniquement.",
                                "Je possède les compétences suivantes :",
                                "• Je sais mettre correctement un baudrier",
                                "• Je sais m'encorder en utilisant un nœud de huit tressé avec un nœud d'arrêt", 
                                "• Je sais utiliser un système d'assurage pour assurer en moulinette",
                                "• Je sais parer une chute"
                            ]
                        },
                        {
                            level: '2',
                            title: 'être grimpeur autonome de niveau 2 ou je possède un Passeport FFME Escalade jaune (***)',
                            description: 'Niveau 2 - Grimpeur autonome niveau 2',
                            details: [
                                "J'ai accès à la structure blocs et au mur à cordes en tête.",
                                "Je possède toutes les compétences du niveau 1, plus :",
                                "• Je suis autonome de niveau 1",
                                "• Je sais utiliser un système d'assurage pour assurer en tête",
                                "• Je sais grimper en tête"
                            ]
                        }
                    ].map(({ level, title, description, details }) => (
                        <div key={level} style={{ marginBottom: '25px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                padding: '20px',
                                border: '2px solid #ddd',
                                borderRadius: '15px',
                                backgroundColor: selectedLevel === level ? '#e8f5e8' : '#fff',
                                borderColor: selectedLevel === level ? '#4CAF50' : '#ddd',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                marginBottom: '15px'
                            }} onClick={() => handleLevelChange(level)}>
                                <input
                                    type="radio"
                                    name="niveau"
                                    value={level}
                                    checked={selectedLevel === level}
                                    onChange={() => handleLevelChange(level)}
                                    style={{ marginRight: '15px', transform: 'scale(1.2)' }}
                                />
                                <span style={{ lineHeight: '1.6', flex: 1, fontSize: '1.1rem' }}>
                                    {title}
                                </span>
                            </div>

                            <div style={{
                                marginLeft: '40px',
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '10px',
                                border: '1px solid #e9ecef'
                            }}>
                                <h4 style={{ color: '#667eea', marginBottom: '10px' }}>{description}</h4>
                                {details.map((detail, index) => (
                                    <p key={index} style={{ 
                                        margin: '5px 0', 
                                        lineHeight: '1.5',
                                        color: '#555',
                                        fontSize: '0.95rem'
                                    }}>
                                        {detail}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
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
                        onClick={handleRetourForm}
                        style={{
                            flex: 1,
                            padding: '15px 30px',
                            background: 'transparent',
                            color: '#ff9500',
                            border: '2px solid #ff9500',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            minWidth: '150px'
                        }}
                    >
                        ← Retour formulaire
                    </button>

                    <button
                        onClick={continuer}
                        disabled={!selectedLevel}
                        style={{
                            flex: 2,
                            padding: '15px 30px',
                            background: !selectedLevel ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: !selectedLevel ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s',
                            minWidth: '150px'
                        }}
                    >
                        Continuer →
                    </button>
                </div>
            </div>
        </div>
    );
}
