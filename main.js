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

// GECORRIGEERDE CONFIGURATIE
const BACKEND_PORT = 3001;
const ADMIN_PORT = 3000;
const TABLET_PORT = 3002;

// Paths voor geïnstalleerde versie
const PATHS = {
  backend: path.join(__dirname, 'resources', 'app', 'backend'),
  adminDashboard: path.join(__dirname, 'resources', 'app', 'admin-dashboard'),
  tabletUi: path.join(__dirname, 'resources', 'app', 'tablet-ui')
};

console.log('🚀 Logiciel Escalade - Démarrage complet');
console.log('Chemin installation:', __dirname);
console.log('Chemins services:', PATHS);

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

  // FRANSE LOADING PAGE
  const loadingHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Logiciel Escalade - Chargement</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          margin: 0;
          padding: 50px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .logo { font-size: 4rem; margin-bottom: 30px; }
        h1 { font-size: 2.5rem; margin-bottom: 40px; }
        .status { font-size: 1.2rem; margin: 20px 0; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 10px; }
        .loading { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        .services { text-align: left; max-width: 600px; margin: 0 auto; }
        .service { margin: 10px 0; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="logo">🧗‍♀️</div>
      <h1>Logiciel de Gestion Escalade</h1>
      
      <div class="status loading">
        ⚡ Démarrage des services en cours...
        <div class="services">
          <div class="service">🔧 Backend API (port 3001)</div>
          <div class="service">📊 Tableau de bord (port 3000)</div>
          <div class="service">📱 Interface tablette (port 3002)</div>
        </div>
      </div>
      
      <div class="status">⏳ Initialisation complète... (15 secondes)</div>
      
      <p>Les services démarrent automatiquement en arrière-plan</p>
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
          <meta charset="UTF-8">
          <title>Logiciel Escalade - Services</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
              margin: 0;
              padding: 30px;
              min-height: 100vh;
            }
            .container { max-width: 800px; margin: 0 auto; }
            .logo { font-size: 3rem; margin-bottom: 20px; }
            h1 { font-size: 2rem; margin-bottom: 30px; }
            .success { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 15px; margin-bottom: 30px; }
            .services { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
            .service {
              background: rgba(255,255,255,0.1);
              padding: 25px;
              border-radius: 15px;
              transition: transform 0.3s, background 0.3s;
            }
            .service:hover { transform: translateY(-5px); background: rgba(255,255,255,0.2); }
            .service h3 { margin-top: 0; color: #FFD700; }
            .btn {
              display: inline-block;
              background: #4CAF50;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              margin-top: 15px;
              transition: background 0.3s;
            }
            .btn:hover { background: #45a049; }
            .btn.backend { background: #2196F3; }
            .btn.backend:hover { background: #1976D2; }
            .footer { margin-top: 40px; font-size: 0.9rem; opacity: 0.8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🧗‍♀️</div>
            <h1>Logiciel de Gestion Escalade</h1>
            
            <div class="success">
              <h2>✅ Application démarrée avec succès</h2>
              <p>Le logiciel est maintenant opérationnel. Accédez aux différentes interfaces :</p>
            </div>

            <div class="services">
              <div class="service">
                <h3>📊 Tableau de Bord Administrateur</h3>
                <p>Interface de gestion complète pour les administrateurs.</p>
                <a href="http://localhost:3000" class="btn">Ouvrir le Tableau de Bord</a>
              </div>
              
              <div class="service">
                <h3>📱 Interface Tablette</h3>
                <p>Interface simplifiée pour les utilisateurs sur tablette.</p>
                <a href="http://localhost:3002" class="btn">Ouvrir Interface Tablette</a>
              </div>
              
              <div class="service">
                <h3>🔧 API Backend</h3>
                <p>Service de données et API REST.</p>
                <a href="http://localhost:3001" class="btn backend">Vérifier l'API</a>
              </div>
            </div>
            
            <div class="footer">
              Logiciel développé par Kevin Bleys • Version 1.0.0
            </div>
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
  
  // 1. BACKEND SERVICE STARTEN
  startBackendService();
  
  // 2. ADMIN DASHBOARD SERVER STARTEN
  startAdminDashboardServer();
  
  // 3. TABLET UI SERVER STARTEN 
  startTabletUIServer();
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
        console.log('Backend:', data.toString());
      });
      
      backendProcess.stderr.on('data', (data) => {
        console.error('Backend error:', data.toString());
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

function startAdminDashboardServer() {
  const adminBuildPath = path.join(PATHS.adminDashboard, 'build');
  console.log('📊 Contrôle admin dashboard:', adminBuildPath);
  
  if (fs.existsSync(adminBuildPath)) {
    console.log('📊 Démarrage serveur admin dashboard...');
    
    const app = express();
    
    // Serve static files
    app.use(express.static(adminBuildPath));
    
    // **GECORRIGEERDE SPA ROUTING - Express v4 compatible**
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
    
    // Créer een fallback server
    const app = express();
    app.get('*', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Admin Dashboard - En Construction</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f0f0f0;
              text-align: center;
              padding: 50px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 15px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚧 Admin Dashboard</h1>
            <p>L'interface administrateur est en cours de construction.</p>
            <a href="http://localhost:3001">← Vérifier l'API Backend</a>
          </div>
        </body>
        </html>
      `);
    });
    
    const server = http.createServer(app);
    server.listen(ADMIN_PORT, () => {
      console.log(`✅ Admin dashboard placeholder démarré sur http://localhost:${ADMIN_PORT}`);
    });
    
    servers.push({ name: 'Admin Dashboard Placeholder', server, port: ADMIN_PORT });
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
    
    // **GECORRIGEERDE SPA ROUTING - Express v4 compatible**
    app.get('*', (req, res) => {
      const indexPath = path.join(tabletDistPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Interface Tablette - Escalade</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 50px;
                margin: 0;
                min-height: 100vh;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 40px;
                background: rgba(0,0,0,0.3);
                border-radius: 20px;
              }
              .btn {
                display: inline-block;
                background: #4CAF50;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                margin: 10px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div style="font-size: 3rem;">🧗‍♀️</div>
              <h1>Interface Tablette</h1>
              <p>Bienvenue dans l'interface tablette du système de gestion escalade.</p>
              <p>Cette interface est optimisée pour les écrans tactiles.</p>
              
              <a href="http://localhost:3000" class="btn">📊 Tableau de Bord</a>
              <a href="http://localhost:3001" class="btn">🔧 API Backend</a>
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
    
    // Créer een serveur de base même sans build
    const app = express();
    app.get('*', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Interface Tablette - En Construction</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
              padding: 50px;
              margin: 0;
              min-height: 100vh;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 40px;
              background: rgba(0,0,0,0.3);
              border-radius: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚧 Interface Tablette</h1>
            <p>L'interface tablette est en cours de construction.</p>
            <a href="http://localhost:3000">← Retour au Tableau de Bord</a>
          </div>
        </body>
        </html>
      `);
    });
    
    const server = http.createServer(app);
    server.listen(TABLET_PORT, () => {
      console.log(`✅ Tablet UI placeholder démarré sur http://localhost:${TABLET_PORT}`);
    });
    
    servers.push({ name: 'Tablet UI Placeholder', server, port: TABLET_PORT });
  }
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
        label: 'Tableau de Bord', 
        click: () => shell.openExternal(`http://localhost:${ADMIN_PORT}`)
      },
      { 
        label: 'Interface Tablette', 
        click: () => shell.openExternal(`http://localhost:${TABLET_PORT}`)
      },
      { 
        label: 'API Backend', 
        click: () => shell.openExternal(`http://localhost:${BACKEND_PORT}`)
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

// NIEUWE FUNCTIE: Desktop Shortcuts maken
function createDesktopShortcuts() {
  const os = require('os');
  const desktopPath = path.join(os.homedir(), 'Desktop');
  
  // Shortcut configuratie
  const shortcuts = [
    {
      name: 'Backend API (Escalade)',
      url: 'http://localhost:3001',
      icon: path.join(__dirname, 'assets', 'icon.ico')
    },
    {
      name: 'Interface Tablette (Escalade)',
      url: 'http://localhost:3002', 
      icon: path.join(__dirname, 'assets', 'tablet-icon.png')
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
