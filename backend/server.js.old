const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

// **NIEUWE IMPORTS**
const cleanupService = require('./cleanup-service');
const exportService = require('./export-service');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Bestand opslag
const PRESENCES_FILE = path.join(__dirname, 'data', 'presences.json');
const PRESENCE_HISTORY_FILE = path.join(__dirname, 'data', 'presence-history.json');

// **GECORRIGEERDE INITIALISATIE**
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
  
  // **NIEUWE FUNCTIONALITEIT: Zorg dat exports directory bestaat**
  exportService.ensureExportsDir();
  
  // **NIEUWE LIJN: Maak testdata aan als er geen data is**
  exportService.createTestDataIfNeeded();
};
initStorage();

// Lecture/Écriture des données
const readPresences = () => JSON.parse(fs.readFileSync(PRESENCES_FILE));
const writePresences = (data) => fs.writeFileSync(PRESENCES_FILE, JSON.stringify(data, null, 2));
const readPresenceHistory = () => JSON.parse(fs.readFileSync(PRESENCE_HISTORY_FILE));
const writePresenceHistory = (data) => fs.writeFileSync(PRESENCE_HISTORY_FILE, JSON.stringify(data, null, 2));

// **AANGEPASTE CRON JOBS**

// Dagelijkse reset om middernacht (blijft hetzelfde)
cron.schedule('0 0 * * *', () => {
  try {
    console.log('=== DAGELIJKSE RESET GESTART ===');
    const currentPresences = readPresences();
    
    if (currentPresences.length > 0) {
      const history = readPresenceHistory();
      const today = new Date().toISOString().split('T')[0];
      
      history.push({
        date: today,
        presences: currentPresences
      });
      
      writePresenceHistory(history);
      console.log(`${currentPresences.length} presences gearchiveerd voor ${today}`);
      
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

// **NIEUWE CRON JOB: Automatische seizoen export op 30 juni om middernacht**
cron.schedule('0 0 30 6 *', () => {
  try {
    console.log('=== AUTOMATISCHE SEIZOEN EXPORT GESTART (30 JUNI) ===');
    
    const result = exportService.exportSeasonToExcel();
    console.log(`Seizoen ${result.seasonName} automatisch geëxporteerd: ${result.filename}`);
    console.log(`${result.recordCount} records geëxporteerd`);
    
    console.log('=== AUTOMATISCHE SEIZOEN EXPORT VOLTOOID ===');
  } catch (error) {
    console.error('Fout bij automatische seizoen export:', error);
  }
});

// Cleanup jobs (blijven hetzelfde)
cron.schedule('0 2 * * *', () => {
  console.log('=== AUTOMATISCHE CLEANUP GESTART (02:00) ===');
  cleanupService.performCleanup();
  console.log('=== AUTOMATISCHE CLEANUP VOLTOOID ===');
});

cron.schedule('0 3 * * 0', () => {
  console.log('=== WEKELIJKSE CLEANUP GESTART (ZONDAG 03:00) ===');
  cleanupService.performCleanup();
  console.log('=== WEKELIJKSE CLEANUP VOLTOOID ===');
});

// Import routes des membres
const membersRoutes = require('./routes/members');
app.use('/members', membersRoutes);

// **NIEUWE ROUTES: Seizoen export en statistieken**

// Route: Seizoen export (update bestaand bestand)
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
    console.error('Seizoen export error:', error);
    res.status(500).json({
      success: false,
      error: 'Fout bij seizoen export: ' + error.message
    });
  }
});

// Route: Beschikbare seizoenen ophalen
app.get('/admin/seasons', (req, res) => {
  try {
    const seasons = exportService.getAvailableSeasons();
    res.json({
      success: true,
      seasons
    });
  } catch (error) {
    console.error('Seasons error:', error);
    res.status(500).json({
      success: false,
      error: 'Fout bij ophalen seizoenen: ' + error.message
    });
  }
});

// Route: Huidige seizoen statistieken
app.get('/admin/statistics', (req, res) => {
  try {
    const stats = exportService.generateSeasonStatistics();
    const currentSeason = exportService.getCurrentSeason();
    
    res.json({
      success: true,
      statistics: stats,
      currentSeason: currentSeason
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Fout bij ophalen statistieken: ' + error.message
    });
  }
});

// Route: Statistieken pagina
app.get('/admin/statistics-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'statistics.html'));
});

// **NIEUWE ROUTE: Force create test data**
app.post('/admin/create-test-data', (req, res) => {
  try {
    exportService.createTestDataIfNeeded();
    res.json({
      success: true,
      message: 'Test data created successfully'
    });
  } catch (error) {
    console.error('Create test data error:', error);
    res.status(500).json({
      success: false,
      error: 'Fout bij aanmaken test data: ' + error.message
    });
  }
});

// **BESTAANDE EXPORT ROUTES** (voor oude jaren)
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
    console.error('Excel export error:', error);
    res.status(500).json({
      success: false,
      error: 'Fout bij Excel export: ' + error.message
    });
  }
});

// Route: Beschikbare jaren ophalen
app.get('/admin/export/years', (req, res) => {
  try {
    exportService.createTestDataIfNeeded(); // <-- force testdata fix
    const years = exportService.getAvailableYears();
    res.json({
      success: true,
      years
    });
  } catch (error) {
    console.error('Years error:', error);
    res.status(500).json({
      success: false,
      error: 'Fout bij ophalen jaren: ' + error.message
    });
  }
});

app.post('/admin/export-and-cleanup/:year', (req, res) => {
  try {
    const { year } = req.params;
    const yearInt = parseInt(year);
    
    if (!yearInt || yearInt < 2020 || yearInt > 2030) {
      return res.status(400).json({
        success: false,
        error: 'Ongeldig jaar (moet tussen 2020 en 2030 zijn)'
      });
    }
    
    const exportResult = exportService.exportYearToExcel(yearInt);
    const cleanupResult = exportService.cleanupYearAfterExport(yearInt);
    
    res.json({
      success: true,
      message: `Jaar ${year} geëxporteerd en opgeruimd`,
      export: {
        filename: exportResult.filename,
        recordCount: exportResult.recordCount
      },
      cleanup: {
        deletedCount: cleanupResult.deletedCount,
        remainingCount: cleanupResult.remainingCount
      }
    });
  } catch (error) {
    console.error('Export and cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Fout bij export en cleanup: ' + error.message
    });
  }
});

app.get('/admin/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(__dirname, 'data', 'exports', filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        error: 'Bestand niet gevonden'
      });
    }
    
    res.download(filepath, filename);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: 'Fout bij download: ' + error.message
    });
  }
});

// **CLEANUP ROUTES**
app.post('/admin/cleanup', (req, res) => {
  try {
    const result = cleanupService.manualCleanup();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Fout bij cleanup: ' + error.message
    });
  }
});

app.get('/admin/cleanup/status', (req, res) => {
  try {
    const dataDir = path.join(__dirname, 'data');
    const files = fs.readdirSync(dataDir);
    
    const backupFiles = files.filter(file => file.includes('_backup_') && file.endsWith('.json'));
    const historyFile = path.join(dataDir, 'presence-history.json');
    
    let historyEntries = 0;
    let availableYears = [];
    if (fs.existsSync(historyFile)) {
      const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      historyEntries = Array.isArray(history) ? history.length : 0;
      availableYears = exportService.getAvailableYears();
    }

    res.json({
      success: true,
      status: {
        backupFiles: backupFiles.length,
        historyEntries: historyEntries,
        availableYears: availableYears,
        lastCleanup: 'Bekijk cleanup.log voor details'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Fout bij ophalen cleanup status: ' + error.message
    });
  }
});

// **PRESENCE REGISTRATION - AANGEPAST VOOR NIVEAU DE GRIMPE**
app.post('/presences', (req, res) => {
  try {
    const type = req.body.type;
    const nom = req.body.nom;
    const prenom = req.body.prenom;
    
    console.log('=== PRESENCE REGISTRATION ===');
    console.log('Type:', type);
    console.log('Nom:', nom);
    console.log('Prenom:', prenom);
    console.log('Raw request body:', req.body);
    
    const presence = {
      id: Date.now().toString(),
      type: type,
      nom: nom,
      prenom: prenom,
      date: new Date().toISOString()
    };

    if (type === 'adherent') {
      presence.status = 'adherent';
      
      // **NIVEAU DE GRIMPE VOOR ADHERENTS** (van tablet interface)
      if (req.body.niveau !== undefined) {
        presence.niveau = req.body.niveau.toString();
        console.log('Niveau toegevoegd voor adherent:', presence.niveau);
      }
      
      console.log('Final presence object for adherent:', presence);
      
    } else if (type === 'non-adherent') {
      presence.status = 'pending';
      presence.tarif = req.body.tarif || 10;
      presence.methodePaiement = req.body.methodePaiement || 'Especes';
      
      // **EXTRA VELDEN VOOR NON-ADHERENTS**
      if (req.body.email) presence.email = req.body.email;
      if (req.body.telephone) presence.telephone = req.body.telephone;
      if (req.body.dateNaissance) presence.dateNaissance = req.body.dateNaissance;
      if (req.body.adresse) presence.adresse = req.body.adresse;
      
      // **NIVEAU DE GRIMPE VOOR NON-ADHERENTS**
      if (req.body.niveau !== undefined) {
        presence.niveau = req.body.niveau.toString();
        console.log('Niveau toegevoegd voor non-adherent:', presence.niveau);
      }
      
      // **ASSURANCE**
      if (req.body.assuranceAccepted !== undefined) {
        presence.assuranceAccepted = req.body.assuranceAccepted;
      }
      
      console.log('Final presence object for non-adherent:', presence);
      
    } else {
      return res.status(400).json({ success: false, error: 'Type inconnu: ' + type });
    }
    
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

// **BESTAANDE PRESENCE ROUTES**
app.get('/presences', (req, res) => {
  try {
    const presences = readPresences();
    res.json({ success: true, presences });
  } catch (error) {
    console.error('Fout GET /presences:', error);
    res.status(500).json({ success: false, error: 'Server fout' });
  }
});

app.get('/presences/history/:date', (req, res) => {
  try {
    const { date } = req.params;
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

app.get('/presences/history', (req, res) => {
  try {
    const history = readPresenceHistory();
    const dates = history.map(h => h.date).sort().reverse();
    res.json({ success: true, dates });
  } catch (error) {
    console.error('Fout GET /presences/history:', error);
    res.status(500).json({ success: false, error: 'Server fout' });
  }
});

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
    
    if (montant !== undefined && montant !== null) {
      presences[index].tarif = montant;
    }
    
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
    
    if (presences[index].tarif !== undefined) {
      presences[index].tarifOriginal = presences[index].tarif;
      presences[index].tarif = 0;
    } else {
      presences[index].tarif = 0;
    }
    
    writePresences(presences);
    
    res.json({ success: true, presence: presences[index] });
  } catch (error) {
    console.error('Fout annulation:', error);
    res.status(500).json({ success: false, error: 'Server fout' });
  }
});

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

// **ADMIN ROUTES**
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Server starten
app.listen(PORT, () => {
  console.log(`Backend server actief op http://localhost:${PORT}`);
  console.log(`Admin interface op http://localhost:${PORT}/admin`);
  console.log('Dagelijkse reset om middernacht is geactiveerd');
  console.log('Automatische seizoen export op 30 juni is geactiveerd');
  console.log('Dagelijkse cleanup om 02:00 is geactiveerd');
  console.log('Wekelijkse cleanup op zondag om 03:00 is geactiveerd');
  console.log('Excel export functionaliteit beschikbaar via admin interface');
});
