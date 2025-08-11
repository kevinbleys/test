const Service = require('node-windows').Service;
const path = require('path');

console.log('🗑️  Klimzaal Presence Management - Service Verwijderen');
console.log('====================================================');

// Service configuratie
const serviceName = 'KlimzaalPresenceManagement';
const serviceDescription = 'Klimzaal Presence Management Backend Service';
const scriptPath = path.join(__dirname, 'server.js');

// Maak service object
const svc = new Service({
  name: serviceName,
  description: serviceDescription,
  script: scriptPath
});

// Event listeners
svc.on('uninstall', function() {
  console.log('✅ Service succesvol verwijderd!');
  console.log('🛑 Backend service is gestopt');
  process.exit(0);
});

svc.on('error', function(err) {
  console.error('❌ Service error:', err);
  process.exit(1);
});

// Verwijder service
console.log('🛑 Service verwijderen...');
svc.uninstall();