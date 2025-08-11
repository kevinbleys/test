const Service = require('node-windows').Service;
const path = require('path');
const fs = require('fs');

console.log('🚀 Klimzaal Presence Management - Service Installer');
console.log('===================================================');

// Service configuratie
const serviceName = 'KlimzaalPresenceBackend';
const serviceDescription = 'Klimzaal Presence Management Backend Service';
const scriptPath = path.join(__dirname, 'server.js');

// Controleer of server.js bestaat
if (!fs.existsSync(scriptPath)) {
  console.error('❌ server.js niet gevonden op:', scriptPath);
  process.exit(1);
}

console.log('📂 Script pad:', scriptPath);
console.log('🔧 Service naam:', serviceName);

// Maak service object met juiste configuratie
const svc = new Service({
  name: serviceName,
  description: serviceDescription,
  script: scriptPath,
  nodeOptions: [
    '--max_old_space_size=4096'
  ],
  workingDirectory: __dirname,
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

// Event listeners
svc.on('install', function() {
  console.log('✅ Service geïnstalleerd!');
  console.log('🔄 Service wordt gestart...');
  
  setTimeout(() => {
    svc.start();
  }, 1000);
});

svc.on('alreadyinstalled', function() {
  console.log('⚠️  Service is al geïnstalleerd');
  console.log('🔄 Probeer service te herstarten...');
  
  setTimeout(() => {
    svc.restart();
  }, 1000);
});

svc.on('start', function() {
  console.log('✅ Service gestart!');
  console.log('🌐 Backend draait nu op: http://localhost:3001');
  console.log('📊 Backend API endpoints beschikbaar');
  console.log('');
  console.log('🎯 Service wordt automatisch gestart bij herstart computer');
  console.log('📋 Bekijk services: Win+R → services.msc → zoek naar "' + serviceName + '"');
  console.log('');
  console.log('✅ Installatie voltooid!');
  
  setTimeout(() => {
    process.exit(0);
  }, 2000);
});

svc.on('error', function(err) {
  console.error('❌ Service error:', err.message);
  console.log('');
  console.log('🔧 Mogelijke oplossingen:');
  console.log('1. Start Command Prompt als Administrator');
  console.log('2. Controleer of poort 3001 vrij is');
  console.log('3. Controleer Windows Event Viewer voor details');
  
  process.exit(1);
});

// Installeer service
console.log('📦 Service installeren...');
console.log('⏳ Dit kan even duren...');

try {
  svc.install();
} catch (error) {
  console.error('❌ Installatie fout:', error.message);
  process.exit(1);
}