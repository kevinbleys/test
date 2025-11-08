const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  🚀 CLIMBING CLUB - SERVER v5.2 FINAL COMPLETE           ║');
console.log('║  + Tentative Tracking + French Messages + All Features  ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log(`Port: ${PORT}\n`);

const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const NON_MEMBERS_FILE = path.join(DATA_DIR, 'non-members.json');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const SAVED_NON_MEMBERS_FILE = path.join(DATA_DIR, 'saved-non-members.json');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');

// ====== STARTUP CLEANUP ======
const cleanupAllDuplicates = () => {
    try {
        const presences = fs.existsSync(PRESENCES_FILE) 
            ? JSON.parse(fs.readFileSync(PRESENCES_FILE, 'utf8')) 
            : [];
        
        if (!Array.isArray(presences)) {
            fs.writeFileSync(PRESENCES_FILE, JSON.stringify([], null, 2));
            console.log('✅ Corrupted presences.json fixed');
            return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const signatures = new Map();
        let duplicateCount = 0;
        let oldEntriesRemoved = 0;
        
        const cleaned = presences.filter(p => {
            if (p.date && p.type === 'adherent') {
                const pDate = new Date(p.date).toISOString().split('T')[0];
                if (pDate !== today) {
                    oldEntriesRemoved++;
                    return false;
                }
            }
            
            if (p.date && p.type === 'adherent') {
                const nom = (p.nom || '').trim().toLowerCase();
                const prenom = (p.prenom || '').trim().toLowerCase();
                const sig = `${nom}_${prenom}`;
                
                if (signatures.has(sig)) {
                    duplicateCount++;
                    return false;
                }
                signatures.set(sig, true);
            }
            
            return true;
        });
        
        if (duplicateCount > 0 || oldEntriesRemoved > 0) {
            fs.writeFileSync(PRESENCES_FILE, JSON.stringify(cleaned, null, 2));
            console.log(`✅ STARTUP CLEANUP:`);
            if (duplicateCount > 0) console.log(`   - Removed ${duplicateCount} duplicates`);
            if (oldEntriesRemoved > 0) console.log(`   - Removed ${oldEntriesRemoved} old entries`);
        } else {
            console.log('✅ No cleanup needed - database clean!');
        }
    } catch (error) {
        console.error('❌ STARTUP ERROR:', error.message);
    }
};

cleanupAllDuplicates();

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR, { recursive: true });

const initDataFile = (filePath) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
};

initDataFile(PRESENCES_FILE);
initDataFile(NON_MEMBERS_FILE);
initDataFile(PRESENCE_HISTORY_FILE);
initDataFile(SAVED_NON_MEMBERS_FILE);

const readJsonFile = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return [];
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data) || [];
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

let syncService = null;
try {
    syncService = require('./sync-service');
    console.log('✅ Sync service loaded');
} catch (error) {
    syncService = { getMembers: () => [], syncMembers: async () => 0 };
}

cron.schedule('0 0 * * *', () => {
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
});

cron.schedule('5 * * * *', async () => {
    try {
        if (syncService?.syncMembers) await syncService.syncMembers();
    } catch (error) {}
}, { timezone: "Europe/Brussels" });

app.get('/', (req, res) => res.json({ status: 'ok', version: '5.2.0' }));
app.get('/api/health', (req, res) => res.json({ status: 'healthy' }));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.get('/members/check', (req, res) => {
    const { nom, prenom } = req.query;
    if (!nom || !prenom) return res.status(400).json({ success: false });
    
    const nomNorm = nom.trim().toLowerCase();
    const prenomNorm = prenom.trim().toLowerCase();
    const today = new Date().toISOString().split('T')[0];
    const requestId = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    console.log(`\n>>> REQUEST [${requestId}]: ${nom} ${prenom}`);
    
    try {
        const members = syncService.getMembers();
        const member = members.find(m =>
            m.lastname?.trim().toLowerCase() === nomNorm &&
            m.firstname?.trim().toLowerCase() === prenomNorm
        );
        
        // ===== ATTEMPT 1: Member not found =====
        if (!member) {
            console.log(`    ❌ Not a member - tentative non-adherent`);
            
            const presences = readJsonFile(PRESENCES_FILE);
            const attemptPresence = {
                id: `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
                requestId: requestId,
                type: 'tentative-non-adherent',
                nom: nom.trim(),
                prenom: prenom.trim(),
                date: new Date().toISOString(),
                status: 'tentative non-adherent',
                niveau: 'N/A',
                tarif: 0,
                methodePaiement: 'N/A'
            };
            
            presences.push(attemptPresence);
            writeJsonFile(PRESENCES_FILE, presences);
            
            return res.json({ success: false, error: "Not found" });
        }
        
        // ===== ATTEMPT 2: Member found but not paid =====
        const joinStatus = member.joinFileStatusLabel;
        if (joinStatus !== "Payé" && joinStatus !== "En cours de paiement") {
            console.log(`    ❌ Member found but not paid - tentative non-payé`);
            
            const presences = readJsonFile(PRESENCES_FILE);
            const attemptPresence = {
                id: `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
                requestId: requestId,
                type: 'tentative-non-payé',
                nom: nom.trim(),
                prenom: prenom.trim(),
                date: new Date().toISOString(),
                status: 'tentative non-payé',
                niveau: 'N/A',
                tarif: 0,
                methodePaiement: 'N/A'
            };
            
            presences.push(attemptPresence);
            writeJsonFile(PRESENCES_FILE, presences);
            
            return res.json({ 
                success: false, 
                error: "Vous avez encore à régler votre adhésion"
            });
        }
        
        // ===== SUCCESS: Valid member =====
        console.log(`    ✅ Member verified`);
        
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
            console.log(`    🛑 DUPLICATE BLOCKED`);
            return res.json({
                success: true, isPaid: true, alreadyRegistered: true,
                message: "Vous êtes déjà enregistré aujourd'hui",
                presence: exists
            });
        }
        
        console.log(`    ✅ Creating new entry`);
        
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
        
        const deduped = presences.filter(p => {
            if (!p.date || p.type !== 'adherent') return true;
            const pDate = new Date(p.date).toISOString().split('T')[0];
            if (pDate !== today) return true;
            
            const count = presences.filter(p2 => 
                p2.date && 
                new Date(p2.date).toISOString().split('T')[0] === today &&
                (p2.nom || '').trim().toLowerCase() === (p.nom || '').trim().toLowerCase() &&
                (p2.prenom || '').trim().toLowerCase() === (p.prenom || '').trim().toLowerCase()
            ).length;
            
            return count === 1 || presences.indexOf(p) === presences.findIndex(p2 =>
                p2.date &&
                new Date(p2.date).toISOString().split('T')[0] === today &&
                (p2.nom || '').trim().toLowerCase() === (p.nom || '').trim().toLowerCase() &&
                (p2.prenom || '').trim().toLowerCase() === (p.prenom || '').trim().toLowerCase()
            );
        });
        
        writeJsonFile(PRESENCES_FILE, deduped);
        console.log(`    ✅ SAVED: ${nom} ${prenom}`);
        
        return res.json({
            success: true, isPaid: true,
            message: "Bienvenue!",
            membre: member,
            presence: newPresence
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ success: false });
    }
});

app.get('/members/all', (req, res) => {
    try {
        const members = syncService.getMembers();
        res.json({ success: true, members });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// ===== PRESENCES ENDPOINTS =====
app.get('/presences', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const today = new Date().toISOString().split('T')[0];
        
        const todayOnly = presences.filter(p => {
            if (!p.date) return false;
            const pDate = new Date(p.date).toISOString().split('T')[0];
            return pDate === today;
        });
        
        const deduped = [];
        const seen = new Set();
        
        for (const p of todayOnly) {
            if (p.type === 'adherent') {
                const sig = `${(p.nom || '').trim().toLowerCase()}_${(p.prenom || '').trim().toLowerCase()}`;
                if (seen.has(sig)) continue;
                seen.add(sig);
            }
            deduped.push(p);
        }
        
        res.json({ success: true, presences: deduped, count: deduped.length });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, presences: [], count: 0 });
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
        const { type, nom, prenom, tarif, ...other } = req.body;
        if (!type || !nom || !prenom) return res.status(400).json({ success: false });
        
        const presences = readJsonFile(PRESENCES_FILE);
        const newPresence = {
            id: `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
            type, nom: nom.trim(), prenom: prenom.trim(),
            date: new Date().toISOString(),
            tarif: tarif || 0,
            ...other
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

// ===== HISTORY ENDPOINTS =====
app.get('/presences/history', (req, res) => {
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const dates = history.map(h => h.date).sort().reverse();
        res.json({ success: true, dates });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, dates: [] });
    }
});

app.get('/presences/history/:date', (req, res) => {
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const day = history.find(h => h.date === req.params.date);
        res.json({ success: true, presences: day?.presences || [] });
    } catch (error) {
        console.error('Error:', error);
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

// ===== NON-MEMBERS =====
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

// ===== STATS =====
app.get('/api/stats/today', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const today = new Date().toISOString().split('T')[0];
        const valid = presences.filter(p => p.date && new Date(p.date).toISOString().split('T')[0] === today);
        
        const totalRevenue = valid.reduce((sum, p) => sum + (p.tarif || 0), 0);
        
        res.json({
            success: true,
            stats: {
                total: valid.length,
                adherents: valid.filter(p => p.type === 'adherent').length,
                nonAdherents: valid.filter(p => p.type === 'non-adherent').length,
                productSales: valid.filter(p => p.type === 'product-sale').length,
                revenue: totalRevenue
            }
        });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// ===== EXPORT YEARS =====
app.get('/admin/export/years', (req, res) => {
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const years = [...new Set(history.map(h => {
            try { return new Date(h.date).getFullYear(); } catch (e) { return null; }
        }))].filter(y => y && y > 2000).sort((a, b) => b - a);
        
        res.json({ success: true, years });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, years: [] });
    }
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((error, req, res) => {
    console.error('💥 ERROR:', error);
    res.status(500).json({ error: 'Server error' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Server running on http://localhost:' + PORT + '              ║');
    console.log('║  ✅ FRENCH MESSAGES + TENTATIVE TRACKING ENABLED        ║');
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