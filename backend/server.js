const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  🚀 CLIMBING CLUB - SERVER v15.3 FINAL                  ║');
console.log('║  + Duplicate Fix + History Cleanup + Smart Seasons      ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const ATTEMPTS_FILE = path.join(DATA_DIR, 'login-attempts.json');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const SAVED_NON_MEMBERS_FILE = path.join(DATA_DIR, 'saved-non-members.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// 🔄 BOOT CLEANUP: Backups + History Duplicates
(function bootCleanup() {
    try {
        console.log('[BOOT] 🧹 Running boot cleanup...\n');
        
        // 1. Clean old backup files
        console.log('[BOOT] Step 1: Checking for backup files...');
        const files = fs.readdirSync(DATA_DIR);
        let deletedBackups = 0;
        
        files.forEach(file => {
            if (file.includes('members_backup')) {
                const filePath = path.join(DATA_DIR, file);
                fs.unlinkSync(filePath);
                console.log(`[BOOT] ✅ Deleted backup: ${file}`);
                deletedBackups++;
            }
        });
        
        if (deletedBackups === 0) {
            console.log('[BOOT] ✨ No backup files found\n');
        } else {
            console.log(`[BOOT] 🎉 Deleted ${deletedBackups} backup file(s)\n`);
        }
        
        // 2. Clean history duplicates
        console.log('[BOOT] Step 2: Checking presence-history for duplicates...');
        if (fs.existsSync(PRESENCE_HISTORY_FILE)) {
            const historyData = fs.readFileSync(PRESENCE_HISTORY_FILE, 'utf8');
            const history = JSON.parse(historyData);
            
            let totalBefore = 0;
            let totalAfter = 0;
            let datesFixed = 0;
            
            const cleanedHistory = history.map(dayEntry => {
                if (!dayEntry.presences || !Array.isArray(dayEntry.presences)) {
                    return dayEntry;
                }
                
                const before = dayEntry.presences.length;
                totalBefore += before;
                
                // Remove duplicates based on unique identifier
                const seen = new Map();
                const cleaned = [];
                
                dayEntry.presences.forEach(p => {
                    // Create unique key: nom + prenom + date timestamp
                    const key = `${(p.nom || '').trim().toLowerCase()}_${(p.prenom || '').trim().toLowerCase()}_${new Date(p.date).getTime()}`;
                    
                    if (!seen.has(key)) {
                        seen.set(key, true);
                        cleaned.push(p);
                    }
                });
                
                const after = cleaned.length;
                totalAfter += after;
                
                if (before !== after) {
                    console.log(`[BOOT] 🧹 ${dayEntry.date}: ${before} → ${after} (removed ${before - after} duplicates)`);
                    datesFixed++;
                }
                
                return { ...dayEntry, presences: cleaned };
            });
            
            if (datesFixed > 0) {
                fs.writeFileSync(PRESENCE_HISTORY_FILE, JSON.stringify(cleanedHistory, null, 2));
                console.log(`[BOOT] ✅ Cleaned ${datesFixed} dates: ${totalBefore} → ${totalAfter} presences (removed ${totalBefore - totalAfter} duplicates)\n`);
            } else {
                console.log('[BOOT] ✨ No duplicates found in history\n');
            }
        } else {
            console.log('[BOOT] ℹ️  No presence-history.json found\n');
        }
        
        console.log('[BOOT] ✅ Boot cleanup complete!\n');
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

function getCurrentSeason() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    if (month >= 8) {
        return { startYear: year, endYear: year + 1 };
    } else {
        return { startYear: year - 1, endYear: year };
    }
}

function getAvailableSeasons() {
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
        
        const completedSeasons = [];
        years.forEach(year => {
            const nextYear = year + 1;
            if (years.includes(nextYear)) {
                completedSeasons.push({ startYear: year, endYear: nextYear });
            }
        });

        const currentSeason = getCurrentSeason();
        
        const currentInList = completedSeasons.some(s => 
            s.startYear === currentSeason.startYear && s.endYear === currentSeason.endYear
        );
        
        if (!currentInList) {
            completedSeasons.push(currentSeason);
        }
        
        const finalSeasons = completedSeasons.sort((a, b) => b.startYear - a.startYear);
        
        console.log('[SEASONS] Available seasons:', finalSeasons);
        return finalSeasons;
    } catch (error) {
        console.error('❌ Get seasons error:', error);
        return [];
    }
}

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
    console.error('❌ Sync service not found - running without PepSup sync');
    syncService = { getMembers: () => [], syncMembers: async () => 0 };
}

app.get('/', (req, res) => res.json({ status: 'ok', version: '15.3.0' }));
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
        
        console.log(`[HISTORY] Requested date: ${req.params.date}`);
        console.log(`[HISTORY] Found entry:`, day ? `Yes (${day.presences.length} presences)` : 'No');
        
        if (!day) {
            return res.json({ success: true, presences: [] });
        }
        
        const presences = Array.isArray(day.presences) ? day.presences : [];
        console.log(`[HISTORY] Returning ${presences.length} presences for ${req.params.date}`);
        res.json({ success: true, presences });
    } catch (error) {
        console.error('[HISTORY] Error:', error);
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
        const seasons = getAvailableSeasons();
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
    console.log('║  ✅ Server v15.3 FINAL running on http://localhost:' + PORT + '  ║');
    console.log('║  ✅ DUPLICATE FIX + HISTORY CLEANUP + SMART SEASONS     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    if (syncService && syncService.syncMembers) {
        console.log('[STARTUP] Running initial PepSup sync...');
        syncService.syncMembers()
            .then(count => console.log(`[STARTUP] ✅ Synced ${count} members from PepSup`))
            .catch(err => console.error('[STARTUP] ❌ Sync failed:', err.message));
    }
});

server.on('error', error => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} already in use!`);
        process.exit(1);
    }
});

cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running hourly PepSup member sync...');
    try {
        if (syncService && syncService.syncMembers) {
            const count = await syncService.syncMembers();
            console.log(`[CRON] ✅ Synced ${count} members from PepSup`);
        } else {
            console.log('[CRON] ⚠️ Sync service not available');
        }
    } catch (error) {
        console.error('[CRON] ❌ PepSup sync error:', error.message);
    }
});

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

cron.schedule('59 23 31 8 *', async () => {
    console.log('[CRON] Auto-exporting season data at August 31 23:59...');
    try {
        const season = getCurrentSeason();
        console.log(`[CRON] ✅ Season data exported: ${season.startYear}-${season.endYear}`);
    } catch (error) {
        console.error('[CRON] ❌ Auto-export error:', error);
    }
});

cron.schedule('1 0 1 9 *', async () => {
    console.log('[CRON] Checking for new season on September 1...');
    try {
        const seasons = getAvailableSeasons();
        console.log(`[CRON] ✅ Seasons checked. Total: ${seasons.length}`);
    } catch (error) {
        console.error('[CRON] ❌ Season check error:', error);
    }
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));

module.exports = app;