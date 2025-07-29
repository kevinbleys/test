import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSuccessSound } from '../utils/soundUtils';

export default function Confirmation() {
  const navigate = useNavigate();

  useEffect(() => {
    playSuccessSound();
    const timer = setTimeout(() => navigate('/'), 2500);   // auto-return
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="confirmation-page">
      <h2>Merci !</h2>
      <p>Votre enregistrement est terminé.</p>
      <p>Vous allez être redirigé vers l’accueil…</p>
    </div>
  );
}
