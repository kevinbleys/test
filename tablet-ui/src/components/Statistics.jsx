// src/components/Statistics.jsx
import React from 'react';

export default function Statistics() {
  const members = JSON.parse(localStorage.getItem('members') || '[]');
  const nonMembers = JSON.parse(localStorage.getItem('non_members') || '[]');

  return (
    <div className="stats-container">
      <h2>Statistiques des Vérifications</h2>
      
      <div className="stat-box">
        <h3>Membres vérifiés</h3>
        <p>Total : {members.length}</p>
        <ul>
          {members.map((m, i) => (
            <li key={i}>{m.nom} {m.prenom}</li>
          ))}
        </ul>
      </div>

      <div className="stat-box">
        <h3>Non-membres</h3>
        <p>Total : {nonMembers.length}</p>
        <ul>
          {nonMembers.map((m, i) => (
            <li key={i}>{m.nom} {m.prenom}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
