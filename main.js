const { app, BrowserWindow, shell, Menu, Tray } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Globale variabelen
let mainWindow;
let processes = [];
let tray;

// Configuratie
const BACKEND_PORT = 3001;
const ADMIN_PORT = 3000;
const TABLET_PORT = 3002;

// Paths - AANGEPAST VOOR GEÏNSTALLEERDE LOCATIE
const isInstalled = process.env.NODE_ENV === 'production' || !__dirname.includes('node_modules');
const PATHS = {
  backend: path.join(__dirname, 'resources', 'app', 'backend'),
  adminDashboard: path.join(__dirname, 'resources', 'app', 'admin-dashboard'),
  tabletUi: path.join(__dirname, 'resources', 'app', 'tablet-ui')
};

console.log('🚀 Logiciel d\'Escalade - Démarrage');
console.log('Chemin d\'installation:', __dirname);
console.log('Chemins des services:', PATHS);

// App ready event
app.whenReady().then(() => {
  createWindow();
  setTimeout(() => startAllServices(), 2000); // Wacht 2 seconden
  createTray();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit app
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
      webSecurity: false  // BELANGRIJK voor local file access
    },
    autoHideMenuBar: true,
    title: 'Logiciel d\'Escalade - Démarrage en cours...'
  });

  // FRANSE LOADING PAGE
  const loadingHTML = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <title>Logiciel d'Escalade - Chargement</title>
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
          animation: progress 12s ease-in-out forwards;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        @keyframes progress {
          0% { width: 0%; }
          20% { width: 25%; }
          40% { width: 45%; }
          60% { width: 65%; }
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
        .services {
          margin-top: 20px;
          font-size: 16px;
          opacity: 0.9;
        }
        .service-item {
          margin: 8px 0;
          padding: 5px 15px;
          background: rgba(255,255,255,0.1);
          border-radius: 15px;
          display: inline-block;
          margin: 5px;
        }
      </style>
    </head>
    <body>
      <div class="loader">
        <div class="climbing-emoji">🧗‍♀️</div>
        <div class="spinner"></div>
        <h1>Logiciel de Gestion d'Escalade</h1>
        <div class="progress"><div class="progress-bar"></div></div>
        <div class="status">⚡ Démarrage des services en cours...</div>
        <div class="services">
          <div class="service-item">📊 Tableau de bord (port 3000)</div>
          <div class="service-item">📱 Interface tablette (port 3002)</div>
          <div class="service-item">🔧 API Backend (port 3001)</div>
        </div>
        <div class="status" style="margin-top: 30px; font-size: 16px;">
          ⏳ Veuillez patienter... (12 secondes)
        </div>
      </div>
    </body>
    </html>
  `;
  
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`);

  // WACHT LANGER en probeer verschillende URLs
  setTimeout(async () => {
    mainWindow.setTitle('Logiciel d\'Escalade - Tableau de Bord');
    
    // Probeer verschillende URLs
    const urlsToTry = [
      `http://localhost:${ADMIN_PORT}`,
      `http://127.0.0.1:${ADMIN_PORT}`,
      'file://' + path.join(__dirname, 'resources', 'app', 'admin-dashboard', 'build', 'index.html')
    ];
    
    let loaded = false;
    for (const url of urlsToTry) {
      if (!loaded) {
        console.log('🔄 Tentative de chargement:', url);
        try {
          await mainWindow.loadURL(url);
          loaded = true;
          console.log('✅ Chargé avec succès:', url);
          break;
        } catch (error) {
          console.log('❌ Échec:', url, error.message);
        }
      }
    }
    
    if (!loaded) {
      // Fallback naar een simpele HTML page
      const fallbackHTML = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <title>Logiciel d'Escalade - Erreur</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
            .error { background: #ffe6e6; padding: 30px; border-radius: 10px; }
            .retry { margin-top: 20px; }
            button { padding: 10px 20px; background: #007cba; color: white; border: none; border-radius: 5px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>⚠️ Problème de connexion</h2>
            <p>Le tableau de bord ne peut pas se charger automatiquement.</p>
            <div class="retry">
              <p><strong>Solutions:</strong></p>
              <p>• Ouvrez votre navigateur et allez à: <strong>http://localhost:3000</strong></p>
              <p>• Ou attendez quelques secondes et cliquez sur le bouton ci-dessous</p>
              <button onclick="window.location.reload()">🔄 Réessayer</button>
            </div>
          </div>
        </body>
        </html>
      `;
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fallbackHTML)}`);
    }
  }, 12000); // 12 seconden wachten

  // Development tools in debug mode
  if (process.env.DEBUG === '1') {
    mainWindow.webContents.openDevTools();
  }
}

function startAllServices() {
  console.log('🚀 Démarrage de tous les services...');
  
  // Backend starten
  const backendPath = PATHS.backend;
  const backendServer = path.join(backendPath, 'server.js');
  
  if (fs.existsSync(backendServer)) {
    console.log('📡 Démarrage du backend...', backendPath);
    const backendProcess = spawn('node', ['server.js'], {
      cwd: backendPath,
      stdio: ['ignore', 'ignore', 'ignore'], // Geen output in productie
      shell: true,
      detached: false,
      env: { 
        ...process.env, 
        NODE_ENV: 'production', 
        PORT: BACKEND_PORT.toString()
      }
    });
    
    backendProcess.on('error', (error) => {
      console.error('❌ Erreur backend:', error);
    });
    
    processes.push({ name: 'Backend', process: backendProcess, port: BACKEND_PORT });
    console.log('✅ Backend démarré sur le port', BACKEND_PORT);
  } else {
    console.error('❌ Serveur backend introuvable:', backendServer);
  }

  // Admin Dashboard starten (als het een build heeft)
  const adminBuildPath = path.join(PATHS.adminDashboard, 'build');
  if (fs.existsSync(adminBuildPath)) {
    console.log('📊 Service admin dashboard disponible');
    
    // Start een simple HTTP server voor de admin dashboard
    const http = require('http');
    const express = require('express');
    const app = express();
    
    app.use(express.static(adminBuildPath));
    
    const server = http.createServer(app);
    server.listen(ADMIN_PORT, 'localhost', () => {
      console.log(`✅ Admin dashboard démarré sur http://localhost:${ADMIN_PORT}`);
    });
    
    server.on('error', (error) => {
      console.error('❌ Erreur admin dashboard:', error);
    });
  }

  // Tablet UI starten (als het een dist heeft)  
  const tabletDistPath = path.join(PATHS.tabletUi, 'dist');
  if (fs.existsSync(tabletDistPath)) {
    console.log('📱 Service tablet UI disponible');
    
    // Start een simple HTTP server voor tablet UI
    const http = require('http');
    const express = require('express');
    const app = express();
    
    app.use(express.static(tabletDistPath));
    
    const server = http.createServer(app);
    server.listen(TABLET_PORT, 'localhost', () => {
      console.log(`✅ Tablet UI démarré sur http://localhost:${TABLET_PORT}`);
    });
  }
}

function stopAllServices() {
  console.log('🛑 Arrêt de tous les services...');
  processes.forEach(({ name, process }) => {
    if (process && !process.killed) {
      console.log(`🛑 Arrêt de ${name}...`);
      process.kill();
    }
  });
  processes = [];
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
          setTimeout(() => startAllServices(), 2000);
        }
      },
      { type: 'separator' },
      { 
        label: 'Quitter', 
        click: () => app.quit()
      }
    ]);
    
    tray.setToolTip('Logiciel de Gestion d\'Escalade');
    tray.setContextMenu(contextMenu);
    
    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  }
}

function isDev() {
  return process.env.NODE_ENV === 'development';
}