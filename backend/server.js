const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 BACKEND - ULTIMATE DUPLICATE PREVENTION');
console.log(`Port: ${PORT}`);

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const NON_MEMBERS_FILE = path.join(DATA_DIR, 'non-members.json');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const SAVED_NON_MEMBERS_FILE = path.join(DATA_DIR, 'saved-non-members.json');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');

// === MULTI-LAYER DUPLICATE PREVENTION ===
// Layer 1: Request deduplication cache (60 second window)
const recentRequests = new Map();

// Layer 2: Synchronous processing queue per person
const processingQueue = new Map();

// Layer 3: In-memory cache van vandaag's presences
let presencesCache = null;
let cacheLastUpdated = 0;
const CACHE_TTL = 1000; // 1 second

const cleanupOldRequests = () => {
    const now = Date.now();
    for (const [key, timestamp] of recentRequests.entries()) {
        if (now - timestamp > 60000) { // 60 seconds
            recentRequests.delete(key);
        }
    }
};

setInterval(cleanupOldRequests, 10000); // Cleanup every 10 seconds

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
                console.log(`✅ Valid: ${path.basename(filePath)}`);
            } catch (jsonError) {
                console.warn(`⚠️ Invalid JSON, recreating: ${path.basename(filePath)}`);
                fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
            }
        }
    } catch (error) {
        console.error(`❌ Init failed ${path.basename(filePath)}:`, error.message);
    }
};

initDataFile(PRESENCES_FILE);
initDataFile(NON_MEMBERS_FILE);
initDataFile(PRESENCE_HISTORY_FILE);
initDataFile(SAVED_NON_MEMBERS_FILE);

// File operations with caching
const readJsonFile = (filePath, useCache = false) => {
    try {
        if (useCache && filePath === PRESENCES_FILE) {
            const now = Date.now();
            if (presencesCache && (now - cacheLastUpdated) < CACHE_TTL) {
                return [...presencesCache]; // Return copy
            }
        }
        
        if (!fs.existsSync(filePath)) {
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(data);
        const result = Array.isArray(parsed) ? parsed : [];
        
        if (useCache && filePath === PRESENCES_FILE) {
            presencesCache = result;
            cacheLastUpdated = Date.now();
        }
        
        return result;
    } catch (error) {
        console.error(`❌ Read error ${path.basename(filePath)}:`, error.message);
        return [];
    }
};

const writeJsonFile = (filePath, data) => {
    try {
        if (!Array.isArray(data)) {
            console.error(`❌ Non-array data for ${path.basename(filePath)}`);
            return false;
        }
        
        // Atomic write
        const tempFile = filePath + '.tmp';
        fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
        fs.renameSync(tempFile, filePath);
        
        // Update cache
        if (filePath === PRESENCES_FILE) {
            presencesCache = data;
            cacheLastUpdated = Date.now();
        }
        
        return true;
    } catch (error) {
        console.error(`❌ Write error ${path.basename(filePath)}:`, error.message);
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

// CRON: Daily reset
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
        
        // Clear caches
        presencesCache = null;
        recentRequests.clear();
        processingQueue.clear();
        
        // Cleanup temp files
        fs.readdir(DATA_DIR, (err, files) => {
            if (err) return;
            files.forEach(file => {
                if (file.endsWith('.backup') || file.endsWith('.tmp')) {
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

// Basic routes
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'API Logiciel Escalade',
        version: '2.7.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    const presences = readJsonFile(PRESENCES_FILE);
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        presences: presences.length,
        cacheSize: recentRequests.size,
        timestamp: new Date().toISOString()
    });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// === ULTIMATE MEMBERS CHECK - 3 LAGEN BESCHERMING ===
app.get('/members/check', async (req, res) => {
    const { nom, prenom } = req.query;
    
    if (!nom || !prenom) {
        return res.status(400).json({
            success: false,
            error: "Paramètres 'nom' et 'prenom' requis"
        });
    }
    
    const nomNormalized = nom.trim().toLowerCase();
    const prenomNormalized = prenom.trim().toLowerCase();
    const personKey = `${nomNormalized}_${prenomNormalized}`;
    const today = new Date().toISOString().split('T')[0];
    
    // Generate request ID (unique per person per second)
    const requestId = `${personKey}_${today}_${Date.now()}`;
    const dedupeKey = `${personKey}_${today}`;
    
    console.log('=== MEMBER CHECK ===');
    console.log(`Person: ${nom} ${prenom}`);
    console.log(`Request ID: ${requestId}`);
    
    // === LAYER 1: REQUEST DEDUPLICATION (within 5 seconds) ===
    const recentTimestamp = recentRequests.get(dedupeKey);
    if (recentTimestamp && (Date.now() - recentTimestamp) < 5000) {
        console.log('🚫 LAYER 1: Duplicate request within 5 seconds - REJECTED');
        
        // Return existing presence if available
        const presences = readJsonFile(PRESENCES_FILE, true);
        const existing = presences.find(p => 
            p.type === 'adherent' &&
            p.nom?.trim().toLowerCase() === nomNormalized &&
            p.prenom?.trim().toLowerCase() === prenomNormalized &&
            p.date && new Date(p.date).toISOString().split('T')[0] === today
        );
        
        return res.json({
            success: true,
            isPaid: true,
            alreadyRegistered: true,
            message: "Vous êtes déjà enregistré aujourd'hui. Bienvenue !",
            presence: existing
        });
    }
    
    // Mark this request timestamp
    recentRequests.set(dedupeKey, Date.now());
    
    // === LAYER 2: SYNCHRONOUS QUEUE PER PERSON ===
    // Wait if this person is currently being processed
    while (processingQueue.has(personKey)) {
        console.log('⏳ LAYER 2: Waiting for concurrent request to finish...');
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Mark as processing
    processingQueue.set(personKey, true);
    
    try {
        const members = syncService.getMembers();
        const member = members.find(m =>
            m.lastname?.trim().toLowerCase() === nomNormalized &&
            m.firstname?.trim().toLowerCase() === prenomNormalized
        );
        
        if (!member) {
            console.log('❌ Member not found');
            processingQueue.delete(personKey);
            return res.json({
                success: false,
                error: "Aucun membre trouvé avec ce nom et prénom"
            });
        }
        
        const joinStatus = member.joinFileStatusLabel;
        
        if (joinStatus === "Payé" || joinStatus === "En cours de paiement") {
            console.log(`✅ Valid payment: ${joinStatus}`);
            
            // === LAYER 3: DATABASE CHECK (with cache) ===
            const presences = readJsonFile(PRESENCES_FILE, true);
            
            console.log(`🔍 LAYER 3: Checking database`);
            console.log(`   Current presences: ${presences.length}`);
            
            const exists = presences.find(p => {
                if (!p.date || p.type !== 'adherent') return false;
                
                const presenceDate = new Date(p.date).toISOString().split('T')[0];
                if (presenceDate !== today) return false;
                
                const pNom = (p.nom || '').trim().toLowerCase();
                const pPrenom = (p.prenom || '').trim().toLowerCase();
                
                return pNom === nomNormalized && pPrenom === prenomNormalized;
            });
            
            if (exists) {
                console.log('⚠️ LAYER 3: DUPLICATE FOUND IN DATABASE - BLOCKING');
                processingQueue.delete(personKey);
                return res.json({
                    success: true,
                    isPaid: true,
                    alreadyRegistered: true,
                    message: "Vous êtes déjà enregistré aujourd'hui. Bienvenue !",
                    membre: member,
                    presence: exists
                });
            }
            
            // CREATE NEW PRESENCE
            console.log('✅ All layers passed - creating new presence');
            const newPresence = {
                id: Date.now().toString() + crypto.randomBytes(4).toString('hex'),
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
            const written = writeJsonFile(PRESENCES_FILE, presences);
            
            // Release processing lock
            processingQueue.delete(personKey);
            
            if (written) {
                console.log(`✅ SAVED: ${nom} ${prenom} at ${new Date().toLocaleTimeString()}`);
            }
            
            return res.json({
                success: true,
                isPaid: true,
                message: "Adhésion reconnue. Bienvenue !",
                membre: member,
                presence: newPresence
            });
        } else {
            console.log(`❌ Invalid payment: ${joinStatus}`);
            processingQueue.delete(personKey);
            return res.json({
                success: false,
                error: "Vous n'avez pas encore payé votre adhésion"
            });
        }
    } catch (error) {
        console.error('❌ Error:', error);
        processingQueue.delete(personKey); // Always release on error
        recentRequests.delete(dedupeKey); // Clear dedupe on error
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

// PRESENCES ROUTES
app.get('/presences', (req, res) => {
    try {
        const allPresences = readJsonFile(PRESENCES_FILE, true);
        const today = new Date().toISOString().split('T')[0];
        
        const todayPresences = allPresences.filter(p => {
            if (!p.date) return false;
            return new Date(p.date).toISOString().split('T')[0] === today;
        });
        
        res.json({
            success: true,
            presences: todayPresences,
            count: todayPresences.length
        });
    } catch (error) {
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
            id: Date.now().toString() + crypto.randomBytes(4).toString('hex'),
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

// HISTORY ROUTES
app.get('/presences/history', (req, res) => {
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const dates = history.map(h => h.date).sort().reverse();
        res.json({ success: true, dates });
    } catch (error) {
        res.status(500).json({ success: false, dates: [], error: error.message });
    }
});

app.get('/presences/history/:date', (req, res) => {
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const dayHistory = history.find(h => h.date === req.params.date);
        
        if (!dayHistory) {
            return res.json({ success: true, presences: [], count: 0 });
        }
        
        res.json({ 
            success: true, 
            presences: dayHistory.presences || [],
            count: dayHistory.presences ? dayHistory.presences.length : 0
        });
    } catch (error) {
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

// NON-MEMBERS ROUTES
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

// STATS
app.get('/api/stats/today', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE, true);
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

// EXPORT ROUTES
app.get('/admin/export/years', (req, res) => {
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        
        const years = [...new Set(history.map(h => {
            try {
                return new Date(h.date).getFullYear();
            } catch (e) {
                return null;
            }
        }))].filter(y => y && !isNaN(y) && y > 2000 && y < 2100).sort().reverse();
        
        res.json({ success: true, years });
    } catch (error) {
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

// ERROR HANDLERS
app.use((req, res) => {
    res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

app.use((error, req, res, next) => {
    console.error('💥 ERROR:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
});

// SERVER STARTUP
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('🎉 ==========================================');
    console.log('🎉 BACKEND - ULTIMATE DUPLICATE PREVENTION');
    console.log('🎉 ==========================================');
    console.log(`✅ Backend: http://localhost:${PORT}`);
    console.log(`📊 Admin: http://localhost:${PORT}/admin`);
    console.log(`🛡️ 3-Layer protection active`);
    console.log('🎉 ==========================================');
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