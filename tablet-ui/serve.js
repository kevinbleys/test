// Production static file server voor Tablet UI
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('📱 Starting Climbing Club Tablet Interface Service');
console.log('Port:', PORT);

// Serve static files from build directory
const buildPath = path.join(__dirname, 'build');
const publicPath = path.join(__dirname, 'public');

// Check if build directory exists
if (fs.existsSync(buildPath)) {
    console.log('✅ Serving from build directory');
    app.use(express.static(buildPath));

    // Serve index.html for all routes (SPA)
    app.get('*', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
} else if (fs.existsSync(publicPath)) {
    console.log('✅ Serving from public directory');
    app.use(express.static(publicPath));

    app.get('*', (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
    });
} else {
    console.error('❌ No build or public directory found!');
    process.exit(1);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'tablet-ui',
        timestamp: new Date().toISOString() 
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log('✅ Tablet Interface service started successfully');
    console.log(`📱 Interface disponible: http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use!`);
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 Tablet Interface service shutting down...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('📴 Tablet Interface service interrupted');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
