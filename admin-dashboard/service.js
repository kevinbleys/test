var Service = require('node-windows').Service;

// Créer un nouveau service
var svc = new Service({
    name: 'ClimbingClub-Admin',
    description: 'Admin Dashboard pour le logiciel Club d\'Escalade',
    script: require('path').join(__dirname, 'admin-dashboard', 'serve.js'),
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=2048'
    ],
    env: [
        {
            name: "NODE_ENV",
            value: "production"
        },
        {
            name: "PORT", 
            value: "3002"
        }
    ]
});

// Écouter l'événement "install"
svc.on('install', function() {
    console.log('✅ Service Admin Dashboard installé avec succès');
    console.log('Démarrage du service...');
    svc.start();
});

svc.on('start', function() {
    console.log('✅ Service Admin Dashboard démarré');
    console.log('Dashboard disponible sur: http://localhost:3002');
});

svc.on('error', function(err) {
    console.error('❌ Erreur service Admin Dashboard:', err);
});

// Installer le service
console.log('Installation du service Admin Dashboard...');
svc.install();
