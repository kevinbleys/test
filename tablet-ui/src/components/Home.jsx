import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSuccessSound } from '../utils/soundUtils';
import './Home.css';

export default function Home() {
  const nav = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMemberClick = () => {
    playSuccessSound();
    nav('/members');
  };

  const handleNonMemberClick = () => {
    playSuccessSound();
    nav('/non-member-type'); // ✅ NIEUWE ROUTE: Ga naar keuze pagina
  };

  return (
    <div className="home-container">
      <div className="content">
        <div className="header">
          <h1>🧗‍♀️ Beyrède Escalade Montagne</h1>
          <div className="time-display">
            {time.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>

        <div className="button-container">
          <button 
            className="main-button member-button"
            onClick={handleMemberClick}
          >
            <div className="button-icon">👤</div>
            <div className="button-text">
              <div className="button-title">Je suis membre</div>
              <div className="button-subtitle">Vérification rapide avec PepSup</div>
            </div>
          </button>

          <button 
            className="main-button non-member-button"
            onClick={handleNonMemberClick}
          >
            <div className="button-icon">📝</div>
            <div className="button-text">
              <div className="button-title">Je ne suis pas membre</div>
              <div className="button-subtitle">Inscription pour la séance</div>
            </div>
          </button>
        </div>

        <div className="footer">
          <p>Sélectionnez votre statut pour commencer</p>
        </div>
      </div>
    </div>
  );
}