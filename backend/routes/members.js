const express = require('express');
const router = express.Router();
const syncService = require('../sync-service');

// Debug functie om member status te loggen
const logMemberStatus = (member) => {
  console.log('=== MEMBER STATUS DEBUG ===');
  console.log('Member:', member.firstname, member.lastname);
  console.log('Status label:', member.joinFileStatusLabel);
  console.log('Categories:', member.categories);
  console.log('=== END DEBUG ===');
};

// Route spécifique pour de vérification
router.get('/check', (req, res) => {
  const { nom, prenom } = req.query;
  
  if (!nom || !prenom) {
    return res.status(400).json({ 
      success: false, 
      error: "Les paramètres 'nom' et 'prenom' sont requis" 
    });
  }
  
  try {
    const members = syncService.getMembers();
    console.log(`Searching for member: ${prenom} ${nom}`);
    
    const membre = members.find(
      m => 
        m.lastname?.trim().toLowerCase() === nom.trim().toLowerCase() &&
        m.firstname?.trim().toLowerCase() === prenom.trim().toLowerCase()
    );
    
    if (!membre) {
      console.log('Member not found');
      return res.json({ 
        success: false, 
        error: "Aucun membre trouvé avec ce nom et prénom" 
      });
    }
    
    logMemberStatus(membre);
    
    const status = membre.joinFileStatusLabel ? membre.joinFileStatusLabel.trim().toLowerCase() : "";
    
    // Vérification du statut de paiement
    if (status === "payé" || status === "pay" || status === "paid") {
      console.log('Member is paid - access granted');
      return res.json({
        success: true,
        isPaid: true,
        message: "Adhésion valide. Bienvenue !",
        membre
      });
    } else if (status === "en cours de paiement" || status === "en cours") {
      console.log('Member payment in progress - access granted');
      return res.json({
        success: true,
        isPaid: true,
        message: "Paiement en cours. Accès autorisé.",
        membre
      });
    } else if (status === "a payer" || status === "à payer" || status.includes("payer")) {
      console.log('Member needs to pay - access denied');
      return res.json({
        success: false,
        isPaid: false,
        error: "Vous n'avez pas encore réglé votre adhésion, merci d'appeler un bénévole.",
        membre
      });
    } else if (status === "" || status === null || status === undefined) {
      // Si pas de statut explicite, vérifier si c'est un adhérent enregistré
      const isRegisteredMember = membre.categories && membre.categories.length > 0;
      
      if (isRegisteredMember) {
        console.log('Member has categories - access granted');
        return res.json({
          success: true,
          isPaid: true,
          message: "Adhésion reconnue.",
          membre
        });
      } else {
        console.log('Member status unknown - access denied');
        return res.json({
          success: false,
          isPaid: false,
          error: "Statut de paiement inconnu, merci de contacter un bénévole.",
          membre
        });
      }
    } else {
      console.log('Member status unknown - access denied');
      return res.json({
        success: false,
        isPaid: false,
        error: "Statut de paiement inconnu, merci de contacter un bénévole.",
        membre
      });
    }
    
  } catch (err) {
    console.error("Erreur lors de la vérification du membre:", err);
    res.status(500).json({ 
      success: false, 
      error: "Erreur lors de la vérification du membre"
    });
  }
});

// Récupérer la liste complète des membres
router.get('/all', (req, res) => {
  try {
    const members = syncService.getMembers();
    res.json({ success: true, members });
  } catch (err) {
    console.error("Erreur lors de la récupération des membres:", err);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération des membres", 
      error: err.message 
    });
  }
});

module.exports = router;
