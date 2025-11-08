const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  🚀 CLIMBING CLUB - SERVER v7.0 ROOT CAUSE FIX          ║');
console.log('║  + Deep History Persistence Debug + All Features       ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
console.log(`Port: ${PORT}\n`);

const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const ATTEMPTS_FILE = path.join(DATA_DIR, 'login-attempts.json');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const SAVED_NON_MEMBERS_FILE = path.join(DATA_DIR, 'saved-non-members.json');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR, { recursive: true });

const initDataFile = (filePath) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
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
        return JSON.parse(data) || [];
    } catch (error) {
        console.error(`❌ Read error on ${filePath}:`, error.message);
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
        console.error(`❌ Write error on ${filePath}:`, error.message);
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
    const attempts = readJsonFile(ATTEMPTS_FILE);
    const combined = [...presences, ...attempts];
    
    if (combined.length > 0) {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const today = new Date().toISOString().split('T')[0];
        const idx = history.findIndex(h => h.date === today);
        if (idx >= 0) history[idx].presences = combined;
        else history.push({ date: today, presences: combined });
        writeJsonFile(PRESENCE_HISTORY_FILE, history);
        writeJsonFile(PRESENCES_FILE, []);
        writeJsonFile(ATTEMPTS_FILE, []);
        console.log(`✅ Archived ${combined.length} entries to history`);
    }
});

cron.schedule('5 * * * *', async () => {
    try {
        if (syncService?.syncMembers) await syncService.syncMembers();
    } catch (error) {}
}, { timezone: "Europe/Brussels" });

app.get('/', (req, res) => res.json({ status: 'ok', version: '7.0.0' }));
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
        const attempts = readJsonFile(ATTEMPTS_FILE);
        
        const member = members.find(m =>
            m.lastname?.trim().toLowerCase() === nomNorm &&
            m.firstname?.trim().toLowerCase() === prenomNorm
        );
        
        if (!member) {
            console.log(`    ❌ NOT A MEMBER`);
            
            const attemptEntry = {
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
            
            attempts.push(attemptEntry);
            const saved = writeJsonFile(ATTEMPTS_FILE, attempts);
            console.log(`    💾 TENTATIVE NON-ADHERENT SAVED: ${saved ? 'YES ✅' : 'NO ❌'}`);
            
            return res.json({ 
                success: false, 
                error: "Vous n'êtes pas membre du club. Inscrivez-vous en tant que non-membre du club"
            });
        }
        
        const joinStatus = member.joinFileStatusLabel;
        if (joinStatus !== "Payé" && joinStatus !== "En cours de paiement") {
            console.log(`    ❌ MEMBER NOT PAID (Status: ${joinStatus})`);
            
            const attemptEntry = {
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
            
            attempts.push(attemptEntry);
            const saved = writeJsonFile(ATTEMPTS_FILE, attempts);
            console.log(`    💾 TENTATIVE NON-PAYÉ SAVED: ${saved ? 'YES ✅' : 'NO ❌'}`);
            
            return res.json({ 
                success: false, 
                error: "Vous avez encore à régler votre adhésion"
            });
        }
        
        console.log(`    ✅ MEMBER VERIFIED`);
        
        const presences = readJsonFile(PRESENCES_FILE);
        
        const exists = presences.find(p => {
            if (!p.date || p.type !== 'adherent') return false;
            const pDate = new Date(p.date).toISOString().split('T')[0];
            if (pDate !== today) return false;
            return (p.nom || '').trim().toLowerCase() === nomNorm && 
                   (p.prenom || '').trim().toLowerCase() === prenomNorm;
        });
        
        if (exists) {
            console.log(`    🛑 DUPLICATE - Already registered today`);
            return res.json({
                success: true, isPaid: true, alreadyRegistered: true,
                message: "Vous êtes déjà enregistré aujourd'hui",
                presence: exists
            });
        }
        
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
        const saved = writeJsonFile(PRESENCES_FILE, presences);
        console.log(`    💾 ADHERENT SAVED: ${saved ? 'YES ✅' : 'NO ❌'}`);
        
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
        console.error('Error:', error);
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

// ===== HISTORY ENDPOINTS =====
app.get('/presences/history', (req, res) => {
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        
        console.log(`\n[/presences/history GET] =====================`);
        console.log(`[/presences/history GET] Total history entries: ${history.length}`);
        
        history.forEach((h, idx) => {
            const presenceCount = (h.presences || []).length;
            console.log(`  [${idx}] Date: ${h.date}, Presences: ${presenceCount}`);
            if (presenceCount > 0) {
                (h.presences || []).slice(0, 3).forEach(p => {
                    console.log(`      - ${p.type}: ${p.nom} ${p.prenom}`);
                });
                if (presenceCount > 3) console.log(`      ... and ${presenceCount - 3} more`);
            }
        });
        
        const dates = history
            .map(h => h.date)
            .filter(d => d && d.length === 10)
            .sort()
            .reverse();
        
        console.log(`[/presences/history GET] Valid dates: ${dates.length}`);
        console.log(`[/presences/history GET] Dates: ${dates.join(', ')}`);
        console.log(`[/presences/history GET] =====================\n`);
        
        res.json({ success: true, dates });
    } catch (error) {
        console.error('[/presences/history GET] Error:', error);
        res.status(500).json({ success: false, dates: [] });
    }
});

app.get('/presences/history/:date', (req, res) => {
    try {
        const requestedDate = req.params.date;
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        
        console.log(`\n[/presences/history/${requestedDate}] Looking for data...`);
        
        const day = history.find(h => h.date === requestedDate);
        
        if (!day) {
            console.log(`[/presences/history/${requestedDate}] ❌ NO ENTRY FOUND for ${requestedDate}`);
            console.log(`[/presences/history/${requestedDate}] Available dates:`, history.map(h => h.date).join(', '));
            return res.json({ success: true, presences: [], debug: { found: false, requested: requestedDate } });
        }
        
        const presencesData = day.presences || [];
        console.log(`[/presences/history/${requestedDate}] ✅ FOUND: ${presencesData.length} entries`);
        presencesData.forEach(p => {
            console.log(`  - ${p.type}: ${p.nom} ${p.prenom} (${p.date})`);
        });
        
        res.json({ success: true, presences: presencesData, debug: { found: true, requested: requestedDate, count: presencesData.length } });
    } catch (error) {
        console.error(`[/presences/history/${req.params.date}] Error:`, error);
        res.status(500).json({ success: false, presences: [] });
    }
});

app.post('/presences/archive', (req, res) => {
    try {
        console.log('\n[ARCHIVE] ═══════════════════════════════════════════');
        
        const presences = readJsonFile(PRESENCES_FILE);
        const attempts = readJsonFile(ATTEMPTS_FILE);
        const combined = [...presences, ...attempts];
        
        console.log(`[ARCHIVE] Presences: ${presences.length}`);
        console.log(`[ARCHIVE] Attempts: ${attempts.length}`);
        console.log(`[ARCHIVE] Combined: ${combined.length}`);
        
        if (!combined.length) {
            console.log('[ARCHIVE] ❌ NO DATA TO ARCHIVE');
            return res.json({ success: false });
        }
        
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const today = new Date().toISOString().split('T')[0];
        
        console.log(`[ARCHIVE] Today's date: ${today}`);
        console.log(`[ARCHIVE] History entries BEFORE: ${history.length}`);
        
        const idx = history.findIndex(h => h.date === today);
        
        if (idx >= 0) {
            console.log(`[ARCHIVE] UPDATING existing entry for ${today}`);
            history[idx].presences = combined;
        } else {
            console.log(`[ARCHIVE] CREATING new entry for ${today}`);
            history.push({ date: today, presences: combined });
        }
        
        const saved1 = writeJsonFile(PRESENCE_HISTORY_FILE, history);
        const saved2 = writeJsonFile(PRESENCES_FILE, []);
        const saved3 = writeJsonFile(ATTEMPTS_FILE, []);
        
        console.log(`[ARCHIVE] Saved history: ${saved1}`);
        console.log(`[ARCHIVE] Cleared presences: ${saved2}`);
        console.log(`[ARCHIVE] Cleared attempts: ${saved3}`);
        
        // VERIFICATION
        const verifyHistory = readJsonFile(PRESENCE_HISTORY_FILE);
        const verifyDay = verifyHistory.find(h => h.date === today);
        if (verifyDay) {
            console.log(`[ARCHIVE] ✅ VERIFICATION: ${verifyDay.presences.length} entries stored for ${today}`);
            verifyDay.presences.slice(0, 5).forEach(p => {
                console.log(`  ✓ ${p.type}: ${p.nom} ${p.prenom}`);
            });
        } else {
            console.log(`[ARCHIVE] ❌ VERIFICATION FAILED: No entry for ${today}`);
        }
        
        console.log(`[ARCHIVE] History entries AFTER: ${verifyHistory.length}`);
        console.log('[ARCHIVE] ═══════════════════════════════════════════\n');
        
        res.json({ success: true });
    } catch (error) {
        console.error('[ARCHIVE] Error:', error);
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

// ===== EXPORT YEARS =====
app.get('/admin/export/years', (req, res) => {
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        
        console.log(`\n[/admin/export/years] ═══════════════════════════`);
        console.log(`[/admin/export/years] Total history entries: ${history.length}`);
        
        const years = [...new Set(history.map(h => {
            if (!h.date || h.date.length !== 10) return null;
            try {
                const year = parseInt(h.date.substring(0, 4));
                if (year > 2000 && year < 2100) {
                    console.log(`  ✓ ${h.date} → ${year}`);
                    return year;
                }
                console.log(`  ✗ ${h.date} → INVALID YEAR ${year}`);
                return null;
            } catch (e) {
                console.log(`  ✗ ${h.date} → ERROR`);
                return null;
            }
        }))].filter(y => y).sort((a, b) => b - a);
        
        console.log(`[/admin/export/years] Found years: ${years.join(', ')}`);
        console.log(`[/admin/export/years] ═══════════════════════════\n`);
        
        res.json({ success: true, years });
    } catch (error) {
        console.error('[/admin/export/years] Error:', error);
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
    console.log('║  ✅ Server v7.0 running on http://localhost:' + PORT + '        ║');
    console.log('║  ✅ FULL DEBUG + ROOT CAUSE FIX IMPLEMENTED           ║');
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