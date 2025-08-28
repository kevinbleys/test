var Service = require('node-windows').Service;

// Créer un nouveau service
var svc = new Service({
    name: 'ClimbingClub-Frontend',
    description: 'Frontend service pour le logiciel Club d\'Escalade (Interface Tablette)',
    script: require('path').join(__dirname, 'tablet-ui', 'serve.js'),
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
            value: "3000"
        }
    ]
});

// Écouter l'événement "install"
svc.on('install', function() {
    console.log('✅ Service Frontend installé avec succès');
    console.log('Démarrage du service...');
    svc.start();
});

svc.on('start', function() {
    console.log('✅ Service Frontend démarré');
    console.log('Interface tablette disponible sur: http://localhost:3000');
});

svc.on('error', function(err) {
    console.error('❌ Erreur service Frontend:', err);
});

// Installer le service
console.log('Installation du service Frontend...');
svc.install();
