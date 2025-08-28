var Service = require('node-windows').Service;

var svc = new Service({
    name: 'ClimbingClub-Frontend',
    script: require('path').join(__dirname, 'tablet-ui', 'serve.js')
});

svc.on('uninstall', function() {
    console.log('✅ Service Frontend désinstallé');
});

svc.on('error', function(err) {
    console.error('❌ Erreur désinstallation Frontend:', err);
});

console.log('Désinstallation du service Frontend...');
svc.uninstall();
