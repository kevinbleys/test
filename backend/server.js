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

// Routes API pour les présences - KRITIEKE AANPASSING
app.post('/presences', (req, res) => {
  try {
    const { type, nom, prenom, ...additionalData } = req.body;
    
    // Debug logging
    console.log('=== PRESENCE REGISTRATION DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Type:', type);
    console.log('Nom:', nom);
    console.log('Prenom:', prenom);
    console.log('Additional data:', additionalData);
    
    const presence = {
      id: Date.now().toString(),
      type,
      nom,
      prenom,
      date: new Date().toISOString()
    };

    // KRITIEKE LOGICA - verschillende behandeling voor adherents vs non-adherents
    if (type === 'adherent') {
      // Voor adherents: ABSOLUUT GEEN automatische tarif
      presence.status = 'adherent';
      
      // EXPLICIET: Alleen toevoegen als het in de request zit EN niet null/undefined is
      if (additionalData.tarif !== undefined && additionalData.tarif !== null) {
        presence.tarif = additionalData.tarif;
        console.log('Tarif expliciet toegevoegd voor adherent:', additionalData.tarif);
      } else {
        console.log('GEEN tarif toegevoegd aan adherent - zoals het moet zijn');
      }
      
      // Geen andere fields kopiëren voor adherents
    } else if (type === 'non-adherent') {
      // Voor non-adherents: wel standaard tarif
      presence.status = 'pending';
      presence.tarif = additionalData.tarif || 10;
      presence.methodePaiement = additionalData.methodePaiement || null;
      
      // Specifieke fields voor non-adherents
      presence.dateNaissance = additionalData.dateNaissance;
      presence.email = additionalData.email;
      presence.telephone = additionalData.telephone;
      presence.adresse = additionalData.adresse;
      
      console.log('Tarif toegevoegd voor non-adherent:', presence.tarif);
    }
    
    console.log('Final presence object:', presence);
    console.log('=== END DEBUG ===');
    
    const presences = readPresences();
    presences.push(presence);
    writePresences(presences);
    
    res.status(201).json({ success: true, presence });
  } catch (error) {
    console.error('Fout POST /presences:', error);
    res.status(500).json({ success: false, error: 'Server fout' });
  }
});

// Récupérer toutes les présences
app.get('/presences', (req, res) => {
  try {
    const presences = readPresences();
    res.json({ success: true, presences });
  } catch (error) {
    console.error('Fout GET /presences:', error);
    res.status(500).json({ success: false, error: 'Server fout' });
  }
});

// Récupérer une présence spécifique par ID
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
    presences[index].tarif = montant || presences[index].tarif;
    presences[index].dateValidation = new Date().toISOString();
    
    writePresences(presences);
    
    res.json({ success: true, presence: presences[index] });
  } catch (error) {
    console.error('Fout validation:', error);
    res.status(500).json({ success: false, error: 'Server fout' });
  }
});

// Ajouter un tarif à un adhérent
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

// Annuler une présence
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

// Route explicite voor admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Backend server actief op http://localhost:${PORT}`);
  console.log(`Admin interface op http://localhost:${PORT}/admin`);
});
