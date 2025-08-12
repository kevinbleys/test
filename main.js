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

// Configuratie
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
        <title>Logiciel Escalade - Chargement</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; margin: 0; padding: 50px; }
            .container { max-width: 600px; margin: 0 auto; }
            .icon { font-size: 64px; margin-bottom: 20px; }
            h1 { margin: 30px 0; font-size: 2.5em; }
            .status { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; }
            .service { margin: 10px 0; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 5px; }
            .loading { margin: 30px 0; font-size: 1.2em; }
            .note { margin-top: 40px; font-size: 0.9em; opacity: 0.8; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">🧗‍♀️</div>
            <h1>Logiciel de Gestion Escalade</h1>
            
            <div class="status">
                <div class="service">⚡ Démarrage des services en cours...</div>
                <div class="service">🔧 Backend API (port 3001)</div>
                <div class="service">📊 Tableau de bord (port 3000)</div>
                <div class="service">📱 Interface tablette (port 3002)</div>
            </div>
            
            <div class="loading">⏳ Initialisation complète... (15 secondes)</div>
            
            <div class="note">
                Les services démarrent automatiquement en arrière-plan
            </div>
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
      
      // Fallback naar error page
      const errorHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Logiciel Escalade - Services</title>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 40px; }
                .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { text-align: center; color: #2c3e50; margin-bottom: 40px; }
                .icon { font-size: 48px; margin-bottom: 20px; }
                .service-card { background: #ecf0f1; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3498db; }
                .btn { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
                .btn:hover { background: #2980b9; }
                .footer { text-align: center; margin-top: 40px; color: #7f8c8d; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="icon">🧗‍♀️</div>
                    <h1>Logiciel de Gestion Escalade</h1>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <h3>✅ Application démarrée avec succès</h3>
                    <p>Le logiciel est maintenant opérationnel. Accédez aux différentes interfaces :</p>
                </div>

                <div class="service-card">
                    <h3>📊 Tableau de Bord Administrateur</h3>
                    <p>Interface de gestion complète pour les administrateurs.</p>
                    <a href="http://localhost:3000" class="btn">Ouvrir le Tableau de Bord</a>
                </div>

                <div class="service-card">
                    <h3>📱 Interface Tablette</h3>
                    <p>Interface simplifiée pour les utilisateurs sur tablette.</p>
                    <a href="http://localhost:3002" class="btn">Ouvrir Interface Tablette</a>
                </div>

                <div class="service-card">
                    <h3>🔧 API Backend</h3>
                    <p>Service de données et API REST.</p>
                    <a href="http://localhost:3001" class="btn">Vérifier l'API</a>
                </div>

                <div class="footer">
                    Logiciel développé par Kevin Bleys • Version 1.0.0
                </div>
            </div>
        </body>
        </html>
      `;
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHTML)}`);
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
              <title>Interface Tablette - Escalade</title>
              <meta charset="utf-8">
              <style>
                  body { font-family: Arial, sans-serif; background: #2c3e50; color: white; text-align: center; padding: 50px; }
                  .container { max-width: 500px; margin: 0 auto; }
                  .icon { font-size: 64px; margin-bottom: 20px; }
                  h1 { color: #3498db; }
                  .btn { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="icon">🧗‍♀️</div>
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
            <title>Interface Tablette - En Construction</title>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; background: #e74c3c; color: white; text-align: center; padding: 50px; }
                .container { max-width: 500px; margin: 0 auto; }
                h1 { margin: 30px 0; }
                .btn { display: inline-block; padding: 12px 24px; background: white; color: #e74c3c; text-decoration: none; border-radius: 5px; margin: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚧 Interface Tablette</h1>
                <p>L'interface tablette est en cours de construction.</p>
                <a href="http://localhost:3000" class="btn">← Retour au Tableau de Bord</a>
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
