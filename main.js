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

  // FRANSE LOADING PAGE (VERBETERD)
  const loadingHTML = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <title>Logiciel Escalade - Chargement</title>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          margin: 0; 
          background: linear-gradient(135deg, #2E8B57 0%, #228B22 50%, #32CD32 100%);
          color: white;
        }
        .loader { 
          text-align: center; 
          background: rgba(255,255,255,0.15);
          padding: 60px 40px;
          border-radius: 25px;
          backdrop-filter: blur(15px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.2);
          max-width: 500px;
        }
        .spinner { 
          border: 5px solid rgba(255,255,255,0.3); 
          border-top: 5px solid #ffffff; 
          border-radius: 50%; 
          width: 80px; 
          height: 80px; 
          animation: spin 1.5s linear infinite; 
          margin: 0 auto 30px; 
        }
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
        h1 { 
          margin-bottom: 25px; 
          font-size: 32px;
          font-weight: 300;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .status {
          font-size: 18px;
          margin: 15px 0;
          opacity: 0.95;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        .progress {
          width: 350px;
          height: 6px;
          background: rgba(255,255,255,0.25);
          border-radius: 3px;
          margin: 25px auto;
          overflow: hidden;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #00ff87, #60efff);
          border-radius: 3px;
          animation: progress 15s ease-in-out forwards;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        @keyframes progress {
          0% { width: 0%; }
          20% { width: 30%; }
          50% { width: 60%; }
          80% { width: 85%; }
          100% { width: 100%; }
        }
        .climbing-emoji {
          font-size: 48px;
          margin-bottom: 20px;
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        .service-status {
          margin-top: 30px;
          font-size: 14px;
          opacity: 0.8;
        }
        .service-item {
          margin: 8px 0;
          padding: 8px 15px;
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          display: inline-block;
          margin: 5px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="loader">
        <div class="climbing-emoji">🧗‍♀️</div>
        <div class="spinner"></div>
        <h1>Logiciel de Gestion Escalade</h1>
        <div class="progress"><div class="progress-bar"></div></div>
        <div class="status">⚡ Démarrage des services en cours...</div>
        <div class="service-status">
          <div class="service-item">🔧 Backend API (port 3001)</div>
          <div class="service-item">📊 Tableau de bord (port 3000)</div>
          <div class="service-item">📱 Interface tablette (port 3002)</div>
        </div>
        <div class="status" style="margin-top: 30px; font-size: 16px;">
          ⏳ Initialisation complète... (15 secondes)
        </div>
        <div style="font-size: 12px; margin-top: 20px; opacity: 0.7;">
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
        <html lang="fr">
        <head>
          <title>Logiciel Escalade - Services</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; }
            .status { background: white; padding: 30px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .working { border-left: 5px solid #28a745; }
            .error { border-left: 5px solid #dc3545; }
            .warning { border-left: 5px solid #ffc107; }
            h1 { color: #2E8B57; margin-bottom: 30px; }
            .btn { display: inline-block; padding: 12px 24px; background: #007cba; color: white; text-decoration: none; border-radius: 5px; margin: 10px 10px 0 0; }
            .btn:hover { background: #005a8c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🧗‍♀️ Logiciel de Gestion Escalade</h1>
            
            <div class="status working">
              <h3>✅ Application démarrée avec succès</h3>
              <p>Le logiciel est maintenant opérationnel. Accédez aux différentes interfaces :</p>
            </div>

            <div class="status">
              <h3>📊 Tableau de Bord Administrateur</h3>
              <p>Interface de gestion complète pour les administrateurs.</p>
              <a href="http://localhost:3000" class="btn">Ouvrir le Tableau de Bord</a>
            </div>

            <div class="status">
              <h3>📱 Interface Tablette</h3>
              <p>Interface simplifiée pour les utilisateurs sur tablette.</p>
              <a href="http://localhost:3002" class="btn">Ouvrir Interface Tablette</a>
            </div>

            <div class="status">
              <h3>🔧 API Backend</h3>
              <p>Service de données et API REST.</p>
              <a href="http://localhost:3001" class="btn">Vérifier l'API</a>
            </div>

            <div style="text-align: center; margin-top: 40px; color: #666;">
              <p>Logiciel développé par Kevin Bleys • Version 1.0.0</p>
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
  
  // 1. BACKEND SERVICE STARTEN (NODE.JS)
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
    
    // Installeer eerst dependencies als ze ontbreken
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
    
    // SPA routing - toujours retourner index.html
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
    
    // SPA routing - toujours retourner index.html
    app.get('*', (req, res) => {
      const indexPath = path.join(tabletDistPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        // Si pas d'index.html, créer une page basique
        res.send(`
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <title>Interface Tablette - Escalade</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #f0f8ff; }
              .container { max-width: 600px; margin: 0 auto; }
              .welcome { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              h1 { color: #2E8B57; margin-bottom: 20px; }
              .emoji { font-size: 72px; margin: 20px 0; }
              .btn { display: inline-block; padding: 15px 30px; background: #2E8B57; color: white; text-decoration: none; border-radius: 10px; margin: 10px; font-size: 18px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="welcome">
                <div class="emoji">🧗‍♀️</div>
                <h1>Interface Tablette</h1>
                <p style="font-size: 18px; margin: 20px 0;">Bienvenue dans l'interface tablette du système de gestion escalade.</p>
                <p>Cette interface est optimisée pour les écrans tactiles.</p>
                <a href="http://localhost:3000" class="btn">📊 Tableau de Bord</a>
                <a href="http://localhost:3001" class="btn">🔧 API Backend</a>
              </div>
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
    
    // Créer un serveur de base même sans build
    const app = express();
    app.get('*', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <title>Interface Tablette - En Construction</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f8ff; }
            .message { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
            h1 { color: #2E8B57; }
          </style>
        </head>
        <body>
          <div class="message">
            <h1>🚧 Interface Tablette</h1>
            <p>L'interface tablette est en cours de construction.</p>
            <p><a href="http://localhost:3000" style="color: #2E8B57;">← Retour au Tableau de Bord</a></p>
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