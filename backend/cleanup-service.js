const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const LOG_FILE = path.join(DATA_DIR, 'cleanup.log');

// Logging functie
const logMessage = (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] CLEANUP: ${message}\n`;
  
  console.log(logEntry.trim());
  
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (error) {
    console.error('Fout bij schrijven naar cleanup log:', error);
  }
};

// **FUNCTIE: Oude backup bestanden verwijderen**
const cleanupBackupFiles = () => {
  try {
    logMessage('=== CLEANUP BACKUP BESTANDEN GESTART ===');
    
    if (!fs.existsSync(DATA_DIR)) {
      logMessage('Data directory bestaat niet');
      return;
    }

    const files = fs.readdirSync(DATA_DIR);
    const backupFiles = files.filter(file => file.includes('_backup_') && file.endsWith('.json'));
    
    if (backupFiles.length === 0) {
      logMessage('Geen backup bestanden gevonden');
      return;
    }

    // Sorteer backup bestanden op timestamp (nieuwste eerst)
    const sortedBackups = backupFiles
      .map(file => {
        const match = file.match(/_backup_(\d+)\.json$/);
        const timestamp = match ? parseInt(match[1]) : 0;
        return { file, timestamp, path: path.join(DATA_DIR, file) };
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    logMessage(`Gevonden ${sortedBackups.length} backup bestanden`);

    // **BEHOUD ALLEEN DE LAATSTE 5 BACKUPS**
    const KEEP_BACKUPS = 5;
    const toDelete = sortedBackups.slice(KEEP_BACKUPS);
    const toKeep = sortedBackups.slice(0, KEEP_BACKUPS);

    if (toDelete.length === 0) {
      logMessage(`Alle ${sortedBackups.length} backup bestanden worden behouden (≤ ${KEEP_BACKUPS})`);
      return;
    }

    logMessage(`Behouden: ${toKeep.length} backups (de ${KEEP_BACKUPS} nieuwste)`);
    toKeep.forEach(backup => {
      const date = new Date(backup.timestamp).toLocaleDateString('fr-FR');
      logMessage(`  ✓ Behouden: ${backup.file} (${date})`);
    });

    // Verwijder oude backups
    let deletedCount = 0;
    toDelete.forEach(backup => {
      try {
        fs.unlinkSync(backup.path);
        const date = new Date(backup.timestamp).toLocaleDateString('fr-FR');
        logMessage(`  🗑️  Verwijderd: ${backup.file} (${date})`);
        deletedCount++;
      } catch (error) {
        logMessage(`  ❌ Fout bij verwijderen ${backup.file}: ${error.message}`);
      }
    });

    logMessage(`CLEANUP VOLTOOID: ${deletedCount} oude backup bestanden verwijderd`);
    logMessage('=== CLEANUP BACKUP BESTANDEN BEËINDIGD ===');

  } catch (error) {
    logMessage(`FOUT BIJ CLEANUP: ${error.message}`);
  }
};

// **AANGEPASTE FUNCTIE: Presence history NIET meer automatisch opruimen**
const cleanupPresenceHistory = () => {
  logMessage('=== PRESENCE HISTORY CLEANUP OVERGESLAGEN ===');
  logMessage('Presence history wordt alleen handmatig opgeruimd na jaarlijkse Excel export');
  logMessage('Gebruik de Excel export functie voor jaarlijkse archivering');
  logMessage('=== PRESENCE HISTORY CLEANUP BEËINDIGD ===');
  
  // Geen automatische cleanup meer - alleen handmatig via Excel export
};

// **FUNCTIE: Log bestanden opruimen**
const cleanupLogFiles = () => {
  try {
    logMessage('=== CLEANUP LOG BESTANDEN GESTART ===');
    
    const logFiles = ['sync.log', 'cleanup.log', 'export.log'];
    const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB

    logFiles.forEach(logFileName => {
      const logFilePath = path.join(DATA_DIR, logFileName);
      
      if (!fs.existsSync(logFilePath)) {
        return;
      }

      const stats = fs.statSync(logFilePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      if (stats.size > MAX_LOG_SIZE) {
        // Bewaar alleen de laatste 1000 regels
        const content = fs.readFileSync(logFilePath, 'utf8');
        const lines = content.split('\n');
        const lastLines = lines.slice(-1000);
        
        fs.writeFileSync(logFilePath, lastLines.join('\n'));
        logMessage(`Log bestand verkleind: ${logFileName} (${fileSizeMB}MB → laatste 1000 regels)`);
      } else {
        logMessage(`Log bestand OK: ${logFileName} (${fileSizeMB}MB)`);
      }
    });

    logMessage('=== CLEANUP LOG BESTANDEN BEËINDIGD ===');

  } catch (error) {
    logMessage(`FOUT BIJ LOG CLEANUP: ${error.message}`);
  }
};

// **HOOFD CLEANUP FUNCTIE**
const performCleanup = () => {
  logMessage('🧹 DAGELIJKSE CLEANUP GESTART');
  
  cleanupBackupFiles();
  cleanupPresenceHistory(); // Nu alleen een log bericht
  cleanupLogFiles();
  
  logMessage('🧹 DAGELIJKSE CLEANUP VOLTOOID');
};

// **FUNCTIE: Handmatige cleanup (via API)**
const manualCleanup = () => {
  logMessage('🧹 HANDMATIGE CLEANUP GESTART');
  performCleanup();
  return {
    success: true,
    message: 'Cleanup succesvol uitgevoerd - bekijk cleanup.log voor details'
  };
};

module.exports = {
  performCleanup,
  manualCleanup,
  cleanupBackupFiles,
  cleanupPresenceHistory,
  cleanupLogFiles
};
