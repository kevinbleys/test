const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const LOG_FILE = path.join(DATA_DIR, 'cleanup.log');

// Logging function
const logMessage = (message) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] CLEANUP: ${message}\n`;
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.appendFileSync(LOG_FILE, logEntry);
        console.log(`CLEANUP: ${message}`);
    } catch (error) {
        console.error('Cleanup log error:', error);
    }
};

// Perform cleanup of old backup files
function performCleanup() {
    try {
        logMessage('🧹 Starting cleanup process');

        if (!fs.existsSync(DATA_DIR)) {
            logMessage('⚠️ Data directory does not exist, nothing to clean');
            return { success: true, message: 'Nothing to clean' };
        }

        const files = fs.readdirSync(DATA_DIR);
        const backupFiles = files.filter(file => file.includes('_backup_') && file.endsWith('.json'));

        logMessage(`📁 Found ${backupFiles.length} backup files`);

        let cleanedCount = 0;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep backups for 30 days

        backupFiles.forEach(file => {
            const filePath = path.join(DATA_DIR, file);
            try {
                const stats = fs.statSync(filePath);
                if (stats.mtime < cutoffDate) {
                    fs.unlinkSync(filePath);
                    logMessage(`🗑️ Deleted old backup: ${file}`);
                    cleanedCount++;
                } else {
                    logMessage(`📝 Keeping recent backup: ${file}`);
                }
            } catch (error) {
                logMessage(`❌ Error processing ${file}: ${error.message}`);
            }
        });

        logMessage(`✅ Cleanup completed: ${cleanedCount} files deleted`);

        return {
            success: true,
            message: `Cleanup completed: ${cleanedCount} old backup files deleted`,
            filesDeleted: cleanedCount,
            filesKept: backupFiles.length - cleanedCount
        };

    } catch (error) {
        logMessage(`❌ Cleanup error: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Manual cleanup function
function manualCleanup() {
    logMessage('🔧 Manual cleanup initiated');
    return performCleanup();
}

module.exports = {
    performCleanup,
    manualCleanup
};
