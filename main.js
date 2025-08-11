const { app, BrowserWindow, shell, Menu, Tray } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Globale variabelen
let mainWindow;
let processes = [];
let tray;

// Configuratie - GEBASEERD OP JE STARTUP.BAT
const BACKEND_PORT = 3001;     // Backend API server
const ADMIN_PORT = 3000;       // Admin dashboard server (React default)  
const TABLET_PORT = 3002;      // Tablet interface server
const PATHS = {
  backend: path.join(__dirname, 'backend'),
  adminDashboard: path.join(__dirname, 'admin-dashboard'),
  tabletUi: path.join(__dirname, 'tablet-ui')
};

// App ready event
app.whenReady().then(() => {
  createWindow();
  startAllServices();
  createTray();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit app wanneer alle vensters gesloten zijn
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopAllServices();
    app.quit();
  }
});

// App wordt beëindigd
app.on('before-quit', () => {
  stopAllServices();
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, 'assets', 'icon.png'), // PNG BESTAND!
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    autoHideMenuBar: true,
    title: 'Klimzaal Presence Management - Opstarten...'
  });

  // Menu verwijderen in productie
  if (!isDev()) {
    mainWindow.setMenuBarVisibility(false);
  }

  // Loading page terwijl services starten
  const loadingHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Klimzaal Loading...</title>
      <style>
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          margin: 0; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .loader { 
          text-align: center; 
          background: rgba(255,255,255,0.1);
          padding: 50px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .spinner { 
          border: 4px solid rgba(255,255,255,0.3); 
          border-top: 4px solid #ffffff; 
          border-radius: 50%; 
          width: 80px; 
          height: 80px; 
          animation: spin 2s linear infinite; 
          margin: 0 auto 30px; 
        }
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
        h2 { 
          margin-bottom: 20px; 
          font-size: 28px;
          font-weight: 300;
        }
        p { 
          margin: 8px 0; 
          opacity: 0.9; 
          font-size: 16px;
        }
        .progress {
          width: 300px;
          height: 4px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
          margin: 30px auto 20px;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #00ff87, #60efff);
          border-radius: 2px;
          animation: progress 8s ease-in-out forwards;
        }
        @keyframes progress {
          0% { width: 0%; }
          25% { width: 30%; }
          50% { width: 60%; }
          75% { width: 85%; }
          100% { width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="loader">
        <div class="spinner"></div>
        <h2>🧗‍♀️ Klimzaal Presence Management</h2>
        <div class="progress"><div class="progress-bar"></div></div>
        <p>⚡ Services worden gestart...</p>
        <p>📊 Admin Dashboard (poort 3000)</p>
        <p>📱 Tablet Interface (poort 3002)</p>
        <p>🔧 Backend API (poort 3001)</p>
        <p><br>⏳ Even geduld alstublieft... (8 seconden)</p>
      </div>
    </body>
    </html>
  `;
  
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`);

  // Wacht op services en laad dan admin dashboard
  setTimeout(() => {
    mainWindow.setTitle('Klimzaal Presence Management - Admin Dashboard');
    mainWindow.loadURL(`http://localhost:${ADMIN_PORT}`);
  }, 8000); // 8 seconden om alle services te starten

  // Development tools
  if (isDev()) {
    mainWindow.webContents.openDevTools();
  }
}

function startAllServices() {
  console.log('🚀 Alle services starten...');
  
  // Start Backend (poort 3001)
  if (fs.existsSync(path.join(PATHS.backend, 'server.js'))) {
    console.log('📡 Backend starten op poort 3001...');
    const backendProcess = spawn('npm', ['start'], {
      cwd: PATHS.backend,
      stdio: isDev() ? 'inherit' : 'ignore',
      shell: true,
      env: { ...process.env, NODE_ENV: 'production', PORT: BACKEND_PORT }
    });
    processes.push({ name: 'Backend', process: backendProcess, port: BACKEND_PORT });
  }

  // Start Admin Dashboard (poort 3000) 
  if (fs.existsSync(path.join(PATHS.adminDashboard, 'package.json'))) {
    console.log('📊 Admin Dashboard starten op poort 3000...');
    const adminProcess = spawn('npm', ['start'], {
      cwd: PATHS.adminDashboard,
      stdio: isDev() ? 'inherit' : 'ignore', 
      shell: true,
      env: { ...process.env, NODE_ENV: 'production', PORT: ADMIN_PORT }
    });
    processes.push({ name: 'Admin Dashboard', process: adminProcess, port: ADMIN_PORT });
  }

  // Start Tablet UI (poort 3002 om conflict te vermijden)
  if (fs.existsSync(path.join(PATHS.tabletUi, 'package.json'))) {
    console.log('📱 Tablet UI starten op poort 3002...');
    const tabletProcess = spawn('npm', ['start'], {
      cwd: PATHS.tabletUi,
      stdio: isDev() ? 'inherit' : 'ignore',
      shell: true,
      env: { ...process.env, NODE_ENV: 'production', PORT: TABLET_PORT }
    });
    processes.push({ name: 'Tablet UI', process: tabletProcess, port: TABLET_PORT });
  }

  // Error handling voor alle processen
  processes.forEach(({ name, process }) => {
    process.on('error', (error) => {
      console.error(`❌ ${name} error:`, error);
    });
    
    process.on('exit', (code) => {
      console.log(`🛑 ${name} gestopt met code ${code}`);
    });
  });
}

function stopAllServices() {
  console.log('🛑 Alle services stoppen...');
  processes.forEach(({ name, process }) => {
    if (process && !process.killed) {
      console.log(`🛑 ${name} stoppen...`);
      process.kill();
    }
  });
  processes = [];
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png'); // PNG BESTAND!
  
  if (fs.existsSync(iconPath)) {
    tray = new Tray(iconPath);
    
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Admin Dashboard', 
        click: () => shell.openExternal(`http://localhost:${ADMIN_PORT}`)
      },
      { 
        label: 'Tablet Interface', 
        click: () => shell.openExternal(`http://localhost:${TABLET_PORT}`)
      },
      { 
        label: 'Backend API', 
        click: () => shell.openExternal(`http://localhost:${BACKEND_PORT}`)
      },
      { type: 'separator' },
      { 
        label: 'Toon App', 
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      { 
        label: 'Herstart Services',
        click: () => {
          stopAllServices();
          setTimeout(() => startAllServices(), 2000);
        }
      },
      { type: 'separator' },
      { 
        label: 'Afsluiten', 
        click: () => app.quit()
      }
    ]);
    
    tray.setToolTip('Klimzaal Presence Management');
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