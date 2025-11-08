const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 DEFINITIEVE BACKEND - ALLE PROBLEMEN GEFIXED');
console.log(`Port: ${PORT}`);
console.log(`Node version: ${process.version}`);

// Data file paths  
const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const NON_MEMBERS_FILE = path.join(DATA_DIR, 'non-members.json');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const SAVED_NON_MEMBERS_FILE = path.join(DATA_DIR, 'saved-non-members.json');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');

// Setup directories
const setupDataDirectories = () => {
    [DATA_DIR, EXPORTS_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created: ${dir}`);
        }
    });
};
setupDataDirectories();

// Initialize data files with better error handling
const initDataFile = (filePath, defaultData = []) => {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
            console.log(`✅ Initialized ${path.basename(filePath)}`);
        } else {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                JSON.parse(content); // Validate JSON
                console.log(`✅ Valid: ${path.basename(filePath)}`);
            } catch (jsonError) {
                console.warn(`⚠️ Invalid JSON in ${path.basename(filePath)}, recreating...`);
                fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
            }
        }
    } catch (error) {
        console.error(`❌ Failed to init ${path.basename(filePath)}:`, error.message);
    }
};

initDataFile(PRESENCES_FILE);
initDataFile(NON_MEMBERS_FILE);
initDataFile(PRESENCE_HISTORY_FILE);
initDataFile(SAVED_NON_MEMBERS_FILE);

// File operations with better error handling
const readJsonFile = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️ File not found: ${path.basename(filePath)}, returning []`);
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(data);
        const result = Array.isArray(parsed) ? parsed : [];
        console.log(`📖 Read ${result.length} from ${path.basename(filePath)}`);
        return result;
    } catch (error) {
        console.error(`❌ Error reading ${path.basename(filePath)}:`, error.message);
        return [];
    }
};

const writeJsonFile = (filePath, data) => {
    try {
        if (!Array.isArray(data)) {
            console.error(`❌ Non-array data for ${path.basename(filePath)}`);
            return false;
        }
        
        if (fs.existsSync(filePath)) {
            fs.copyFileSync(filePath, filePath + '.backup');
        }
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`💾 Wrote ${data.length} to ${path.basename(filePath)}`);
        return true;
    } catch (error) {
        console.error(`❌ Error writing ${path.basename(filePath)}:`, error.message);
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
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Logging
app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path} from ${ip}`);
    next();
});

// Sync service
let syncService = null;
try {
    syncService = require('./sync-service');
    console.log('✅ Sync service loaded');
} catch (error) {
    console.warn('⚠️ Sync service not found');
    syncService = {
        getMembers: () => [],
        syncMembers: async () => 0
    };
}

// Export service  
let exportService = null;
try {
    exportService = require('./export-service');
    console.log('✅ Export service loaded');
} catch (error) {
    console.warn('⚠️ Export service not found');
}

// CRON: Daily reset + cleanup
cron.schedule('0 0 * * *', () => {
    try {
        console.log('=== DAILY RESET ===');
        
        const presences = readJsonFile(PRESENCES_FILE);
        if (presences.length > 0) {
            const history = readJsonFile(PRESENCE_HISTORY_FILE);
            const today = new Date().toISOString().split('T')[0];
            
            const existingIndex = history.findIndex(h => h.date === today);
            if (existingIndex >= 0) {
                history[existingIndex].presences = presences;
            } else {
                history.push({ date: today, presences });
            }
            
            writeJsonFile(PRESENCE_HISTORY_FILE, history);
            writeJsonFile(PRESENCES_FILE, []);
            console.log(`✅ Archived ${presences.length} for ${today}`);
        }
        
        // Cleanup backups
        fs.readdir(DATA_DIR, (err, files) => {
            if (err) return;
            files.forEach(file => {
                if (file.endsWith('.backup') || file.endsWith('.backup.json')) {
                    try {
                        fs.unlinkSync(path.join(DATA_DIR, file));
                    } catch (e) {}
                }
            });
        });
        
        console.log('=== DAILY RESET DONE ===');
    } catch (error) {
        console.error('❌ Daily reset error:', error.message);
    }
});

// CRON: Pepsup sync
cron.schedule('5 * * * *', async () => {
    try {
        if (syncService && syncService.syncMembers) {
            const count = await syncService.syncMembers();
            console.log(`✅ Synced ${count} members`);
        }
    } catch (error) {
        console.error('❌ Sync error:', error.message);
    }
}, { timezone: "Europe/Brussels" });

// === BASIC ROUTES ===
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'API Logiciel Escalade',
        version: '2.4.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    const presences = readJsonFile(PRESENCES_FILE);
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        presences: presences.length,
        timestamp: new Date().toISOString()
    });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// === MEMBERS ROUTES ===
app.get('/members/check', (req, res) => {
    const { nom, prenom } = req.query;
    if (!nom || !prenom) {
        return res.status(400).json({
            success: false,
            error: "Paramètres 'nom' et 'prenom' requis"
        });
    }
    
    try {
        const members = syncService.getMembers();
        const member = members.find(m =>
            m.lastname?.trim().toLowerCase() === nom.trim().toLowerCase() &&
            m.firstname?.trim().toLowerCase() === prenom.trim().toLowerCase()
        );
        
        if (!member) {
            return res.json({ success: false, error: "Membre non trouvé" });
        }
        
        const joinStatus = member.joinFileStatusLabel;
        
        if (joinStatus === "Payé" || joinStatus === "En cours de paiement") {
            // Check duplicate
            const presences = readJsonFile(PRESENCES_FILE);
            const today = new Date().toISOString().split('T')[0];
            
            const exists = presences.find(p =>
                p.type === 'adherent' &&
                p.nom?.trim().toLowerCase() === nom.trim().toLowerCase() &&
                p.prenom?.trim().toLowerCase() === prenom.trim().toLowerCase() &&
                p.date && new Date(p.date).toISOString().split('T')[0] === today
            );
            
            if (exists) {
                return res.json({
                    success: true,
                    isPaid: true,
                    alreadyRegistered: true,
                    message: "Déjà enregistré aujourd'hui",
                    membre: member,
                    presence: exists
                });
            }
            
            // New presence
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
            
            return res.json({
                success: true,
                isPaid: true,
                message: "Bienvenue !",
                membre: member,
                presence: newPresence
            });
        } else {
            return res.json({
                success: false,
                error: "Adhésion non payée"
            });
        }
    } catch (error) {
        console.error('❌ Member check error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error'
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

// === PRESENCES ROUTES ===
// FIX: Always return valid response
app.get('/presences', (req, res) => {
    console.log('📋 GET /presences');
    try {
        const allPresences = readJsonFile(PRESENCES_FILE);
        const today = new Date().toISOString().split('T')[0];
        
        const todayPresences = allPresences.filter(p => {
            if (!p.date) return false;
            return new Date(p.date).toISOString().split('T')[0] === today;
        });
        
        console.log(`✅ Today (${today}): ${todayPresences.length}/${allPresences.length}`);
        
        res.json({
            success: true,
            presences: todayPresences,
            count: todayPresences.length
        });
    } catch (error) {
        console.error('❌ GET /presences error:', error);
        res.status(500).json({
            success: false,
            presences: [],
            error: error.message
        });
    }
});

app.get('/presences/:id', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const presence = presences.find(p => p.id === req.params.id);
        
        if (!presence) {
            return res.status(404).json({ success: false, error: 'Not found' });
        }
        
        res.json({ success: true, presence });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/presences', (req, res) => {
    const { type, nom, prenom, ...otherData } = req.body;
    
    if (!type || !nom || !prenom) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields'
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
        } else if (type === 'non-adherent') {
            newPresence.status = req.body.status || 'pending';
            newPresence.tarif = req.body.tarif || 10;
            newPresence.methodePaiement = req.body.methodePaiement || 'Especes';
        }
        
        presences.push(newPresence);
        
        if (writeJsonFile(PRESENCES_FILE, presences)) {
            res.json({ success: true, presence: newPresence });
        } else {
            throw new Error('Failed to save');
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/presences/:id/valider', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const index = presences.findIndex(p => p.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Not found' });
        }
        
        presences[index].status = 'Payé';
        if (req.body.montant) presences[index].tarif = req.body.montant;
        if (req.body.methodePaiement) presences[index].methodePaiement = req.body.methodePaiement;
        presences[index].dateValidation = new Date().toISOString();
        
        if (writeJsonFile(PRESENCES_FILE, presences)) {
            res.json({ success: true, presence: presences[index] });
        } else {
            throw new Error('Failed to save');
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/presences/:id', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const filtered = presences.filter(p => p.id !== req.params.id);
        
        if (filtered.length === presences.length) {
            return res.status(404).json({ success: false, error: 'Not found' });
        }
        
        if (writeJsonFile(PRESENCES_FILE, filtered)) {
            res.json({ success: true });
        } else {
            throw new Error('Failed to save');
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// === HISTORY ROUTES ===
app.get('/presences/history', (req, res) => {
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const dates = history.map(h => h.date).sort().reverse();
        res.json({ success: true, dates });
    } catch (error) {
        res.status(500).json({ success: false, dates: [], error: error.message });
    }
});

// FIX: Always return valid response
app.get('/presences/history/:date', (req, res) => {
    const { date } = req.params;
    console.log(`📅 GET /presences/history/${date}`);
    
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const dayHistory = history.find(h => h.date === date);
        
        if (!dayHistory) {
            console.log(`❌ No history for ${date}`);
            return res.json({ success: true, presences: [], count: 0 });
        }
        
        console.log(`✅ Found ${dayHistory.presences.length} for ${date}`);
        res.json({ 
            success: true, 
            presences: dayHistory.presences || [],
            count: dayHistory.presences ? dayHistory.presences.length : 0
        });
    } catch (error) {
        console.error('❌ History error:', error);
        res.status(500).json({
            success: false,
            presences: [],
            error: error.message
        });
    }
});

app.post('/presences/archive', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        if (presences.length === 0) {
            return res.json({ success: false, message: 'No presences to archive' });
        }
        
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const today = new Date().toISOString().split('T')[0];
        
        const existingIndex = history.findIndex(h => h.date === today);
        if (existingIndex >= 0) {
            history[existingIndex].presences = presences;
        } else {
            history.push({ date: today, presences });
        }
        
        writeJsonFile(PRESENCE_HISTORY_FILE, history);
        writeJsonFile(PRESENCES_FILE, []);
        
        res.json({ success: true, message: `${presences.length} archived` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// === NON-MEMBERS ROUTES ===
app.post('/save-non-member', (req, res) => {
    try {
        const { nom, prenom, email, dateNaissance, niveau } = req.body;
        
        if (!nom || !prenom || !email || !dateNaissance || niveau === undefined) {
            return res.status(400).json({ success: false, error: 'Missing fields' });
        }
        
        const saved = readJsonFile(SAVED_NON_MEMBERS_FILE);
        const existingIndex = saved.findIndex(m =>
            m.nom.toLowerCase() === nom.toLowerCase() &&
            m.prenom.toLowerCase() === prenom.toLowerCase() &&
            m.dateNaissance === dateNaissance
        );
        
        const data = {
            id: existingIndex >= 0 ? saved[existingIndex].id : Date.now().toString(),
            nom: nom.trim(),
            prenom: prenom.trim(),
            email: email.trim(),
            telephone: req.body.telephone || '',
            dateNaissance,
            niveau: parseInt(niveau),
            assuranceAccepted: req.body.assuranceAccepted || true,
            age: req.body.age,
            tarif: req.body.tarif,
            savedAt: existingIndex >= 0 ? saved[existingIndex].savedAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (existingIndex >= 0) {
            saved[existingIndex] = data;
        } else {
            saved.push(data);
        }
        
        if (writeJsonFile(SAVED_NON_MEMBERS_FILE, saved)) {
            res.json({ success: true, nonMember: data });
        } else {
            throw new Error('Failed to save');
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/quick-non-member', (req, res) => {
    try {
        const { nom, prenom, dateNaissance } = req.body;
        
        if (!nom || !prenom || !dateNaissance) {
            return res.status(400).json({ success: false, error: 'Missing fields' });
        }
        
        const saved = readJsonFile(SAVED_NON_MEMBERS_FILE);
        const found = saved.find(m =>
            m.nom.toLowerCase().trim() === nom.toLowerCase().trim() &&
            m.prenom.toLowerCase().trim() === prenom.toLowerCase().trim() &&
            m.dateNaissance === dateNaissance
        );
        
        if (found) {
            res.json({ success: true, nonMember: found });
        } else {
            res.json({ success: false, message: 'Not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// === STATS ===
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
        res.status(500).json({ success: false, error: error.message });
    }
});

// === EXPORT ROUTES ===
// FIX: Always return valid response with years
app.get('/admin/export/years', (req, res) => {
    console.log('📊 GET /admin/export/years');
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        
        const years = [...new Set(history.map(h => {
            try {
                const year = new Date(h.date).getFullYear();
                return year;
            } catch (e) {
                return null;
            }
        }))].filter(y => y && !isNaN(y) && y > 2000 && y < 2100).sort().reverse();
        
        console.log(`✅ Found years: ${years.join(', ')}`);
        
        res.json({ success: true, years });
    } catch (error) {
        console.error('❌ Export years error:', error);
        res.status(500).json({
            success: false,
            years: [],
            error: error.message
        });
    }
});

if (exportService) {
    app.post('/admin/export/season', async (req, res) => {
        try {
            const result = await exportService.exportSeasonToExcel();
            res.json({ success: true, filename: result.filename, recordCount: result.recordCount });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    app.post('/admin/export/:year', async (req, res) => {
        try {
            const yearInt = parseInt(req.params.year);
            if (!yearInt || yearInt < 2020 || yearInt > 2030) {
                return res.status(400).json({ success: false, error: 'Invalid year' });
            }
            const result = await exportService.exportYearToExcel(yearInt);
            res.json({ success: true, filename: result.filename, recordCount: result.recordCount });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
}

// === ERROR HANDLERS ===
app.use((req, res) => {
    res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

app.use((error, req, res, next) => {
    console.error('💥 ERROR:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
});

// === SERVER STARTUP ===
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('🎉 ========================================');
    console.log('🎉 BACKEND STARTED - ALL PROBLEMS FIXED');
    console.log('🎉 ========================================');
    console.log(`✅ Backend: http://localhost:${PORT}`);
    console.log(`📊 Admin: http://localhost:${PORT}/admin`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    console.log('🎉 ========================================');
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