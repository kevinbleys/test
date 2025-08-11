const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');

console.log('🏗️  Klimzaal Presence Management - Installer Builder');
console.log('=====================================================');

// Controleer of assets directory bestaat
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log('📁 Assets directory aangemaakt');
}

// Build configuratie
const buildConfig = {
  appId: 'com.klimzaal.presence-management',
  productName: 'Klimzaal Presence Management',
  directories: {
    output: 'dist'
  },
  files: [
    'main.js',
    'backend/**/*',
    'admin-dashboard/**/*', 
    'tablet-ui/**/*',
    'assets/**/*',
    'node_modules/**/*',
    'package.json'
  ],
  extraFiles: [
    {
      from: 'backend',
      to: 'backend',
      filter: ['**/*']
    }
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
    shortcutName: 'Klimzaal Admin',
    installerIcon: 'assets/icon.ico',
    uninstallerIcon: 'assets/icon.ico',
    installerHeaderIcon: 'assets/icon.ico',
    deleteAppDataOnUninstall: false,
    runAfterFinish: false,
    include: 'installer-script.nsh',
    artifactName: '${productName}-Setup-${version}.${ext}',
    displayLanguageSelector: false
  },
  publish: null // Geen automatische publicatie
};

// Start build proces
async function buildInstaller() {
  try {
    console.log('📦 Installer bouwen...');
    console.log('⏳ Dit kan enkele minuten duren...');
    
    const result = await builder.build({
      targets: builder.Platform.WINDOWS.createTarget('nsis', builder.Arch.x64),
      config: buildConfig
    });
    
    console.log('✅ Installer succesvol gebouwd!');
    console.log('📂 Uitvoer:', path.join(__dirname, 'dist'));
    console.log('');
    console.log('🎯 Volgende stappen:');
    console.log('1. Kopieer de .exe installer naar de klimzaalcomputer');
    console.log('2. Start de installer als Administrator');
    console.log('3. Volg de installatiestappen');
    console.log('4. Desktop iconen worden automatisch aangemaakt');
    console.log('5. Service start automatisch bij herstart');
    
  } catch (error) {
    console.error('❌ Build fout:', error);
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