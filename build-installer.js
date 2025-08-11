const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');

console.log('🏗️  Klimzaal Presence Management - PNG Installer Builder');
console.log('=============================================================');

// Controleer alle vereiste directories en bestanden - NU MET PNG!
const requiredPaths = [
  'assets/icon.png',           // VERANDERD van .ico naar .png
  'assets/tablet-icon.png',    // VERANDERD van .ico naar .png
  'assets/tray-icon.png',      // VERANDERD van .ico naar .png
  'main.js',
  'backend/server.js',
  'backend/package.json',
  'admin-dashboard/package.json',
  'tablet-ui/package.json'
];

console.log('📋 Bestandencheck (PNG versie)...');
let missingFiles = [];

requiredPaths.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    missingFiles.push(filePath);
  } else {
    console.log(`✅ ${filePath}`);
  }
});

if (missingFiles.length > 0) {
  console.error('❌ Ontbrekende PNG bestanden:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  console.log('');
  console.log('🔧 ONTBREKENDE PNG BESTANDEN OPLOSSEN:');
  console.log('1. Maak PNG bestanden aan in assets/ folder:');
  console.log('   • icon.png (256x256 of groter)');
  console.log('   • tablet-icon.png (256x256 of groter)'); 
  console.log('   • tray-icon.png (32x32 of groter)');
  console.log('2. Of converteer je ICO bestanden naar PNG via:');
  console.log('   https://convertio.co/ico-png/');
  console.log('');
  console.log('💡 TIP: Je kunt ook tijdelijk zonder iconen bouwen door');
  console.log('   de icon-regels uit package.json te verwijderen.');
  process.exit(1);
}

// Build configuratie - MET PNG ICONEN
const buildConfig = {
  appId: 'com.klimzaal.presence-management',
  productName: 'Klimzaal Presence Management',
  directories: {
    output: 'dist'
  },
  files: [
    'main.js',
    'assets/**/*',
    'package.json',
    // Backend inclusief dependencies
    {
      from: 'backend',
      to: 'backend', 
      filter: [
        '**/*',
        '!node_modules/**/*'  // Exclude node_modules - will be reinstalled
      ]
    },
    // Admin dashboard build
    {
      from: 'admin-dashboard/build',
      to: 'admin-dashboard/build',
      filter: ['**/*']
    },
    {
      from: 'admin-dashboard/package.json',
      to: 'admin-dashboard/package.json'
    },
    // Tablet UI build
    {
      from: 'tablet-ui/dist', 
      to: 'tablet-ui/dist',
      filter: ['**/*']
    },
    {
      from: 'tablet-ui/package.json',
      to: 'tablet-ui/package.json'
    }
  ],
  win: {
    target: {
      target: 'nsis',
      arch: ['x64']
    },
    icon: 'assets/icon.png',  // PNG IN PLAATS VAN ICO
    requestedExecutionLevel: 'requireAdministrator'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Klimzaal Admin',
    installerIcon: 'assets/icon.png',         // PNG
    uninstallerIcon: 'assets/icon.png',       // PNG
    installerHeaderIcon: 'assets/icon.png',   // PNG
    deleteAppDataOnUninstall: false,
    runAfterFinish: true,
    include: 'installer-script.nsh',
    artifactName: 'Klimzaal-Presence-Management-Setup-${version}.${ext}',
    displayLanguageSelector: false,
    installerLanguages: ['nl_NL', 'en_US']
  },
  publish: null
};

// Pre-build checks en taken
async function preBuildTasks() {
  console.log('📦 Pre-build taken uitvoeren...');
  const { execSync } = require('child_process');
  
  // Controleer of admin-dashboard build bestaat
  if (!fs.existsSync('admin-dashboard/build')) {
    console.log('📊 Admin dashboard build niet gevonden - bouwen...');
    try {
      execSync('npm run build', { 
        cwd: 'admin-dashboard', 
        stdio: 'inherit' 
      });
    } catch (error) {
      console.error('❌ Admin dashboard build gefaald:', error.message);
      console.log('💡 Ga naar admin-dashboard map en run: npm run build');
      return false;
    }
  }
  
  // Controleer of tablet-ui build bestaat  
  if (!fs.existsSync('tablet-ui/dist')) {
    console.log('📱 Tablet UI build niet gevonden - bouwen...');
    try {
      execSync('npm run build', { 
        cwd: 'tablet-ui', 
        stdio: 'inherit' 
      });
    } catch (error) {
      console.error('❌ Tablet UI build gefaald:', error.message);
      console.log('💡 Ga naar tablet-ui map en run: npm run build');
      return false;
    }
  }
  
  return true;
}

// Start build proces
async function buildInstaller() {
  try {
    // Pre-build checks
    const preBuildSuccess = await preBuildTasks();
    if (!preBuildSuccess) {
      process.exit(1);
    }
    
    console.log('🔨 Installer bouwen met PNG iconen...');
    console.log('⏳ Dit kan 5-10 minuten duren...');
    console.log('');
    
    const result = await builder.build({
      targets: builder.Platform.WINDOWS.createTarget('nsis', builder.Arch.x64),
      config: buildConfig
    });
    
    console.log('');
    console.log('🎉 ✅ PNG INSTALLER SUCCESVOL GEBOUWD! ✅ 🎉');
    console.log('===================================================');
    console.log('📂 Installer locatie:', path.join(__dirname, 'dist'));
    console.log('');
    
    // Zoek de .exe file
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      const exeFiles = fs.readdirSync(distDir).filter(file => file.endsWith('.exe'));
      if (exeFiles.length > 0) {
        console.log('💾 Installer bestand:', exeFiles[0]);
        console.log('📊 Bestand grootte:', (fs.statSync(path.join(distDir, exeFiles[0])).size / (1024*1024)).toFixed(1) + ' MB');
      }
    }
    
    console.log('');
    console.log('🎯 DEPLOYMENT INSTRUCTIES:');
    console.log('==========================');
    console.log('1. Kopieer de .exe naar de klimzaalcomputer');
    console.log('2. Start de installer ALS ADMINISTRATOR');
    console.log('3. Volg de installatiestappen');
    console.log('4. Desktop shortcuts worden automatisch aangemaakt');
    console.log('5. Backend service start automatisch');
    console.log('');
    console.log('📱 Na installatie beschikbaar:');
    console.log('   • Admin Dashboard: http://localhost:3000');
    console.log('   • Tablet Interface: http://localhost:3002'); 
    console.log('   • Backend API: http://localhost:3001');
    console.log('');
    console.log('🚀 SUCCES! Je PNG installer is klaar voor deployment!');
    
  } catch (error) {
    console.error('');
    console.error('❌ BUILD FOUT:');
    console.error('===============');
    console.error(error.message);
    console.log('');
    console.log('🔧 MOGELIJKE OPLOSSINGEN:');
    console.log('1. Controleer of alle node_modules geïnstalleerd zijn');
    console.log('2. Bouw admin-dashboard: cd admin-dashboard && npm run build');
    console.log('3. Bouw tablet-ui: cd tablet-ui && npm run build');
    console.log('4. Controleer of alle PNG iconen bestaan in assets/');
    console.log('5. Run als Administrator');
    
    process.exit(1);
  }
}

// Controleer dependencies
const requiredDeps = ['electron', 'electron-builder'];
const missingDeps = requiredDeps.filter(dep => {
  try {
    require.resolve(dep);
    return false;
  } catch {
    return true;
  }
});

if (missingDeps.length > 0) {
  console.error('❌ Ontbrekende dependencies:', missingDeps.join(', '));
  console.log('💡 Installeer ze met: npm install --save-dev', missingDeps.join(' '));
  process.exit(1);
}

// Start build
buildInstaller();