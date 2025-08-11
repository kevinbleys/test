const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔗 Desktop Shortcuts Aanmaken - GECORRIGEERDE POORTEN');
console.log('=====================================================');

// Shortcut configuratie - MET JUISTE POORTEN
const shortcuts = [
  {
    name: 'Klimzaal Admin Dashboard',
    url: 'http://localhost:4000',  // GECORRIGEERD: Admin dashboard op poort 4000
    icon: path.join(__dirname, 'assets', 'icon.ico')
  },
  {
    name: 'Klimzaal Tablet Interface', 
    url: 'http://localhost:4000/tablet',  // GECORRIGEERD: Tablet via admin server
    icon: path.join(__dirname, 'assets', 'tablet-icon.ico')
  },
  {
    name: 'Backend API (Dev)',
    url: 'http://localhost:3001',  // Backend API voor development
    icon: path.join(__dirname, 'assets', 'tray-icon.ico')
  }
];

// Windows shortcut (.lnk) aanmaken via PowerShell
function createWindowsShortcut(name, url, iconPath) {
  const desktopPath = path.join(os.homedir(), 'Desktop');
  const shortcutPath = path.join(desktopPath, `${name}.lnk`);
  
  // PowerShell script om URL shortcut te maken
  const psScript = `
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("${shortcutPath}")
    $Shortcut.TargetPath = "${url}"
    $Shortcut.IconLocation = "${iconPath}"
    $Shortcut.WindowStyle = 3
    $Shortcut.Save()
  `;
  
  const { execSync } = require('child_process');
  
  try {
    execSync(`powershell -Command "${psScript}"`, { stdio: 'pipe' });
    console.log(`✅ Shortcut aangemaakt: ${name} → ${url}`);
    return true;
  } catch (error) {
    console.error(`❌ Fout bij shortcut ${name}:`, error.message);
    return false;
  }
}

// Maak shortcuts aan
let successCount = 0;

console.log('📍 Poort configuratie:');
console.log('   • Admin Dashboard: http://localhost:4000');
console.log('   • Tablet Interface: http://localhost:4000/tablet'); 
console.log('   • Backend API: http://localhost:3001');
console.log('');

for (const shortcut of shortcuts) {
  if (createWindowsShortcut(shortcut.name, shortcut.url, shortcut.icon)) {
    successCount++;
  }
}

console.log('');
console.log(`🎯 ${successCount}/${shortcuts.length} shortcuts succesvol aangemaakt`);

if (successCount === shortcuts.length) {
  console.log('✅ Alle desktop shortcuts zijn klaar!');
  console.log('📋 Je kunt nu de iconen op het bureaublad vinden');
} else {
  console.log('⚠️  Sommige shortcuts konden niet worden aangemaakt');
  console.log('💡 Probeer het script als Administrator uit te voeren');
}