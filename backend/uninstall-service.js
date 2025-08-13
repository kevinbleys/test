const Service = require('node-windows').Service;
const path = require('path');

console.log('🔧 Désinstallation du service backend Windows...');

// Service configuratie
const svc = new Service({
  name: 'EscaladeBackendService',
  script: path.join(__dirname, 'server.js')
});

// Event listeners
svc.on('uninstall', () => {
  console.log('✅ Service désinstallé avec succès');
});

svc.on('stop', () => {
  console.log('🛑 Service arrêté');
});

svc.on('error', (error) => {
  console.error('❌ Erreur:', error);
});

// Désinstaller le service
console.log('🛑 Arrêt et désinstallation...');
svc.uninstall();
