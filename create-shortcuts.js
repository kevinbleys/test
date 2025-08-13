const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔗 Desktop Shortcuts Creation - CORRECTE POORTEN');
console.log('='.repeat(50));

// Shortcut configuratie - MET JUISTE POORTEN
const shortcuts = [
  {
    name: 'Backend API (Escalade)',
    url: 'http://localhost:3001', // Backend API
    icon: path.join(__dirname, 'assets', 'icon.ico')
  },
  {
    name: 'Interface Tablette (Escalade)', 
    url: 'http://localhost:3002', // Tablet interface
    icon: path.join(__dirname, 'assets', 'icon.ico')
  }
];

// Windows shortcut (.url) aanmaken
function createWindowsShortcut(name, url, iconPath) {
  const desktopPath = path.join(os.homedir(), 'Desktop');
  const shortcutPath = path.join(desktopPath, `${name}.url`);
  
  const urlContent = `[InternetShortcut]
URL=${url}
IconFile=${iconPath}
IconIndex=0
`;

  try {
    fs.writeFileSync(shortcutPath, urlContent);
    console.log(`✅ Shortcut créé: ${name} → ${url}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur shortcut ${name}:`, error.message);
    return false;
  }
}

// Maak shortcuts aan
let successCount = 0;

console.log('📍 Configuration des ports:');
console.log(' • Backend API: http://localhost:3001');
console.log(' • Interface Tablette: http://localhost:3002'); 
console.log(' • Admin Dashboard (dans l\'app): http://localhost:3000');
console.log('');

for (const shortcut of shortcuts) {
  if (createWindowsShortcut(shortcut.name, shortcut.url, shortcut.icon)) {
    successCount++;
  }
}

console.log('');
console.log(`🎯 ${successCount}/${shortcuts.length} shortcuts créés avec succès`);

if (successCount === shortcuts.length) {
  console.log('✅ Tous les raccourcis desktop sont prêts!');
  console.log('📋 Les icônes sont maintenant sur le bureau');
} else {
  console.log('⚠️ Certains shortcuts n\'ont pas pu être créés');
  console.log('💡 Essayez d\'exécuter en tant qu\'Administrateur');
}
