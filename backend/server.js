const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const ATTEMPTS_FILE = path.join(DATA_DIR, 'login-attempts.json');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const SAVED_NON_MEMBERS_FILE = path.join(DATA_DIR, 'saved-non-members.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const readJsonFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    return false;
  }
};

// Initialize files if they don't exist
[PRESENCES_FILE, ATTEMPTS_FILE, PRESENCE_HISTORY_FILE, SAVED_NON_MEMBERS_FILE].forEach(f => {
  if (!fs.existsSync(f)) {
    fs.writeFileSync(f, '[]');
  }
});

app.use(cors({ origin: '*', credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', version: '15.3' });
});

// Admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// GET all presences for today
app.get('/presences', (req, res) => {
  try {
    const presences = readJsonFile(PRESENCES_FILE);
    const attempts = readJsonFile(ATTEMPTS_FILE);
    const today = new Date().toISOString().split('T')[0];
    const todayOnly = [...presences, ...attempts].filter(p => {
      if (!p.date) return false;
      return new Date(p.date).toISOString().split('T')[0] === today;
    });
    res.json({ success: true, presences: todayOnly });
  } catch (error) {
    res.status(500).json({ success: false, presences: [] });
  }
});

// POST new presence
app.post('/presences', (req, res) => {
  try {
    const { type, nom, prenom, tarif = 0, ...rest } = req.body;
    if (!type || !nom || !prenom) {
      return res.status(400).json({ success: false });
    }
    const presences = readJsonFile(PRESENCES_FILE);
    const newP = {
      id: `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
      type,
      nom: nom.trim(),
      prenom: prenom.trim(),
      date: new Date().toISOString(),
      tarif,
      ...rest
    };
    presences.push(newP);
    writeJsonFile(PRESENCES_FILE, presences);
    res.json({ success: true, presence: newP });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// GET presence by ID
app.get('/presences/:id', (req, res) => {
  try {
    const presences = readJsonFile(PRESENCES_FILE);
    const presence = presences.find(p => p.id === req.params.id);
    res.json({ success: !!presence, presence });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// POST validate payment
app.post('/presences/:id/valider', (req, res) => {
  try {
    const presences = readJsonFile(PRESENCES_FILE);
    const idx = presences.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false });
    }
    presences[idx].status = 'Payé';
    if (req.body.montant) presences[idx].tarif = req.body.montant;
    if (req.body.methodePaiement) presences[idx].methodePaiement = req.body.methodePaiement;
    writeJsonFile(PRESENCES_FILE, presences);
    res.json({ success: true, presence: presences[idx] });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// DELETE presence
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

// GET history dates list
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

// GET presences for a specific date (THIS IS THE FIX!)
app.get('/presences/history/:date', (req, res) => {
  try {
    const requestedDate = req.params.date;
    const history = readJsonFile(PRESENCE_HISTORY_FILE);
    
    // Find the entry for this specific date
    const dayEntry = history.find(h => h.date === requestedDate);
    
    if (!dayEntry) {
      return res.json({ success: true, presences: [] });
    }
    
    const presences = Array.isArray(dayEntry.presences) ? dayEntry.presences : [];
    res.json({ success: true, presences });
  } catch (error) {
    res.status(500).json({ success: false, presences: [] });
  }
});

// POST archive presences
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

// GET admin seasons
app.get('/admin/seasons', (req, res) => {
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
    const seasons = [];
    
    years.forEach(y => {
      if (years.includes(y + 1)) {
        seasons.push({ startYear: y, endYear: y + 1 });
      }
    });
    
    const now = new Date();
    const mon = now.getMonth();
    const curr = {
      startYear: mon >= 8 ? now.getFullYear() : now.getFullYear() - 1,
      endYear: mon >= 8 ? now.getFullYear() + 1 : now.getFullYear()
    };
    
    if (!seasons.some(s => s.startYear === curr.startYear && s.endYear === curr.endYear)) {
      seasons.push(curr);
    }
    
    res.json({ success: true, seasons: seasons.sort((a, b) => b.startYear - a.startYear) });
  } catch (error) {
    res.status(500).json({ success: false, seasons: [] });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin\n`);
});
