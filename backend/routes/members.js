/*
 *  Route / members
 *  ─────────────────────────────────────────────────────────────
 *  Logica:
 *  1.  Elke persoon die als lid (“Adhérent”) in PEPsup voorkomt
 *      wordt als geldig beschouwd – óók wanneer
 *      ① joinFileStatusLabel ontbreekt of “À payer” is;
 *  2.  Alleen volledig onbekende personen of “Contact extérieur”
 *      blijven NIET-geldig en moeten via het niet-lid-formulier.
 */

const express   = require('express');
const router    = express.Router();
const sync      = require('../sync-service');

/* Helper: test op lid-categorie */
const isAdherentCategory = m =>
  Array.isArray(m.categories) &&
  m.categories.some(c =>
    typeof c.label === 'string' &&
    c.label.toLowerCase().includes('adhérent')
  );

/* Helper: normale status-labels die wél betaald betekenen */
const paidLabels = ['payé', 'pay', 'paid', 'en cours', 'en cours de paiement'];

router.get('/check', (req, res) => {
  const { nom, prenom } = req.query;
  if (!nom || !prenom) {
    return res.status(400).json({
      success: false,
      error  : "Paramètres 'nom' et 'prenom' requis"
    });
  }

  /* Zoek lid in gesynchroniseerde lijst */
  const members = sync.getMembers();
  const member  = members.find(m =>
    m.lastname?.trim().toLowerCase()  === nom.trim().toLowerCase()  &&
    m.firstname?.trim().toLowerCase() === prenom.trim().toLowerCase()
  );

  if (!member) {
    /* Helemaal niet gevonden → onbekend */
    return res.json({
      success: false,
      error  : "Aucun membre trouvé avec ce nom et prénom"
    });
  }

  /* Bepaal betaalstatus */
  const rawStatus = (member.joinFileStatusLabel || '').trim().toLowerCase();
  const isPaid =
    paidLabels.includes(rawStatus) ||
    isAdherentCategory(member);          // categorie “Adhérent” is voldoende

  if (isPaid) {
    /* Geldig lid → OK */
    return res.json({
      success : true,
      isPaid  : true,
      message : "Adhésion reconnue. Bienvenue !",
      membre  : member
    });
  }

  /* Wel lid maar niet betaald → blijft foutmelding */
  return res.json({
    success : false,
    isPaid  : false,
    error   : "Vous n'avez pas encore réglé votre adhésion, merci d'appeler un bénévole.",
    membre  : member
  });
});

/* Extra endpoint: alle leden */
router.get('/all', (_req, res) => {
  try {
    res.json({ success: true, members: sync.getMembers() });
  } catch (e) {
    res.status(500).json({ success:false, error: e.message });
  }
});

module.exports = router;
