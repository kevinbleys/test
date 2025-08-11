const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');

console.log('🏗️  Klimzaal Presence Management - HYBRID Installer Builder');
console.log('================================================================');

// Controleer alle vereiste directories en bestanden - HYBRID VERSIE
const requiredPaths = [
  'assets/icon.png',           // Voor Electron app
  'assets/tablet-icon.png',    // Voor Electron app
  'assets/tray-icon.png',      // Voor Electron app
  'assets/icon.ico',           // Voor NSIS installer (NIEUW!)
  'main.js',
  'backend/server.js',
  'backend/package.json',
  'admin-dashboard/package.json',
  'tablet-ui/package.json'
];

console.log('📋 Bestandencheck (HYBRID versie - PNG + ICO)...');
let missingFiles = [];

requiredPaths.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    missingFiles.push(filePath);
  } else {
    console.log(`✅ ${filePath}`);
  }
});

if (missingFiles.length > 0) {
  console.error('❌ Ontbrekende bestanden:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  console.log('');
  console.log('🔧 ONTBREKENDE BESTANDEN OPLOSSEN:');
  console.log('');
  console.log('🖼️  Voor PNG bestanden (Electron app iconen):');
  console.log('   • icon.png (256x256 of groter)');
  console.log('   • tablet-icon.png (256x256 of groter)'); 
  console.log('   • tray-icon.png (32x32 of groter)');
  console.log('');
  console.log('🎯 Voor ICO bestand (NSIS installer icoon):');
  console.log('   • icon.ico (Windows ico formaat, multi-size)');
  console.log('');
  console.log('💡 SNELLE ICO CONVERSIE:');
  console.log('   1. Ga naar: https://convertio.co/png-ico/');
  console.log('   2. Upload je icon.png');
  console.log('   3. Download als icon.ico');
  console.log('   4. Plaats in assets/ folder');
  console.log('');
  console.log('⚡ OF gebruik online ICO maker:');
  console.log('   https://www.favicon-generator.org/');
  
  process.exit(1);
}

// Build configuratie - HYBRID (PNG voor app, ICO voor installer)
const buildConfig = {
  appId: 'com.escalade.logiciel-presence',
  productName: 'Logiciel d\'Escalade',  // FRANSE NAAM
  directories: {
    output: 'dist'
  },
  files: [
    'main.js',
    'assets/**/*',
    'package.json',
    // ... rest van je files
  ],
  win: {
    target: {
      target: 'nsis',
      arch: ['x64']
    },
    icon: 'assets/icon.ico',
    requestedExecutionLevel: 'requireAdministrator'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Logiciel Escalade',              // FRANSE SHORTCUT NAAM
    installerIcon: 'assets/icon.ico',
    uninstallerIcon: 'assets/icon.ico',
    installerHeaderIcon: 'assets/icon.ico',
    deleteAppDataOnUninstall: false,
    runAfterFinish: false,
    artifactName: 'logiciel-escalade-${version}.${ext}',  // FRANSE BESTANDSNAAM
    displayLanguageSelector: false,
    installerLanguages: ['fr_FR']                   // FRANSE TAAL
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
      console.log('✅ Admin dashboard build succesvol');
    } catch (error) {
      console.error('❌ Admin dashboard build gefaald:', error.message);
      console.log('💡 Ga naar admin-dashboard map en run: npm run build');
      return false;
    }
  } else {
    console.log('✅ Admin dashboard build bestaat al');
  }
  
  // Controleer of tablet-ui build bestaat  
  if (!fs.existsSync('tablet-ui/dist')) {
    console.log('📱 Tablet UI build niet gevonden - bouwen...');
    try {
      execSync('npm run build', { 
        cwd: 'tablet-ui', 
        stdio: 'inherit' 
      });
      console.log('✅ Tablet UI build succesvol');
    } catch (error) {
      console.error('❌ Tablet UI build gefaald:', error.message);
      console.log('💡 Ga naar tablet-ui map en run: npm run build');
      return false;
    }
  } else {
    console.log('✅ Tablet UI build bestaat al');
  }
  
  return true;
}

// Cleanup functie om locked bestanden te verwijderen
async function cleanupDist() {
  console.log('🧹 Opruimen oude build bestanden...');
  const distDir = path.join(__dirname, 'dist');
  
  if (fs.existsSync(distDir)) {
    try {
      // Probeer dist directory te verwijderen
      fs.rmSync(distDir, { recursive: true, force: true });
      console.log('✅ Oude build bestanden opgeruimd');
    } catch (error) {
      console.log('⚠️  Kon niet alle oude bestanden verwijderen:', error.message);
      console.log('💡 Dit is normaal als bestanden in gebruik zijn');
    }
  }
  
  // Even wachten
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// Start build proces
async function buildInstaller() {
  try {
    // Cleanup eerst
    await cleanupDist();
    
    // Pre-build checks
    const preBuildSuccess = await preBuildTasks();
    if (!preBuildSuccess) {
      process.exit(1);
    }
    
    console.log('🔨 Installer bouwen met HYBRID iconen (PNG+ICO)...');
    console.log('⏳ Dit kan 5-10 minuten duren...');
    console.log('');
    
    const result = await builder.build({
      targets: builder.Platform.WINDOWS.createTarget('nsis', builder.Arch.x64),
      config: buildConfig
    });
    
    console.log('');
    console.log('🎉 ✅ HYBRID INSTALLER SUCCESVOL GEBOUWD! ✅ 🎉');
    console.log('======================================================');
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
    console.log('🎯 ICONEN CONFIGURATIE:');
    console.log('========================');
    console.log('📱 Electron app gebruikt: PNG bestanden');
    console.log('💿 NSIS installer gebruikt: ICO bestand');
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
    console.log('🚀 SUCCES! Je HYBRID installer is klaar voor deployment!');
    
  } catch (error) {
    console.error('');
    console.error('❌ BUILD FOUT:');
    console.error('===============');
    console.error(error.message);
    console.log('');
    console.log('🔧 MOGELIJKE OPLOSSINGEN:');
    console.log('1. Controleer of icon.ico een geldig ICO bestand is');
    console.log('2. Herstart PowerShell en probeer opnieuw');
    console.log('3. Verwijder dist/ folder handmatig en probeer opnieuw');
    console.log('4. Converteer PNG naar ICO: https://convertio.co/png-ico/');
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