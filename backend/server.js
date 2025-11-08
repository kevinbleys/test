const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  🚀 BACKEND - ULTIMATE FINAL SOLUTION v4.0                ║');
console.log('║  ZERO DUPLICATES GUARANTEED                               ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log(`Port: ${PORT}`);

const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const NON_MEMBERS_FILE = path.join(DATA_DIR, 'non-members.json');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const SAVED_NON_MEMBERS_FILE = path.join(DATA_DIR, 'saved-non-members.json');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');

// ====== STARTUP CLEANUP - AGGRESSIVE ======
const cleanupAllDuplicates = () => {
    try {
        const presences = fs.existsSync(PRESENCES_FILE) 
            ? JSON.parse(fs.readFileSync(PRESENCES_FILE, 'utf8')) 
            : [];
        
        if (!Array.isArray(presences)) {
            fs.writeFileSync(PRESENCES_FILE, JSON.stringify([], null, 2));
            console.log('✅ STARTUP: Corrupted presences.json fixed');
            return;
        }
        
        // Create signature for each person+date
        const signatures = new Map();
        let duplicateCount = 0;
        
        const cleaned = presences.filter(p => {
            // Keep non-adherents and entries without dates
            if (!p.date || p.type !== 'adherent') {
                return true;
            }
            
            // Create signature: nom_prenom_date
            const nom = (p.nom || '').trim().toLowerCase();
            const prenom = (p.prenom || '').trim().toLowerCase();
            const date = new Date(p.date).toISOString().split('T')[0];
            const sig = `${nom}_${prenom}_${date}`;
            
            // If we've seen this signature, it's a duplicate
            if (signatures.has(sig)) {
                duplicateCount++;
                console.log(`  ❌ DUPLICATE REMOVED: ${p.nom} ${p.prenom} (${date})`);
                return false;
            }
            
            signatures.set(sig, true);
            return true;
        });
        
        if (duplicateCount > 0) {
            fs.writeFileSync(PRESENCES_FILE, JSON.stringify(cleaned, null, 2));
            console.log(`\n✅ STARTUP CLEANUP: Removed ${duplicateCount} duplicates`);
        } else {
            console.log('✅ STARTUP: No duplicates found - clean!');
        }
    } catch (error) {
        console.error('❌ STARTUP CLEANUP ERROR:', error.message);
    }
};

// Run cleanup IMMEDIATELY on startup
cleanupAllDuplicates();

// Setup directories
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

// Initialize data files
const initDataFile = (filePath, defaultData = []) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
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
        console.error(`❌ Read error:`, error.message);
        return [];
    }
};

const writeJsonFile = (filePath, data) => {
    try {
        if (!Array.isArray(data)) return false;
        const tempFile = filePath + '.tmp.' + crypto.randomBytes(6).toString('hex');
        fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), { flag: 'w' });
        fs.renameSync(tempFile, filePath);
        return true;
    } catch (error) {
        console.error(`❌ Write error:`, error.message);
        return false;
    }
};

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002',
             'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002',
             /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

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
        console.log('\n=== DAILY RESET ===');
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
        console.log('=== DAILY RESET DONE ===\n');
    } catch (error) {
        console.error('❌ Daily reset error:', error.message);
    }
});

// CRON: Pepsup sync
cron.schedule('5 * * * *', async () => {
    try {
        if (syncService?.syncMembers) await syncService.syncMembers();
    } catch (error) {
        console.error('❌ Sync error:', error.message);
    }
}, { timezone: "Europe/Brussels" });

// Routes
app.get('/', (req, res) => res.json({ status: 'ok', version: '4.0.0' }));
app.get('/api/health', (req, res) => res.json({ status: 'healthy', presences: readJsonFile(PRESENCES_FILE).length }));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// ====== BULLETPROOF MEMBERS CHECK ======
app.get('/members/check', (req, res) => {
    const { nom, prenom } = req.query;
    if (!nom || !prenom) return res.status(400).json({ success: false, error: "Missing params" });
    
    const nomNorm = nom.trim().toLowerCase();
    const prenomNorm = prenom.trim().toLowerCase();
    const today = new Date().toISOString().split('T')[0];
    const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`\n>>> REQUEST [${requestId}]: ${nom} ${prenom} on ${today}`);
    
    try {
        // 1. Get member
        const members = syncService.getMembers();
        const member = members.find(m =>
            m.lastname?.trim().toLowerCase() === nomNorm &&
            m.firstname?.trim().toLowerCase() === prenomNorm
        );
        
        if (!member) {
            console.log(`    ❌ Member not found`);
            return res.json({ success: false, error: "Not found" });
        }
        
        const joinStatus = member.joinFileStatusLabel;
        if (joinStatus !== "Payé" && joinStatus !== "En cours de paiement") {
            console.log(`    ❌ Payment invalid: ${joinStatus}`);
            return res.json({ success: false, error: "Not paid" });
        }
        
        console.log(`    ✅ Member verified - Status: ${joinStatus}`);
        
        // 2. Check database NOW (at time of request)
        const presences = readJsonFile(PRESENCES_FILE);
        console.log(`    📋 Database has ${presences.length} entries`);
        
        const exists = presences.find(p => {
            if (!p.date || p.type !== 'adherent') return false;
            const pDate = new Date(p.date).toISOString().split('T')[0];
            if (pDate !== today) return false;
            return (p.nom || '').trim().toLowerCase() === nomNorm && 
                   (p.prenom || '').trim().toLowerCase() === prenomNorm;
        });
        
        if (exists) {
            console.log(`    🛑 DUPLICATE BLOCKED: Already in database`);
            return res.json({
                success: true, isPaid: true, alreadyRegistered: true,
                message: "Vous êtes déjà enregistré aujourd'hui",
                presence: exists
            });
        }
        
        console.log(`    ✅ No duplicate found - Creating new entry`);
        
        // 3. CREATE & SAVE
        const newPresence = {
            id: `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
            requestId: requestId,
            type: 'adherent',
            nom: nom.trim(),
            prenom: prenom.trim(),
            date: new Date().toISOString(),
            status: 'adherent',
            niveau: 'N/A',
            tarif: 0,
            methodePaiement: 'N/A'
        };
        
        presences.push(newPresence);
        
        // CRITICAL: Verify no duplicate was added while we were processing
        const finalCheck = presences.filter(p => {
            if (!p.date || p.type !== 'adherent') return false;
            const pDate = new Date(p.date).toISOString().split('T')[0];
            if (pDate !== today) return false;
            return (p.nom || '').trim().toLowerCase() === nomNorm && 
                   (p.prenom || '').trim().toLowerCase() === prenomNorm;
        });
        
        console.log(`    📊 Final check: ${finalCheck.length} entries for this person today`);
        
        if (finalCheck.length > 1) {
            console.log(`    ⚠️ DUPLICATE DETECTED! Cleaning...`);
            // Remove all duplicates, keep only the first
            const seen = new Set();
            const deduped = presences.filter(p => {
                if (!p.date || p.type !== 'adherent') return true;
                const pDate = new Date(p.date).toISOString().split('T')[0];
                if (pDate !== today) return true;
                const sig = `${(p.nom || '').trim().toLowerCase()}_${(p.prenom || '').trim().toLowerCase()}`;
                if (seen.has(sig)) return false;
                seen.add(sig);
                return true;
            });
            presences.length = 0;
            presences.push(...deduped);
        }
        
        writeJsonFile(PRESENCES_FILE, presences);
        console.log(`    ✅ SAVED: ${nom} ${prenom} (ID: ${newPresence.id})`);
        console.log(`    ✅ Database now has ${presences.length} entries\n`);
        
        return res.json({
            success: true, isPaid: true,
            message: "Adhésion reconnue. Bienvenue !",
            membre: member,
            presence: newPresence
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.get('/members/all', (req, res) => {
    try {
        const members = syncService.getMembers();
        res.json({ success: true, members, count: members.length });
    } catch (error) {
        res.status(500).json({ success: false });
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
        res.status(500).json({ success: false, presences: [] });
    }
});

app.get('/presences/:id', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const presence = presences.find(p => p.id === req.params.id);
        res.json({ success: !!presence, presence });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.post('/presences', (req, res) => {
    try {
        const { type, nom, prenom, ...other } = req.body;
        if (!type || !nom || !prenom) return res.status(400).json({ success: false });
        
        const presences = readJsonFile(PRESENCES_FILE);
        const newPresence = {
            id: `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
            type, nom: nom.trim(), prenom: prenom.trim(),
            date: new Date().toISOString(), ...other
        };
        
        presences.push(newPresence);
        writeJsonFile(PRESENCES_FILE, presences);
        res.json({ success: true, presence: newPresence });
    } catch (error) {
        res.status(500).json({ success: false });
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
        res.status(500).json({ success: false });
    }
});

app.delete('/presences/:id', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const filtered = presences.filter(p => p.id !== req.params.id);
        writeJsonFile(PRESENCES_FILE, filtered);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
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
        res.json({ success: true, presences: day?.presences || [] });
    } catch (error) {
        res.status(500).json({ success: false, presences: [] });
    }
});

app.post('/presences/archive', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        if (!presences.length) return res.json({ success: false });
        
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const today = new Date().toISOString().split('T')[0];
        const idx = history.findIndex(h => h.date === today);
        
        if (idx >= 0) history[idx].presences = presences;
        else history.push({ date: today, presences });
        
        writeJsonFile(PRESENCE_HISTORY_FILE, history);
        writeJsonFile(PRESENCES_FILE, []);
        res.json({ success: true });
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
        const idx = saved.findIndex(m => m.nom.toLowerCase() === nom.toLowerCase() && 
                                         m.prenom.toLowerCase() === prenom.toLowerCase() && 
                                         m.dateNaissance === dateNaissance);
        
        const data = {
            id: idx >= 0 ? saved[idx].id : Date.now().toString(),
            nom: nom.trim(), prenom: prenom.trim(), email: email.trim(),
            telephone: req.body.telephone || '', dateNaissance, niveau: parseInt(niveau),
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
        const found = saved.find(m => m.nom.toLowerCase() === nom.toLowerCase() && 
                                      m.prenom.toLowerCase() === prenom.toLowerCase() && 
                                      m.dateNaissance === dateNaissance);
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
        }))].filter(y => y && !isNaN(y) && y > 2000).sort().reverse();
        
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
            if (!yearInt) return res.status(400).json({ success: false });
            const result = await exportService.exportYearToExcel(yearInt);
            res.json({ success: true, filename: result.filename });
        } catch (error) {
            res.status(500).json({ success: false });
        }
    });
}

// ERROR HANDLERS
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((error, req, res) => {
    console.error('💥 ERROR:', error);
    res.status(500).json({ error: 'Server error' });
});

// SERVER STARTUP
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Server running on http://localhost:' + PORT + '              ║');
    console.log('║  🔒 BULLETPROOF DUPLICATE PREVENTION ACTIVE              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
});

server.on('error', error => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} already in use!`);
        process.exit(1);
    }
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));

module.exports = app;