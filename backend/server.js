const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Bestand opslag
const PRESENCES_FILE = path.join(__dirname, 'data', 'presences.json');
const PRESENCE_HISTORY_FILE = path.join(__dirname, 'data', 'presence-history.json');

// Initialisation du stockage
const initStorage = () => {
  if (!fs.existsSync(path.dirname(PRESENCES_FILE))) {
    fs.mkdirSync(path.dirname(PRESENCES_FILE), { recursive: true });
  }
  if (!fs.existsSync(PRESENCES_FILE)) {
    fs.writeFileSync(PRESENCES_FILE, '[]');
  }
  if (!fs.existsSync(PRESENCE_HISTORY_FILE)) {
    fs.writeFileSync(PRESENCE_HISTORY_FILE, '[]');
  }
};
initStorage();

// Lecture/Écriture des données
const readPresences = () => JSON.parse(fs.readFileSync(PRESENCES_FILE));
const writePresences = (data) => fs.writeFileSync(PRESENCES_FILE, JSON.stringify(data, null, 2));
const readPresenceHistory = () => JSON.parse(fs.readFileSync(PRESENCE_HISTORY_FILE));
const writePresenceHistory = (data) => fs.writeFileSync(PRESENCE_HISTORY_FILE, JSON.stringify(data, null, 2));

// ===== CRON JOB: DAGELIJKSE RESET OM MIDDERNACHT =====
cron.schedule('0 0 * * *', () => {
  try {
    console.log('=== DAGELIJKSE RESET GESTART ===');
    const currentPresences = readPresences();
    
    if (currentPresences.length > 0) {
      // Voeg huidige dag toe aan historiek
      const history = readPresenceHistory();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      history.push({
        date: today,
        presences: currentPresences
      });
      
      writePresenceHistory(history);
      console.log(`${currentPresences.length} presences gearchiveerd voor ${today}`);
      
      // Reset huidige presences
      writePresences([]);
      console.log('Huidige presences gereset voor nieuwe dag');
    } else {
      console.log('Geen presences om te archiveren');
    }
    
    console.log('=== DAGELIJKSE RESET VOLTOOID ===');
  } catch (error) {
    console.error('Fout bij dagelijkse reset:', error);
  }
});

// Import routes des membres
const membersRoutes = require('./routes/members');
app.use('/members', membersRoutes);

// Routes API pour les présences - AANGEPAST VOOR BETALINGSMETHODE
app.post('/presences', (req, res) => {
  try {
    // EXPLICIETE destructuring
    const type = req.body.type;
    const nom = req.body.nom;
    const prenom = req.body.prenom;
    
    // DEBUG logging
    console.log('=== PRESENCE REGISTRATION WITH PAYMENT METHOD ===');
    console.log('Type:', type);
    console.log('Nom:', nom);
    console.log('Prenom:', prenom);
    console.log('Raw request body:', req.body);
    
    // Base presence object
    const presence = {
      id: Date.now().toString(),
      type: type,
      nom: nom,
      prenom: prenom,
      date: new Date().toISOString()
    };

    // KRITIEKE LOGICA - EXPLICIETE scheiding
    if (type === 'adherent') {
      // Voor adherents: ABSOLUUT GEEN tarif veld
      presence.status = 'adherent';
      
      console.log('=== ADHERENT DETECTED ===');
      console.log('NO TARIF WILL BE ADDED');
      console.log('Final presence object for adherent:', presence);
      
    } else if (type === 'non-adherent') {
      // Voor non-adherents: wel tarif EN betalingsmethode
      presence.status = 'pending';
      presence.tarif = req.body.tarif || 10;
      
      // **NIEUWE FUNCTIONALITEIT: BETALINGSMETHODE**
      presence.methodePaiement = req.body.methodePaiement || 'Especes'; // Default naar especes
      
      // Extra velden voor non-adherents
      if (req.body.email) presence.email = req.body.email;
      if (req.body.telephone) presence.telephone = req.body.telephone;
      if (req.body.dateNaissance) presence.dateNaissance = req.body.dateNaissance;
      if (req.body.adresse) presence.adresse = req.body.adresse;
      
      console.log('=== NON-ADHERENT DETECTED ===');
      console.log('Tarif added:', presence.tarif);
      console.log('Methode paiement added:', presence.methodePaiement);
      console.log('Final presence object for non-adherent:', presence);
      
    } else {
      console.log('=== UNKNOWN TYPE ===');
      console.log('Type received:', type);
      return res.status(400).json({ success: false, error: 'Type inconnu: ' + type });
    }
    
    console.log('=== SAVING TO FILE ===');
    
    const presences = readPresences();
    presences.push(presence);
    writePresences(presences);
    
    console.log('=== SAVED SUCCESSFULLY ===');
    
    res.status(201).json({ success: true, presence });
  } catch (error) {
    console.error('=== ERROR IN /presences ===');
    console.error('Error details:', error);
    res.status(500).json({ success: false, error: 'Server fout: ' + error.message });
  }
});

// GET toutes les présences (huidige dag)
app.get('/presences', (req, res) => {
  try {
    const presences = readPresences();
    res.json({ success: true, presences });
  } catch (error) {
    console.error('Fout GET /presences:', error);
    res.status(500).json({ success: false, error: 'Server fout' });
  }
});

// **NIEUWE ROUTE: GET historiek per datum**
app.get('/presences/history/:date', (req, res) => {
  try {
    const { date } = req.params; // YYYY-MM-DD format
    const history = readPresenceHistory();
    
    const dayHistory = history.find(h => h.date === date);
    
    if (!dayHistory) {
      return res.json({ success: true, presences: [] });
    }
    
    res.json({ success: true, presences: dayHistory.presences });
  } catch (error) {
    console.error('Fout GET /presences/history/:date:', error);
    res.status(500).json({ success: false, error: 'Server fout' });
  }
});

// **NIEUWE ROUTE: GET alle beschikbare datums**
app.get('/presences/history', (req, res) => {
  try {
    const history = readPresenceHistory();
    const dates = history.map(h => h.date).sort().reverse(); // Nieuwste eerst
    res.json({ success: true, dates });
  } catch (error) {
    console.error('Fout GET /presences/history:', error);
    res.status(500).json({ success: false, error: 'Server fout' });
  }
});

// GET présence spécifique par ID
app.get('/presences/:id', (req, res) => {
  try {
    const { id } = req.params;
    const presences = readPresences();
    const presence = presences.find(p => p.id === id);
    
    if (!presence) {
      return res.status(404).json({ success: false, error: 'Présence non trouvée' });
    }
    
    res.json({ success: true, presence });
  } catch (error) {
    console.error('Fout GET /presences/:id:', error);
    res.status(500).json({ success: false, error: 'Server fout' });
  }
});

// Valider une présence - AANGEPAST VOOR BETALINGSMETHODE
app.post('/presences/:id/valider', (req, res) => {
  try {
    const { id } = req.params;
    const { montant, methodePaiement } = req.body;
    
    const presences = readPresences();
    const index = presences.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Présence non trouvée' });
    }
    
    presences[index].status = 'Payé';
    
    // Alleen tarif toevoegen als er een montant is
    if (montant !== undefined && montant !== null) {
      presences[index].tarif = montant;
    }
    
    // **NIEUWE FUNCTIONALITEIT: Update betalingsmethode bij validatie**
    if (methodePaiement) {
      presences[index].methodePaiement = methodePaiement;
    }
    
    presences[index].dateValidation = new Date().toISOString();
    
    writePresences(presences);
    
    res.json({ success: true, presence: presences[index] });
  } catch (error) {
    console.error('Fout validation:', error);
    res.status(500).json({ success: false, error: 'Server fout' });
  }
});

// Ajouter tarif aan adherent (indien nodig) - AANGEPAST VOOR BETALINGSMETHODE
app.post('/presences/:id/ajouter-tarif', (req, res) => {
  try {
    const { id } = req.params;
    const { montant, methodePaiement } = req.body;
    
    const presences = readPresences();
    const index = presences.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Présence non trouvée' });
    }
    
    presences[index].tarif = montant || 0;
    
    // **NIEUWE FUNCTIONALITEIT: Betalingsmethode voor adherents**
    if (methodePaiement) {
      presences[index].methodePaiement = methodePaiement;
    }
    
    presences[index].dateModificationTarif = new Date().toISOString();
    
    writePresences(presences);
    
    res.json({ success: true, presence: presences[index] });
  } catch (error) {
    console.error('Fout ajout tarif:', error);
    res.status(500).json({ success: false, error: 'Server fout' });
  }
});

// ===== AANGEPASTE ANNULER ROUTE - ZET TARIEF OP 0 =====
app.post('/presences/:id/annuler', (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== ANNULER PRESENCE ===');
    console.log('ID:', id);
    
    const presences = readPresences();
    const index = presences.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Présence non trouvée' });
    }
    
    const originalPresence = { ...presences[index] };
    console.log('Original presence:', originalPresence);
    
    // Status op annulé zetten
    presences[index].status = 'Annulé';
    presences[index].dateAnnulation = new Date().toISOString();
    
    // NIEUWE FUNCTIONALITEIT: Tarief op 0 zetten bij annulering
    if (presences[index].tarif !== undefined) {
      console.log('Setting tarif from', presences[index].tarif, 'to 0');
      presences[index].tarifOriginal = presences[index].tarif; // Bewaar origineel tarief
      presences[index].tarif = 0;
    } else {
      console.log('No tarif field found, adding tarif: 0');
      presences[index].tarif = 0;
    }
    
    console.log('Updated presence:', presences[index]);
    
    writePresences(presences);
    
    res.json({ success: true, presence: presences[index] });
  } catch (error) {
    console.error('Fout annulation:', error);
    res.status(500).json({ success: false, error: 'Server fout' });
  }
});

// **NIEUWE ROUTE: Handmatige archivering** (voor testing)
app.post('/presences/archive', (req, res) => {
  try {
    const currentPresences = readPresences();
    
    if (currentPresences.length === 0) {
      return res.json({ success: false, message: 'Geen presences om te archiveren' });
    }
    
    const history = readPresenceHistory();
    const today = new Date().toISOString().split('T')[0];
    
    history.push({
      date: today,
      presences: currentPresences
    });
    
    writePresenceHistory(history);
    writePresences([]);
    
    res.json({ 
      success: true, 
      message: `${currentPresences.length} presences gearchiveerd voor ${today}` 
    });
  } catch (error) {
    console.error('Fout handmatige archivering:', error);
    res.status(500).json({ success: false, error: 'Server fout' });
  }
});

// Admin route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Server starten
app.listen(PORT, () => {
  console.log(`Backend server actief op http://localhost:${PORT}`);
  console.log(`Admin interface op http://localhost:${PORT}/admin`);
  console.log('Dagelijkse reset om middernacht is geactiveerd');
});
