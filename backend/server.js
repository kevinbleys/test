const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Bestand opslag
const PRESENCES_FILE = path.join(__dirname, 'data', 'presences.json');

// Initialisation du stockage
const initStorage = () => {
  if (!fs.existsSync(path.dirname(PRESENCES_FILE))) {
    fs.mkdirSync(path.dirname(PRESENCES_FILE), { recursive: true });
  }
  if (!fs.existsSync(PRESENCES_FILE)) {
    fs.writeFileSync(PRESENCES_FILE, '[]');
  }
};
initStorage();

// Lecture/Écriture des données
const readPresences = () => JSON.parse(fs.readFileSync(PRESENCES_FILE));
const writePresences = (data) => fs.writeFileSync(PRESENCES_FILE, JSON.stringify(data, null, 2));

// Import routes des membres
const membersRoutes = require('./routes/members');
app.use('/members', membersRoutes);

// Routes API pour les présences - DEFINITIEVE OPLOSSING
app.post('/presences', (req, res) => {
  try {
    // EXPLICIETE destructuring - geen spread operator
    const type = req.body.type;
    const nom = req.body.nom;
    const prenom = req.body.prenom;
    
    // DEBUG logging
    console.log('=== PRESENCE REGISTRATION FIXED ===');
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
      // Voor non-adherents: wel tarif
      presence.status = 'pending';
      presence.tarif = req.body.tarif || 10;
      
      // Extra velden voor non-adherents
      if (req.body.email) presence.email = req.body.email;
      if (req.body.telephone) presence.telephone = req.body.telephone;
      if (req.body.dateNaissance) presence.dateNaissance = req.body.dateNaissance;
      if (req.body.adresse) presence.adresse = req.body.adresse;
      if (req.body.methodePaiement) presence.methodePaiement = req.body.methodePaiement;
      
      console.log('=== NON-ADHERENT DETECTED ===');
      console.log('Tarif added:', presence.tarif);
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

// GET toutes les présences
app.get('/presences', (req, res) => {
  try {
    const presences = readPresences();
    res.json({ success: true, presences });
  } catch (error) {
    console.error('Fout GET /presences:', error);
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

// Valider une présence
app.post('/presences/:id/valider', (req, res) => {
  try {
    const { id } = req.params;
    const { montant } = req.body;
    
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
    
    presences[index].dateValidation = new Date().toISOString();
    
    writePresences(presences);
    
    res.json({ success: true, presence: presences[index] });
  } catch (error) {
    console.error('Fout validation:', error);
    res.status(500).json({ success: false, error: 'Server fout' });
  }
});

// Ajouter tarif aan adherent (indien nodig)
app.post('/presences/:id/ajouter-tarif', (req, res) => {
  try {
    const { id } = req.params;
    const { montant } = req.body;
    
    const presences = readPresences();
    const index = presences.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Présence non trouvée' });
    }
    
    presences[index].tarif = montant || 0;
    presences[index].dateModificationTarif = new Date().toISOString();
    
    writePresences(presences);
    
    res.json({ success: true, presence: presences[index] });
  } catch (error) {
    console.error('Fout ajout tarif:', error);
    res.status(500).json({ success: false, error: 'Server fout' });
  }
});

// Annuler présence
app.post('/presences/:id/annuler', (req, res) => {
  try {
    const { id } = req.params;
    
    const presences = readPresences();
    const index = presences.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Présence non trouvée' });
    }
    
    presences[index].status = 'Annulé';
    presences[index].dateAnnulation = new Date().toISOString();
    
    writePresences(presences);
    
    res.json({ success: true, presence: presences[index] });
  } catch (error) {
    console.error('Fout annulation:', error);
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
});
