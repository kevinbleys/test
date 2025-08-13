const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');

console.log('🏗️ Logiciel Escalade - ULTIMATE CLEAN BUILDER');
console.log('='.repeat(50));

// Vérifier tous les répertoires et fichiers requis
const requiredPaths = [
  'assets/icon.png',
  'assets/icon.ico',
  'main.js',
  'backend/server.js',
  'backend/package.json'
];

console.log('📋 Vérification des fichiers...');
let missingFiles = [];

requiredPaths.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    missingFiles.push(filePath);
  } else {
    console.log(`✅ ${filePath}`);
  }
});

if (missingFiles.length > 0) {
  console.error('❌ Fichiers manquants:');
  missingFiles.forEach(file => console.error(` - ${file}`));
  process.exit(1);
}

// Configuration complète
const buildConfig = {
  appId: 'com.escalade.logiciel',
  productName: 'Logiciel Escalade',
  copyright: 'Copyright © 2025 Kevin Bleys',
  directories: {
    output: 'dist'
  },
  files: [
    'main.js',
    'assets/**/*',
    'create-shortcuts.js',
    'installer-script.nsh',
    'package.json',
    {
      from: 'backend',
      to: 'resources/app/backend',
      filter: [
        '**/*',
        '!node_modules/**/*'
      ]
    },
    {
      from: 'admin-dashboard/build',
      to: 'resources/app/admin-dashboard/build',
      filter: ['**/*']
    },
    {
      from: 'admin-dashboard/package.json',
      to: 'resources/app/admin-dashboard/package.json'
    },
    {
      from: 'tablet-ui/dist',
      to: 'resources/app/tablet-ui/dist',
      filter: ['**/*']
    },
    {
      from: 'tablet-ui/package.json',
      to: 'resources/app/tablet-ui/package.json'
    }
  ],
  extraResources: [
    {
      from: 'assets',
      to: 'assets'
    }
  ],
  win: {
    target: 'nsis',
    icon: 'assets/icon.ico',
    requestedExecutionLevel: 'requireAdministrator'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    shortcutName: 'Logiciel Escalade',
    artifactName: 'logiciel-escalade.${ext}',
    include: 'installer-script.nsh'
  }
};

// ULTIMATE CLEANUP FUNCTIE
async function ultimateCleanup() {
  console.log('🧹 ULTIMATE CLEANUP - verwijderen van alle cache...');
  
  const pathsToClean = [
    path.join(__dirname, 'dist'),
    path.join(__dirname, 'node_modules', '.cache'),
    path.join(require('os').homedir(), 'AppData', 'Local', 'electron-builder'),
    path.join(require('os').homedir(), 'AppData', 'Local', 'electron')
  ];
  
  for (const cleanPath of pathsToClean) {
    if (fs.existsSync(cleanPath)) {
      try {
        console.log(`🧹 Nettoyage: ${cleanPath}`);
        fs.rmSync(cleanPath, { recursive: true, force: true });
      } catch (error) {
        console.log(`⚠️ Impossible de nettoyer ${cleanPath}:`, error.message);
      }
    }
  }
  
  // Kill alle electron processen
  try {
    const { execSync } = require('child_process');
    execSync('taskkill /f /im electron.exe 2>nul', { stdio: 'ignore' });
    console.log('🛑 Processus Electron fermés');
  } catch (error) {
    // Ignore errors
  }
  
  console.log('⏳ Attendre 3 secondes...');
  await new Promise(resolve => setTimeout(resolve, 3000));
}

// Tâches de pré-construction
async function preBuildTasks() {
  console.log('📦 Vérification des builds...');
  const { execSync } = require('child_process');
  
  // Backend dependencies installeren
  if (fs.existsSync('backend/package.json')) {
    console.log('📡 Installation dépendances backend...');
    try {
      execSync('npm install --production', { cwd: 'backend', stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ Avertissement: Installation backend échouée');
    }
  }
  
  // Admin dashboard build
  if (!fs.existsSync('admin-dashboard/build') && fs.existsSync('admin-dashboard/package.json')) {
    console.log('📊 Construction admin dashboard...');
    try {
      execSync('npm install', { cwd: 'admin-dashboard', stdio: 'inherit' });
      execSync('npm run build', { cwd: 'admin-dashboard', stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ Avertissement: Build admin dashboard échoué');
    }
  }
  
  // Tablet UI build
  if (!fs.existsSync('tablet-ui/dist') && fs.existsSync('tablet-ui/package.json')) {
    console.log('📱 Construction tablet UI...');
    try {
      execSync('npm install', { cwd: 'tablet-ui', stdio: 'inherit' });
      execSync('npm run build', { cwd: 'tablet-ui', stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ Avertissement: Build tablet UI échoué');
    }
  }
  
  return true;
}

// ULTIMATE BUILD FUNCTION
async function ultimateBuild() {
  try {
    // Ultimate cleanup
    await ultimateCleanup();
    
    // Pre-build tasks
    const preBuildSuccess = await preBuildTasks();
    if (!preBuildSuccess) {
      process.exit(1);
    }
    
    console.log('🔨 ULTIMATE BUILD - Configuration complète...');
    console.log('⏳ Construction en cours (5-10 minutes)...');
    
    // Build with complete config
    await builder.build({
      targets: builder.Platform.WINDOWS.createTarget('nsis', builder.Arch.x64),
      config: buildConfig
    });
    
    console.log('');
    console.log('🎉 ✅ ULTIMATE SUCCESS! ✅ 🎉');
    console.log('='.repeat(32));
    
    // Find and show result
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      const exeFiles = fs.readdirSync(distDir).filter(file => file.endsWith('.exe'));
      if (exeFiles.length > 0) {
        console.log('💾 Fichier installer:', exeFiles[0]);
        const fileSize = (fs.statSync(path.join(distDir, exeFiles)).size / (1024*1024)).toFixed(1);
        console.log('📊 Taille:', fileSize + ' MB');
      }
    }
    
    console.log('');
    console.log('🎯 PRÊT POUR DÉPLOIEMENT:');
    console.log('='.repeat(25));
    console.log('1. Copier le .exe sur clé USB');
    console.log('2. Installer en tant qu\'Administrateur');
    console.log('3. L\'application créera automatiquement les raccourcis:');
    console.log('   - Backend API (Escalade) → http://localhost:3001');
    console.log('   - Interface Tablette (Escalade) → http://localhost:3002');
    console.log('4. Raccourci "Logiciel Escalade" créé sur le bureau');
    console.log('');
    console.log('🚀 TERMINÉ AVEC SUCCÈS!');
    
  } catch (error) {
    console.error('');
    console.error('❌ ERREUR ULTIMATE:');
    console.error('='.repeat(19));
    console.error(error.message);
    
    console.log('');
    console.log('🆘 DERNIÈRE TENTATIVE:');
    console.log('='.repeat(22));
    console.log('1. Redémarrer l\'ordinateur');
    console.log('2. Ouvrir PowerShell en tant qu\'Administrateur');
    console.log('3. cd vers le dossier du projet');
    console.log('4. npm run rebuild');
    
    process.exit(1);
  }
}

// VÉRIFICATION DES DÉPENDANCES
const deps = ['electron', 'electron-builder'];
const missing = deps.filter(dep => {
  try {
    require.resolve(dep);
    return false;
  } catch {
    return true;
  }
});

if (missing.length > 0) {
  console.error('❌ Dépendances manquantes:', missing.join(', '));
  console.log('💡 Installer avec: npm install --save-dev', missing.join(' '));
  process.exit(1);
}

// START ULTIMATE BUILD
ultimateBuild();
