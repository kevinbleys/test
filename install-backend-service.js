var Service = require('node-windows').Service;

// Créer un nouveau service
var svc = new Service({
    name: 'ClimbingClub-Backend',
    description: 'Backend service pour le logiciel Club d\'Escalade',
    script: require('path').join(__dirname, 'backend', 'server.js'),
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=4096'
    ],
    env: [
        {
            name: "NODE_ENV",
            value: "production"
        },
        {
            name: "PORT", 
            value: "3001"
        }
    ]
});

// Écouter l'événement "install"
svc.on('install', function() {
    console.log('✅ Service Backend installé avec succès');
    console.log('Démarrage du service...');
    svc.start();
});

svc.on('start', function() {
    console.log('✅ Service Backend démarré');
    console.log('Backend disponible sur: http://localhost:3001');
});

svc.on('error', function(err) {
    console.error('❌ Erreur service Backend:', err);
});

// Installer le service
console.log('Installation du service Backend...');
svc.install();
