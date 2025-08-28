const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// App configuratie
const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Backend Logiciel Escalade - Démarrage');
console.log('Port:', PORT);
console.log('Environnement:', process.env.NODE_ENV);

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const NON_MEMBERS_FILE = path.join(DATA_DIR, 'non-members.json');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
const initDataFile = (filePath, defaultData = []) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
        console.log(`✅ Initialized ${path.basename(filePath)}`);
    }
};

initDataFile(PRESENCES_FILE);
initDataFile(NON_MEMBERS_FILE);
initDataFile(PRESENCE_HISTORY_FILE);

// Helper functions for data management
const readJsonFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
};

const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
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

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Routes de base
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'API Logiciel Escalade opérationnelle',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            status: '/api/status',
            health: '/api/health',
            users: '/api/users',
            climbing: '/api/climbing',
            members: '/members/*',
            presences: '/presences'
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// Status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        status: 'operational',
        services: {
            database: 'connected',
            api: 'running',
            frontend: 'available'
        },
        version: '1.0.0'
    });
});

// ===== MEMBERS ROUTES =====
// Import sync service
let syncService;
try {
    syncService = require('./sync-service');
    console.log('✅ Sync service loaded');
} catch (error) {
    console.error('❌ Could not load sync service:', error.message);
    syncService = { getMembers: () => [] };
}

// Member check route
app.get('/members/check', (req, res) => {
    const { nom, prenom } = req.query;
    if (!nom || !prenom) {
        return res.status(400).json({
            success: false,
            error: "Paramètres 'nom' et 'prenom' requis"
        });
    }

    console.log('=== MEMBER CHECK ===');
    console.log('Nom:', nom);
    console.log('Prenom:', prenom);

    // Get members from sync service
    const members = syncService.getMembers();
    const member = members.find(m =>
        m.lastname?.trim().toLowerCase() === nom.trim().toLowerCase() &&
        m.firstname?.trim().toLowerCase() === prenom.trim().toLowerCase()
    );

    if (!member) {
        console.log('Member niet gevonden');
        return res.json({
            success: false,
            error: "Aucun membre trouvé avec ce nom et prénom"
        });
    }

    console.log('Member gevonden:', {
        name: `${member.firstname} ${member.lastname}`,
        categories: member.categories,
        joinFileStatusLabel: member.joinFileStatusLabel
    });

    // Check if member is an adherent
    const isAdherent = Array.isArray(member.categories) &&
        member.categories.some(c =>
            typeof c.label === 'string' &&
            c.label.toLowerCase().includes('adhérent')
        );

    // Check payment status
    const rawStatus = (member.joinFileStatusLabel || '').trim().toLowerCase();
    const paidLabels = ['payé', 'pay', 'paid', 'en cours', 'en cours de paiement', 'validé', 'validee'];
    const unpaidLabels = ['à payer', 'a payer', 'en attente', 'pending', 'impayé', 'impaye', 'non payé', 'non paye'];

    const isExplicitlyPaid = paidLabels.includes(rawStatus);
    const isExplicitlyUnpaid = unpaidLabels.includes(rawStatus);

    console.log('Is adherent:', isAdherent);
    console.log('Payment status:', rawStatus);
    console.log('Is explicitly paid:', isExplicitlyPaid);

    if (isAdherent && (isExplicitlyPaid || (!isExplicitlyUnpaid && rawStatus === ''))) {
        console.log('✅ Member accepted');
        return res.json({
            success: true,
            isPaid: true,
            message: "Adhésion reconnue. Bienvenue !",
            membre: member
        });
    }

    if (isAdherent && isExplicitlyUnpaid) {
        console.log('❌ Member rejected - unpaid');
        return res.json({
            success: false,
            isPaid: false,
            error: "Votre adhésion n'est pas encore réglée. Merci de contacter un bénévole pour finaliser votre paiement.",
            membre: member,
            needsPayment: true
        });
    }

    if (!isAdherent) {
        console.log('❌ Member rejected - not adherent');
        return res.json({
            success: false,
            error: "Vous n'êtes pas enregistré comme adhérent. Merci de vous inscrire comme visiteur.",
            membre: member
        });
    }

    console.log('❌ Member rejected - fallback');
    return res.json({
        success: false,
        isPaid: false,
        error: "Statut d'adhésion non déterminé. Merci de contacter un bénévole.",
        membre: member
    });
});

// Get all members
app.get('/members/all', (req, res) => {
    try {
        const members = syncService.getMembers();
        res.json({ success: true, members });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== PRESENCES ROUTES =====

// Get all presences
app.get('/presences', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        res.json({
            success: true,
            presences,
            count: presences.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la lecture des présences'
        });
    }
});

// Add new presence
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

        // Create new presence object
        const newPresence = {
            id: Date.now().toString(),
            type,
            nom: nom.trim(),
            prenom: prenom.trim(),
            date: new Date().toISOString(),
            ...otherData
        };

        // Special handling for adherents (no tarif should be added)
        if (type === 'adherent') {
            newPresence.status = 'adherent';
            // Explicitly remove tarif field if it exists
            delete newPresence.tarif;
            console.log('✅ Adherent presence created without tarif');
        }

        console.log('New presence object:', JSON.stringify(newPresence, null, 2));

        presences.push(newPresence);

        if (writeJsonFile(PRESENCES_FILE, presences)) {
            console.log('✅ Presence saved successfully');
            res.json({
                success: true,
                message: 'Présence enregistrée avec succès',
                presence: newPresence
            });
        } else {
            throw new Error('Failed to write presence file');
        }
    } catch (error) {
        console.error('❌ Error saving presence:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l'enregistrement de la présence'
        });
    }
});

// Delete presence
app.delete('/presences/:id', (req, res) => {
    const { id } = req.params;

    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const filteredPresences = presences.filter(p => p.id !== id);

        if (filteredPresences.length === presences.length) {
            return res.status(404).json({
                success: false,
                error: 'Présence non trouvée'
            });
        }

        if (writeJsonFile(PRESENCES_FILE, filteredPresences)) {
            res.json({
                success: true,
                message: 'Présence supprimée avec succès'
            });
        } else {
            throw new Error('Failed to write presence file');
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression de la présence'
        });
    }
});

// ===== NON-MEMBERS ROUTES =====

// Get non-members
app.get('/non-members', (req, res) => {
    try {
        const nonMembers = readJsonFile(NON_MEMBERS_FILE);
        res.json({
            success: true,
            nonMembers,
            count: nonMembers.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la lecture des non-membres'
        });
    }
});

// Add non-member
app.post('/non-members', (req, res) => {
    console.log('=== NEW NON-MEMBER REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    try {
        const nonMembers = readJsonFile(NON_MEMBERS_FILE);

        const newNonMember = {
            id: Date.now().toString(),
            ...req.body,
            dateCreated: new Date().toISOString()
        };

        nonMembers.push(newNonMember);

        if (writeJsonFile(NON_MEMBERS_FILE, nonMembers)) {
            res.json({
                success: true,
                message: 'Non-membre enregistré avec succès',
                nonMember: newNonMember
            });
        } else {
            throw new Error('Failed to write non-members file');
        }
    } catch (error) {
        console.error('❌ Error saving non-member:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l'enregistrement du non-membre'
        });
    }
});

// ===== STATS & REPORTING ROUTES =====

// Get today's stats
app.get('/api/stats/today', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const today = new Date().toISOString().split('T')[0];

        const todayPresences = presences.filter(p => 
            p.date.startsWith(today)
        );

        const adherents = todayPresences.filter(p => p.type === 'adherent').length;
        const nonAdherents = todayPresences.filter(p => p.type === 'non-adherent').length;
        const totalRevenue = todayPresences
            .filter(p => p.tarif)
            .reduce((sum, p) => sum + (p.tarif || 0), 0);

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

// ===== LEGACY API ROUTES (for compatibility) =====

app.get('/api/climbing/sessions', (req, res) => {
    res.json({
        sessions: [
            {
                id: 1,
                date: '2025-08-28',
                participants: 12,
                type: 'cours_initiation',
                instructor: 'Marie Dubois'
            },
            {
                id: 2,
                date: '2025-08-28',
                participants: 8,
                type: 'entrainement_libre',
                instructor: null
            }
        ]
    });
});

app.get('/api/users', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const users = presences.map(p => ({
            id: p.id,
            name: `${p.prenom} ${p.nom}`,
            type: p.type,
            date: p.date
        }));

        res.json({ users });
    } catch (error) {
        res.json({ users: [] });
    }
});

app.get('/api/presence', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        res.json({
            current_users: presences.length,
            max_capacity: 50,
            status: 'available',
            last_update: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            current_users: 0,
            max_capacity: 50,
            status: 'available',
            last_update: new Date().toISOString()
        });
    }
});

app.post('/api/presence/checkin', (req, res) => {
    const { userId, userName } = req.body;

    res.json({
        success: true,
        message: `Check-in réussi pour ${userName}`,
        userId: userId,
        timestamp: new Date().toISOString()
    });
});

app.post('/api/presence/checkout', (req, res) => {
    const { userId, userName } = req.body;

    res.json({
        success: true,
        message: `Check-out réussi pour ${userName}`,
        userId: userId,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/stats', (req, res) => {
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const today = new Date().toISOString().split('T')[0];
        const todayPresences = presences.filter(p => p.date.startsWith(today));

        res.json({
            daily: {
                visitors: todayPresences.length,
                peak_hour: '18:00',
                avg_session_duration: '2.5h'
            },
            weekly: {
                total_visitors: presences.length,
                busiest_day: 'mercredi',
                avg_daily: Math.round(presences.length / 7)
            },
            monthly: {
                total_visitors: presences.length,
                growth: '+15%',
                retention: '68%'
            }
        });
    } catch (error) {
        res.json({
            daily: { visitors: 0, peak_hour: '18:00', avg_session_duration: '2.5h' },
            weekly: { total_visitors: 0, busiest_day: 'mercredi', avg_daily: 0 },
            monthly: { total_visitors: 0, growth: '+0%', retention: '0%' }
        });
    }
});

app.get('/api/equipment', (req, res) => {
    res.json({
        climbing_routes: {
            easy: 12,
            medium: 18,
            hard: 8,
            expert: 4
        },
        equipment: {
            harnesses_available: 23,
            shoes_available: 31,
            helmets_available: 15
        },
        maintenance: {
            routes_needing_service: 2,
            last_inspection: '2025-08-28'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint non trouvé',
        path: req.originalUrl,
        message: 'Cet endpoint n\'existe pas dans l\'API',
        available_endpoints: [
            '/',
            '/api/health',
            '/api/status',
            '/members/check',
            '/members/all',
            '/presences',
            '/non-members',
            '/api/stats/today',
            '/api/climbing/sessions',
            '/api/users',
            '/api/presence',
            '/api/stats',
            '/api/equipment'
        ]
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Erreur serveur:', error);
    res.status(500).json({
        error: 'Erreur interne du serveur',
        message: 'Une erreur s\'est produite lors du traitement de la requête'
    });
});

// Start server
const server = app.listen(PORT, 'localhost', () => {
    console.log(`✅ Serveur backend démarré sur http://localhost:${PORT}`);
    console.log(`📊 API disponible`);
    console.log('🔗 Endpoints principaux:');
    console.log(`  • Health: http://localhost:${PORT}/api/health`);
    console.log(`  • Members: http://localhost:${PORT}/members/check`);
    console.log(`  • Presences: http://localhost:${PORT}/presences`);
    console.log(`  • Stats: http://localhost:${PORT}/api/stats/today`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 Arrêt du serveur backend...');
    server.close(() => {
        console.log('✅ Serveur backend arrêté proprement');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('📴 Interruption reçue - arrêt du serveur...');
    server.close(() => {
        console.log('✅ Serveur backend arrêté');
        process.exit(0);
    });
});

module.exports = app;
