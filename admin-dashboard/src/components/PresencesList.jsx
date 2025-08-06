import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PresencesList() {
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  
  // **NIEUWE STATE VOOR DATUM FILTER**
  const [selectedDate, setSelectedDate] = useState('today');
  const [availableDates, setAvailableDates] = useState([]);
  const [isHistoryMode, setIsHistoryMode] = useState(false);

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  useEffect(() => {
    if (selectedDate === 'today') {
      fetchPresences();
      setIsHistoryMode(false);
    } else {
      fetchPresencesByDate(selectedDate);
      setIsHistoryMode(true);
    }
  }, [selectedDate]);

  // **NIEUWE FUNCTIE: Haal beschikbare datums op**
  const fetchAvailableDates = async () => {
    try {
      const response = await axios.get('http://localhost:4000/presences/history');
      if (response.data.success) {
        setAvailableDates(response.data.dates);
      }
    } catch (error) {
      console.error('Fout bij ophalen datums:', error);
    }
  };

  // **NIEUWE FUNCTIE: Haal presences op per datum**
  const fetchPresencesByDate = async (date) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:4000/presences/history/${date}`);
      if (response.data.success) {
        // Sorteer per datum (nieuwste eerst)
        const sortedPresences = response.data.presences.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        setPresences(sortedPresences);
      } else {
        setError('Erreur lors du chargement des présences historiques');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const fetchPresences = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/presences');
      if (response.data.success) {
        // Sorteer per datum (nieuwste eerst)
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

  // **AANGEPASTE FUNCTIE: Valideer met betalingsmethode**
  const handleValiderPresence = async (id, montant = 10, methodePaiement = 'Especes') => {
    if (isHistoryMode) {
      alert('Impossible de modifier les données historiques');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:4000/presences/${id}/valider`, {
        montant,
        methodePaiement
      });
      
      if (response.data.success) {
        fetchPresences();
      } else {
        alert('Erreur lors de la validation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la validation');
    }
  };

  // **AANGEPASTE FUNCTIE: Voeg tarief toe met betalingsmethode**
  const handleAjouterTarif = async (id, montant, methodePaiement = 'Especes') => {
    if (isHistoryMode) {
      alert('Impossible de modifier les données historiques');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:4000/presences/${id}/ajouter-tarif`, {
        montant: parseFloat(montant) || 0,
        methodePaiement
      });
      
      if (response.data.success) {
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
    if (isHistoryMode) {
      alert('Impossible de modifier les données historiques');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir annuler cette présence ?')) {
      try {
        const response = await axios.post(`http://localhost:4000/presences/${id}/annuler`);
        
        if (response.data.success) {
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

  // **NIEUWE FUNCTIE: Handmatige archivering**
  const handleArchiveToday = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir archiver les présences d\'aujourd\'hui ?')) {
      try {
        const response = await axios.post('http://localhost:4000/presences/archive');
        
        if (response.data.success) {
          alert(response.data.message);
          fetchPresences();
          fetchAvailableDates();
        } else {
          alert(response.data.message || 'Erreur lors de l\'archivage');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'archivage');
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
        return <span style={{backgroundColor: '#28a745', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>Adhérent validé</span>;
      case 'Payé':
      case 'Pay':
        return <span style={{backgroundColor: '#007bff', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>Payé</span>;
      case 'pending':
        return <span style={{backgroundColor: '#ffc107', color: 'black', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>En attente</span>;
      case 'Annulé':
        return <span style={{backgroundColor: '#dc3545', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>Annulé</span>;
      default:
        return <span style={{backgroundColor: '#6c757d', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>{presence.status}</span>;
    }
  };

  const getTarifDisplay = (presence) => {
    if (presence.type === 'adherent') {
      // Voor adherents
      if (presence.tarif !== undefined && presence.tarif !== null) {
        return `${presence.tarif}€`;
      } else {
        return <span style={{color: '#28a745', fontWeight: 'bold'}}>Gratuit (adhérent)</span>;
      }
    } else {
      // Voor non-adherents
      return presence.tarif ? `${presence.tarif}€` : '10€';
    }
  };

  // **NIEUWE FUNCTIE: Betalingsmethode weergave**
  const getMethodePaiementDisplay = (presence) => {
    if (!presence.methodePaiement) {
      return <span style={{color: '#6c757d'}}>-</span>;
    }
    
    const methodColors = {
      'Especes': '#28a745',
      'CB': '#007bff', 
      'Cheque': '#ffc107'
    };
    
    return (
      <span style={{
        backgroundColor: methodColors[presence.methodePaiement] || '#6c757d',
        color: presence.methodePaiement === 'Cheque' ? 'black' : 'white',
        padding: '2px 6px',
        borderRadius: '3px',
        fontSize: '11px',
        fontWeight: 'bold'
      }}>
        {presence.methodePaiement}
      </span>
    );
  };

  if (loading) return <div style={{padding: '20px'}}>Chargement des présences...</div>;
  if (error) return <div style={{padding: '20px', color: '#dc3545'}}>Erreur: {error}</div>;

  const filteredPresences = getFilteredPresences();

  return (
    <div style={{padding: '20px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2 style={{margin: 0}}>
          {isHistoryMode ? `Présences du ${selectedDate}` : 'Liste des présences'} ({filteredPresences.length})
        </h2>
        
        {/* **NIEUWE SECTIE: Datum selectie** */}
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <select 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px'}}
          >
            <option value="today">Aujourd'hui</option>
            {availableDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
          
          {selectedDate === 'today' && (
            <button 
              onClick={handleArchiveToday}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Archiver aujourd'hui
            </button>
          )}
        </div>
      </div>

      <div style={{marginBottom: '20px'}}>
        <button onClick={() => setFilter('all')} style={{marginRight: '10px', padding: '8px 16px', backgroundColor: filter === 'all' ? '#007bff' : '#f8f9fa', color: filter === 'all' ? 'white' : 'black', border: '1px solid #ddd', borderRadius: '4px'}}>
          Tous
        </button>
        <button onClick={() => setFilter('adherent')} style={{marginRight: '10px', padding: '8px 16px', backgroundColor: filter === 'adherent' ? '#28a745' : '#f8f9fa', color: filter === 'adherent' ? 'white' : 'black', border: '1px solid #ddd', borderRadius: '4px'}}>
          Adhérents
        </button>
        <button onClick={() => setFilter('non-adherent')} style={{marginRight: '10px', padding: '8px 16px', backgroundColor: filter === 'non-adherent' ? '#ffc107' : '#f8f9fa', color: filter === 'non-adherent' ? 'black' : 'black', border: '1px solid #ddd', borderRadius: '4px'}}>
          Non-adhérents
        </button>
        <button onClick={() => setFilter('pending')} style={{padding: '8px 16px', backgroundColor: filter === 'pending' ? '#dc3545' : '#f8f9fa', color: filter === 'pending' ? 'white' : 'black', border: '1px solid #ddd', borderRadius: '4px'}}>
          En attente
        </button>
      </div>

      {filteredPresences.length === 0 ? (
        <div style={{textAlign: 'center', padding: '40px', color: '#6c757d'}}>
          {isHistoryMode ? 'Aucune présence trouvée pour cette date' : 'Aucune présence trouvée'}
        </div>
      ) : (
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            <thead>
              <tr style={{backgroundColor: '#f8f9fa'}}>
                <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>Date/Heure</th>
                <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>Type</th>
                <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>Nom</th>
                <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>Prénom</th>
                <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>Tarif</th>
                <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>Paiement</th>
                <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>Statut</th>
                {!isHistoryMode && <th style={{padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6'}}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPresences.map((presence, index) => (
                <tr key={presence.id} style={{backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9'}}>
                  <td style={{padding: '12px', borderBottom: '1px solid #dee2e6'}}>{formatDate(presence.date)}</td>
                  <td style={{padding: '12px', borderBottom: '1px solid #dee2e6'}}>
                    {presence.type === 'adherent' ? 'Adhérent' : 'Non-adhérent'}
                  </td>
                  <td style={{padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold'}}>{presence.nom}</td>
                  <td style={{padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold'}}>{presence.prenom}</td>
                  <td style={{padding: '12px', borderBottom: '1px solid #dee2e6'}}>{getTarifDisplay(presence)}</td>
                  <td style={{padding: '12px', borderBottom: '1px solid #dee2e6'}}>{getMethodePaiementDisplay(presence)}</td>
                  <td style={{padding: '12px', borderBottom: '1px solid #dee2e6'}}>{getStatusBadge(presence)}</td>
                  {!isHistoryMode && (
                    <td style={{padding: '12px', borderBottom: '1px solid #dee2e6'}}>
                      <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                        {presence.status === 'pending' && (
                          <div style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                            <input
                              type="number"
                              placeholder="€"
                              style={{width: '50px', padding: '4px', border: '1px solid #ddd', borderRadius: '3px'}}
                              onChange={(e) => {
                                const value = e.target.value;
                                const methodePaiement = e.target.parentElement.querySelector('select').value;
                                if (value) {
                                  handleValiderPresence(presence.id, parseFloat(value), methodePaiement);
                                }
                              }}
                            />
                            <select
                              style={{padding: '4px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '12px'}}
                              defaultValue="Especes"
                            >
                              <option value="Especes">Espèces</option>
                              <option value="CB">CB</option>
                              <option value="Cheque">Chèque</option>
                            </select>
                            <button
                              onClick={() => {
                                const input = document.querySelector(`input[placeholder="€"]`);
                                const select = input.parentElement.querySelector('select');
                                handleValiderPresence(presence.id, input.value ? parseFloat(input.value) : 10, select.value);
                              }}
                              style={{backgroundColor: '#28a745', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px'}}
                            >
                              Valider
                            </button>
                          </div>
                        )}
                        
                        {presence.type === 'adherent' && (presence.tarif === undefined || presence.tarif === null) && (
                          <div style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                            <input
                              type="number"
                              placeholder="€"
                              style={{width: '50px', padding: '4px', border: '1px solid #ddd', borderRadius: '3px'}}
                            />
                            <select
                              style={{padding: '4px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '12px'}}
                              defaultValue="Especes"
                            >
                              <option value="Especes">Espèces</option>
                              <option value="CB">CB</option>
                              <option value="Cheque">Chèque</option>
                            </select>
                            <button
                              onClick={(e) => {
                                const container = e.target.parentElement;
                                const input = container.querySelector('input');
                                const select = container.querySelector('select');
                                handleAjouterTarif(presence.id, input.value, select.value);
                              }}
                              style={{backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px'}}
                            >
                              + Tarif
                            </button>
                          </div>
                        )}
                        
                        {presence.status !== 'Annulé' && (
                          <button
                            onClick={() => handleAnnulerPresence(presence.id)}
                            style={{backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px'}}
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
