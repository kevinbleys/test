const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Startup logging
console.log('🚀 BACKEND STARTUP SEQUENCE INITIATED');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('🗂️ Working Directory:', process.cwd());
console.log('📍 __dirname:', __dirname);

// Version checks
console.log('📦 Node.js Version:', process.version);
console.log('🔧 Platform:', process.platform);
console.log('💻 Architecture:', process.arch);

// App configuratie met error handling
let app;
try {
    app = express();
    console.log('✅ Express app created successfully');
} catch (error) {
    console.error('❌ CRITICAL: Failed to create Express app:', error);
    process.exit(1);
}

// Port configuration with fallbacks
const PORT = process.env.PORT || 3001;
console.log('🌐 Configured Port:', PORT);

// Test if port is available
const net = require('net');
const testPort = (port) => {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(port, (err) => {
            if (err) {
                reject(err);
            } else {
                server.close(() => {
                    resolve(true);
                });
            }
        });
        server.on('error', (err) => {
            reject(err);
        });
    });
};

// Data directory setup with comprehensive error handling
const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const NON_MEMBERS_FILE = path.join(DATA_DIR, 'non-members.json');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');

console.log('📁 Data Directory Path:', DATA_DIR);
console.log('💾 Presences File:', PRESENCES_FILE);

// Ensure data directory exists with detailed logging
const setupDataDirectory = () => {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            console.log('📁 Creating data directory...');
            fs.mkdirSync(DATA_DIR, { recursive: true });
            console.log('✅ Data directory created successfully');
        } else {
            console.log('✅ Data directory already exists');
        }

        // Check if directory is writable
        try {
            const testFile = path.join(DATA_DIR, 'test-write.tmp');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            console.log('✅ Data directory is writable');
        } catch (writeError) {
            console.error('❌ Data directory is not writable:', writeError);
            throw writeError;
        }

    } catch (error) {
        console.error('❌ CRITICAL: Failed to setup data directory:', error);
        console.error('💡 Suggestion: Check file permissions and disk space');
        process.exit(1);
    }
};

setupDataDirectory();

// Robust file initialization
const initDataFile = (filePath, defaultData = []) => {
    try {
        const fileName = path.basename(filePath);
        if (!fs.existsSync(filePath)) {
            console.log(`📄 Initializing ${fileName}...`);
            fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
            console.log(`✅ ${fileName} initialized successfully`);
        } else {
            console.log(`✅ ${fileName} already exists`);
            // Validate existing file
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                JSON.parse(content);
                console.log(`✅ ${fileName} is valid JSON`);
            } catch (jsonError) {
                console.warn(`⚠️ ${fileName} contains invalid JSON, recreating...`);
                fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
                console.log(`✅ ${fileName} recreated with valid JSON`);
            }
        }
    } catch (error) {
        console.error(`❌ Failed to initialize ${path.basename(filePath)}:`, error);
        // Don't exit, continue with in-memory data
        console.log('⚠️ Continuing with in-memory data storage');
    }
};

// Initialize all data files
console.log('📄 Initializing data files...');
initDataFile(PRESENCES_FILE);
initDataFile(NON_MEMBERS_FILE);
initDataFile(PRESENCE_HISTORY_FILE);

// Robust file operations with fallbacks
const readJsonFile = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ File does not exist: ${path.basename(filePath)}, returning empty array`);
            return [];
        }

        const data = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(data);

        if (!Array.isArray(parsed)) {
            console.warn(`⚠️ File contains non-array data: ${path.basename(filePath)}, returning empty array`);
            return [];
        }

        return parsed;
    } catch (error) {
        console.error(`❌ Error reading ${path.basename(filePath)}:`, error);
        return [];
    }
};

const writeJsonFile = (filePath, data) => {
    try {
        if (!Array.isArray(data)) {
            console.error(`❌ Attempted to write non-array data to ${path.basename(filePath)}`);
            return false;
        }

        // Create backup before writing
        if (fs.existsSync(filePath)) {
            const backupPath = filePath + '.backup';
            fs.copyFileSync(filePath, backupPath);
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ Successfully wrote ${data.length} records to ${path.basename(filePath)}`);
        return true;
    } catch (error) {
        console.error(`❌ Error writing ${path.basename(filePath)}:`, error);
        return false;
    }
};

// Middleware setup with error handling
console.log('🔧 Setting up middleware...');

try {
    // CORS setup
    app.use(cors({
        origin: [
            'http://localhost:3000', 
            'http://localhost:3002', 
            'http://127.0.0.1:3000', 
            'http://127.0.0.1:3002'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    console.log('✅ CORS middleware configured');

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    console.log('✅ Body parsing middleware configured');

    // Enhanced logging middleware
    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        console.log(`🌐 ${timestamp} - ${req.method} ${req.path}`);

        if (req.body && Object.keys(req.body).length > 0) {
            console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
        }

        if (req.query && Object.keys(req.query).length > 0) {
            console.log('🔍 Query params:', JSON.stringify(req.query, null, 2));
        }

        next();
    });
    console.log('✅ Logging middleware configured');

} catch (error) {
    console.error('❌ CRITICAL: Failed to setup middleware:', error);
    process.exit(1);
}

// Sync service loading with robust error handling
let syncService = null;
console.log('🔄 Loading sync service...');

try {
    const syncServicePath = path.join(__dirname, 'sync-service');
    if (fs.existsSync(syncServicePath + '.js')) {
        syncService = require('./sync-service');
        console.log('✅ Sync service loaded successfully');

        // Test sync service
        try {
            const testMembers = syncService.getMembers();
            console.log(`✅ Sync service test: ${testMembers.length} members available`);
        } catch (testError) {
            console.warn('⚠️ Sync service loaded but test failed:', testError.message);
        }
    } else {
        console.warn('⚠️ sync-service.js not found, using fallback');
    }
} catch (error) {
    console.warn('⚠️ Could not load sync service:', error.message);
}

// Fallback sync service
if (!syncService) {
    console.log('🔄 Creating fallback sync service...');
    syncService = {
        getMembers: () => {
            console.log('⚠️ Using fallback sync service - returning empty member list');
            return [];
        }
    };
}

// Routes setup
console.log('🛤️ Setting up routes...');

// Health check route - ALWAYS works
app.get('/api/health', (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        dataDir: DATA_DIR,
        syncService: syncService ? 'loaded' : 'fallback'
    };

    console.log('💚 Health check requested, returning:', health);
    res.json(health);
});

// Root route - API status
app.get('/', (req, res) => {
    console.log('🏠 Root endpoint accessed');
    res.json({
        status: 'success',
        message: 'API Logiciel Escalade opérationnelle',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            status: '/api/status',
            members: '/members/check',
            presences: '/presences',
            nonMembers: '/non-members',
            stats: '/api/stats/today'
        }
    });
});

// Status endpoint
app.get('/api/status', (req, res) => {
    const status = {
        status: 'operational',
        services: {
            database: 'file-based',
            api: 'running',
            syncService: syncService ? 'loaded' : 'fallback',
            dataDirectory: fs.existsSync(DATA_DIR) ? 'exists' : 'missing'
        },
        version: '1.0.0',
        timestamp: new Date().toISOString()
    };

    console.log('📊 Status check requested, returning:', status);
    res.json(status);
});

// Members routes
app.get('/members/check', (req, res) => {
    console.log('👤 Member check requested');

    const { nom, prenom } = req.query;
    if (!nom || !prenom) {
        console.log('❌ Missing nom or prenom parameters');
        return res.status(400).json({
            success: false,
            error: "Paramètres 'nom' et 'prenom' requis"
        });
    }

    console.log(`🔍 Checking member: ${prenom} ${nom}`);

    try {
        const members = syncService.getMembers();
        console.log(`📋 Total members in database: ${members.length}`);

        const member = members.find(m =>
            m.lastname?.trim().toLowerCase() === nom.trim().toLowerCase() &&
            m.firstname?.trim().toLowerCase() === prenom.trim().toLowerCase()
        );

        if (!member) {
            console.log('❌ Member not found');
            return res.json({
                success: false,
                error: "Aucun membre trouvé avec ce nom et prénom"
            });
        }

        console.log('✅ Member found:', {
            name: `${member.firstname} ${member.lastname}`,
            categories: member.categories,
            status: member.joinFileStatusLabel
        });

        // Simplified member validation
        const isAdherent = Array.isArray(member.categories) &&
            member.categories.some(c =>
                typeof c.label === 'string' &&
                c.label.toLowerCase().includes('adhérent')
            );

        if (isAdherent) {
            console.log('✅ Member accepted - is adherent');
            return res.json({
                success: true,
                isPaid: true,
                message: "Adhésion reconnue. Bienvenue !",
                membre: member
            });
        } else {
            console.log('❌ Member rejected - not adherent');
            return res.json({
                success: false,
                error: "Vous n'êtes pas enregistré comme adhérent. Merci de vous inscrire comme visiteur."
            });
        }

    } catch (error) {
        console.error('❌ Error in member check:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur lors de la vérification du membre'
        });
    }
});

app.get('/members/all', (req, res) => {
    console.log('👥 All members requested');
    try {
        const members = syncService.getMembers();
        console.log(`📋 Returning ${members.length} members`);
        res.json({ success: true, members, count: members.length });
    } catch (error) {
        console.error('❌ Error getting all members:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Presences routes
app.get('/presences', (req, res) => {
    console.log('📋 Presences list requested');
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        console.log(`📋 Returning ${presences.length} presences`);
        res.json({
            success: true,
            presences,
            count: presences.length
        });
    } catch (error) {
        console.error('❌ Error getting presences:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la lecture des présences'
        });
    }
});

app.post('/presences', (req, res) => {
    console.log('➕ New presence request');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));

    const { type, nom, prenom, ...otherData } = req.body;

    if (!type || !nom || !prenom) {
        console.log('❌ Missing required fields');
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
            console.log('✅ Adherent presence created (no tarif)');
        }

        console.log('💾 Saving presence:', JSON.stringify(newPresence, null, 2));

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
            error: 'Erreur lors de l\'enregistrement de la présence'
        });
    }
});

app.delete('/presences/:id', (req, res) => {
    const { id } = req.params;
    console.log(`🗑️ Delete presence request for ID: ${id}`);

    try {
        const presences = readJsonFile(PRESENCES_FILE);
        const initialCount = presences.length;
        const filteredPresences = presences.filter(p => p.id !== id);

        if (filteredPresences.length === initialCount) {
            console.log('❌ Presence not found for deletion');
            return res.status(404).json({
                success: false,
                error: 'Présence non trouvée'
            });
        }

        if (writeJsonFile(PRESENCES_FILE, filteredPresences)) {
            console.log('✅ Presence deleted successfully');
            res.json({
                success: true,
                message: 'Présence supprimée avec succès'
            });
        } else {
            throw new Error('Failed to write presence file after deletion');
        }
    } catch (error) {
        console.error('❌ Error deleting presence:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression de la présence'
        });
    }
});

// Non-members routes
app.get('/non-members', (req, res) => {
    console.log('👥 Non-members list requested');
    try {
        const nonMembers = readJsonFile(NON_MEMBERS_FILE);
        console.log(`📋 Returning ${nonMembers.length} non-members`);
        res.json({
            success: true,
            nonMembers,
            count: nonMembers.length
        });
    } catch (error) {
        console.error('❌ Error getting non-members:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la lecture des non-membres'
        });
    }
});

app.post('/non-members', (req, res) => {
    console.log('➕ New non-member request');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));

    try {
        const nonMembers = readJsonFile(NON_MEMBERS_FILE);

        const newNonMember = {
            id: Date.now().toString(),
            ...req.body,
            dateCreated: new Date().toISOString()
        };

        nonMembers.push(newNonMember);

        if (writeJsonFile(NON_MEMBERS_FILE, nonMembers)) {
            console.log('✅ Non-member saved successfully');
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
            error: 'Erreur lors de l\'enregistrement du non-membre'
        });
    }
});

// Stats routes
app.get('/api/stats/today', (req, res) => {
    console.log('📊 Today stats requested');
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

        const stats = {
            date: today,
            total: todayPresences.length,
            adherents,
            nonAdherents,
            revenue: totalRevenue,
            presences: todayPresences
        };

        console.log('📊 Today stats:', stats);
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('❌ Error calculating today stats:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du calcul des statistiques'
        });
    }
});

// Legacy compatibility routes
app.get('/api/stats', (req, res) => {
    console.log('📊 Legacy stats requested');
    try {
        const presences = readJsonFile(PRESENCES_FILE);
        res.json({
            daily: {
                visitors: presences.length,
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
        console.error('❌ Error in legacy stats:', error);
        res.json({
            daily: { visitors: 0, peak_hour: '18:00', avg_session_duration: '2.5h' },
            weekly: { total_visitors: 0, busiest_day: 'mercredi', avg_daily: 0 },
            monthly: { total_visitors: 0, growth: '+0%', retention: '0%' }
        });
    }
});

// More legacy routes for compatibility
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
    console.log(`✅ Legacy checkin for: ${userName}`);
    res.json({
        success: true,
        message: `Check-in réussi pour ${userName}`,
        userId: userId,
        timestamp: new Date().toISOString()
    });
});

app.post('/api/presence/checkout', (req, res) => {
    const { userId, userName } = req.body;
    console.log(`✅ Legacy checkout for: ${userName}`);
    res.json({
        success: true,
        message: `Check-out réussi pour ${userName}`,
        userId: userId,
        timestamp: new Date().toISOString()
    });
});

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

// 404 handler with detailed logging
app.use((req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
        error: 'Endpoint non trouvé',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        available_endpoints: [
            'GET /',
            'GET /api/health',
            'GET /api/status',
            'GET /members/check',
            'GET /members/all',
            'GET /presences',
            'POST /presences',
            'DELETE /presences/:id',
            'GET /non-members',
            'POST /non-members',
            'GET /api/stats/today'
        ]
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('💥 GLOBAL ERROR HANDLER:', error);
    console.error('📍 Stack trace:', error.stack);
    res.status(500).json({
        error: 'Erreur interne du serveur',
        message: 'Une erreur s\'est produite lors du traitement de la requête',
        timestamp: new Date().toISOString()
    });
});

// Server startup with comprehensive error handling
const startServer = async () => {
    try {
        // Test port availability first
        console.log(`🔍 Testing port ${PORT} availability...`);
        await testPort(PORT);
        console.log(`✅ Port ${PORT} is available`);

        // Start the server
        const server = app.listen(PORT, 'localhost', () => {
            console.log('🎉 ======================================');
            console.log('🎉 SERVER SUCCESSFULLY STARTED!');
            console.log('🎉 ======================================');
            console.log(`✅ Backend running on: http://localhost:${PORT}`);
            console.log(`📊 API Status: http://localhost:${PORT}/api/health`);
            console.log(`👤 Member Check: http://localhost:${PORT}/members/check`);
            console.log(`📋 Presences: http://localhost:${PORT}/presences`);
            console.log('🎉 ======================================');
        });

        // Handle server errors
        server.on('error', (error) => {
            console.error('💥 SERVER ERROR:', error);
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use!`);
                console.log('💡 Try these solutions:');
                console.log('   1. Kill the process using the port');
                console.log('   2. Use a different port: PORT=3002 npm start');
                process.exit(1);
            }
        });

        // Graceful shutdown handling
        const gracefulShutdown = (signal) => {
            console.log(`📴 Received ${signal}, shutting down gracefully...`);
            server.close(() => {
                console.log('✅ Server closed successfully');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        return server;

    } catch (error) {
        console.error('💥 CRITICAL: Failed to start server:', error);

        if (error.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is already in use!`);
            console.log('💡 Solutions:');
            console.log('   • Check what is using the port: netstat -ano | findstr 3001');
            console.log('   • Kill the process or use different port');
            console.log('   • Try: SET PORT=3002 && npm start');
        } else {
            console.error('❌ Unexpected error:', error.message);
        }

        process.exit(1);
    }
};

// Start the server
console.log('🚀 Starting server...');
startServer();

module.exports = app;
