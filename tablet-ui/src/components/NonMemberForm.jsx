import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playBuzzerSound } from '../utils/soundUtils';

export default function NonMemberForm() {
  const nav = useNavigate();
  const [data, setData] = useState({
    nom: '', prenom: '', email: '', telephone: '', dateNaissance: ''
  });
  const [err, setErr] = useState('');

  const change = e => setData({ ...data, [e.target.name]: e.target.value });

  function next(e) {
    e.preventDefault();
    const ok = data.nom && data.prenom && data.email;
    if (!ok) { setErr('Tous les champs * sont obligatoires'); playBuzzerSound(); return; }
    nav('/niveau', { state: { form: data } });
  }

  return (
    <div className="non-member-form">
      <h2>Inscription non-membre</h2>

      <form className="form-stack" onSubmit={next}>
        <label>Nom *<input name="nom" value={data.nom} onChange={change} required /></label>
        <label>Prénom *<input name="prenom" value={data.prenom} onChange={change} required /></label>
        <label>Email *<input type="email" name="email" value={data.email} onChange={change} required /></label>
        <label>Téléphone<input name="telephone" value={data.telephone} onChange={change} /></label>
        <label>Date de naissance<input type="date" name="dateNaissance" value={data.dateNaissance} onChange={change} /></label>

        {err && <div className="error-message">{err}</div>}
        <button className="btn-verify">Continuer</button>
        <button type="button" className="btn-retour-accueil" onClick={() => nav('/')}>← Retour</button>
      </form>
    </div>
  );
}
