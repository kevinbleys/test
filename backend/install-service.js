const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
    name: 'LogicielEscaladeBackend',
    description: 'Backend service voor Logiciel Escalade climbing club presence management',
    script: path.join(__dirname, 'server.js'),
    nodeOptions: [
        '--max-old-space-size=4096'
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

// Listen for the "install" event, which indicates the process is available as a service.
svc.on('install', () => {
    console.log('✅ Service LogicielEscaladeBackend geinstalleerd');
    console.log('🚀 Service wordt gestart...');
    svc.start();
});

svc.on('start', () => {
    console.log('✅ Service LogicielEscaladeBackend gestart');
    console.log('🌐 Backend beschikbaar op http://localhost:3001');
    console.log('📊 Admin Dashboard: http://localhost:3002');
    console.log('📱 Tablet UI: http://localhost:3000');
});

svc.on('error', (err) => {
    console.error('❌ Service error:', err);
});

console.log('📦 Installatie Windows service voor Logiciel Escalade...');
console.log('   Service naam: LogicielEscaladeBackend');
console.log('   Poort: 3001');
console.log('   Script: server.js');
svc.install();
