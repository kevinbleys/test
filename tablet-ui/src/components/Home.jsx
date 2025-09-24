import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Bienvenue au Club d'Escalade</h1>
      
      <div className="buttons-container">
        <button 
          className="main-button member-button"
          onClick={() => navigate('/member-check')}
        >
          Je suis membre du club
        </button>
        
        <button 
          className="main-button non-member-button"
          onClick={() => navigate('/non-member')}
        >
          Je ne suis pas membre du club
        </button>
      </div>
    </div>
  );
}
