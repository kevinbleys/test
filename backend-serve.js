// Production server starter voor Windows Service
const path = require('path');
const express = require('express');

// Set environment naar productie
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || 3001;

console.log('🚀 Starting Climbing Club Backend Service');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);

// Start de server
try {
    require('./server.js');

    console.log('✅ Backend service started successfully');
    console.log(`📊 Admin interface: http://localhost:${process.env.PORT}/admin`);
    console.log(`🔗 API endpoint: http://localhost:${process.env.PORT}/api/health`);

} catch (error) {
    console.error('❌ Failed to start backend service:', error);
    process.exit(1);
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 Backend service shutting down...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('📴 Backend service interrupted');
    process.exit(0);
});
