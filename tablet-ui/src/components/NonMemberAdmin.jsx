import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NonMemberAdmin.css';

export default function NonMemberAdmin() {
  const [nonMembers, setNonMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editAmounts, setEditAmounts] = useState({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadNonMembers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/non-members');
      setNonMembers(response.data.nonMembers);
      setError('');
    } catch (err) {
      setError("Erreur lors du chargement des non-membres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNonMembers();
    const intervalId = setInterval(loadNonMembers, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handlePaymentValidation = async (id, amount) => {
    try {
      const response = await axios.post(`http://localhost:4000/non-members/${id}/paid`, { amount: Number(amount) });
      if (response.data.success) {
        setSuccessMessage("Paiement validé avec succès");
        loadNonMembers();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError("Erreur lors de la validation du paiement");
    }
  };

  const handleCancelPayment = async (id) => {
    try {
      await axios.post(`http://localhost:4000/non-members/${id}/cancel`);
      loadNonMembers();
    } catch (error) {
      setError("Erreur lors de l'annulation");
    }
  };

  const handleAmountChange = (id, value) => {
    setEditAmounts(prev => ({
      ...prev,
      [id]: value.replace(/[^0-9]/g, '')
    }));
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="admin-container">
      <h2>Administration des Non-Adhérents</h2>
      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}
      <button className="refresh-button" onClick={loadNonMembers} disabled={loading}>
        {loading ? 'Chargement...' : 'Actualiser'}
      </button>
      {loading ? (
        <div className="loading">Chargement des données...</div>
      ) : (
        <div className="table-container">
          {nonMembers.length === 0 ? (
            <p className="no-data">Aucun non-membre enregistré.</p>
          ) : (
            <table className="members-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Date de naissance</th>
                  <th>Âge</th>
                  <th>Tarif</th>
                  <th>Méthode de paiement</th>
                  <th>Statut</th>
                  <th>Date d'enregistrement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {nonMembers.map((member) => (
                  <tr key={member.id} className={member.paid ? 'paid-row' : ''}>
                    <td>{member.nom}</td>
                    <td>{member.prenom}</td>
                    <td>{new Date(member.dateNaissance).toLocaleDateString('fr-FR')}</td>
                    <td>{member.age}</td>
                    <td>
                      {!member.paid ? (
                        <input
                          type="text"
                          value={editAmounts[member.id] !== undefined ? editAmounts[member.id] : member.tarif}
                          onChange={(e) => handleAmountChange(member.id, e.target.value)}
                          style={{ width: '60px' }}
                        />
                      ) : (
                        member.amount !== undefined ? (member.amount === 0 ? 'Gratuit' : member.amount + '€') : (member.tarif === 0 ? 'Gratuit' : member.tarif + '€')
                      )}
                    </td>
                    <td>{member.methodePaiement}</td>
                    <td>{member.paid ? 'Payé' : 'En attente'}</td>
                    <td>{formatDate(member.dateCreated)}</td>
                    <td>
                      {!member.paid && (
                        <>
                          <button
                            className="pay-button"
                            onClick={() => handlePaymentValidation(member.id, editAmounts[member.id] !== undefined ? editAmounts[member.id] : member.tarif)}
                          >
                            Valider
                          </button>
                          <button
                            className="cancel-button"
                            onClick={() => handleCancelPayment(member.id)}
                          >
                            Annuler
                          </button>
                        </>
                      )}
                      {member.paid && member.amount !== undefined && (
                        <span className="paid-label">Payé {member.amount === 0 ? 'Gratuit' : member.amount + '€'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
