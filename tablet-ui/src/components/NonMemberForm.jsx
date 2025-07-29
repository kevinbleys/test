import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playBuzzerSound, playSuccessSound } from '../utils/soundUtils';

export default function NonMemberForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '', dateNaissance: ''
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      /* alleen registratie, nog géén tarif-keuze */
      const { data } = await axios.post('http://localhost:4000/presences', {
        type: 'non-adherent',
        ...form
      });
      if (data.success) {
        playSuccessSound();
        /* ga nu naar de check-/assurance-stap */
        navigate('/conditions', {
          state: { presenceId: data.presence.id, montant: data.presence.tarif || 10 }
        });
      } else {
        setErr('Erreur lors de l’enregistrement');
        playBuzzerSound();
      }
    } catch (e) {
      setErr(e.response?.data?.error || 'Erreur de connexion');
      playBuzzerSound();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="non-member-form">
      <h2>Inscription non-membre</h2>
      <form onSubmit={onSubmit}>
        {/* velden */}
        {/* …nom, prenom, email, telephone, dateNaissance … */}
        <button disabled={loading}>S’inscrire</button>
      </form>
      {err && <div className="error-message">{err}</div>}
    </div>
  );
}
