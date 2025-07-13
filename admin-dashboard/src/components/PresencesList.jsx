import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PresencesList() {
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, adherent, non-adherent, pending

  useEffect(() => {
    fetchPresences();
  }, []);

  const fetchPresences = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/presences');
      if (response.data.success) {
        // Trier par date (plus récent en premier)
        const sortedPresences = response.data.presences.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        setPresences(sortedPresences);
      } else {
        setError('Erreur lors du chargement des présences');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleValiderPresence = async (id, montant = 10) => {
    try {
      const response = await axios.post(`http://localhost:4000/presences/${id}/valider`, {
        montant
      });
      
      if (response.data.success) {
        // Actualiser la liste
        fetchPresences();
      } else {
        alert('Erreur lors de la validation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la validation');
    }
  };

  const handleAjouterTarif = async (id, montant) => {
    try {
      const response = await axios.post(`http://localhost:4000/presences/${id}/ajouter-tarif`, {
        montant: parseFloat(montant) || 0
      });
      
      if (response.data.success) {
        // Actualiser la liste
        fetchPresences();
      } else {
        alert('Erreur lors de l\'ajout du tarif');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout du tarif');
    }
  };

  const handleAnnulerPresence = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette présence ?')) {
      try {
        const response = await axios.post(`http://localhost:4000/presences/${id}/annuler`);
        
        if (response.data.success) {
          // Actualiser la liste
          fetchPresences();
        } else {
          alert('Erreur lors de l\'annulation');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'annulation');
      }
    }
  };

  const getFilteredPresences = () => {
    switch (filter) {
      case 'adherent':
        return presences.filter(p => p.type === 'adherent');
      case 'non-adherent':
        return presences.filter(p => p.type === 'non-adherent');
      case 'pending':
        return presences.filter(p => p.status === 'pending');
      default:
        return presences;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getStatusBadge = (presence) => {
    switch (presence.status) {
      case 'adherent':
        return <span className="badge badge-success">Adhérent validé</span>;
      case 'Payé':
      case 'Pay':
        return <span className="badge badge-success">Payé</span>;
      case 'pending':
        return <span className="badge badge-warning">En attente</span>;
      case 'Annulé':
        return <span className="badge badge-danger">Annulé</span>;
      default:
        return <span className="badge badge-secondary">{presence.status}</span>;
    }
  };

  const getTarifDisplay = (presence) => {
    if (presence.type === 'adherent') {
      // Pour les adhérents
      if (presence.tarif !== undefined && presence.tarif !== null) {
        return `${presence.tarif}€`;
      } else {
        return <span className="text-muted">Gratuit (adhérent)</span>;
      }
    } else {
      // Pour les non-adhérents
      return presence.tarif ? `${presence.tarif}€` : '10€';
    }
  };

  if (loading) return <div className="loading">Chargement des présences...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;

  const filteredPresences = getFilteredPresences();

  return (
    <div className="presences-list">
      <div className="presences-header">
        <h2>Liste des présences ({filteredPresences.length})</h2>
        <button onClick={fetchPresences} className="btn-refresh">
          🔄 Actualiser
        </button>
      </div>

      <div className="filters">
        <button 
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          Toutes ({presences.length})
        </button>
        <button 
          className={filter === 'adherent' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('adherent')}
        >
          Adhérents ({presences.filter(p => p.type === 'adherent').length})
        </button>
        <button 
          className={filter === 'non-adherent' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('non-adherent')}
        >
          Non-adhérents ({presences.filter(p => p.type === 'non-adherent').length})
        </button>
        <button 
          className={filter === 'pending' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('pending')}
        >
          En attente ({presences.filter(p => p.status === 'pending').length})
        </button>
      </div>

      <div className="presences-table">
        {filteredPresences.length === 0 ? (
          <div className="no-presences">Aucune présence trouvée</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date/Heure</th>
                <th>Type</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Tarif</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPresences.map((presence) => (
                <tr key={presence.id}>
                  <td>{formatDate(presence.date)}</td>
                  <td>
                    <span className={`type-badge ${presence.type}`}>
                      {presence.type === 'adherent' ? 'Adhérent' : 'Non-adhérent'}
                    </span>
                  </td>
                  <td>{presence.nom}</td>
                  <td>{presence.prenom}</td>
                  <td>{getTarifDisplay(presence)}</td>
                  <td>{getStatusBadge(presence)}</td>
                  <td className="actions">
                    {presence.status === 'pending' && (
                      <button 
                        onClick={() => handleValiderPresence(presence.id)}
                        className="btn-validate"
                      >
                        Valider (10€)
                      </button>
                    )}
                    
                    {presence.type === 'adherent' && (presence.tarif === undefined || presence.tarif === null) && (
                      <button 
                        onClick={() => {
                          const montant = prompt('Montant à ajouter (0 pour gratuit) :', '0');
                          if (montant !== null) {
                            handleAjouterTarif(presence.id, montant);
                          }
                        }}
                        className="btn-add-tarif"
                      >
                        Ajouter tarif
                      </button>
                    )}
                    
                    {presence.status !== 'Annulé' && (
                      <button 
                        onClick={() => handleAnnulerPresence(presence.id)}
                        className="btn-cancel"
                      >
                        Annuler
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
