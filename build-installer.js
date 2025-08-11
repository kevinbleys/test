const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');

console.log('🏗️  Logiciel d\'Escalade - Constructeur d\'installateur FRANÇAIS');
console.log('================================================================');

// Vérifier tous les répertoires et fichiers requis
const requiredPaths = [
  'assets/icon.png',
  'assets/tablet-icon.png',
  'assets/tray-icon.png',
  'assets/icon.ico',
  'main.js',
  'backend/server.js',
  'backend/package.json',
  'admin-dashboard/package.json',
  'tablet-ui/package.json'
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
  missingFiles.forEach(file => console.error(`   - ${file}`));
  console.log('');
  console.log('🔧 RÉSOUDRE LES FICHIERS MANQUANTS:');
  console.log('1. Créer les fichiers PNG dans assets/');
  console.log('2. Convertir PNG vers ICO: https://convertio.co/png-ico/');
  process.exit(1);
}

// Configuration de construction - VERSION FRANÇAISE
const buildConfig = {
  appId: 'com.escalade.logiciel-presence',
  productName: 'Logiciel d\'Escalade',
  directories: {
    output: 'dist'
  },
  files: [
    'main.js',
    'assets/**/*',
    'package.json',
    // Backend avec dépendances
    {
      from: 'backend',
      to: 'resources/app/backend',
      filter: [
        '**/*',
        '!node_modules/**/*'
      ]
    },
    // Build du tableau de bord admin
    {
      from: 'admin-dashboard/build',
      to: 'resources/app/admin-dashboard/build',
      filter: ['**/*']
    },
    {
      from: 'admin-dashboard/package.json',
      to: 'resources/app/admin-dashboard/package.json'
    },
    // Build de l'interface tablette
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
    shortcutName: 'Logiciel Escalade',
    installerIcon: 'assets/icon.ico',
    uninstallerIcon: 'assets/icon.ico',
    installerHeaderIcon: 'assets/icon.ico',
    deleteAppDataOnUninstall: false,
    runAfterFinish: false,
    artifactName: 'logiciel-escalade-${version}.${ext}',
    displayLanguageSelector: false,
    installerLanguages: ['fr_FR'],
    // Textes français pour l'installateur
    language: 'fr_FR'
  },
  publish: null
};

// Tâches de pré-construction
async function preBuildTasks() {
  console.log('📦 Exécution des tâches de pré-construction...');
  const { execSync } = require('child_process');
  
  // Vérifier si la construction du tableau de bord admin existe
  if (!fs.existsSync('admin-dashboard/build')) {
    console.log('📊 Construction du tableau de bord admin non trouvée - construction...');
    try {
      console.log('📂 Répertoire de travail:', path.resolve('admin-dashboard'));
      execSync('npm run build', { 
        cwd: 'admin-dashboard', 
        stdio: 'inherit',
        timeout: 300000 // 5 minutes timeout
      });
      console.log('✅ Construction du tableau de bord admin réussie');
    } catch (error) {
      console.error('❌ Échec de la construction du tableau de bord admin:', error.message);
      console.log('💡 Aller au répertoire admin-dashboard et exécuter: npm run build');
      return false;
    }
  } else {
    console.log('✅ Construction du tableau de bord admin existe déjà');
  }
  
  // Vérifier si la construction de l'interface tablette existe
  if (!fs.existsSync('tablet-ui/dist')) {
    console.log('📱 Construction de l\'interface tablette non trouvée - construction...');
    try {
      console.log('📂 Répertoire de travail:', path.resolve('tablet-ui'));
      execSync('npm run build', { 
        cwd: 'tablet-ui', 
        stdio: 'inherit',
        timeout: 300000 // 5 minutes timeout
      });
      console.log('✅ Construction de l\'interface tablette réussie');
    } catch (error) {
      console.error('❌ Échec de la construction de l\'interface tablette:', error.message);
      console.log('💡 Aller au répertoire tablet-ui et exécuter: npm run build');
      return false;
    }
  } else {
    console.log('✅ Construction de l\'interface tablette existe déjà');
  }
  
  // Installer les dépendances du backend si nécessaire
  const backendNodeModules = path.join('backend', 'node_modules');
  if (!fs.existsSync(backendNodeModules)) {
    console.log('📦 Installation des dépendances du backend...');
    try {
      execSync('npm install --production', { 
        cwd: 'backend', 
        stdio: 'inherit',
        timeout: 300000
      });
      console.log('✅ Dépendances du backend installées');
    } catch (error) {
      console.error('❌ Échec de l\'installation des dépendances du backend:', error.message);
      return false;
    }
  }
  
  return true;
}

// Fonction de nettoyage
async function cleanupDist() {
  console.log('🧹 Nettoyage des anciens fichiers de construction...');
  const distDir = path.join(__dirname, 'dist');
  
  if (fs.existsSync(distDir)) {
    try {
      fs.rmSync(distDir, { recursive: true, force: true });
      console.log('✅ Anciens fichiers de construction nettoyés');
    } catch (error) {
      console.log('⚠️  Impossible de supprimer tous les anciens fichiers:', error.message);
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// Démarrer le processus de construction
async function buildInstaller() {
  try {
    await cleanupDist();
    
    const preBuildSuccess = await preBuildTasks();
    if (!preBuildSuccess) {
      process.exit(1);
    }
    
    console.log('🔨 Construction de l\'installateur avec icônes FRANÇAIS...');
    console.log('⏳ Cela peut prendre 5-10 minutes...');
    console.log('');
    
    const result = await builder.build({
      targets: builder.Platform.WINDOWS.createTarget('nsis', builder.Arch.x64),
      config: buildConfig
    });
    
    console.log('');
    console.log('🎉 ✅ INSTALLATEUR FRANÇAIS CONSTRUIT AVEC SUCCÈS! ✅ 🎉');
    console.log('=======================================================');
    console.log('📂 Emplacement de l\'installateur:', path.join(__dirname, 'dist'));
    console.log('');
    
    // Rechercher le fichier .exe
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      const exeFiles = fs.readdirSync(distDir).filter(file => file.endsWith('.exe'));
      if (exeFiles.length > 0) {
        console.log('💾 Fichier d\'installation:', exeFiles[0]);
        console.log('📊 Taille du fichier:', (fs.statSync(path.join(distDir, exeFiles[0])).size / (1024*1024)).toFixed(1) + ' MB');
      }
    }
    
    console.log('');
    console.log('🎯 INSTRUCTIONS DE DÉPLOIEMENT:');
    console.log('===============================');
    console.log('1. Copier le fichier .exe vers l\'ordinateur de la salle d\'escalade');
    console.log('2. Démarrer l\'installateur EN TANT QU\'ADMINISTRATEUR');
    console.log('3. Suivre les étapes d\'installation');
    console.log('4. Les raccourcis du bureau seront créés automatiquement');
    console.log('5. Le service backend démarrera automatiquement');
    console.log('');
    console.log('📱 Disponible après l\'installation:');
    console.log('   • Tableau de Bord Admin: http://localhost:3000');
    console.log('   • Interface Tablette: http://localhost:3002'); 
    console.log('   • API Backend: http://localhost:3001');
    console.log('');
    console.log('🚀 SUCCÈS! Votre installateur français est prêt pour le déploiement!');
    
  } catch (error) {
    console.error('');
    console.error('❌ ERREUR DE CONSTRUCTION:');
    console.error('===========================');
    console.error(error.message);
    console.log('');
    console.log('🔧 SOLUTIONS POSSIBLES:');
    console.log('1. Vérifier que tous les node_modules sont installés');
    console.log('2. Construire admin-dashboard: cd admin-dashboard && npm run build');
    console.log('3. Construire tablet-ui: cd tablet-ui && npm run build');
    console.log('4. Vérifier que tous les icônes PNG et ICO existent dans assets/');
    console.log('5. Exécuter en tant qu\'Administrateur');
    console.log('6. Essayer: npm run clean && npm run build');
    
    process.exit(1);
  }
}

// Vérifier les dépendances
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
  console.error('❌ Dépendances manquantes:', missingDeps.join(', '));
  console.log('💡 Les installer avec: npm install --save-dev', missingDeps.join(' '));
  process.exit(1);
}

// Démarrer la construction
buildInstaller();