const express = require('express');
const router = express.Router();
const syncService = require('../sync-service');
// Vérification du statut de paiement
console.log(`DEBUG - Membre: ${membre.firstname} ${membre.lastname}`);
console.log(`DEBUG - Statut brut: '${membre.joinFileStatusLabel}'`);
const status = membre.joinFileStatusLabel ? membre.joinFileStatusLabel.trim().toLowerCase() : "";
console.log(`DEBUG - Statut traité: '${status}'`);
console.log(`DEBUG - Comparaison avec "a payer": ${status === "a payer"}`);
console.log(`DEBUG - Catégories: ${JSON.stringify(membre.categories)}`);


// Récupérer un membre par nom et prénom
router.get('/', (req, res) => {
  const { nom, prenom } = req.query;
  
  // Validation des paramètres
  if (!nom || !prenom) {
    return res.status(400).json({ 
      success: false, 
      message: "Les paramètres 'nom' et 'prenom' sont requis" 
    });
  }
  
  try {
    // Récupération des membres
    const members = syncService.getMembers();
    
    // Recherche du membre dans la liste (insensible à la casse et aux espaces)
    const membre = members.find(
      m => 
        m.lastname?.trim().toLowerCase() === nom.trim().toLowerCase() &&
        m.firstname?.trim().toLowerCase() === prenom.trim().toLowerCase()
    );
    
    // Si aucun membre trouvé
    if (!membre) {
      return res.status(404).json({ 
        success: false, 
        message: "Aucun membre trouvé avec ce nom et prénom" 
      });
    }
    
    // Vérification du statut de paiement
// Dans routes/members.js
const status = membre.joinFileStatusLabel ? membre.joinFileStatusLabel.trim().toLowerCase() : "";

// Vérification améliorée
if (status === "payé" || status === "en cours de paiement") {
  // Code pour adhésion confirmée
} else if (status === "a payer" || status.includes("payer") || status.includes("à payer")) {
  return res.json({
    success: false,
    isPaid: false,
    message: "Vous n'avez pas encore réglé votre adhésion, merci d'appeler un bénévole.",
    membre
  });
}

      if (isRegisteredMember) {
        return res.json({
          success: true,
          isPaid: true, // Considéré comme payé pour les adhérents sans statut explicite
          message: "Adhésion reconnue.",
          membre
        });
      }
      
      return res.json({
        success: false,
        isPaid: false,
        message: "Statut de paiement inconnu, merci de contacter un bénévole.",
        membre
      });
    }
  } catch (err) {
    console.error("Erreur lors de la recherche du membre:", err);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la recherche du membre", 
      error: err.message 
    });
  }
});

// Récupérer la liste compl
