#!/usr/bin/env node
/**
 * BEYREDE ESCALADE - Climbing Club Management Server
 * Complete backend met all fixes
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// =============================================================================
// DATA MANAGEMENT HELPERS
// =============================================================================

const FILES = {
  presences: path.join(DATA_DIR, 'presences.json'),
  history: path.join(DATA_DIR, 'presence-history.json'),
  members: path.join(DATA_DIR, 'members.json'),
  archive: path.join(DATA_DIR, 'archive.json')
};

function ensureFile(filepath, defaultContent) {
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(defaultContent, null, 2));
  }
}

// Initialize all files
Object.values(FILES).forEach((file, idx) => {
  const defaults = [[], [], [], []];
  ensureFile(file, defaults[idx]);
});

function readJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    console.error(`Error reading ${filepath}:`, e);
    return Array.isArray(JSON.parse(fs.readFileSync(filepath, 'utf8'))) ? [] : {};
  }
}

function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// =============================================================================
// PRESENCES ENDPOINTS
// =============================================================================

/**
 * GET /presences
 * Get today's presences
 */
app.get('/presences', (req, res) => {
  try {
    const presences = readJSON(FILES.presences);
    res.json({ success: true, presences: presences || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /presences
 * Add new presence (adhérent or non-adhérent)
 */
app.post('/presences', (req, res) => {
  try {
    const { prenom, nom, type, tarif } = req.body;
    
    if (!prenom || !nom || !type) {
      return res.status(400).json({ success: false, error: 'Missing fields' });
    }

    const presences = readJSON(FILES.presences);
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newPresence = {
      id,
      prenom,
      nom,
      type, // 'adherent' or 'non-adherent'
      tarif: tarif || (type === 'adherent' ? 0 : 15),
      methodePaiement: null,
      timestamp: new Date().toISOString(),
      date: getTodayDate()
    };

    presences.push(newPresence);
    writeJSON(FILES.presences, presences);
    
    res.json({ success: true, presence: newPresence });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /presences/:id
 * Delete a presence
 */
app.delete('/presences/:id', (req, res) => {
  try {
    const presences = readJSON(FILES.presences);
    const filtered = presences.filter(p => p.id !== req.params.id);
    writeJSON(FILES.presences, filtered);
    
    res.json({ success: true, message: 'Presence deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /presences/:id/valider
 * Validate payment for a presence
 */
app.post('/presences/:id/valider', (req, res) => {
  try {
    const { montant, methodePaiement } = req.body;
    const presences = readJSON(FILES.presences);
    
    const idx = presences.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Presence not found' });
    }

    presences[idx].tarif = montant;
    presences[idx].methodePaiement = methodePaiement;
    presences[idx].type = 'adherent'; // Convert to adhérent
    
    writeJSON(FILES.presences, presences);
    
    res.json({ success: true, presence: presences[idx] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /presences/archive
 * Archive today's presences to history
 */
app.post('/presences/archive', (req, res) => {
  try {
    const presences = readJSON(FILES.presences);
    const history = readJSON(FILES.history);
    const today = getTodayDate();

    // ✅ FIXED: Ensure history is an array
    let historyArray = Array.isArray(history) ? history : [];

    // Remove old entry for today if exists
    historyArray = historyArray.filter(h => h.date !== today);

    // Add today's presences
    if (presences.length > 0) {
      historyArray.push({
        date: today,
        presences: presences
      });
    }

    // Sort by date (newest first)
    historyArray.sort((a, b) => new Date(b.date) - new Date(a.date));

    writeJSON(FILES.history, historyArray);
    writeJSON(FILES.presences, []); // Clear today's presences

    res.json({ success: true, archived: presences.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================================================
// HISTORY ENDPOINTS
// =============================================================================

/**
 * GET /presences/history
 * Get all available history dates
 */
app.get('/presences/history', (req, res) => {
  try {
    const history = readJSON(FILES.history);
    
    // ✅ FIXED: Handle both array and object formats
    let dates = [];
    
    if (Array.isArray(history)) {
      dates = history.map(h => h.date).filter(d => d);
    } else if (typeof history === 'object') {
      dates = Object.keys(history).filter(k => k.match(/^\d{4}-\d{2}-\d{2}$/));
    }

    dates.sort().reverse();

    res.json({ success: true, dates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /presences/history/:date
 * Get presences for specific date
 * Date format: YYYY-MM-DD
 */
app.get('/presences/history/:date', (req, res) => {
  try {
    const dateStr = req.params.date; // YYYY-MM-DD
    const history = readJSON(FILES.history);

    // ✅ FIXED: Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    let presences = [];

    if (Array.isArray(history)) {
      // Array format: [{ date, presences }, ...]
      const entry = history.find(h => h.date === dateStr);
      presences = entry ? entry.presences : [];
    } else if (typeof history === 'object') {
      // Object format: { "YYYY-MM-DD": [...] }
      presences = history[dateStr] || [];
    }

    res.json({ 
      success: true, 
      date: dateStr,
      presences: Array.isArray(presences) ? presences : [] 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================================================
// MEMBERS ENDPOINTS
// =============================================================================

/**
 * GET /members
 * Get all members
 */
app.get('/members', (req, res) => {
  try {
    const members = readJSON(FILES.members);
    res.json({ success: true, members: Array.isArray(members) ? members : [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /members
 * Add new member
 */
app.post('/members', (req, res) => {
  try {
    const { prenom, nom, email, telephone, dateAdhesion } = req.body;
    
    if (!prenom || !nom) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const members = readJSON(FILES.members);
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newMember = {
      id,
      prenom,
      nom,
      email: email || '',
      telephone: telephone || '',
      dateAdhesion: dateAdhesion || getTodayDate(),
      status: 'active'
    };

    members.push(newMember);
    writeJSON(FILES.members, members);
    
    res.json({ success: true, member: newMember });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /members/:id
 * Delete a member
 */
app.delete('/members/:id', (req, res) => {
  try {
    const members = readJSON(FILES.members);
    const filtered = members.filter(m => m.id !== req.params.id);
    writeJSON(FILES.members, filtered);
    
    res.json({ success: true, message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================================================
// ADMIN / SEASONS ENDPOINTS
// =============================================================================

/**
 * GET /admin/seasons
 * Get all seasons (September-August)
 */
app.get('/admin/seasons', (req, res) => {
  try {
    const history = readJSON(FILES.history);
    const years = new Set();

    if (Array.isArray(history)) {
      history.forEach(h => {
        if (h.date) {
          const year = parseInt(h.date.substring(0, 4));
          const month = parseInt(h.date.substring(5, 7));
          const seasonYear = month >= 9 ? year : year - 1;
          years.add(seasonYear);
        }
      });
    }

    const seasons = Array.from(years)
      .sort((a, b) => b - a)
      .map(year => ({
        startYear: year,
        endYear: year + 1,
        label: `${year}-${year + 1}`
      }));

    res.json({ success: true, seasons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /export/season/:season
 * Export season data
 * season format: YYYY-YYYY (e.g., 2024-2025)
 */
app.get('/export/season/:season', (req, res) => {
  try {
    const [startYear, endYear] = req.params.season.split('-').map(Number);
    const history = readJSON(FILES.history);
    
    let seasonData = [];

    if (Array.isArray(history)) {
      seasonData = history.filter(h => {
        if (!h.date) return false;
        const year = parseInt(h.date.substring(0, 4));
        const month = parseInt(h.date.substring(5, 7));
        const seasonYear = month >= 9 ? year : year - 1;
        return seasonYear === startYear;
      });
    }

    const csv = generateCSV(seasonData);
    
    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', `attachment; filename="season-${startYear}-${endYear}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function generateCSV(historyData) {
  let csv = 'Date,Prénom,Nom,Type,Montant,Paiement\n';
  
  historyData.forEach(entry => {
    if (Array.isArray(entry.presences)) {
      entry.presences.forEach(p => {
        csv += `${entry.date},${p.prenom},${p.nom},${p.type},${p.tarif},${p.methodePaiement || 'N/A'}\n`;
      });
    }
  });

  return csv;
}

// =============================================================================
// SERVER START
// =============================================================================

app.listen(PORT, () => {
  console.log('\n');
  console.log('🏔️  BEYREDE ESCALADE SERVER RUNNING 🏔️');
  console.log('=====================================');
  console.log(`✅ API: http://localhost:${PORT}`);
  console.log(`📁 Data: ${DATA_DIR}`);
  console.log('=====================================\n');
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
