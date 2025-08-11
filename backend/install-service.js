const Service = require('node-windows').Service;
const path = require('path');
const fs = require('fs');

console.log('🚀 Klimzaal Presence Management - Service Installer');
console.log('===================================================');

// Service configuratie
const serviceName = 'KlimzaalPresenceManagement';
const serviceDescription = 'Klimzaal Presence Management Backend Service';
const scriptPath = path.join(__dirname, 'server.js');

// Controleer of server.js bestaat
if (!fs.existsSync(scriptPath)) {
  console.error('❌ server.js niet gevonden op:', scriptPath);
  process.exit(1);
}

// Maak service object
const svc = new Service({
  name: serviceName,
  description: serviceDescription,
  script: scriptPath,
  nodeOptions: [
    '--max_old_space_size=4096'
  ],
  //, workingDirectory: __dirname
  env: {
    name: "NODE_ENV",
    value: "production"
  }
});

// Event listeners
svc.on('install', function() {
  console.log('✅ Service geïnstalleerd!');
  console.log('🔄 Service wordt gestart...');
  svc.start();
});

svc.on('alreadyinstalled', function() {
  console.log('⚠️  Service is al geïnstalleerd');
  console.log('🔄 Probeer service te herstarten...');
  svc.restart();
});

svc.on('start', function() {
  console.log('✅ Service gestart!');
  console.log('🌐 Backend draait nu op: http://localhost:3001');
  console.log('📊 Admin dashboard: http://localhost:3001');
  console.log('');
  console.log('🎯 Service wordt automatisch gestart bij herstart computer');
  console.log('📋 Bekijk services: Win+R → services.msc');
  process.exit(0);
});

svc.on('error', function(err) {
  console.error('❌ Service error:', err);
  process.exit(1);
});

// Installeer service
console.log('📦 Service installeren...');
console.log('📂 Script pad:', scriptPath);
svc.install();