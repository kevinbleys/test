const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

// Services
let exportService;
let cleanupService;

// Probeer services te laden
try {
    exportService = require('./export-service');
    console.log('✅ Export service loaded');
} catch (error) {
    console.warn('⚠️ Export service not found, using fallback');
    exportService = null;
}

try {
    cleanupService = require('./cleanup-service');
    console.log('✅ Cleanup service loaded');
} catch (error) {
    console.warn('⚠️ Cleanup service not found, using fallback');
    cleanupService = null;
}

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Backend Logiciel Escalade - Démarrage avec Admin Interface');
console.log('Port:', PORT);

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const NON_MEMBERS_FILE = path.join(DATA_DIR, 'non-members.json');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');

// Ensure data directories exist
const setupDataDirectories = () => {
    const dirs = [DATA_DIR, EXPORTS_DIR];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
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
            // Validate existing file
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                JSON.parse(content);
                console.log(`✅ ${path.basename(filePath)} is valid`);
            } catch (jsonError) {
                console.warn(`⚠️ ${path.basename(filePath)} invalid, recreating...`);
                fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
            }
        }
    } catch (error) {
        console.error(`❌ Failed to initialize ${path.basename(filePath)}:`, error);
    }
};

initDataFile(PRESENCES_FILE);
initDataFile(NON_MEMBERS_FILE);
initDataFile(PRESENCE_HISTORY_FILE);

// File operations
const readJsonFile = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error(`Error reading ${path.basename(filePath)}:`, error);
        return [];
    }
};

const writeJsonFile = (filePath, data) => {
    try {
        if (!Array.isArray(data)) {
            console.error(`Attempted to write non-array data to ${path.basename(filePath)}`);
            return false;
        }

        // Create backup
        if (fs.existsSync(filePath)) {
            const backupPath = filePath + '.backup';
            fs.copyFileSync(filePath, backupPath);
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${path.basename(filePath)}:`, error);
        return false;
    }
};

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for admin interface
app.use(express.static(path.join(__dirname, 'public')));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Sync service loading
let syncService = null;
try {
    const syncServicePath = path.join(__dirname, 'sync-service');
    if (fs.existsSync(syncServicePath + '.js')) {
        syncService = require('./sync-service');
        console.log('✅ Sync service loaded');
    }
} catch (error) {
    console.warn('⚠️ Sync service loading failed:', error.message);
}

if (!syncService) {
    syncService = {
        getMembers: () => {
            console.log('⚠️ Using fallback sync service');
            return [];
        }
    };
}

// ===== CRON JOBS FOR DAILY RESET AND CLEANUP =====

// Daily reset at midnight
cron.schedule('0 0 * * *', () => {
    try {
        console.log('=== DAGELIJKSE RESET GESTART ===');
        const currentPresences = readJsonFile(PRESENCES_FILE);

        if (currentPresences.length > 0) {
            const history = readJsonFile(PRESENCE_HISTORY_FILE);
            const today = new Date().toISOString().split('T')[0];

            history.push({
                date: today,
                presences: currentPresences
            });

            writeJsonFile(PRESENCE_HISTORY_FILE, history);
            console.log(`${currentPresences.length} presences gearchiveerd voor ${today}`);

            writeJsonFile(PRESENCES_FILE, []);
            console.log('Huidige presences gereset voor nieuwe dag');
        } else {
            console.log('Geen presences om te archiveren');
        }

        console.log('=== DAGELIJKSE RESET VOLTOOID ===');
    } catch (error) {
        console.error('Fout bij dagelijkse reset:', error);
    }
});

// Automatic season export on June 30th at midnight
cron.schedule('0 0 30 6 *', () => {
    if (exportService) {
        try {
            console.log('=== AUTOMATISCHE SEIZOEN EXPORT GESTART (30 JUNI) ===');
            const result = exportService.exportSeasonToExcel();
            console.log(`Seizoen ${result.seasonName} automatisch geëxporteerd: ${result.filename}`);
            console.log(`${result.recordCount} records geëxporteerd`);
            console.log('=== AUTOMATISCHE SEIZOEN EXPORT VOLTOOID ===');
        } catch (error) {
            console.error('Fout bij automatische seizoen export:', error);
        }
    }
});

// Cleanup jobs
if (cleanupService) {
    cron.schedule('0 2 * * *', () => {
        console.log('=== AUTOMATISCHE CLEANUP GESTART (02:00) ===');
        cleanupService.performCleanup();
        console.log('=== AUTOMATISCHE CLEANUP VOLTOOID ===');
    });
}

// ===== BASIC API ROUTES =====

app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'API Logiciel Escalade opérationnelle',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            admin: '/admin',
            members: '/members/check',
            presences: '/presences'
        }
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// ===== ADMIN INTERFACE ROUTE =====

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ===== MEMBERS ROUTES =====

app.get('/members/check', (req, res) => {
    const { nom, prenom } = req.query;
    if (!nom || !prenom) {
        return res.status(400).json({
            success: false,
            error: "Paramètres 'nom' et 'prenom' requis"
        });
    }

    console.log('=== MEMBER CHECK ===');
    console.log('Nom:', nom, 'Prenom:', prenom);

    try {
        const members = syncService.getMembers();
        const member = members.find(m =>
            m.lastname?.trim().toLowerCase() === nom.trim().toLowerCase() &&
            m.firstname?.trim().toLowerCase() === prenom.trim().toLowerCase()
        );

        if (!member) {
            return res.json({
                success: false,
                error: "Aucun membre trouvé avec ce nom et prénom"
            });
        }

        const isAdherent = Array.isArray(member.categories) &&
            member.categories.some(c =>
                typeof c.label === 'string' &&
                c.label.toLowerCase().includes('adhérent')
            );

        if (isAdherent) {
            return res.json({
                success: true,
                isPaid: true,
                message: "Adhésion reconnue. Bienvenue !",
                membre: member
            });
        } else {
            return res.json({
                success: false,
                error: "Vous n'êtes pas enregistré comme adhérent. Merci de vous inscrire comme visiteur."
            });
        }
    } catch (error) {
        console.error('Error in member check:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur lors de la vérification du membre'
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

// ===== PRESENCES ROUTES =====

// Get specific presence by ID (needed for PaymentPage)
app.get('/presences/:id', (req, res) => {
    try {
        const { id } = req.params;
        const presences = readJsonFile(PRESENCES_FILE);
        const presence = presences.find(p => p.id === id);
        
        if (!presence) {
            return res.status(404).json({ success: false, error: 'Présence non trouvée' });
        }
        
        res.json({ success: true, presence });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});


app.post('/presences', (req, res) => {
    console.log('=== NEW PRESENCE REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { type, nom, prenom, ...otherData } = req.body;

    if (!type || !nom || !prenom) {
        return res.status(400).json({
            success: false,
            error: 'Champs requis: type, nom, prenom'
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

        // Special handling for adherents
        if (type === 'adherent') {
            newPresence.status = 'adherent';
            delete newPresence.tarif;

            if (req.body.niveau !== undefined) {
                newPresence.niveau = req.body.niveau.toString();
            }
        } else if (type === 'non-adherent') {
            newPresence.status = req.body.status || 'pending';
            newPresence.tarif = req.body.tarif || 10;
            newPresence.methodePaiement = req.body.methodePaiement || 'Especes';

            // Extra fields for non-members
            if (req.body.email) newPresence.email = req.body.email;
            if (req.body.telephone) newPresence.telephone = req.body.telephone;
            if (req.body.dateNaissance) newPresence.dateNaissance = req.body.dateNaissance;
            if (req.body.niveau !== undefined) newPresence.niveau = req.body.niveau.toString();
            if (req.body.assuranceAccepted !== undefined) newPresence.assuranceAccepted = req.body.assuranceAccepted;
        }

        presences.push(newPresence);

        if (writeJsonFile(PRESENCES_FILE, presences)) {
            res.json({
                success: true,
                message: 'Présence enregistrée avec succès',
                presence: newPresence
            });
        } else {
            throw new Error('Failed to write presence file');
        }
    } catch (error) {
        console.error('Error saving presence:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'enregistrement de la présence'
        });
    }
});

// Presence history routes for calendar functionality
app.get('/presences/history', (req, res) => {
    try {
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const dates = history.map(h => h.date).sort().reverse();
        res.json({ success: true, dates });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.get('/presences/history/:date', (req, res) => {
    try {
        const { date } = req.params;
        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const dayHistory = history.find(h => h.date === date);

        if (!dayHistory) {
            return res.json({ success: true, presences: [] });
        }

        res.json({ success: true, presences: dayHistory.presences });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Presence management routes for admin
app.post('/presences/:id/valider', (req, res) => {
    try {
        const { id } = req.params;
        const { montant, methodePaiement } = req.body;

        const presences = readJsonFile(PRESENCES_FILE);
        const index = presences.findIndex(p => p.id === id);

        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Présence non trouvée' });
        }

        presences[index].status = 'Payé';
        if (montant !== undefined && montant !== null) {
            presences[index].tarif = montant;
        }
        if (methodePaiement) {
            presences[index].methodePaiement = methodePaiement;
        }
        presences[index].dateValidation = new Date().toISOString();

        if (writeJsonFile(PRESENCES_FILE, presences)) {
            res.json({ success: true, presence: presences[index] });
        } else {
            throw new Error('Failed to write presence file');
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.delete('/presences/:id', (req, res) => {
    try {
        const { id } = req.params;
        const presences = readJsonFile(PRESENCES_FILE);
        const filteredPresences = presences.filter(p => p.id !== id);

        if (filteredPresences.length === presences.length) {
            return res.status(404).json({ success: false, error: 'Présence non trouvée' });
        }

        if (writeJsonFile(PRESENCES_FILE, filteredPresences)) {
            res.json({ success: true, message: 'Présence supprimée avec succès' });
        } else {
            throw new Error('Failed to write presence file');
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Manual archive route
app.post('/presences/archive', (req, res) => {
    try {
        const currentPresences = readJsonFile(PRESENCES_FILE);

        if (currentPresences.length === 0) {
            return res.json({ success: false, message: 'Geen presences om te archiveren' });
        }

        const history = readJsonFile(PRESENCE_HISTORY_FILE);
        const today = new Date().toISOString().split('T')[0];

        history.push({
            date: today,
            presences: currentPresences
        });

        writeJsonFile(PRESENCE_HISTORY_FILE, history);
        writeJsonFile(PRESENCES_FILE, []);

        res.json({ 
            success: true, 
            message: `${currentPresences.length} presences gearchiveerd voor ${today}` 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// ===== ADMIN EXPORT ROUTES =====

// Season export
app.post('/admin/export/season', (req, res) => {
    if (!exportService) {
        return res.status(500).json({
            success: false,
            error: 'Export service niet beschikbaar'
        });
    }

    try {
        const result = exportService.exportSeasonToExcel();
        res.json({
            success: true,
            message: `Excel export voor seizoen ${result.seasonName} bijgewerkt`,
            filename: result.filename,
            recordCount: result.recordCount,
            seasonName: result.seasonName
        });
    } catch (error) {
        console.error('Season export error:', error);
        res.status(500).json({
            success: false,
            error: 'Fout bij seizoen export: ' + error.message
        });
    }
});

// Get available years for export
app.get('/admin/export/years', (req, res) => {
    if (!exportService) {
        return res.json({ success: true, years: [] });
    }

    try {
        const years = exportService.getAvailableYears();
        res.json({ success: true, years });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Fout bij ophalen jaren: ' + error.message
        });
    }
});

// Export specific year
app.post('/admin/export/:year', (req, res) => {
    if (!exportService) {
        return res.status(500).json({
            success: false,
            error: 'Export service niet beschikbaar'
        });
    }

    try {
        const { year } = req.params;
        const yearInt = parseInt(year);

        if (!yearInt || yearInt < 2020 || yearInt > 2030) {
            return res.status(400).json({
                success: false,
                error: 'Ongeldig jaar (moet tussen 2020 en 2030 zijn)'
            });
        }

        const result = exportService.exportYearToExcel(yearInt);
        res.json({
            success: true,
            message: `Excel export voor ${year} succesvol aangemaakt`,
            filename: result.filename,
            recordCount: result.recordCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Fout bij Excel export: ' + error.message
        });
    }
});

// Statistics route
app.get('/admin/statistics', (req, res) => {
    if (!exportService) {
        return res.json({
            success: true,
            statistics: {
                seasonName: 'Onbekend',
                totalVisits: 0,
                adherents: { total: 0 },
                nonAdherents: { total: 0, totalPaid: 0 }
            },
            currentSeason: 'Onbekend'
        });
    }

    try {
        const stats = exportService.generateSeasonStatistics();
        const currentSeason = exportService.getCurrentSeason();

        res.json({
            success: true,
            statistics: stats,
            currentSeason: currentSeason
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Fout bij ophalen statistieken: ' + error.message
        });
    }
});

// Download route
app.get('/admin/download/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const filepath = path.join(EXPORTS_DIR, filename);

        if (!fs.existsSync(filepath)) {
            return res.status(404).json({
                success: false,
                error: 'Bestand niet gevonden'
            });
        }

        res.download(filepath, filename);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Fout bij download: ' + error.message
        });
    }
});

// ===== STATS ROUTES =====

app.get('/api/stats/today', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const today = new Date().toISOString().split('T')[0];

        const todayPresences = presences.filter(p => 
            p.date && p.date.startsWith(today)
        );

        const adherents = todayPresences.filter(p => p.type === 'adherent').length;
        const nonAdherents = todayPresences.filter(p => p.type === 'non-adherent').length;
        const totalRevenue = todayPresences
            .filter(p => p.tarif && typeof p.tarif === 'number')
            .reduce((sum, p) => sum + p.tarif, 0);

        res.json({
            success: true,
            stats: {
                date: today,
                total: todayPresences.length,
                adherents,
                nonAdherents,
                revenue: totalRevenue,
                presences: todayPresences
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erreur lors du calcul des statistiques'
        });
    }
});

// ===== 404 HANDLER =====

app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint non trouvé',
        path: req.originalUrl,
        available_endpoints: [
            '/',
            '/admin',
            '/api/health',
            '/members/check',
            '/presences',
            '/api/stats/today'
        ]
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Erreur interne du serveur',
        message: 'Une erreur s\'est produite lors du traitement de la requête'
    });
});

// ===== SERVER STARTUP =====

const server = app.listen(PORT, 'localhost', () => {
    console.log('🎉 ======================================');
    console.log('🎉 SERVER WITH ADMIN INTERFACE STARTED!');
    console.log('🎉 ======================================');
    console.log(`✅ Backend running on: http://localhost:${PORT}`);
    console.log(`📊 Admin Interface: http://localhost:${PORT}/admin`);
    console.log(`📈 Health check: http://localhost:${PORT}/api/health`);
    console.log('🕛 Daily reset scheduled for midnight');
    console.log('📅 Season export scheduled for June 30th');
    console.log('🎉 ======================================');
});

server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use!`);
        process.exit(1);
    }
});

process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;
