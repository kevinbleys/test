const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 DEFINITIEVE BACKEND - VOLLEDIGE WERKENDE VERSIE');
console.log('Port:', PORT);

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const NON_MEMBERS_FILE = path.join(DATA_DIR, 'non-members.json');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const SAVED_NON_MEMBERS_FILE = path.join(DATA_DIR, 'saved-non-members.json'); // ✅ NIEUWE FILE
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');

// Ensure data directories exist
const setupDataDirectories = () => {
  const dirs = [DATA_DIR, EXPORTS_DIR];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};
setupDataDirectories();

// Initialize data files
const initDataFile = (filePath, defaultData = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      console.log(`✅ Initialized ${path.basename(filePath)}`);
    } else {
      // Validate existing file
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
        console.log(`✅ ${path.basename(filePath)} is valid`);
      } catch (jsonError) {
        console.warn(`⚠️ ${path.basename(filePath)} invalid, recreating...`);
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      }
    }
  } catch (error) {
    console.error(`❌ Failed to initialize ${path.basename(filePath)}:`, error);
  }
};

initDataFile(PRESENCES_FILE);
initDataFile(NON_MEMBERS_FILE);
initDataFile(PRESENCE_HISTORY_FILE);
initDataFile(SAVED_NON_MEMBERS_FILE); // ✅ NIEUWE FILE INITIALISATIE

// File operations with extensive logging
const readJsonFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File does not exist: ${path.basename(filePath)}, returning empty array`);
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);
    const result = Array.isArray(parsed) ? parsed : [];
    console.log(`📖 Read ${result.length} records from ${path.basename(filePath)}`);
    return result;
  } catch (error) {
    console.error(`❌ Error reading ${path.basename(filePath)}:`, error);
    return [];
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    if (!Array.isArray(data)) {
      console.error(`❌ Attempted to write non-array data to ${path.basename(filePath)}`);
      return false;
    }

    // Create backup
    if (fs.existsSync(filePath)) {
      const backupPath = filePath + '.backup';
      fs.copyFileSync(filePath, backupPath);
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`💾 Wrote ${data.length} records to ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error writing ${path.basename(filePath)}:`, error);
    return false;
  }
};

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for admin interface
app.use(express.static(path.join(__dirname, 'public')));

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('🔍 Query params:', JSON.stringify(req.query, null, 2));
  }
  next();
});

// Sync service loading
let syncService = null;
try {
  const syncServicePath = path.join(__dirname, 'sync-service');
  if (fs.existsSync(syncServicePath + '.js')) {
    syncService = require('./sync-service');
    console.log('✅ Sync service loaded');
  }
} catch (error) {
  console.warn('⚠️ Sync service loading failed:', error.message);
}

if (!syncService) {
  syncService = {
    getMembers: () => {
      console.log('⚠️ Using fallback sync service');
      return [];
    },
    syncMembers: async () => {
      console.log('⚠️ Using fallback sync - no actual sync performed');
      return 0;
    }
  };
}

// Services
let exportService;
let cleanupService;

// Try to load services
try {
  exportService = require('./export-service');
  console.log('✅ Export service loaded');
} catch (error) {
  console.warn('⚠️ Export service not found, using fallback');
  exportService = null;
}

try {
  cleanupService = require('./cleanup-service');
  console.log('✅ Cleanup service loaded');
} catch (error) {
  console.warn('⚠️ Cleanup service not found, using fallback');
  cleanupService = null;
}

// ===== CRON JOBS =====
// Daily reset at midnight
cron.schedule('0 0 * * *', () => {
  try {
    console.log('=== DAGELIJKSE RESET GESTART ===');
    const currentPresences = readJsonFile(PRESENCES_FILE);
    if (currentPresences.length > 0) {
      const history = readJsonFile(PRESENCE_HISTORY_FILE);
      const today = new Date().toISOString().split('T')[0];

      history.push({
        date: today,
        presences: currentPresences
      });

      writeJsonFile(PRESENCE_HISTORY_FILE, history);
      console.log(`${currentPresences.length} presences gearchiveerd voor ${today}`);

      writeJsonFile(PRESENCES_FILE, []);
      console.log('Huidige presences gereset voor nieuwe dag');
    } else {
      console.log('Geen presences om te archiveren');
    }
    console.log('=== DAGELIJKSE RESET VOLTOOID ===');
  } catch (error) {
    console.error('Fout bij dagelijkse reset:', error);
  }
});

// ===== PEPSUP SYNC CRON JOB =====
cron.schedule('5 * * * *', async () => {
  try {
    console.log('⏰ DÉMARRAGE synchronisation Pepsup automatique');
    if (syncService && syncService.syncMembers) {
      const memberCount = await syncService.syncMembers();
      console.log(`✅ Synchronisation Pepsup réussie: ${memberCount} membres synchronisés`);
    } else {
      console.warn('⚠️ Sync service non disponible');
    }
  } catch (error) {
    console.error('❌ ERREUR lors de la synchronisation Pepsup automatique:', error.message);
    // Log l'erreur vers le sync log file aussi
    try {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] ERREUR CRON: ${error.message}\n`;
      const logPath = path.join(__dirname, 'data', 'sync.log');
      fs.appendFileSync(logPath, logEntry);
    } catch (logError) {
      console.error('Impossible d\'écrire vers sync.log:', logError);
    }
  }
}, {
  scheduled: true,
  timezone: "Europe/Brussels"
});

// ===== SYNC ON STARTUP (OPTIONEEL) =====
setTimeout(async () => {
  try {
    console.log('🚀 Synchronisation Pepsup au démarrage du serveur');
    if (syncService && syncService.syncMembers) {
      const memberCount = await syncService.syncMembers();
      console.log(`✅ Synchronisation startup réussie: ${memberCount} membres`);
    }
  } catch (error) {
    console.error('❌ Erreur synchronisation startup:', error.message);
  }
}, 5000);

console.log('🔄 Synchronisation automatique Pepsup configurée - chaque heure à *:05');

// ===== BASIC API ROUTES =====
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Logiciel Escalade - DEFINITIEVE VERSIE',
    version: '2.1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      admin: '/admin',
      members: '/members/check',
      presences: '/presences',
      quickNonMember: '/quick-non-member',
      saveNonMember: '/save-non-member'
    }
  });
});

app.get('/api/health', (req, res) => {
  const presences = readJsonFile(PRESENCES_FILE);
  const savedNonMembers = readJsonFile(SAVED_NON_MEMBERS_FILE);

  const health = {
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    dataFiles: {
      presences: presences.length,
      savedNonMembers: savedNonMembers.length,
      presencesFile: fs.existsSync(PRESENCES_FILE),
      savedNonMembersFile: fs.existsSync(SAVED_NON_MEMBERS_FILE),
      dataDir: fs.existsSync(DATA_DIR)
    }
  };

  console.log('💚 Health check:', health);
  res.json(health);
});

// ===== ADMIN INTERFACE ROUTE =====
app.get('/admin', (req, res) => {
  console.log('📊 Admin interface requested');
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ===== MEMBERS ROUTES =====
app.get('/members/check', (req, res) => {
  const { nom, prenom } = req.query;

  if (!nom || !prenom) {
    return res.status(400).json({
      success: false,
      error: "Paramètres 'nom' et 'prenom' requis"
    });
  }

  console.log('=== MEMBER CHECK ===');
  console.log('Nom:', nom, 'Prenom:', prenom);

  try {
    const members = syncService.getMembers();
    const member = members.find(m =>
      m.lastname?.trim().toLowerCase() === nom.trim().toLowerCase() &&
      m.firstname?.trim().toLowerCase() === prenom.trim().toLowerCase()
    );

    if (!member) {
      return res.json({
        success: false,
        error: "Aucun membre trouvé avec ce nom et prénom"
      });
    }

    const isAdherent = Array.isArray(member.categories) &&
      member.categories.some(c =>
        typeof c.label === 'string' &&
        c.label.toLowerCase().includes('adhérent')
      );

    if (isAdherent) {
      return res.json({
        success: true,
        isPaid: true,
        message: "Adhésion reconnue. Bienvenue !",
        membre: member
      });
    } else {
      return res.json({
        success: false,
        error: "Vous n'êtes pas enregistré comme adhérent. Merci de vous inscrire comme visiteur."
      });
    }
  } catch (error) {
    console.error('Error in member check:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification du membre'
    });
  }
});

app.get('/members/all', (req, res) => {
  try {
    const members = syncService.getMembers();
    res.json({ success: true, members, count: members.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== ✅ NIEUWE NIET-LEDEN OPSLAG ENDPOINTS ===== 

// POST /save-non-member - Sla niet-lid op na volledige registratie
app.post('/save-non-member', (req, res) => {
  try {
    console.log('=== SAVE NON-MEMBER REQUEST ===');
    console.log('Request body:', req.body);

    const { nom, prenom, email, telephone, dateNaissance, niveau, assuranceAccepted, age, tarif } = req.body;

    // Valideer verplichte velden
    if (!nom || !prenom || !email || !dateNaissance || niveau === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Verplichte velden ontbreken'
      });
    }

    // Laad huidige niet-leden
    const savedNonMembers = readJsonFile(SAVED_NON_MEMBERS_FILE);

    // Check of deze niet-lid al bestaat (op basis van naam, voornaam en geboortedatum)
    const existingIndex = savedNonMembers.findIndex(member => 
      member.nom.toLowerCase() === nom.toLowerCase() &&
      member.prenom.toLowerCase() === prenom.toLowerCase() &&
      member.dateNaissance === dateNaissance
    );

    const nonMemberData = {
      id: existingIndex >= 0 ? savedNonMembers[existingIndex].id : Date.now().toString(),
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.trim(),
      telephone: telephone || '',
      dateNaissance,
      niveau: parseInt(niveau),
      assuranceAccepted: assuranceAccepted || true,
      age,
      tarif,
      savedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      // Update bestaande entry
      nonMemberData.savedAt = savedNonMembers[existingIndex].savedAt; // Behoud originele datum
      savedNonMembers[existingIndex] = nonMemberData;
      console.log(`✅ Non-member bijgewerkt: ${nom} ${prenom}`);
    } else {
      // Nieuwe entry toevoegen
      savedNonMembers.push(nonMemberData);
      console.log(`✅ Nieuwe non-member opgeslagen: ${nom} ${prenom}`);
    }

    // Sla op naar bestand
    if (writeJsonFile(SAVED_NON_MEMBERS_FILE, savedNonMembers)) {
      res.json({
        success: true,
        message: 'Niet-lid succesvol opgeslagen',
        nonMember: nonMemberData
      });
    } else {
      throw new Error('Fout bij opslaan naar bestand');
    }

  } catch (error) {
    console.error('❌ SAVE NON-MEMBER ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Server error bij opslaan niet-lid'
    });
  }
});

// POST /quick-non-member - Zoek opgeslagen niet-lid voor snelle registratie
app.post('/quick-non-member', (req, res) => {
  try {
    console.log('=== QUICK NON-MEMBER LOOKUP ===');
    console.log('Request body:', req.body);

    const { nom, prenom, dateNaissance } = req.body;

    if (!nom || !prenom || !dateNaissance) {
      return res.status(400).json({
        success: false,
        error: 'Naam, voornaam en geboortedatum zijn verplicht'
      });
    }

    // Laad opgeslagen niet-leden
    const savedNonMembers = readJsonFile(SAVED_NON_MEMBERS_FILE);
    console.log(`Zoeken in ${savedNonMembers.length} opgeslagen niet-leden`);

    // Zoek match (case-insensitive voor namen)
    const foundMember = savedNonMembers.find(member => 
      member.nom.toLowerCase().trim() === nom.toLowerCase().trim() &&
      member.prenom.toLowerCase().trim() === prenom.toLowerCase().trim() &&
      member.dateNaissance === dateNaissance
    );

    if (foundMember) {
      console.log(`✅ Niet-lid gevonden: ${foundMember.nom} ${foundMember.prenom}`);
      res.json({
        success: true,
        message: 'Niet-lid gevonden',
        nonMember: foundMember
      });
    } else {
      console.log(`❌ Geen match gevonden voor: ${nom} ${prenom} ${dateNaissance}`);
      res.json({
        success: false,
        message: 'Aucune inscription trouvée avec ces données. Vérifiez l\'orthographe ou utilisez "Première inscription".'
      });
    }

  } catch (error) {
    console.error('❌ QUICK NON-MEMBER LOOKUP ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Server error bij zoeken niet-lid'
    });
  }
});

// GET /saved-non-members - Lijst alle opgeslagen niet-leden (voor debug/admin)
app.get('/saved-non-members', (req, res) => {
  try {
    const savedNonMembers = readJsonFile(SAVED_NON_MEMBERS_FILE);
    res.json({
      success: true,
      count: savedNonMembers.length,
      nonMembers: savedNonMembers.map(member => ({
        id: member.id,
        nom: member.nom,
        prenom: member.prenom,
        dateNaissance: member.dateNaissance,
        niveau: member.niveau,
        savedAt: member.savedAt,
        updatedAt: member.updatedAt
      }))
    });
  } catch (error) {
    console.error('❌ GET SAVED NON-MEMBERS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Server error bij ophalen niet-leden lijst'
    });
  }
});

// ===== PRESENCES ROUTES =====

// ✅ GET /presences - CRITICAL ROUTE FOR ADMIN INTERFACE
app.get('/presences', (req, res) => {
  console.log('📋 GET /presences - Admin interface requesting all presences');
  try {
    const presences = readJsonFile(PRESENCES_FILE);
    console.log(`📋 Returning ${presences.length} presences to admin interface`);
    res.json({
      success: true,
      presences,
      count: presences.length
    });
  } catch (error) {
    console.error('❌ Error in GET /presences:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la lecture des présences'
    });
  }
});

// ✅ GET /presences/:id - FOR PAYMENT PAGE STATUS CHECK
app.get('/presences/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🔍 GET /presences/${id} - Payment page checking status`);

  try {
    const presences = readJsonFile(PRESENCES_FILE);
    const presence = presences.find(p => p.id === id);

    if (!presence) {
      console.log(`❌ Presence ${id} not found`);
      return res.status(404).json({
        success: false,
        error: 'Présence non trouvée'
      });
    }

    console.log(`✅ Found presence ${id}, status: ${presence.status}`);
    res.json({ success: true, presence });
  } catch (error) {
    console.error(`❌ Error getting presence ${id}:`, error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ✅ POST /presences - FOR CREATING NEW PRESENCES
app.post('/presences', (req, res) => {
  console.log('=== NEW PRESENCE REQUEST ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  const { type, nom, prenom, ...otherData } = req.body;

  if (!type || !nom || !prenom) {
    return res.status(400).json({
      success: false,
      error: 'Champs requis: type, nom, prenom'
    });
  }

  try {
    const presences = readJsonFile(PRESENCES_FILE);

    const newPresence = {
      id: Date.now().toString(),
      type,
      nom: nom.trim(),
      prenom: prenom.trim(),
      date: new Date().toISOString(),
      ...otherData
    };

    // Special handling for adherents
    if (type === 'adherent') {
      newPresence.status = 'adherent';
      delete newPresence.tarif;
      if (req.body.niveau !== undefined) {
        newPresence.niveau = req.body.niveau.toString();
      }
    } else if (type === 'non-adherent') {
      newPresence.status = req.body.status || 'pending';
      newPresence.tarif = req.body.tarif || 10;
      newPresence.methodePaiement = req.body.methodePaiement || 'Especes';

      // Extra fields for non-members
      if (req.body.email) newPresence.email = req.body.email;
      if (req.body.telephone) newPresence.telephone = req.body.telephone;
      if (req.body.dateNaissance) newPresence.dateNaissance = req.body.dateNaissance;
      if (req.body.niveau !== undefined) newPresence.niveau = req.body.niveau.toString();
      if (req.body.assuranceAccepted !== undefined) newPresence.assuranceAccepted = req.body.assuranceAccepted;
      if (req.body.quickRegistration) newPresence.quickRegistration = true;
    }

    presences.push(newPresence);

    if (writeJsonFile(PRESENCES_FILE, presences)) {
      console.log('✅ NEW PRESENCE CREATED:', newPresence);
      res.json({
        success: true,
        message: 'Présence enregistrée avec succès',
        presence: newPresence
      });
    } else {
      throw new Error('Failed to write presence file');
    }

  } catch (error) {
    console.error('❌ Error saving presence:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement de la présence'
    });
  }
});

// ✅ POST /presences/:id/valider - FOR ADMIN VALIDATION
app.post('/presences/:id/valider', (req, res) => {
  const { id } = req.params;
  const { montant, methodePaiement } = req.body;

  console.log(`💳 VALIDATING PAYMENT for presence ${id}`);
  console.log('Validation data:', { montant, methodePaiement });

  try {
    const presences = readJsonFile(PRESENCES_FILE);
    const index = presences.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Présence non trouvée' });
    }

    presences[index].status = 'Payé';
    if (montant !== undefined && montant !== null) {
      presences[index].tarif = montant;
    }
    if (methodePaiement) {
      presences[index].methodePaiement = methodePaiement;
    }
    presences[index].dateValidation = new Date().toISOString();

    if (writeJsonFile(PRESENCES_FILE, presences)) {
      console.log('✅ PAYMENT VALIDATED:', presences[index]);
      res.json({ success: true, presence: presences[index] });
    } else {
      throw new Error('Failed to write presence file');
    }

  } catch (error) {
    console.error('❌ Error validating payment:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ✅ DELETE /presences/:id - FOR ADMIN DELETION
app.delete('/presences/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ DELETING presence ${id}`);

  try {
    const presences = readJsonFile(PRESENCES_FILE);
    const filteredPresences = presences.filter(p => p.id !== id);

    if (filteredPresences.length === presences.length) {
      return res.status(404).json({ success: false, error: 'Présence non trouvée' });
    }

    if (writeJsonFile(PRESENCES_FILE, filteredPresences)) {
      console.log(`✅ DELETED presence ${id}`);
      res.json({ success: true, message: 'Présence supprimée avec succès' });
    } else {
      throw new Error('Failed to write presence file');
    }

  } catch (error) {
    console.error('❌ Error deleting presence:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ===== HISTORY ROUTES =====
app.get('/presences/history', (req, res) => {
  try {
    const history = readJsonFile(PRESENCE_HISTORY_FILE);
    const dates = history.map(h => h.date).sort().reverse();
    res.json({ success: true, dates });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/presences/history/:date', (req, res) => {
  try {
    const { date } = req.params;
    const history = readJsonFile(PRESENCE_HISTORY_FILE);
    const dayHistory = history.find(h => h.date === date);

    if (!dayHistory) {
      return res.json({ success: true, presences: [] });
    }

    res.json({ success: true, presences: dayHistory.presences });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ===== ARCHIVE ROUTE =====
app.post('/presences/archive', (req, res) => {
  try {
    const currentPresences = readJsonFile(PRESENCES_FILE);
    if (currentPresences.length === 0) {
      return res.json({ success: false, message: 'Geen presences om te archiveren' });
    }

    const history = readJsonFile(PRESENCE_HISTORY_FILE);
    const today = new Date().toISOString().split('T')[0];

    history.push({
      date: today,
      presences: currentPresences
    });

    writeJsonFile(PRESENCE_HISTORY_FILE, history);
    writeJsonFile(PRESENCES_FILE, []);

    res.json({
      success: true,
      message: `${currentPresences.length} presences gearchiveerd voor ${today}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ===== NON-MEMBERS ROUTES =====
app.get('/non-members', (req, res) => {
  try {
    const nonMembers = readJsonFile(NON_MEMBERS_FILE);
    res.json({
      success: true,
      nonMembers,
      count: nonMembers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la lecture des non-membres'
    });
  }
});

app.post('/non-members', (req, res) => {
  console.log('=== NEW NON-MEMBER REQUEST ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  try {
    const nonMembers = readJsonFile(NON_MEMBERS_FILE);
    const newNonMember = {
      id: Date.now().toString(),
      ...req.body,
      dateCreated: new Date().toISOString()
    };

    nonMembers.push(newNonMember);

    if (writeJsonFile(NON_MEMBERS_FILE, nonMembers)) {
      res.json({
        success: true,
        message: 'Non-membre enregistré avec succès',
        nonMember: newNonMember
      });
    } else {
      throw new Error('Failed to write non-members file');
    }
  } catch (error) {
    console.error('❌ Error saving non-member:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement du non-membre'
    });
  }
});

// ===== STATS ROUTES =====
app.get('/api/stats/today', (req, res) => {
  console.log('📊 TODAY STATS REQUESTED');
  try {
    const presences = readJsonFile(PRESENCES_FILE);
    const today = new Date().toISOString().split('T')[0];

    const todayPresences = presences.filter(p =>
      p.date && p.date.startsWith(today)
    );

    const adherents = todayPresences.filter(p => p.type === 'adherent').length;
    const nonAdherents = todayPresences.filter(p => p.type === 'non-adherent').length;

    const totalRevenue = todayPresences
      .filter(p => p.tarif && typeof p.tarif === 'number')
      .reduce((sum, p) => sum + p.tarif, 0);

    const stats = {
      date: today,
      total: todayPresences.length,
      adherents,
      nonAdherents,
      revenue: totalRevenue,
      presences: todayPresences
    };

    console.log('📊 TODAY STATS:', stats);
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Error calculating today stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du calcul des statistiques'
    });
  }
});

// ===== ✅ EXPORT ROUTES MET WERKENDE JAREN FUNCTIONALITEIT =====
if (exportService) {
  app.post('/admin/export/season', (req, res) => {
    try {
      const result = exportService.exportSeasonToExcel();
      res.json({
        success: true,
        message: `Excel export voor seizoen ${result.seasonName} bijgewerkt`,
        filename: result.filename,
        recordCount: result.recordCount,
        seasonName: result.seasonName
      });
    } catch (error) {
      console.error('Season export error:', error);
      res.status(500).json({
        success: false,
        error: 'Fout bij seizoen export: ' + error.message
      });
    }
  });

  app.get('/admin/export/years', (req, res) => {
    try {
      const years = exportService.getAvailableYears();
      res.json({ success: true, years });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Fout bij ophalen jaren: ' + error.message
      });
    }
  });

  app.post('/admin/export/:year', (req, res) => {
    try {
      const { year } = req.params;
      const yearInt = parseInt(year);

      if (!yearInt || yearInt < 2020 || yearInt > 2030) {
        return res.status(400).json({
          success: false,
          error: 'Ongeldig jaar (moet tussen 2020 en 2030 zijn)'
        });
      }

      const result = exportService.exportYearToExcel(yearInt);
      res.json({
        success: true,
        message: `Excel export voor ${year} succesvol aangemaakt`,
        filename: result.filename,
        recordCount: result.recordCount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Fout bij Excel export: ' + error.message
      });
    }
  });
}

// ===== 404 HANDLER =====
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Endpoint non trouvé',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: [
      'GET /',
      'GET /admin',
      'GET /api/health',
      'GET /members/check',
      'GET /presences',
      'POST /presences',
      'GET /presences/:id',
      'POST /presences/:id/valider',
      'DELETE /presences/:id',
      'GET /api/stats/today',
      'POST /save-non-member',
      'POST /quick-non-member',
      'GET /saved-non-members'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('💥 GLOBAL ERROR:', error);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: error.message
  });
});

// ===== SERVER STARTUP =====
const server = app.listen(PORT, 'localhost', () => {
  console.log('🎉 ======================================');
  console.log('🎉 DEFINITIEVE BACKEND GESTART!');
  console.log('🎉 ======================================');
  console.log(`✅ Backend: http://localhost:${PORT}`);
  console.log(`📊 Admin: http://localhost:${PORT}/admin`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
  console.log('🎉 ======================================');

  // Test data files
  setTimeout(() => {
    const presences = readJsonFile(PRESENCES_FILE);
    const savedNonMembers = readJsonFile(SAVED_NON_MEMBERS_FILE);
    console.log(`📊 Current presences count: ${presences.length}`);
    console.log(`📊 Saved non-members count: ${savedNonMembers.length}`);
  }, 1000);
});

server.on('error', (error) => {
  console.error('💥 Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  console.log('📴 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;