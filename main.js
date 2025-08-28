const { app, BrowserWindow, shell, Menu, Tray } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const express = require('express');
const http = require('http');

// Globale variabelen
let mainWindow;
let processes = [];
let tray;
let servers = [];

// ✅ GECORRIGEERDE POORT CONFIGURATIE
const TABLET_PORT = 3000;  // Tablet UI
const BACKEND_PORT = 3001; // Backend API
const ADMIN_PORT = 3002;   // Admin Dashboard

// Paths voor geïnstalleerde versie
const PATHS = {
    backend: path.join(__dirname, 'backend'),
    adminDashboard: path.join(__dirname, 'admin-dashboard'),
    tabletUi: path.join(__dirname, 'tablet-ui')
};

console.log('🚀 Logiciel Escalade - Démarrage complet');
console.log('Configuration ports:');
console.log(`  📱 Tablet UI: http://localhost:${TABLET_PORT}`);
console.log(`  🔧 Backend API: http://localhost:${BACKEND_PORT}`);
console.log(`  📊 Admin Dashboard: http://localhost:${ADMIN_PORT}`);

// App ready event
app.whenReady().then(() => {
    createWindow();
    setTimeout(() => startAllServices(), 3000);
    createTray();

    // Desktop shortcuts maken na installatie
    setTimeout(() => createDesktopShortcuts(), 5000);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        stopAllServices();
        app.quit();
    }
});

app.on('before-quit', () => {
    stopAllServices();
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false
        },
        autoHideMenuBar: true,
        title: 'Logiciel Escalade - Démarrage en cours...'
    });

    // LOADING PAGE MET JUISTE POORTEN
    const loadingHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Logiciel Escalade - Chargement</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 40px; 
                   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                   color: white; text-align: center; min-height: 100vh; 
                   display: flex; flex-direction: column; justify-content: center; }
            .logo { font-size: 4em; margin-bottom: 20px; }
            h1 { font-size: 2.5em; margin-bottom: 30px; }
            .services { background: rgba(255,255,255,0.1); padding: 30px; 
                       border-radius: 15px; margin: 30px 0; backdrop-filter: blur(10px); }
            .service-item { margin: 15px 0; font-size: 1.2em; padding: 10px; 
                           background: rgba(255,255,255,0.1); border-radius: 8px; }
            .loading { font-size: 1.3em; margin-top: 30px; }
            @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
            .pulse { animation: pulse 2s infinite; }
        </style>
    </head>
    <body>
        <div class="logo">🧗‍♀️</div>
        <h1>Logiciel de Gestion Escalade</h1>

        <div class="services">
            <h2>⚡ Services en cours de démarrage...</h2>
            <div class="service-item">📱 Interface Tablette (port ${TABLET_PORT})</div>
            <div class="service-item">🔧 Backend API (port ${BACKEND_PORT})</div>
            <div class="service-item">📊 Tableau de Bord Admin (port ${ADMIN_PORT})</div>
        </div>

        <div class="loading pulse">
            ⏳ Initialisation complète... (15 secondes)<br>
            <small>Les services démarrent automatiquement en arrière-plan</small>
        </div>
    </body>
    </html>
    `;

    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`);

    // Wacht op alle services (15 seconden)
    setTimeout(async () => {
        mainWindow.setTitle('Logiciel Escalade - Tableau de Bord');

        // Probeer admin dashboard te laden
        const adminUrl = `http://localhost:${ADMIN_PORT}`;
        console.log('🔄 Chargement du tableau de bord:', adminUrl);

        try {
            await mainWindow.loadURL(adminUrl);
            console.log('✅ Tableau de bord chargé avec succès');
        } catch (error) {
            console.log('❌ Erreur chargement tableau de bord:', error.message);

            // Fallback naar success page met shortcuts
            const successHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Logiciel Escalade - Services</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 40px; 
                           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                           color: white; text-align: center; min-height: 100vh; }
                    .logo { font-size: 4em; margin-bottom: 20px; }
                    h1 { font-size: 2.5em; margin-bottom: 30px; }
                    .success { background: rgba(46, 160, 67, 0.2); padding: 20px; 
                              border-radius: 10px; margin: 20px 0; }
                    .service-card { background: rgba(255,255,255,0.1); padding: 20px; 
                                   border-radius: 10px; margin: 20px; backdrop-filter: blur(10px); }
                    .btn { background: #4CAF50; color: white; padding: 12px 24px; 
                          border: none; border-radius: 5px; font-size: 1.1em; 
                          cursor: pointer; margin: 10px; text-decoration: none; 
                          display: inline-block; transition: all 0.3s; }
                    .btn:hover { background: #45a049; transform: translateY(-2px); }
                    .footer { margin-top: 40px; opacity: 0.8; }
                </style>
            </head>
            <body>
                <div class="logo">🧗‍♀️</div>
                <h1>Logiciel de Gestion Escalade</h1>

                <div class="success">
                    <h2>✅ Application démarrée avec succès</h2>
                    <p>Le logiciel est maintenant opérationnel. Accédez aux différentes interfaces :</p>
                </div>

                <div class="service-card">
                    <h3>📱 Interface Tablette</h3>
                    <p>Interface optimisée pour les écrans tactiles.</p>
                    <a href="http://localhost:${TABLET_PORT}" class="btn" onclick="require('electron').shell.openExternal(this.href); return false;">
                        Ouvrir Interface Tablette
                    </a>
                </div>

                <div class="service-card">
                    <h3>🔧 API Backend</h3>
                    <p>Service de données et API REST.</p>
                    <a href="http://localhost:${BACKEND_PORT}" class="btn" onclick="require('electron').shell.openExternal(this.href); return false;">
                        Vérifier l'API Backend
                    </a>
                </div>

                <div class="service-card">
                    <h3>📊 Tableau de Bord Administrateur</h3>
                    <p>Interface de gestion complète pour les administrateurs.</p>
                    <a href="http://localhost:${ADMIN_PORT}" class="btn" onclick="require('electron').shell.openExternal(this.href); return false;">
                        Ouvrir le Tableau de Bord
                    </a>
                </div>

                <div class="footer">
                    Logiciel développé par Kevin Bleys • Version 1.0.0
                </div>
            </body>
            </html>
            `;
            mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(successHTML)}`);
        }
    }, 15000);

    // Development tools
    if (process.env.DEBUG === '1') {
        mainWindow.webContents.openDevTools();
    }
}

function startAllServices() {
    console.log('🚀 Démarrage de tous les services...');

    // 1. BACKEND SERVICE STARTEN (PORT 3001)
    startBackendService();

    // 2. TABLET UI SERVER STARTEN (PORT 3000) 
    startTabletUIServer();

    // 3. ADMIN DASHBOARD SERVER STARTEN (PORT 3002)
    startAdminDashboardServer();
}

function startBackendService() {
    const backendPath = PATHS.backend;
    const backendServer = path.join(backendPath, 'server.js');

    console.log('📡 Contrôle backend:', backendServer);

    if (fs.existsSync(backendServer)) {
        console.log('📡 Démarrage du service backend...');

        const backendNodeModules = path.join(backendPath, 'node_modules');
        if (!fs.existsSync(backendNodeModules)) {
            console.log('📦 Installation des dépendances backend...');
            exec('npm install --production', { cwd: backendPath }, (error) => {
                if (error) {
                    console.error('❌ Erreur installation dépendances:', error);
                } else {
                    console.log('✅ Dépendances backend installées');
                    startBackendProcess();
                }
            });
        } else {
            startBackendProcess();
        }

        function startBackendProcess() {
            const backendProcess = spawn('node', ['server.js'], {
                cwd: backendPath,
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: true,
                env: { 
                    ...process.env, 
                    NODE_ENV: 'production', 
                    PORT: BACKEND_PORT.toString()
                }
            });

            backendProcess.stdout.on('data', (data) => {
                console.log('Backend:', data.toString().trim());
            });

            backendProcess.stderr.on('data', (data) => {
                console.error('Backend error:', data.toString().trim());
            });

            backendProcess.on('error', (error) => {
                console.error('❌ Erreur démarrage backend:', error);
            });

            processes.push({ name: 'Backend', process: backendProcess, port: BACKEND_PORT });
            console.log(`✅ Backend démarré sur le port ${BACKEND_PORT}`);
        }
    } else {
        console.error('❌ Serveur backend introuvable:', backendServer);
    }
}

function startTabletUIServer() {
    const tabletDistPath = path.join(PATHS.tabletUi, 'dist');
    console.log('📱 Contrôle tablet UI:', tabletDistPath);

    if (fs.existsSync(tabletDistPath)) {
        console.log('📱 Démarrage serveur tablet UI...');

        const app = express();

        // Serve static files
        app.use(express.static(tabletDistPath));

        // SPA routing support
        app.get('*', (req, res) => {
            const indexPath = path.join(tabletDistPath, 'index.html');
            if (fs.existsSync(indexPath)) {
                res.sendFile(indexPath);
            } else {
                res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Interface Tablette - Escalade</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; 
                               padding: 40px; background: #f0f0f0; }
                        .container { max-width: 600px; margin: 0 auto; 
                                   background: white; padding: 40px; border-radius: 10px; 
                                   box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .logo { font-size: 3em; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">🧗‍♀️</div>
                        <h1>Interface Tablette</h1>
                        <p>Bienvenue dans l'interface tablette du système de gestion escalade.</p>
                        <p>Cette interface est optimisée pour les écrans tactiles.</p>
                        <p><a href="http://localhost:${ADMIN_PORT}">📊 Tableau de Bord</a> | 
                           <a href="http://localhost:${BACKEND_PORT}">🔧 API Backend</a></p>
                    </div>
                </body>
                </html>
                `);
            }
        });

        const server = http.createServer(app);

        server.listen(TABLET_PORT, 'localhost', () => {
            console.log(`✅ Tablet UI démarré sur http://localhost:${TABLET_PORT}`);
        });

        server.on('error', (error) => {
            console.error('❌ Erreur tablet UI:', error);
        });

        servers.push({ name: 'Tablet UI', server, port: TABLET_PORT });
    } else {
        console.error('❌ Build tablet UI introuvable:', tabletDistPath);
        createPlaceholderServer('Tablet UI', TABLET_PORT, '🧗‍♀️', 'Interface Tablette');
    }
}

function startAdminDashboardServer() {
    const adminBuildPath = path.join(PATHS.adminDashboard, 'build');
    console.log('📊 Contrôle admin dashboard:', adminBuildPath);

    if (fs.existsSync(adminBuildPath)) {
        console.log('📊 Démarrage serveur admin dashboard...');

        const app = express();

        // Serve static files
        app.use(express.static(adminBuildPath));

        // SPA routing support
        app.get('*', (req, res) => {
            res.sendFile(path.join(adminBuildPath, 'index.html'));
        });

        const server = http.createServer(app);

        server.listen(ADMIN_PORT, 'localhost', () => {
            console.log(`✅ Admin dashboard démarré sur http://localhost:${ADMIN_PORT}`);
        });

        server.on('error', (error) => {
            console.error('❌ Erreur admin dashboard:', error);
        });

        servers.push({ name: 'Admin Dashboard', server, port: ADMIN_PORT });
    } else {
        console.error('❌ Build admin dashboard introuvable:', adminBuildPath);
        createPlaceholderServer('Admin Dashboard', ADMIN_PORT, '📊', 'Tableau de Bord Administrateur');
    }
}

function createPlaceholderServer(serviceName, port, icon, title) {
    const app = express();
    app.get('*', (req, res) => {
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${title} - En Construction</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; 
                       padding: 40px; background: #f0f0f0; }
                .container { max-width: 600px; margin: 0 auto; 
                           background: white; padding: 40px; border-radius: 10px; 
                           box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .logo { font-size: 3em; margin-bottom: 20px; }
                .btn { background: #4CAF50; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; margin: 10px; 
                      display: inline-block; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">${icon}</div>
                <h1>🚧 ${title}</h1>
                <p>Ce service est en cours de construction.</p>
                <a href="http://localhost:${BACKEND_PORT}" class="btn">🔧 API Backend</a>
                ${port !== TABLET_PORT ? `<a href="http://localhost:${TABLET_PORT}" class="btn">📱 Interface Tablette</a>` : ''}
                ${port !== ADMIN_PORT ? `<a href="http://localhost:${ADMIN_PORT}" class="btn">📊 Tableau de Bord</a>` : ''}
            </div>
        </body>
        </html>
        `);
    });

    const server = http.createServer(app);
    server.listen(port, () => {
        console.log(`✅ ${serviceName} placeholder démarré sur http://localhost:${port}`);
    });

    servers.push({ name: `${serviceName} Placeholder`, server, port });
}

function stopAllServices() {
    console.log('🛑 Arrêt de tous les services...');

    // Stop processes
    processes.forEach(({ name, process }) => {
        if (process && !process.killed) {
            console.log(`🛑 Arrêt ${name}...`);
            process.kill();
        }
    });
    processes = [];

    // Stop servers
    servers.forEach(({ name, server }) => {
        if (server) {
            console.log(`🛑 Fermeture ${name}...`);
            server.close();
        }
    });
    servers = [];
}

function createTray() {
    const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');

    if (fs.existsSync(iconPath)) {
        tray = new Tray(iconPath);

        const contextMenu = Menu.buildFromTemplate([
            { 
                label: 'Interface Tablette', 
                click: () => shell.openExternal(`http://localhost:${TABLET_PORT}`)
            },
            { 
                label: 'API Backend', 
                click: () => shell.openExternal(`http://localhost:${BACKEND_PORT}`)
            },
            { 
                label: 'Tableau de Bord Admin', 
                click: () => shell.openExternal(`http://localhost:${ADMIN_PORT}`)
            },
            { type: 'separator' },
            { 
                label: 'Afficher l\'Application', 
                click: () => {
                    if (mainWindow) {
                        mainWindow.show();
                        mainWindow.focus();
                    }
                }
            },
            { 
                label: 'Redémarrer les Services',
                click: () => {
                    stopAllServices();
                    setTimeout(() => startAllServices(), 3000);
                }
            },
            { type: 'separator' },
            { 
                label: 'Quitter', 
                click: () => app.quit()
            }
        ]);

        tray.setToolTip('Logiciel de Gestion Escalade');
        tray.setContextMenu(contextMenu);

        tray.on('double-click', () => {
            if (mainWindow) {
                mainWindow.show();
                mainWindow.focus();
            }
        });
    }
}

// Desktop Shortcuts maken met juiste poorten
function createDesktopShortcuts() {
    const os = require('os');
    const desktopPath = path.join(os.homedir(), 'Desktop');

    // Shortcut configuratie MET JUISTE POORTEN
    const shortcuts = [
        {
            name: 'Interface Tablette (Escalade)',
            url: `http://localhost:${TABLET_PORT}`,
            icon: path.join(__dirname, 'assets', 'tablet-icon.ico')
        },
        {
            name: 'Backend API (Escalade)',
            url: `http://localhost:${BACKEND_PORT}`, 
            icon: path.join(__dirname, 'assets', 'icon.ico')
        },
        {
            name: 'Tableau de Bord Admin (Escalade)',
            url: `http://localhost:${ADMIN_PORT}`,
            icon: path.join(__dirname, 'assets', 'admin-icon.ico')
        }
    ];

    shortcuts.forEach(shortcut => {
        const shortcutPath = path.join(desktopPath, `${shortcut.name}.url`);

        const urlContent = `[InternetShortcut]
URL=${shortcut.url}
IconFile=${shortcut.icon}
IconIndex=0
`;

        try {
            fs.writeFileSync(shortcutPath, urlContent);
            console.log(`✅ Desktop shortcut créé: ${shortcut.name} → ${shortcut.url}`);
        } catch (error) {
            console.error(`❌ Erreur création shortcut ${shortcut.name}:`, error.message);
        }
    });
}
