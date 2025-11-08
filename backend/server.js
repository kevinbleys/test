const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 DEFINITIEVE BACKEND - VERSIE MET ALLE FIXES');
console.log('Port:', PORT);

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const NON_MEMBERS_FILE = path.join(DATA_DIR, 'non-members.json');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const SAVED_NON_MEMBERS_FILE = path.join(DATA_DIR, 'saved-non-members.json');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');

// Setup directories
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
initDataFile(SAVED_NON_MEMBERS_FILE);

// File operations
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
        'http://127.0.0.1:3002',
        /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Logging middleware
app.use((req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
    console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path} from ${clientIP}`);
    next();
});

// Sync service
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
            console.log('⚠️ Using fallback sync');
            return 0;
        }
    };
}

// Export service
let exportService;
try {
    exportService = require('./export-service');
    console.log('✅ Export service loaded');
} catch (error) {
    console.warn('⚠️ Export service not found');
    exportService = null;
}

// ===== CRON JOB: DAGELIJKSE RESET + BACKUP CLEANUP =====
cron.schedule('0 0 * * *', () => {
    try {
        console.log('=== DAGELIJKSE RESET EN CLEANUP GESTART ===');
        
        const currentPresences = readJsonFile(PRESENCES_FILE);
        if (currentPresences.length > 0) {
            const history = readJsonFile(PRESENCE_HISTORY_FILE);
            const today = new Date().toISOString().split('T')[0];
            
            const existingIndex = history.findIndex(h => h.date === today);
            if (existingIndex >= 0) {
                history[existingIndex].presences = currentPresences;
            } else {
                history.push({
                    date: today,
                    presences: currentPresences
                });
            }
            
            writeJsonFile(PRESENCE_HISTORY_FILE, history);
            console.log(`${currentPresences.length} presences gearchiveerd voor ${today}`);
            
            writeJsonFile(PRESENCES_FILE, []);
            console.log('Huidige presences gereset');
        }
        
        // Verwijder .backup bestanden
        fs.readdir(DATA_DIR, (err, files) => {
            if (err) return;
            let deletedCount = 0;
            files.forEach(file => {
                if (file.endsWith('.backup') || file.endsWith('.backup.json')) {
                    try {
                        fs.unlinkSync(path.join(DATA_DIR, file));
                        deletedCount++;
                    } catch (e) {}
                }
            });
            console.log(`🗑️ ${deletedCount} backup files verwijderd`);
        });
        
        console.log('=== DAGELIJKSE RESET VOLTOOID ===');
    } catch (error) {
        console.error('❌ Fout bij dagelijkse cleanup:', error);
    }
});

// CRON JOB: Pepsup sync
cron.schedule('5 * * * *', async () => {
    try {
        console.log('⏰ Pepsup sync gestart');
        if (syncService && syncService.syncMembers) {
            const memberCount = await syncService.syncMembers();
            console.log(`✅ Pepsup sync: ${memberCount} membres`);
        }
    } catch (error) {
        console.error('❌ Pepsup sync error:', error.message);
    }
}, {
    scheduled: true,
    timezone: "Europe/Brussels"
});

// ===== BASIC API ROUTES =====
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'API Logiciel Escalade',
        version: '2.3.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    const presences = readJsonFile(PRESENCES_FILE);
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        dataFiles: {
            presences: presences.length,
            presencesFile: fs.existsSync(PRESENCES_FILE),
            dataDir: fs.existsSync(DATA_DIR)
        }
    });
});

app.get('/admin', (req, res) => {
    console.log('📊 Admin interface requested');
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ===== MEMBERS CHECK - MET DUPLICATE PREVENTIE =====
app.get('/members/check', (req, res) => {
    const { nom, prenom } = req.query;
    if (!nom || !prenom) {
        return res.status(400).json({
            success: false,
            error: "Paramètres 'nom' et 'prenom' requis"
        });
    }
    
    console.log('=== MEMBER CHECK ===');
    console.log(`Checking: ${nom} ${prenom}`);
    
    try {
        const members = syncService.getMembers();
        const member = members.find(m =>
            m.lastname?.trim().toLowerCase() === nom.trim().toLowerCase() &&
            m.firstname?.trim().toLowerCase() === prenom.trim().toLowerCase()
        );
        
        if (!member) {
            console.log('❌ Member not found');
            return res.json({
                success: false,
                error: "Aucun membre trouvé avec ce nom et prénom"
            });
        }
        
        const joinStatus = member.joinFileStatusLabel;
        
        if (joinStatus === "Payé" || joinStatus === "En cours de paiement") {
            console.log(`✅ Valid payment status: ${joinStatus}`);
            
            // CHECK DUPLICATE
            const presences = readJsonFile(PRESENCES_FILE);
            const today = new Date().toISOString().split('T')[0];
            
            const alreadyPresent = presences.find(p =>
                p.type === 'adherent' &&
                p.nom && p.prenom &&
                p.nom.trim().toLowerCase() === nom.trim().toLowerCase() &&
                p.prenom.trim().toLowerCase() === prenom.trim().toLowerCase() &&
                p.date && new Date(p.date).toISOString().split('T')[0] === today
            );
            
            if (alreadyPresent) {
                console.log('⚠️ Already registered today');
                return res.json({
                    success: true,
                    isPaid: true,
                    alreadyRegistered: true,
                    message: "Vous êtes déjà enregistré aujourd'hui. Bienvenue !",
                    membre: member,
                    presence: alreadyPresent
                });
            }
            
            // NEW PRESENCE
            const newPresence = {
                id: Date.now().toString(),
                type: 'adherent',
                nom: nom.trim(),
                prenom: prenom.trim(),
                date: new Date().toISOString(),
                status: 'adherent',
                niveau: 'N/A',
                tarif: 0,
                methodePaiement: 'N/A',
                membre: member,
                joinFileStatus: joinStatus
            };
            
            presences.push(newPresence);
            writeJsonFile(PRESENCES_FILE, presences);
            
            console.log('✅ New presence created');
            return res.json({
                success: true,
                isPaid: true,
                message: "Adhésion reconnue. Bienvenue !",
                membre: member,
                presence: newPresence
            });
        } else {
            console.log(`❌ Invalid payment status: ${joinStatus}`);
            return res.json({
                success: false,
                error: "Vous n'avez pas encore payé votre adhésion"
            });
        }
    } catch (error) {
        console.error('❌ Error in member check:', error);
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

// ===== PRESENCES ROUTES =====
// GET /presences - ALLEEN VANDAAG
app.get('/presences', (req, res) => {
    console.log('📋 GET /presences - Today only');
    try {
        const allPresences = readJsonFile(PRESENCES_FILE);
        const today = new Date().toISOString().split('T')[0];
        
        const todayPresences = allPresences.filter(presence => {
            if (!presence.date) return false;
            const presenceDate = new Date(presence.date).toISOString().split('T')[0];
            return presenceDate === today;
        });
        
        console.log(`📊 Today (${today}): ${todayPresences.length}/${allPresences.length} presences`);
        
        res.json({
            success: true,
            presences: todayPresences,
            count: todayPresences.length
        });
    } catch (error) {
        console.error('❌ Error in GET /presences:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la lecture des présences'
        });
    }
});

app.get('/presences/:id', (req, res) => {
    const { id } = req.params;
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const presence = presences.find(p => p.id === id);
        
        if (!presence) {
            return res.status(404).json({
                success: false,
                error: 'Présence non trouvée'
            });
        }
        
        res.json({ success: true, presence });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.post('/presences', (req, res) => {
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
            
            if (req.body.email) newPresence.email = req.body.email;
            if (req.body.telephone) newPresence.telephone = req.body.telephone;
            if (req.body.dateNaissance) newPresence.dateNaissance = req.body.dateNaissance;
            if (req.body.niveau !== undefined) newPresence.niveau = req.body.niveau.toString();
            if (req.body.assuranceAccepted !== undefined) newPresence.assuranceAccepted = req.body.assuranceAccepted;
        }
        
        presences.push(newPresence);
        
        if (writeJsonFile(PRESENCES_FILE, presences)) {
            res.json({
                success: true,
                message: 'Présence enregistrée avec succès',
                presence: newPresence
            });
        } else {
            throw new Error('Failed to write file');
        }
    } catch (error) {
        console.error('❌ Error saving presence:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'enregistrement'
        });
    }
});

app.post('/presences/:id/valider', (req, res) => {
    const { id } = req.params;
    const { montant, methodePaiement } = req.body;
    
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const index = presences.findIndex(p => p.id === id);
        
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Présence non trouvée' });
        }
        
        presences[index].status = 'Payé';
        if (montant !== undefined) presences[index].tarif = montant;
        if (methodePaiement) presences[index].methodePaiement = methodePaiement;
        presences[index].dateValidation = new Date().toISOString();
        
        if (writeJsonFile(PRESENCES_FILE, presences)) {
            res.json({ success: true, presence: presences[index] });
        } else {
            throw new Error('Failed to write file');
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.delete('/presences/:id', (req, res) => {
    const { id } = req.params;
    
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const filtered = presences.filter(p => p.id !== id);
        
        if (filtered.length === presences.length) {
            return res.status(404).json({ success: false, error: 'Présence non trouvée' });
        }
        
        if (writeJsonFile(PRESENCES_FILE, filtered)) {
            res.json({ success: true, message: 'Présence supprimée' });
        } else {
            throw new Error('Failed to write file');
        }
    } catch (error) {
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
        console.log(`📅 Loading history for: ${date}`);
        
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const dayHistory = history.find(h => h.date === date);
        
        if (!dayHistory) {
            console.log(`❌ No history for ${date}`);
            return res.json({ success: true, presences: [] });
        }
        
        console.log(`✅ Found ${dayHistory.presences.length} presences for ${date}`);
        res.json({ 
            success: true, 
            presences: dayHistory.presences || [],
            count: dayHistory.presences ? dayHistory.presences.length : 0
        });
    } catch (error) {
        console.error('❌ Error loading history:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.post('/presences/archive', (req, res) => {
    try {
        const currentPresences = readJsonFile(PRESENCES_FILE);
        if (currentPresences.length === 0) {
            return res.json({ success: false, message: 'Geen presences om te archiveren' });
        }
        
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const today = new Date().toISOString().split('T')[0];
        
        const existingIndex = history.findIndex(h => h.date === today);
        if (existingIndex >= 0) {
            history[existingIndex].presences = currentPresences;
        } else {
            history.push({ date: today, presences: currentPresences });
        }
        
        writeJsonFile(PRESENCE_HISTORY_FILE, history);
        writeJsonFile(PRESENCES_FILE, []);
        
        res.json({
            success: true,
            message: `${currentPresences.length} presences gearchiveerd`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// ===== NON-MEMBERS ROUTES =====
app.post('/save-non-member', (req, res) => {
    try {
        const { nom, prenom, email, telephone, dateNaissance, niveau, assuranceAccepted, age, tarif } = req.body;
        
        if (!nom || !prenom || !email || !dateNaissance || niveau === undefined) {
            return res.status(400).json({ success: false, error: 'Verplichte velden ontbreken' });
        }
        
        const savedNonMembers = readJsonFile(SAVED_NON_MEMBERS_FILE);
        const existingIndex = savedNonMembers.findIndex(m =>
            m.nom.toLowerCase() === nom.toLowerCase() &&
            m.prenom.toLowerCase() === prenom.toLowerCase() &&
            m.dateNaissance === dateNaissance
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
            nonMemberData.savedAt = savedNonMembers[existingIndex].savedAt;
            savedNonMembers[existingIndex] = nonMemberData;
        } else {
            savedNonMembers.push(nonMemberData);
        }
        
        if (writeJsonFile(SAVED_NON_MEMBERS_FILE, savedNonMembers)) {
            res.json({ success: true, nonMember: nonMemberData });
        } else {
            throw new Error('Failed to write');
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.post('/quick-non-member', (req, res) => {
    try {
        const { nom, prenom, dateNaissance } = req.body;
        
        if (!nom || !prenom || !dateNaissance) {
            return res.status(400).json({ success: false, error: 'Velden ontbreken' });
        }
        
        const savedNonMembers = readJsonFile(SAVED_NON_MEMBERS_FILE);
        const found = savedNonMembers.find(m =>
            m.nom.toLowerCase().trim() === nom.toLowerCase().trim() &&
            m.prenom.toLowerCase().trim() === prenom.toLowerCase().trim() &&
            m.dateNaissance === dateNaissance
        );
        
        if (found) {
            res.json({ success: true, nonMember: found });
        } else {
            res.json({ success: false, message: 'Aucune inscription trouvée' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// ===== STATS =====
app.get('/api/stats/today', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const today = new Date().toISOString().split('T')[0];
        
        const todayPresences = presences.filter(p => p.date && p.date.startsWith(today));
        const valid = todayPresences.filter(p => p.type !== 'failed-login');
        
        res.json({
            success: true,
            stats: {
                date: today,
                total: valid.length,
                adherents: valid.filter(p => p.type === 'adherent').length,
                nonAdherents: valid.filter(p => p.type === 'non-adherent').length,
                revenue: valid.filter(p => p.tarif).reduce((s, p) => s + p.tarif, 0),
                presences: todayPresences
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// ===== EXPORTS =====
if (exportService) {
    app.post('/admin/export/season', async (req, res) => {
        try {
            const result = await exportService.exportSeasonToExcel();
            res.json({ success: true, filename: result.filename, recordCount: result.recordCount });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    app.get('/admin/export/years', (req, res) => {
        try {
            const years = exportService.getAvailableYears();
            res.json({ success: true, years });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    app.post('/admin/export/:year', async (req, res) => {
        try {
            const yearInt = parseInt(req.params.year);
            if (!yearInt || yearInt < 2020 || yearInt > 2030) {
                return res.status(400).json({ success: false, error: 'Ongeldig jaar' });
            }
            const result = await exportService.exportYearToExcel(yearInt);
            res.json({ success: true, filename: result.filename, recordCount: result.recordCount });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
}

// ===== ERROR HANDLERS =====
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint non trouvé', path: req.originalUrl });
});

app.use((error, req, res, next) => {
    console.error('💥 ERROR:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
});

// ===== SERVER STARTUP =====
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('🎉 ====================================');
    console.log('🎉 BACKEND GESTART - DEFINITIEVE VERSIE');
    console.log('🎉 ====================================');
    console.log(`✅ Backend: http://localhost:${PORT}`);
    console.log(`📊 Admin: http://localhost:${PORT}/admin`);
    console.log('🎉 ====================================');
});

server.on('error', (error) => {
    console.error('💥 Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} already in use!`);
        process.exit(1);
    }
});

process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
});

module.exports = app;