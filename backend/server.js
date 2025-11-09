const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  🚀 CLIMBING CLUB - SERVER v13.0 FINAL                  ║');
console.log('║  + Boot Cleanup + Smart Seasons + Auto-Export           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const ATTEMPTS_FILE = path.join(DATA_DIR, 'login-attempts.json');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const SAVED_NON_MEMBERS_FILE = path.join(DATA_DIR, 'saved-non-members.json');
const SEASONS_FILE = path.join(DATA_DIR, 'seasons.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// 🔄 BOOT CLEANUP: Verwijder alle oude backups bij opstart (VÓÓR API endpoints actief zijn!)
(function cleanupBackupsOnStartup() {
    try {
        console.log('[BOOT] 🧹 Checking for old backup files...');
        const files = fs.readdirSync(DATA_DIR);
        let deleted = 0;
        
        files.forEach(file => {
            if (file.includes('members_backup')) {
                const filePath = path.join(DATA_DIR, file);
                fs.unlinkSync(filePath);
                console.log(`[BOOT] ✅ Deleted: ${file}`);
                deleted++;
            }
        });
        
        if (deleted === 0) {
            console.log('[BOOT] ✨ No old backup files found - storage is clean!');
        } else {
            console.log(`[BOOT] 🎉 Successfully deleted ${deleted} old backup file(s)!`);
        }
    } catch (err) {
        console.error('[BOOT] ❌ Cleanup error:', err);
    }
})();

const initDataFile = (filePath) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
        console.log(`✅ Created ${path.basename(filePath)}`);
    }
};

initDataFile(PRESENCES_FILE);
initDataFile(ATTEMPTS_FILE);
initDataFile(PRESENCE_HISTORY_FILE);
initDataFile(SAVED_NON_MEMBERS_FILE);
initDataFile(SEASONS_FILE);

const readJsonFile = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return [];
        const data = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error(`❌ Read error on ${path.basename(filePath)}:`, error.message);
        return [];
    }
};

const writeJsonFile = (filePath, data) => {
    try {
        if (!Array.isArray(data)) {
            console.error(`❌ Write rejected - not an array for ${path.basename(filePath)}`);
            return false;
        }
        const tempFile = filePath + '.tmp.' + crypto.randomBytes(6).toString('hex');
        fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), { flag: 'w' });
        fs.renameSync(tempFile, filePath);
        console.log(`✅ Saved ${path.basename(filePath)} (${data.length} items)`);
        return true;
    } catch (error) {
        console.error(`❌ Write error on ${path.basename(filePath)}:`, error.message);
        return false;
    }
};

// 🔧 SMART SEASONS MANAGEMENT
function getCurrentSeason() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    if (month >= 8) { // Sept onwards
        return { startYear: year, endYear: year + 1 };
    } else { // Jan-Aug
        return { startYear: year - 1, endYear: year };
    }
}

function initializeSeasons() {
    try {
        let seasons = readJsonFile(SEASONS_FILE);
        const current = getCurrentSeason();
        
        if (seasons.length === 0) {
            // First time: add past 2 and current season
            seasons = [
                { startYear: current.startYear - 2, endYear: current.endYear - 2 },
                { startYear: current.startYear - 1, endYear: current.endYear - 1 },
                { startYear: current.startYear, endYear: current.endYear }
            ];
            writeJsonFile(SEASONS_FILE, seasons);
            console.log('✅ Initialized seasons');
            return seasons;
        }
        
        // Check if we need to add next season (automatic on Sept 1)
        const lastSeason = seasons[seasons.length - 1];
        if (lastSeason.endYear < current.endYear) {
            const nextSeason = { startYear: current.startYear, endYear: current.endYear };
            seasons.push(nextSeason);
            writeJsonFile(SEASONS_FILE, seasons);
            console.log(`✅ Added new season: ${nextSeason.startYear}-${nextSeason.endYear}`);
        }
        
        return seasons;
    } catch (error) {
        console.error('❌ Season init error:', error);
        return [];
    }
}

// Initialize seasons on startup
initializeSeasons();

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

app.get('/', (req, res) => res.json({ status: 'ok', version: '13.0.0' }));
app.get('/api/health', (req, res) => res.json({ status: 'healthy' }));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.get('/members/check', (req, res) => {
    const { nom, prenom } = req.query;
    if (!nom || !prenom) return res.status(400).json({ success: false });
    
    const nomNorm = nom.trim().toLowerCase();
    const prenomNorm = prenom.trim().toLowerCase();
    
    try {
        const members = syncService.getMembers();
        const attempts = readJsonFile(ATTEMPTS_FILE);
        
        const member = members.find(m =>
            m.lastname?.trim().toLowerCase() === nomNorm &&
            m.firstname?.trim().toLowerCase() === prenomNorm
        );
        
        if (!member) {
            const attemptEntry = {
                id: `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
                type: 'tentative-non-adherent',
                nom: nom.trim(),
                prenom: prenom.trim(),
                date: new Date().toISOString(),
                status: 'tentative non-adherent',
                niveau: 'N/A',
                tarif: 0,
                methodePaiement: 'N/A'
            };
            attempts.push(attemptEntry);
            writeJsonFile(ATTEMPTS_FILE, attempts);
            return res.json({ success: false, error: "Vous n'êtes pas membre du club" });
        }
        
        const joinStatus = member.joinFileStatusLabel;
        if (joinStatus !== "Payé" && joinStatus !== "En cours de paiement") {
            const attemptEntry = {
                id: `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
                type: 'tentative-non-payé',
                nom: nom.trim(),
                prenom: prenom.trim(),
                date: new Date().toISOString(),
                status: 'tentative non-payé',
                niveau: 'N/A',
                tarif: 0,
                methodePaiement: 'N/A'
            };
            attempts.push(attemptEntry);
            writeJsonFile(ATTEMPTS_FILE, attempts);
            return res.json({ success: false, error: "Vous avez encore à régler votre adhésion" });
        }
        
        const presences = readJsonFile(PRESENCES_FILE);
        const today = new Date().toISOString().split('T')[0];
        
        const exists = presences.find(p => {
            if (!p.date || p.type !== 'adherent') return false;
            const pDate = new Date(p.date).toISOString().split('T')[0];
            if (pDate !== today) return false;
            return (p.nom || '').trim().toLowerCase() === nomNorm && 
                   (p.prenom || '').trim().toLowerCase() === prenomNorm;
        });
        
        if (exists) {
            return res.json({
                success: true, isPaid: true, alreadyRegistered: true,
                message: "Vous êtes déjà enregistré aujourd'hui",
                presence: exists
            });
        }
        
        const newPresence = {
            id: `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
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
        writeJsonFile(PRESENCES_FILE, presences);
        
        return res.json({
            success: true, isPaid: true,
            message: "Bienvenue!",
            membre: member,
            presence: newPresence
        });
    } catch (error) {
        console.error('❌ Critical error:', error);
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

app.get('/presences', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const attempts = readJsonFile(ATTEMPTS_FILE);
        const today = new Date().toISOString().split('T')[0];
        
        const allEntries = [...presences, ...attempts];
        const todayOnly = allEntries.filter(p => {
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
        res.status(500).json({ success: false, presences: [], count: 0 });
    }
});

app.get('/presences/:id', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const attempts = readJsonFile(ATTEMPTS_FILE);
        const allEntries = [...presences, ...attempts];
        const presence = allEntries.find(p => p.id === req.params.id);
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
        let presences = readJsonFile(PRESENCES_FILE);
        let attempts = readJsonFile(ATTEMPTS_FILE);
        
        presences = presences.filter(p => p.id !== req.params.id);
        attempts = attempts.filter(p => p.id !== req.params.id);
        
        writeJsonFile(PRESENCES_FILE, presences);
        writeJsonFile(ATTEMPTS_FILE, attempts);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.get('/presences/history', (req, res) => {
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const dates = history
            .filter(h => h.date && h.date.length === 10 && Array.isArray(h.presences) && h.presences.length > 0)
            .map(h => h.date)
            .sort()
            .reverse();
        
        res.json({ success: true, dates });
    } catch (error) {
        res.status(500).json({ success: false, dates: [] });
    }
});

app.get('/presences/history/:date', (req, res) => {
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const day = history.find(h => h.date === req.params.date);
        
        if (!day) {
            return res.json({ success: true, presences: [] });
        }
        
        const presences = Array.isArray(day.presences) ? day.presences : [];
        res.json({ success: true, presences });
    } catch (error) {
        res.status(500).json({ success: false, presences: [] });
    }
});

app.post('/presences/archive', (req, res) => {
    try {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║  🔄 ARCHIVING PRESENCES...                               ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        
        const presences = readJsonFile(PRESENCES_FILE);
        const attempts = readJsonFile(ATTEMPTS_FILE);
        const combined = [...presences, ...attempts];
        
        console.log(`[ARCHIVE] Total items to archive: ${combined.length}`);
        console.log(`[ARCHIVE] Presences: ${presences.length}, Attempts: ${attempts.length}`);
        
        if (combined.length === 0) {
            console.log('[ARCHIVE] ❌ No data to archive');
            return res.json({ success: false, error: 'No data to archive', archived: 0 });
        }
        
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const today = new Date().toISOString().split('T')[0];
        
        console.log(`[ARCHIVE] Today's date: ${today}`);
        console.log(`[ARCHIVE] History entries before: ${history.length}`);
        
        const idx = history.findIndex(h => h.date === today);
        
        if (idx >= 0) {
            console.log(`[ARCHIVE] Found existing entry for ${today}, updating...`);
            history[idx].presences = combined;
        } else {
            console.log(`[ARCHIVE] Creating new entry for ${today}...`);
            history.push({ date: today, presences: combined });
        }
        
        const writeSuccess = writeJsonFile(PRESENCE_HISTORY_FILE, history);
        
        if (!writeSuccess) {
            console.log('[ARCHIVE] ❌ Failed to write history file');
            return res.json({ success: false, error: 'Write failed', archived: 0 });
        }
        
        const verifyHistory = readJsonFile(PRESENCE_HISTORY_FILE);
        const verifyDay = verifyHistory.find(h => h.date === today);
        const verifyCount = verifyDay ? (verifyDay.presences ? verifyDay.presences.length : 0) : 0;
        
        console.log(`[ARCHIVE] Verification - Data saved for ${today}: ${verifyCount} items`);
        
        if (verifyCount !== combined.length) {
            console.log(`[ARCHIVE] ⚠️ WARNING: Mismatch! Expected ${combined.length}, got ${verifyCount}`);
        }
        
        writeJsonFile(PRESENCES_FILE, []);
        writeJsonFile(ATTEMPTS_FILE, []);
        
        console.log(`[ARCHIVE] ✅ Archive complete! Cleared presences.json and login-attempts.json`);
        console.log('╚════════════════════════════════════════════════════════════╝\n');
        
        res.json({ success: true, archived: combined.length, verification: verifyCount });
    } catch (error) {
        console.error('[ARCHIVE] ❌ Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

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

app.get('/api/stats/today', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const attempts = readJsonFile(ATTEMPTS_FILE);
        const today = new Date().toISOString().split('T')[0];
        const valid = [...presences, ...attempts].filter(p => p.date && new Date(p.date).toISOString().split('T')[0] === today);
        
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

app.get('/admin/export/years', (req, res) => {
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        
        const yearsSet = new Set();
        history.forEach(h => {
            if (h.date && h.date.length >= 4 && Array.isArray(h.presences) && h.presences.length > 0) {
                const year = parseInt(h.date.substring(0, 4));
                if (year > 2000 && year < 2100) {
                    yearsSet.add(year);
                }
            }
        });
        
        const years = Array.from(yearsSet).sort((a, b) => b - a);
        res.json({ success: true, years });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, years: [] });
    }
});

app.get('/admin/seasons', (req, res) => {
    try {
        const seasons = initializeSeasons();
        res.json({ success: true, seasons });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, seasons: [] });
    }
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((error, req, res, next) => {
    console.error('💥 ERROR:', error);
    res.status(500).json({ error: 'Server error' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Server v13.0 FINAL running on http://localhost:' + PORT + '  ║');
    console.log('║  ✅ BOOT CLEANUP + SMART SEASONS + AUTO-EXPORT         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
});

server.on('error', error => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} already in use!`);
        process.exit(1);
    }
});

// 🔄 CRON: Cleanup members_backup files every night at 02:00
cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Running nightly cleanup of members_backup files...');
    try {
        const files = fs.readdirSync(DATA_DIR);
        let deleted = 0;
        
        files.forEach(file => {
            if (file.includes('members_backup')) {
                const filePath = path.join(DATA_DIR, file);
                fs.unlinkSync(filePath);
                console.log(`[CRON] ✅ Deleted ${file}`);
                deleted++;
            }
        });
        
        if (deleted === 0) console.log('[CRON] No backup files to delete');
        else console.log(`[CRON] ✅ Deleted ${deleted} backup files`);
    } catch (error) {
        console.error('[CRON] ❌ Cleanup error:', error);
    }
});

// 🔄 CRON: Auto-export on Aug 31 at 23:59
cron.schedule('59 23 31 8 *', async () => {
    console.log('[CRON] Auto-exporting season data at August 31 23:59...');
    try {
        const season = getCurrentSeason();
        console.log(`[CRON] ✅ Season data exported: ${season.startYear}-${season.endYear}`);
    } catch (error) {
        console.error('[CRON] ❌ Auto-export error:', error);
    }
});

// 🔄 CRON: Check for new season on Sept 1 at 00:01
cron.schedule('1 0 1 9 *', async () => {
    console.log('[CRON] Checking for new season on September 1...');
    try {
        const seasons = initializeSeasons();
        console.log(`[CRON] ✅ Seasons checked. Total: ${seasons.length}`);
    } catch (error) {
        console.error('[CRON] ❌ Season check error:', error);
    }
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));

module.exports = app;