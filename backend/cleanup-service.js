const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const DATA_DIR = path.join(__dirname, 'data');
const LOG_FILE = path.join(DATA_DIR, 'cleanup.log');

// Logging functie
const logMessage = (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;

  console.log(logEntry.trim());

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (error) {
    console.error('Fout bij schrijven naar cleanup.log:', error);
  }
};

// Clean up old backup files
const cleanupOldBackups = () => {
  try {
    logMessage('=== CLEANUP OLD BACKUPS STARTED ===');

    if (!fs.existsSync(DATA_DIR)) {
      logMessage('Data directory does not exist, skipping cleanup');
      return { deleted: 0, kept: 0 };
    }

    const files = fs.readdirSync(DATA_DIR);

    // Filter backup files (members_backup_*.json)
    const backupFiles = files.filter(file => 
      file.startsWith('members_backup_') && file.endsWith('.json')
    );

    logMessage(`Found ${backupFiles.length} backup files`);

    if (backupFiles.length <= 5) {
      logMessage('5 or fewer backup files found, keeping all');
      return { deleted: 0, kept: backupFiles.length };
    }

    // Sort by creation time (extracted from filename timestamp)
    const backupFilesWithTime = backupFiles.map(file => {
      const timestamp = file.replace('members_backup_', '').replace('.json', '');
      return {
        filename: file,
        timestamp: parseInt(timestamp) || 0,
        path: path.join(DATA_DIR, file)
      };
    }).sort((a, b) => b.timestamp - a.timestamp); // Most recent first

    // Keep most recent 5 files, delete the rest
    const toKeep = backupFilesWithTime.slice(0, 5);
    const toDelete = backupFilesWithTime.slice(5);

    logMessage(`Keeping ${toKeep.length} most recent backup files`);
    logMessage(`Deleting ${toDelete.length} old backup files`);

    let deletedCount = 0;
    toDelete.forEach(fileInfo => {
      try {
        fs.unlinkSync(fileInfo.path);
        logMessage(`Deleted: ${fileInfo.filename}`);
        deletedCount++;
      } catch (error) {
        logMessage(`ERROR deleting ${fileInfo.filename}: ${error.message}`);
      }
    });

    logMessage(`=== CLEANUP COMPLETED: ${deletedCount} files deleted, ${toKeep.length} files kept ===`);

    return { deleted: deletedCount, kept: toKeep.length };

  } catch (error) {
    logMessage(`ERROR in cleanupOldBackups: ${error.message}`);
    return { deleted: 0, kept: 0, error: error.message };
  }
};

// Clean up old export files (keep last 10)
const cleanupOldExports = () => {
  try {
    logMessage('=== CLEANUP OLD EXPORTS STARTED ===');

    const exportsDir = path.join(DATA_DIR, 'exports');

    if (!fs.existsSync(exportsDir)) {
      logMessage('Exports directory does not exist, skipping cleanup');
      return { deleted: 0, kept: 0 };
    }

    const files = fs.readdirSync(exportsDir);

    // Filter Excel files
    const exportFiles = files.filter(file => 
      file.endsWith('.xlsx') || file.endsWith('.xls')
    );

    logMessage(`Found ${exportFiles.length} export files`);

    if (exportFiles.length <= 10) {
      logMessage('10 or fewer export files found, keeping all');
      return { deleted: 0, kept: exportFiles.length };
    }

    // Sort by modification time
    const exportFilesWithTime = exportFiles.map(file => {
      const filePath = path.join(exportsDir, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        mtime: stats.mtime,
        path: filePath
      };
    }).sort((a, b) => b.mtime - a.mtime); // Most recent first

    // Keep most recent 10 files, delete the rest
    const toKeep = exportFilesWithTime.slice(0, 10);
    const toDelete = exportFilesWithTime.slice(10);

    logMessage(`Keeping ${toKeep.length} most recent export files`);
    logMessage(`Deleting ${toDelete.length} old export files`);

    let deletedCount = 0;
    toDelete.forEach(fileInfo => {
      try {
        fs.unlinkSync(fileInfo.path);
        logMessage(`Deleted: ${fileInfo.filename}`);
        deletedCount++;
      } catch (error) {
        logMessage(`ERROR deleting ${fileInfo.filename}: ${error.message}`);
      }
    });

    logMessage(`=== EXPORT CLEANUP COMPLETED: ${deletedCount} files deleted, ${toKeep.length} files kept ===`);

    return { deleted: deletedCount, kept: toKeep.length };

  } catch (error) {
    logMessage(`ERROR in cleanupOldExports: ${error.message}`);
    return { deleted: 0, kept: 0, error: error.message };
  }
};

// Clean up old log files (keep last 30 days)
const cleanupOldLogs = () => {
  try {
    logMessage('=== CLEANUP OLD LOGS STARTED ===');

    if (!fs.existsSync(DATA_DIR)) {
      logMessage('Data directory does not exist, skipping log cleanup');
      return { deleted: 0, kept: 0 };
    }

    const files = fs.readdirSync(DATA_DIR);

    // Filter log files
    const logFiles = files.filter(file => 
      file.endsWith('.log') && file !== 'cleanup.log' // Don't delete current cleanup log
    );

    logMessage(`Found ${logFiles.length} log files (excluding cleanup.log)`);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let deletedCount = 0;
    let keptCount = 0;

    logFiles.forEach(file => {
      const filePath = path.join(DATA_DIR, file);
      try {
        const stats = fs.statSync(filePath);

        if (stats.mtime < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          logMessage(`Deleted old log: ${file}`);
          deletedCount++;
        } else {
          keptCount++;
        }
      } catch (error) {
        logMessage(`ERROR processing log file ${file}: ${error.message}`);
      }
    });

    logMessage(`=== LOG CLEANUP COMPLETED: ${deletedCount} files deleted, ${keptCount} files kept ===`);

    return { deleted: deletedCount, kept: keptCount };

  } catch (error) {
    logMessage(`ERROR in cleanupOldLogs: ${error.message}`);
    return { deleted: 0, kept: 0, error: error.message };
  }
};

// Full cleanup function
const runFullCleanup = () => {
  try {
    logMessage('=== FULL CLEANUP STARTED ===');

    const backupResults = cleanupOldBackups();
    const exportResults = cleanupOldExports();
    const logResults = cleanupOldLogs();

    const totalDeleted = backupResults.deleted + exportResults.deleted + logResults.deleted;
    const totalKept = backupResults.kept + exportResults.kept + logResults.kept;

    logMessage(`=== FULL CLEANUP COMPLETED ===`);
    logMessage(`Total files deleted: ${totalDeleted}`);
    logMessage(`Total files kept: ${totalKept}`);

    return {
      backups: backupResults,
      exports: exportResults,
      logs: logResults,
      totalDeleted,
      totalKept
    };

  } catch (error) {
    logMessage(`ERROR in runFullCleanup: ${error.message}`);
    throw error;
  }
};

module.exports = {
  cleanupOldBackups,
  cleanupOldExports,
  cleanupOldLogs,
  runFullCleanup
};