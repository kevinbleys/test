import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { playBuzzerSound } from '../utils/soundUtils';

export default function LevelPage() {
  const { state } = useLocation();          // form-data
  const nav = useNavigate();
  const [niv, setNiv] = useState('');
  const [err, setErr] = useState('');

  if (!state?.form) { nav('/non-member'); return null; }

  const continuer = () => {
    if (!niv) { setErr('Sélectionnez votre niveau'); playBuzzerSound(); return; }
    nav('/assurance', { state: { form: state.form, niveau: niv } });
  };

  return (
    <div className="conditions-page">
      <h2>Je déclare :</h2>

      <div className="radio-block">
        <label>
          <input type="radio" name="level" value="0" onChange={() => setNiv('0')} />
          ne pas être un grimpeur autonome (accès bloc uniquement).
        </label>
        <label>
          <input type="radio" name="level" value="1" onChange={() => setNiv('1')} />
          être grimpeur autonome de niveau 1 <br />
          ou je possède un Passeport FFME Escalade blanc.
        </label>
        <label>
          <input type="radio" name="level" value="2" onChange={() => setNiv('2')} />
          être grimpeur autonome de niveau 2 <br />
          ou je possède un Passeport FFME Escalade jaune.
        </label>
      </div>

      {/* uitleg onderaan – rechtstreeks uit bijlage 1 */}
      <div className="niveau-info">
        (Niveau 0 : accès uniquement aux blocs.<br/>
        Niveau 1 : accès blocs + moulinette, maîtrise du baudrier, nœud de huit, assurage.<br/>
        Niveau 2 : accès blocs + tête, maîtrises précédentes + assurage tête, grimpe en tête.)
      </div>

      {err && <div className="error-message">{err}</div>}
      <button className="btn-verify" onClick={continuer}>Poursuivre</button>
      <button className="btn-retour-accueil" onClick={() => nav('/')}>← Retour</button>
    </div>
  );
}
