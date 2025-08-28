import React, { useState, useEffect } from 'react';

// ✅ GECORRIGEERDE API URL
const API_BASE_URL = 'http://localhost:3001';

export default function PresencesList() {
    const [presences, setPresences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadPresences();
        loadStats();
        // Refresh every 30 seconds
        const interval = setInterval(() => {
            loadPresences();
            loadStats();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadPresences = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/presences`);
            const data = await response.json();

            if (data.success) {
                // Sort by date (newest first)
                const sortedPresences = data.presences.sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                );
                setPresences(sortedPresences);
            } else {
                setError('Erreur lors du chargement des présences');
            }
        } catch (err) {
            setError('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/stats/today`);
            const data = await response.json();

            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Erreur stats:', err);
        }
    };

    const deletePresence = async (id, nom, prenom) => {
        if (!window.confirm(`Supprimer la présence de ${prenom} ${nom} ?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/presences/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                await loadPresences();
                await loadStats();
                alert('Présence supprimée');
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (err) {
            alert('Erreur de connexion');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeLabel = (type) => {
        return type === 'adherent' ? '👤 Adhérent' : '🎯 Visiteur';
    };

    const getTypeColor = (type) => {
        return type === 'adherent' ? '#4CAF50' : '#2196F3';
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '1.2rem' }}>Chargement des présences...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', fontFamily: "'Segoe UI', sans-serif" }}>
            <h1 style={{ marginBottom: '30px', color: '#333' }}>
                📊 Gestion des Présences
            </h1>

            {/* Stats du jour */}
            {stats && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                        color: 'white',
                        padding: '20px',
                        borderRadius: '10px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            {stats.total}
                        </div>
                        <div>Total présences</div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                        color: 'white',
                        padding: '20px',
                        borderRadius: '10px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            {stats.adherents}
                        </div>
                        <div>Adhérents</div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #FF9800, #F57C00)',
                        color: 'white',
                        padding: '20px',
                        borderRadius: '10px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            {stats.nonAdherents}
                        </div>
                        <div>Visiteurs</div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
                        color: 'white',
                        padding: '20px',
                        borderRadius: '10px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            {stats.revenue}€
                        </div>
                        <div>Recettes</div>
                    </div>
                </div>
            )}

            {error && (
                <div style={{
                    background: '#ff6b6b',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '10px',
                    marginBottom: '20px'
                }}>
                    {error}
                </div>
            )}

            {/* Liste des présences */}
            <div style={{
                background: 'white',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderBottom: '1px solid #dee2e6'
                }}>
                    <h2 style={{ margin: 0 }}>
                        Présences d'aujourd'hui ({presences.length})
                    </h2>
                </div>

                {presences.length === 0 ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#666'
                    }}>
                        Aucune présence enregistrée
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse'
                        }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa' }}>
                                    <th style={tableHeaderStyle}>Type</th>
                                    <th style={tableHeaderStyle}>Nom</th>
                                    <th style={tableHeaderStyle}>Prénom</th>
                                    <th style={tableHeaderStyle}>Heure</th>
                                    <th style={tableHeaderStyle}>Tarif</th>
                                    <th style={tableHeaderStyle}>Paiement</th>
                                    <th style={tableHeaderStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {presences.map((presence, index) => (
                                    <tr
                                        key={presence.id}
                                        style={{
                                            background: index % 2 === 0 ? 'white' : '#f8f9fa',
                                            borderBottom: '1px solid #dee2e6'
                                        }}
                                    >
                                        <td style={tableCellStyle}>
                                            <span style={{
                                                background: getTypeColor(presence.type),
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '15px',
                                                fontSize: '0.9rem'
                                            }}>
                                                {getTypeLabel(presence.type)}
                                            </span>
                                        </td>
                                        <td style={tableCellStyle}>
                                            <strong>{presence.nom}</strong>
                                        </td>
                                        <td style={tableCellStyle}>
                                            {presence.prenom}
                                        </td>
                                        <td style={tableCellStyle}>
                                            {formatDate(presence.date)}
                                        </td>
                                        <td style={tableCellStyle}>
                                            {presence.tarif !== undefined ? 
                                                (presence.tarif === 0 ? 'Gratuit' : `${presence.tarif}€`) 
                                                : '-'
                                            }
                                        </td>
                                        <td style={tableCellStyle}>
                                            {presence.methodePaiement || '-'}
                                        </td>
                                        <td style={tableCellStyle}>
                                            <button
                                                onClick={() => deletePresence(
                                                    presence.id, 
                                                    presence.nom, 
                                                    presence.prenom
                                                )}
                                                style={{
                                                    background: '#ff6b6b',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '5px 10px',
                                                    borderRadius: '5px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                🗑️ Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#e3f2fd',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <span style={{ fontSize: '1.2rem' }}>🔄</span>
                <span>Actualisation automatique toutes les 30 secondes</span>
            </div>
        </div>
    );
}

const tableHeaderStyle = {
    padding: '15px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#333',
    borderBottom: '2px solid #dee2e6'
};

const tableCellStyle = {
    padding: '12px 15px',
    verticalAlign: 'middle'
};
