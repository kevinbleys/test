import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { playBuzzerSound, playSuccessSound } from '../utils/soundUtils';

export default function ConditionsPage() {
  const { state } = useLocation();          // presenceId + montant
  const navigate  = useNavigate();
  const [checks, setChecks] = useState({
    blocOnly  : false,
    baudrier  : false,
    noeud     : false,
    assureur  : false,
    parade    : false
  });

  /** alle boxen aangevinkt? */
  const allOk = Object.values(checks).every(Boolean);

  const toggle = key => setChecks(c => ({ ...c, [key]: !c[key] }));

  useEffect(() => {
    if (!state?.presenceId) navigate('/');
  }, [state, navigate]);

  const continuer = () => {
    playSuccessSound();
    navigate('/paiement', { state });
  };

  return (
    <div className="conditions-page">
      <h2>Je déclare :</h2>

      <label><input type="checkbox" checked={checks.blocOnly} onChange={() => toggle('blocOnly')} />
        ne pas être un grimpeur autonome (bloc uniquement)
      </label>

      <label><input type="checkbox" checked={checks.baudrier} onChange={() => toggle('baudrier')} />
        savoir mettre correctement un baudrier
      </label>

      <label><input type="checkbox" checked={checks.noeud} onChange={() => toggle('noeud')} />
        savoir m’encorder avec un nœud de huit + nœud d’arrêt
      </label>

      <label><input type="checkbox" checked={checks.assureur} onChange={() => toggle('assureur')} />
        savoir utiliser un système d’assurage pour assurer en moulinette
      </label>

      <label><input type="checkbox" checked={checks.parade} onChange={() => toggle('parade')} />
        savoir parer une chute
      </label>

      <hr />

      <h3>Information relative à l’assurance du pratiquant</h3>
      <p className="warning">
        Cette assurance ne couvre pas les dommages corporels que le pratiquant pourrait se causer à lui-même,
        en l’absence de tiers responsable identifié.
      </p>
      <p>
        En l’absence de garantie individuelle accident, il est recommandé de souscrire une couverture adaptée :
        soit auprès de votre assureur, soit via une licence FFME.
      </p>

      <button disabled={!allOk} onClick={continuer} className="btn-verify">
        Poursuivre
      </button>
      {!allOk && <p className="tiny">Veuillez cocher toutes les cases pour continuer.</p>}
    </div>
  );
}
