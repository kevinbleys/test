const express = require('express');
const router = express.Router();
const syncService = require('../sync-service');

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
 console.log(`DEBUG - Membre: ${membre.firstname} ${membre.lastname}`);
 console.log(`DEBUG - Statut brut: '${membre.joinFileStatusLabel}'`);
 
 const status = membre.joinFileStatusLabel ? membre.joinFileStatusLabel.trim().toLowerCase() : "";
 console.log(`DEBUG - Statut traité: '${status}'`);
 
 // Vérification du statut de paiement
 if (status === "payé" || status === "pay" || status === "paid") {
 return res.json({
 success: true,
 isPaid: true,
 message: "Adhésion valide. Bienvenue !",
 membre
 });
 } else if (status === "en cours de paiement" || status === "en cours") {
 return res.json({
 success: true,
 isPaid: true,
 message: "Paiement en cours. Accès autorisé.",
 membre
 });
 } else if (status === "a payer" || status === "à payer" || status.includes("payer")) {
 return res.json({
 success: false,
 isPaid: false,
 message: "Vous n'avez pas encore réglé votre adhésion, merci d'appeler un bénévole.",
 membre
 });
 } else if (status === "" || status === null || status === undefined) {
 // Si pas de statut explicite, vérifier si c'est un adhérent enregistré
 const isRegisteredMember = membre.categories && membre.categories.length > 0;
 
 if (isRegisteredMember) {
 return res.json({
 success: true,
 isPaid: true,
 message: "Adhésion reconnue.",
 membre
 });
 } else {
 return res.json({
 success: false,
 isPaid: false,
 message: "Statut de paiement inconnu, merci de contacter un bénévole.",
 membre
 });
 }
 } else {
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

// Route spécifique pour la vérification (utilisée par le frontend)
router.get('/check', (req, res) => {
 const { nom, prenom } = req.query;
 
 // Validation des paramètres
 if (!nom || !prenom) {
 return res.status(400).json({ 
 success: false, 
 error: "Les paramètres 'nom' et 'prenom' sont requis" 
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
 return res.json({ 
 success: false, 
 error: "Aucun membre trouvé avec ce nom et prénom" 
 });
 }
 
 // Vérification du statut de paiement
 const status = membre.joinFileStatusLabel ? membre.joinFileStatusLabel.trim().toLowerCase() : "";
 
 // Vérification du statut de paiement
 if (status === "payé" || status === "pay" || status === "paid") {
 return res.json({
 success: true,
 isPaid: true,
 message: "Adhésion valide. Bienvenue !",
 membre
 });
 } else if (status === "en cours de paiement" || status === "en cours") {
 return res.json({
 success: true,
 isPaid: true,
 message: "Paiement en cours. Accès autorisé.",
 membre
 });
 } else if (status === "a payer" || status === "à payer" || status.includes("payer")) {
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
 return res.json({
 success: true,
 isPaid: true,
 message: "Adhésion reconnue.",
 membre
 });
 } else {
 return res.json({
 success: false,
 isPaid: false,
 error: "Statut de paiement inconnu, merci de contacter un bénévole.",
 membre
 });
 }
 } else {
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
