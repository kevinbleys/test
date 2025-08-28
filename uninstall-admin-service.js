var Service = require('node-windows').Service;

var svc = new Service({
    name: 'ClimbingClub-Admin',
    script: require('path').join(__dirname, 'admin-dashboard', 'serve.js')
});

svc.on('uninstall', function() {
    console.log('✅ Service Admin Dashboard désinstallé');
});

svc.on('error', function(err) {
    console.error('❌ Erreur désinstallation Admin:', err);
});

console.log('Désinstallation du service Admin Dashboard...');
svc.uninstall();
