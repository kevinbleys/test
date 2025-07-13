const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware essentiel
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fichier de stockage
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

// Importer les routes des membres
const membersRoutes = require('./routes/members');
app.use('/members', membersRoutes);

// Routes API pour les présences
app.post('/presences', (req, res) => {
  try {
    const { type, nom, prenom, ...additionalData } = req.body;
    
    const presence = {
      id: Date.now().toString(),
      type,
      nom,
      prenom,
      date: new Date().toISOString(),
      ...additionalData
    };

    // Logique différenciée selon le type
    if (type === 'adherent') {
      // Pour les adhérents valides - pas de tarif obligatoire
      presence.status = 'adherent';
      // Pas de tarif par défaut pour les adhérents valides
      // Si un tarif est fourni, on l'utilise, sinon on ne met rien
      if (req.body.tarif !== undefined) {
        presence.tarif = req.body.tarif;
      }
    } else if (type === 'non-adherent') {
      // Pour les non-adhérents - tarif obligatoire (défaut 10)
      presence.status = 'pending';
      presence.tarif = req.body.tarif || 10;
      presence.methodePaiement = req.body.methodePaiement || null;
      
      // Ajouter les champs spécifiques aux non-adhérents
      presence.dateNaissance = req.body.dateNaissance;
      presence.email = req.body.email;
      presence.telephone = req.body.telephone;
      presence.adresse = req.body.adresse;
    }
    
    const presences = readPresences();
    presences.push(presence);
    writePresences(presences);
    
    console.log('Nouvelle présence enregistrée:', presence);
    res.status(201).json({ success: true, presence });
  } catch (error) {
    console.error('Erreur POST /presences:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Récupérer toutes les présences
app.get('/presences', (req, res) => {
  try {
    const presences = readPresences();
    res.json({ success: true, presences });
  } catch (error) {
    console.error('Erreur GET /presences:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
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
    console.error('Erreur GET /presences/:id:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Valider une présence (pour les non-adhérents principalement)
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
    if (montant !== undefined) {
      presences[index].tarif = montant;
    }
    presences[index].dateValidation = new Date().toISOString();
    
    writePresences(presences);
    
    res.json({ success: true, presence: presences[index] });
  } catch (error) {
    console.error('Erreur validation:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Ajouter un tarif à un adhérent si nécessaire
app.post('/presences/:id/ajouter-tarif', (req, res) => {
  try {
    const { id } = req.params;
    const { montant } = req.body;
    
    const presences = readPresences();
    const index = presences.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Présence non trouvée' });
    }
    
    // Ajouter ou modifier le tarif
    presences[index].tarif = montant || 0;
    presences[index].dateModificationTarif = new Date().toISOString();
    
    writePresences(presences);
    
    res.json({ success: true, presence: presences[index] });
  } catch (error) {
    console.error('Erreur ajout tarif:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
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
    console.error('Erreur annulation:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Route explicite pour l'admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur backend actif sur http://localhost:${PORT}`);
  console.log(`Interface admin sur http://localhost:${PORT}/admin`);
});
