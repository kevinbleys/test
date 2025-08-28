var Service = require('node-windows').Service;

// Créer la référence vers le service existant
var svc = new Service({
    name: 'ClimbingClub-Backend',
    script: require('path').join(__dirname, 'backend', 'server.js')
});

// Écouter l'événement "uninstall"
svc.on('uninstall', function() {
    console.log('✅ Service Backend désinstallé');
});

svc.on('error', function(err) {
    console.error('❌ Erreur désinstallation Backend:', err);
});

// Désinstaller le service
console.log('Désinstallation du service Backend...');
svc.uninstall();
