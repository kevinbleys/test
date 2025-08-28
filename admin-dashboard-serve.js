// Production static file server voor Admin Dashboard
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3002;

console.log('🖥️ Starting Climbing Club Admin Dashboard Service');
console.log('Port:', PORT);

// Serve static files from build directory
const buildPath = path.join(__dirname, 'build');
const publicPath = path.join(__dirname, 'public');
const srcPath = path.join(__dirname, 'src');

// Check directories in order of preference
let servePath;
if (fs.existsSync(buildPath)) {
    servePath = buildPath;
    console.log('✅ Serving from build directory');
} else if (fs.existsSync(publicPath)) {
    servePath = publicPath;
    console.log('✅ Serving from public directory');
} else if (fs.existsSync(srcPath)) {
    servePath = srcPath;
    console.log('✅ Serving from src directory');
} else {
    console.error('❌ No suitable directory found for admin dashboard!');
    process.exit(1);
}

app.use(express.static(servePath));

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
    const indexPath = path.join(servePath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('<h1>Admin Dashboard - Index file not found</h1>');
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'admin-dashboard',
        timestamp: new Date().toISOString() 
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log('✅ Admin Dashboard service started successfully');
    console.log(`🖥️ Dashboard disponible: http://localhost:${PORT}`);
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
    console.log('📴 Admin Dashboard service shutting down...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('📴 Admin Dashboard service interrupted');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
