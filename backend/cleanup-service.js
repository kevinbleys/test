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

// **FUNCTIE: Oude presence history opruimen**
const cleanupPresenceHistory = () => {
  try {
    logMessage('=== CLEANUP PRESENCE HISTORIEK GESTART ===');
    
    const HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
    
    if (!fs.existsSync(HISTORY_FILE)) {
      logMessage('Geen presence-history.json bestand gevonden');
      return;
    }

    const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    
    if (!Array.isArray(historyData) || historyData.length === 0) {
      logMessage('Presence historiek is leeg of ongeldig');
      return;
    }

    // **BEHOUD ALLEEN DE LAATSTE 30 DAGEN**
    const KEEP_DAYS = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - KEEP_DAYS);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];

    const originalCount = historyData.length;
    const filteredHistory = historyData.filter(entry => entry.date >= cutoffDateString);
    const deletedCount = originalCount - filteredHistory.length;

    if (deletedCount === 0) {
      logMessage(`Alle ${originalCount} historiek entries worden behouden (≤ ${KEEP_DAYS} dagen)`);
      return;
    }

    // Schrijf gefilterde data terug
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(filteredHistory, null, 2));

    logMessage(`Behouden: ${filteredHistory.length} entries (laatste ${KEEP_DAYS} dagen)`);
    logMessage(`Verwijderd: ${deletedCount} entries (ouder dan ${cutoffDateString})`);
    logMessage('=== CLEANUP PRESENCE HISTORIEK BEËINDIGD ===');

  } catch (error) {
    logMessage(`FOUT BIJ PRESENCE HISTORIEK CLEANUP: ${error.message}`);
  }
};

// **FUNCTIE: Log bestanden opruimen**
const cleanupLogFiles = () => {
  try {
    logMessage('=== CLEANUP LOG BESTANDEN GESTART ===');
    
    const logFiles = ['sync.log', 'cleanup.log'];
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
  cleanupPresenceHistory();
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
