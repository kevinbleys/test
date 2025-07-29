import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playSuccessSound, playBuzzerSound } from '../utils/soundUtils';

export default function AssurancePage() {
  const { state } = useLocation();
  const nav = useNavigate();
  const [chk, setChk] = useState({ c1:false, c2:false, c3:false });

  if (!state?.form) return nav('/non-member');
  const allOk = Object.values(chk).every(Boolean);

  const toggle = k => setChk(o => ({ ...o, [k]:!o[k] }));

  const finish = async () => {
    if (!allOk) { playBuzzerSound(); return; }

    try {
      const { data } = await axios.post('http://localhost:4000/presences', {
        type:'non-adherent',
        ...state.form
      });
      if (data.success) {
        playSuccessSound();
        nav('/paiement', {
          state:{ presenceId:data.presence.id, montant:data.presence.tarif||10 }
        });
      }
    } catch { playBuzzerSound(); }
  };

  return (
    <div className="conditions-page">
      <h2>Information relative à l’assurance du pratiquant</h2>

      {/* volledige tekst bijlage 2, beknopt gemaakt */}
      <p className="warning">
        Cette assurance ne couvre pas les dommages corporels que le pratiquant
        pourrait se causer à lui-même, en l’absence de tiers responsable identifié.
      </p>
      <ol>
        <li>La structure dispose d’une RC couvrant les dommages causés à des tiers.</li>
        <li>L’assurance individuelle accident (IA) est vivement recommandée.</li>
        <li>Vérifiez vos garanties personnelles ou souscrivez une licence FFME.</li>
      </ol>

      <label><input type="checkbox" checked={chk.c1} onChange={()=>toggle('c1')}/>
        Je reconnais avoir été informé des conditions d’assurance applicables
      </label>
      <label><input type="checkbox" checked={chk.c2} onChange={()=>toggle('c2')}/>
        Je reconnais avoir été informé de l’existence et de l’intérêt d’une assurance individuelle accident
      </label>
      <label><input type="checkbox" checked={chk.c3} onChange={()=>toggle('c3')}/>
        Je reconnais avoir été informé de la possibilité de souscrire une assurance complémentaire adaptée
      </label>

      <button disabled={!allOk} onClick={finish} className="btn-verify">
        Continuer vers paiement
      </button>
    </div>
  );
}
