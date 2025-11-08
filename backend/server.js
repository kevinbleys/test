const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 BACKEND - PRODUCTION DUPLICATE FIX');
console.log(`Port: ${PORT}`);
console.log('🔒 PRODUCTION MODE: 3-Layer + Cleanup Active');

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const NON_MEMBERS_FILE = path.join(DATA_DIR, 'non-members.json');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const SAVED_NON_MEMBERS_FILE = path.join(DATA_DIR, 'saved-non-members.json');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');

// === PRODUCTION-GRADE DUPLICATE PREVENTION ===
const requestCache = new Map(); // All recent requests
const processingLocks = new Map(); // Current processing
const cleanupQueue = []; // Queue of IDs to cleanup later

// Cleanup old requests every 30 seconds
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, timestamp] of requestCache.entries()) {
        if (now - timestamp > 60000) {
            requestCache.delete(key);
            cleaned++;
        }
    }
    if (cleaned > 0) console.log(`🧹 Cleaned ${cleaned} old request cache entries`);
}, 30000);

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
            } catch (jsonError) {
                console.warn(`⚠️ Invalid JSON in ${path.basename(filePath)}, recreating...`);
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

// File operations - ATOMIC & SAFE
const readJsonFile = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return [];
        const data = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error(`❌ Read error ${path.basename(filePath)}:`, error.message);
        return [];
    }
};

const writeJsonFile = (filePath, data) => {
    try {
        if (!Array.isArray(data)) {
            console.error(`❌ Non-array for ${path.basename(filePath)}`);
            return false;
        }
        
        // Atomic write: write to temp, then rename
        const tempFile = filePath + '.tmp.' + crypto.randomBytes(4).toString('hex');
        fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
        fs.renameSync(tempFile, filePath);
        return true;
    } catch (error) {
        console.error(`❌ Write error ${path.basename(filePath)}:`, error.message);
        return false;
    }
};

// Cleanup duplicates on startup
const cleanupDuplicatesOnStart = () => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const seen = new Set();
        const duplicates = [];
        let cleaned = 0;
        
        const cleaned_presences = presences.filter(p => {
            if (!p.date || p.type !== 'adherent') return true;
            
            const key = `${(p.nom || '').toLowerCase()}_${(p.prenom || '').toLowerCase()}_${new Date(p.date).toISOString().split('T')[0]}`;
            
            if (seen.has(key)) {
                duplicates.push(p);
                cleaned++;
                return false; // Remove this one
            }
            
            seen.add(key);
            return true;
        });
        
        if (cleaned > 0) {
            writeJsonFile(PRESENCES_FILE, cleaned_presences);
            console.log(`🧹 STARTUP CLEANUP: Removed ${cleaned} duplicate entries`);
        }
    } catch (error) {
        console.error('❌ Startup cleanup error:', error.message);
    }
};

// Run cleanup on startup
cleanupDuplicatesOnStart();

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
    if (req.path.includes('/members/check')) {
        console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    }
    next();
});

// Sync service
let syncService = null;
try {
    syncService = require('./sync-service');
    console.log('✅ Sync service loaded');
} catch (error) {
    syncService = { getMembers: () => [], syncMembers: async () => 0 };
}

// Export service
let exportService = null;
try {
    exportService = require('./export-service');
    console.log('✅ Export service loaded');
} catch (error) {
    exportService = null;
}

// CRON: Daily reset
cron.schedule('0 0 * * *', () => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        if (presences.length > 0) {
            const history = readJsonFile(PRESENCE_HISTORY_FILE);
            const today = new Date().toISOString().split('T')[0];
            
            const idx = history.findIndex(h => h.date === today);
            if (idx >= 0) history[idx].presences = presences;
            else history.push({ date: today, presences });
            
            writeJsonFile(PRESENCE_HISTORY_FILE, history);
            writeJsonFile(PRESENCES_FILE, []);
        }
        
        requestCache.clear();
        processingLocks.clear();
    } catch (error) {
        console.error('❌ Daily reset error:', error.message);
    }
});

// CRON: Pepsup sync
cron.schedule('5 * * * *', async () => {
    try {
        if (syncService?.syncMembers) {
            await syncService.syncMembers();
        }
    } catch (error) {
        console.error('❌ Sync error:', error.message);
    }
}, { timezone: "Europe/Brussels" });

// === BASIC ROUTES ===
app.get('/', (req, res) => {
    res.json({ status: 'success', message: 'API v2.8.0', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        presences: readJsonFile(PRESENCES_FILE).length,
        timestamp: new Date().toISOString()
    });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// === PRODUCTION MEMBERS CHECK - BULLETPROOF ===
app.get('/members/check', async (req, res) => {
    const { nom, prenom } = req.query;
    
    if (!nom || !prenom) {
        return res.status(400).json({ success: false, error: "Missing parameters" });
    }
    
    const requestId = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const nomNorm = nom.trim().toLowerCase();
    const prenomNorm = prenom.trim().toLowerCase();
    const personKey = `${nomNorm}_${prenomNorm}`;
    const today = new Date().toISOString().split('T')[0];
    const dedupeKey = `${personKey}_${today}`;
    
    console.log('=== MEMBER CHECK ===');
    console.log(`Request: ${nom} ${prenom} (ID: ${requestId})`);
    
    try {
        // LAYER 1: RAPID FIRE DEDUP
        if (requestCache.has(dedupeKey)) {
            const lastTime = requestCache.get(dedupeKey);
            if (Date.now() - lastTime < 3000) { // 3 second window
                console.log(`🛡️ LAYER 1 BLOCKED: Recent duplicate request`);
                
                const presences = readJsonFile(PRESENCES_FILE);
                const existing = presences.find(p =>
                    p.type === 'adherent' &&
                    (p.nom || '').toLowerCase() === nomNorm &&
                    (p.prenom || '').toLowerCase() === prenomNorm &&
                    new Date(p.date).toISOString().split('T')[0] === today
                );
                
                return res.json({
                    success: true,
                    isPaid: true,
                    alreadyRegistered: true,
                    message: "Vous êtes déjà enregistré aujourd'hui",
                    presence: existing
                });
            }
        }
        
        requestCache.set(dedupeKey, Date.now());
        console.log(`✅ LAYER 1: Request registered`);
        
        // LAYER 2: PROCESSING LOCK
        while (processingLocks.has(personKey)) {
            console.log(`⏳ LAYER 2: Waiting for concurrent request...`);
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        processingLocks.set(personKey, Date.now());
        console.log(`✅ LAYER 2: Lock acquired`);
        
        const members = syncService.getMembers();
        const member = members.find(m =>
            m.lastname?.trim().toLowerCase() === nomNorm &&
            m.firstname?.trim().toLowerCase() === prenomNorm
        );
        
        if (!member) {
            processingLocks.delete(personKey);
            console.log('❌ Member not found');
            return res.json({ success: false, error: "Member not found" });
        }
        
        const joinStatus = member.joinFileStatusLabel;
        if (joinStatus !== "Payé" && joinStatus !== "En cours de paiement") {
            processingLocks.delete(personKey);
            console.log(`❌ Invalid payment status: ${joinStatus}`);
            return res.json({ success: false, error: "Payment not confirmed" });
        }
        
        // LAYER 3: DATABASE VERIFICATION
        const presences = readJsonFile(PRESENCES_FILE);
        
        const exists = presences.find(p => {
            if (!p.date || p.type !== 'adherent') return false;
            const pDate = new Date(p.date).toISOString().split('T')[0];
            if (pDate !== today) return false;
            return (p.nom || '').toLowerCase() === nomNorm && (p.prenom || '').toLowerCase() === prenomNorm;
        });
        
        if (exists) {
            processingLocks.delete(personKey);
            console.log(`🛡️ LAYER 3 BLOCKED: Found in database`);
            return res.json({
                success: true,
                isPaid: true,
                alreadyRegistered: true,
                message: "Vous êtes déjà enregistré aujourd'hui",
                presence: exists
            });
        }
        
        console.log(`✅ LAYER 3: No duplicate in database`);
        
        // CREATE & SAVE
        const newPresence = {
            id: `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
            type: 'adherent',
            nom: nom.trim(),
            prenom: prenom.trim(),
            date: new Date().toISOString(),
            status: 'adherent',
            niveau: 'N/A',
            tarif: 0,
            methodePaiement: 'N/A',
            membre: member
        };
        
        presences.push(newPresence);
        const written = writeJsonFile(PRESENCES_FILE, presences);
        
        processingLocks.delete(personKey);
        console.log(`✅ SAVED: ${nom} ${prenom}`);
        
        return res.json({
            success: true,
            isPaid: true,
            message: "Welcome!",
            membre: member,
            presence: newPresence
        });
        
    } catch (error) {
        processingLocks.delete(personKey);
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
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

// PRESENCES
app.get('/presences', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const today = new Date().toISOString().split('T')[0];
        const todayOnly = presences.filter(p => p.date && new Date(p.date).toISOString().split('T')[0] === today);
        res.json({ success: true, presences: todayOnly, count: todayOnly.length });
    } catch (error) {
        res.status(500).json({ success: false, presences: [], error: error.message });
    }
});

app.get('/presences/:id', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const presence = presences.find(p => p.id === req.params.id);
        if (!presence) return res.status(404).json({ success: false });
        res.json({ success: true, presence });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/presences', (req, res) => {
    try {
        const { type, nom, prenom, ...other } = req.body;
        if (!type || !nom || !prenom) return res.status(400).json({ success: false });
        
        const presences = readJsonFile(PRESENCES_FILE);
        const newPresence = {
            id: `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
            type, nom: nom.trim(), prenom: prenom.trim(), date: new Date().toISOString(),
            ...other
        };
        
        presences.push(newPresence);
        writeJsonFile(PRESENCES_FILE, presences);
        res.json({ success: true, presence: newPresence });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/presences/:id/valider', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const idx = presences.findIndex(p => p.id === req.params.id);
        if (idx === -1) return res.status(404).json({ success: false });
        
        presences[idx].status = 'Payé';
        if (req.body.montant) presences[idx].tarif = req.body.montant;
        if (req.body.methodePaiement) presences[idx].methodePaiement = req.body.methodePaiement;
        
        writeJsonFile(PRESENCES_FILE, presences);
        res.json({ success: true, presence: presences[idx] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/presences/:id', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const filtered = presences.filter(p => p.id !== req.params.id);
        writeJsonFile(PRESENCES_FILE, filtered);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// HISTORY
app.get('/presences/history', (req, res) => {
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        res.json({ success: true, dates: history.map(h => h.date).sort().reverse() });
    } catch (error) {
        res.status(500).json({ success: false, dates: [] });
    }
});

app.get('/presences/history/:date', (req, res) => {
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const day = history.find(h => h.date === req.params.date);
        res.json({ success: true, presences: day?.presences || [], count: day?.presences?.length || 0 });
    } catch (error) {
        res.status(500).json({ success: false, presences: [] });
    }
});

app.post('/presences/archive', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        if (!presences.length) return res.json({ success: false, message: 'Empty' });
        
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const today = new Date().toISOString().split('T')[0];
        const idx = history.findIndex(h => h.date === today);
        
        if (idx >= 0) history[idx].presences = presences;
        else history.push({ date: today, presences });
        
        writeJsonFile(PRESENCE_HISTORY_FILE, history);
        writeJsonFile(PRESENCES_FILE, []);
        res.json({ success: true, message: `Archived ${presences.length}` });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// NON-MEMBERS
app.post('/save-non-member', (req, res) => {
    try {
        const { nom, prenom, email, dateNaissance, niveau } = req.body;
        if (!nom || !prenom || !email || !dateNaissance) return res.status(400).json({ success: false });
        
        const saved = readJsonFile(SAVED_NON_MEMBERS_FILE);
        const idx = saved.findIndex(m => m.nom.toLowerCase() === nom.toLowerCase() && m.prenom.toLowerCase() === prenom.toLowerCase() && m.dateNaissance === dateNaissance);
        
        const data = {
            id: idx >= 0 ? saved[idx].id : Date.now().toString(),
            nom: nom.trim(), prenom: prenom.trim(), email: email.trim(),
            telephone: req.body.telephone || '', dateNaissance, niveau: parseInt(niveau),
            assuranceAccepted: req.body.assuranceAccepted || true,
            age: req.body.age, tarif: req.body.tarif,
            savedAt: idx >= 0 ? saved[idx].savedAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (idx >= 0) saved[idx] = data;
        else saved.push(data);
        
        writeJsonFile(SAVED_NON_MEMBERS_FILE, saved);
        res.json({ success: true, nonMember: data });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.post('/quick-non-member', (req, res) => {
    try {
        const { nom, prenom, dateNaissance } = req.body;
        const saved = readJsonFile(SAVED_NON_MEMBERS_FILE);
        const found = saved.find(m => m.nom.toLowerCase() === nom.toLowerCase() && m.prenom.toLowerCase() === prenom.toLowerCase() && m.dateNaissance === dateNaissance);
        res.json({ success: !!found, nonMember: found });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// STATS
app.get('/api/stats/today', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const today = new Date().toISOString().split('T')[0];
        const valid = presences.filter(p => p.date && new Date(p.date).toISOString().split('T')[0] === today && p.type !== 'failed-login');
        
        res.json({
            success: true,
            stats: {
                date: today,
                total: valid.length,
                adherents: valid.filter(p => p.type === 'adherent').length,
                nonAdherents: valid.filter(p => p.type === 'non-adherent').length,
                revenue: valid.filter(p => p.tarif).reduce((s, p) => s + p.tarif, 0)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// EXPORT
app.get('/admin/export/years', (req, res) => {
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const years = [...new Set(history.map(h => {
            try { return new Date(h.date).getFullYear(); } catch (e) { return null; }
        }))].filter(y => y && !isNaN(y) && y > 2000 && y < 2100).sort().reverse();
        
        res.json({ success: true, years });
    } catch (error) {
        res.status(500).json({ success: false, years: [] });
    }
});

if (exportService) {
    app.post('/admin/export/season', async (req, res) => {
        try {
            const result = await exportService.exportSeasonToExcel();
            res.json({ success: true, filename: result.filename });
        } catch (error) {
            res.status(500).json({ success: false });
        }
    });
    
    app.post('/admin/export/:year', async (req, res) => {
        try {
            const yearInt = parseInt(req.params.year);
            if (!yearInt || yearInt < 2020 || yearInt > 2030) return res.status(400).json({ success: false });
            const result = await exportService.exportYearToExcel(yearInt);
            res.json({ success: true, filename: result.filename });
        } catch (error) {
            res.status(500).json({ success: false });
        }
    });
}

// ERROR HANDLERS
app.use((req, res) => { res.status(404).json({ error: 'Not found' }); });
app.use((error, req, res) => {
    console.error('💥 ERROR:', error);
    res.status(500).json({ error: 'Server error' });
});

// SERVER STARTUP
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ Server running on http://localhost:' + PORT);
    console.log('🔒 PRODUCTION MODE WITH 3-LAYER DUPLICATE PREVENTION');
});

server.on('error', error => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} already in use!`);
        process.exit(1);
    }
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));

module.exports = app;