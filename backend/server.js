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

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
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
      climbing: '/api/climbing'
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

// API Routes pour escalade
app.get('/api/climbing/sessions', (req, res) => {
  res.json({
    sessions: [
      {
        id: 1,
        date: '2025-08-11',
        participants: 12,
        type: 'cours_initiation',
        instructor: 'Marie Dubois'
      },
      {
        id: 2,
        date: '2025-08-11',
        participants: 8,
        type: 'entrainement_libre',
        instructor: null
      }
    ]
  });
});

app.get('/api/users', (req, res) => {
  res.json({
    users: [
      {
        id: 1,
        name: 'Jean Martin',
        level: 'débutant',
        sessions: 5
      },
      {
        id: 2,
        name: 'Sophie Durand',
        level: 'intermédiaire',
        sessions: 23
      }
    ]
  });
});

// Routes voor de données de présence
app.get('/api/presence', (req, res) => {
  res.json({
    current_users: 15,
    max_capacity: 50,
    status: 'available',
    last_update: new Date().toISOString()
  });
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

// Route pour les statistiques
app.get('/api/stats', (req, res) => {
  res.json({
    daily: {
      visitors: 45,
      peak_hour: '18:00',
      avg_session_duration: '2.5h'
    },
    weekly: {
      total_visitors: 312,
      busiest_day: 'mercredi',
      avg_daily: 44.5
    },
    monthly: {
      total_visitors: 1250,
      growth: '+15%',
      retention: '68%'
    }
  });
});

// Route pour les équipements
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
      last_inspection: '2025-08-08'
    }
  });
});

// Import route members (als het bestaat)
if (fs.existsSync(path.join(__dirname, 'routes', 'members.js'))) {
  const membersRoutes = require('./routes/members');
  app.use('/members', membersRoutes);
}

// **GECORRIGEERDE 404 HANDLER - GEEN WILDCARD**
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint non trouvé',
    path: req.originalUrl,
    message: 'Cet endpoint n\'existe pas dans l\'API',
    available_endpoints: [
      '/',
      '/api/health',
      '/api/status',
      '/api/climbing/sessions',
      '/api/users',
      '/api/presence',
      '/api/stats',
      '/api/equipment'
    ]
  });
});

// Gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: 'Une erreur s\'est produite lors du traitement de la requête'
  });
});

// Démarrage du serveur
const server = app.listen(PORT, 'localhost', () => {
  console.log(`✅ Serveur backend démarré sur http://localhost:${PORT}`);
  console.log(`📊 API disponible`);
  console.log('🔗 Endpoints principaux:');
  console.log(` • Status: http://localhost:${PORT}/api/status`);
  console.log(` • Health: http://localhost:${PORT}/api/health`);
  console.log(` • Users: http://localhost:${PORT}/api/users`);
  console.log(` • Presence: http://localhost:${PORT}/api/presence`);
});

// Gestion de l'arrêt propre
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
