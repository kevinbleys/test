const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
    name: 'LogicielEscaladeBackend',
    script: path.join(__dirname, 'server.js')
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', () => {
    console.log('✅ Service LogicielEscaladeBackend volledig verwijderd');
    console.log('🏁 Logiciel Escalade service gestopt');
});

svc.on('error', (err) => {
    console.error('❌ Uninstall error:', err);
});

console.log('🗑️ Verwijdering Windows service LogicielEscaladeBackend...');
svc.uninstall();
