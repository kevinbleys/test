/*
 * Route /members - AANGEPAST VOOR BETAALWAARSCHUWING
 * ─────────────────────────────────────────────────────────────
 * Logica:
 * 1. Alleen personen met EXPLICIETE betaalde status worden geaccepteerd
 * 2. "À payer" status toont waarschuwing
 * 3. Onbekende personen moeten via niet-lid formulier
 */

const express = require('express');
const router = express.Router();
const sync = require('../sync-service');

/* Helper: test op lid-categorie */
const isAdherentCategory = m =>
  Array.isArray(m.categories) &&
  m.categories.some(c =>
    typeof c.label === 'string' &&
    c.label.toLowerCase().includes('adhérent')
  );

/* Helper: EXPLICIETE betaalde status - STRIKTERE CONTROLE */
const paidLabels = ['payé', 'pay', 'paid', 'en cours', 'en cours de paiement', 'validé', 'validee'];
const unpaidLabels = ['à payer', 'a payer', 'en attente', 'pending', 'impayé', 'impaye', 'non payé', 'non paye'];

router.get('/check', (req, res) => {
  const { nom, prenom } = req.query;
  if (!nom || !prenom) {
    return res.status(400).json({
      success: false,
      error: "Paramètres 'nom' et 'prenom' requis"
    });
  }

  console.log('=== MEMBER CHECK ===');
  console.log('Nom:', nom);
  console.log('Prenom:', prenom);

  /* Zoek lid in gesynchroniseerde lijst */
  const members = sync.getMembers();
  const member = members.find(m =>
    m.lastname?.trim().toLowerCase() === nom.trim().toLowerCase() &&
    m.firstname?.trim().toLowerCase() === prenom.trim().toLowerCase()
  );

  if (!member) {
    console.log('Member niet gevonden');
    return res.json({
      success: false,
      error: "Aucun membre trouvé avec ce nom et prénom"
    });
  }

  console.log('Member gevonden:', {
    name: `${member.firstname} ${member.lastname}`,
    categories: member.categories,
    joinFileStatusLabel: member.joinFileStatusLabel
  });

  /* Bepaal betaalstatus - STRIKTERE LOGICA */
  const rawStatus = (member.joinFileStatusLabel || '').trim().toLowerCase();
  console.log('Raw status:', rawStatus);

  // Check of het een adherent categorie is
  const hasAdherentCategory = isAdherentCategory(member);
  console.log('Has adherent category:', hasAdherentCategory);

  // Check expliciete betaalde status
  const isExplicitlyPaid = paidLabels.includes(rawStatus);
  console.log('Is explicitly paid:', isExplicitlyPaid);

  // Check expliciete onbetaalde status
  const isExplicitlyUnpaid = unpaidLabels.includes(rawStatus);
  console.log('Is explicitly unpaid:', isExplicitlyUnpaid);

  // **NIEUWE LOGICA: Striktere controle**
  if (hasAdherentCategory && (isExplicitlyPaid || (!isExplicitlyUnpaid && rawStatus === ''))) {
    // Adherent categorie EN (expliciet betaald OF geen status = OK)
    console.log('✅ Member geaccepteerd - adherent categorie met geldige status');
    return res.json({
      success: true,
      isPaid: true,
      message: "Adhésion reconnue. Bienvenue !",
      membre: member
    });
  }

  if (hasAdherentCategory && isExplicitlyUnpaid) {
    // Adherent categorie MAAR expliciet onbetaald
    console.log('❌ Member geweigerd - adherent categorie maar expliciet onbetaald');
    return res.json({
      success: false,
      isPaid: false,
      error: "Votre adhésion n'est pas encore réglée. Merci de contacter un bénévole pour finaliser votre paiement.",
      membre: member,
      needsPayment: true
    });
  }

  if (!hasAdherentCategory) {
    // Geen adherent categorie
    console.log('❌ Member geweigerd - geen adherent categorie');
    return res.json({
      success: false,
      error: "Vous n'êtes pas enregistré comme adhérent. Merci de vous inscrire comme visiteur.",
      membre: member
    });
  }

  // Fallback - als we hier komen is er iets onverwachts
  console.log('❌ Member geweigerd - fallback logica');
  return res.json({
    success: false,
    isPaid: false,
    error: "Statut d'adhésion non déterminé. Merci de contacter un bénévole.",
    membre: member
  });
});

/* Extra endpoint: alle leden */
router.get('/all', (_req, res) => {
  try {
    res.json({ success: true, members: sync.getMembers() });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
