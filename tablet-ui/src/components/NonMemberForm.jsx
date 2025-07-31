import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playBuzzerSound } from '../utils/soundUtils';

export default function NonMemberForm() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '',
    telephone: '', dateNaissance: ''
  });
  const [err, setErr] = useState('');

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const next = e => {
    e.preventDefault();
    if (!form.nom || !form.prenom || !form.email){
      setErr('Champs obligatoires manquants'); playBuzzerSound(); return;
    }
    nav('/niveau', { state:{ form }});
  };

  return (
    <div className="non-member-form">
      <h2>Inscription non-membre</h2>

      <form className="form-stack" onSubmit={next}>
        <label>Nom *<input name="nom" value={form.nom} onChange={onChange} required/></label>
        <label>Prénom *<input name="prenom" value={form.prenom} onChange={onChange} required/></label>
        <label>Email *<input type="email" name="email" value={form.email} onChange={onChange} required/></label>
        <label>Téléphone<input name="telephone" value={form.telephone} onChange={onChange}/></label>
        <label>Date de naissance<input type="date" name="dateNaissance" value={form.dateNaissance} onChange={onChange}/></label>

        {err && <div className="error-message">{err}</div>}
        <button className="btn-verify">Continuer</button>
        <button type="button" className="btn-retour-accueil" onClick={()=>nav('/')}>← Retour</button>
      </form>
    </div>
  );
}
