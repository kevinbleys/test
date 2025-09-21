
// scripts/backup-db.js - Database backup utility
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/climbing_club.db');
const BACKUP_DIR = path.join(__dirname, '../backups');

function createBackup() {
    try {
        console.log('🔄 Starting database backup...');

        // Controleer of database bestaat
        if (!fs.existsSync(DB_PATH)) {
            throw new Error('Database file not found: ' + DB_PATH);
        }

        // Maak backup directory aan als het niet bestaat
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
            console.log('📁 Created backup directory');
        }

        // Genereer backup filename met timestamp
        const timestamp = new Date().toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .split('.')[0];
        const backupFileName = `climbing_club_backup_${timestamp}.db`;
        const backupPath = path.join(BACKUP_DIR, backupFileName);

        // Kopieer database bestand
        fs.copyFileSync(DB_PATH, backupPath);

        // Verificeer backup
        const originalStats = fs.statSync(DB_PATH);
        const backupStats = fs.statSync(backupPath);

        if (originalStats.size === backupStats.size) {
            console.log('✅ Backup created successfully');
            console.log(`📄 Backup file: ${backupFileName}`);
            console.log(`📏 Size: ${Math.round(backupStats.size / 1024)} KB`);
            console.log(`📍 Location: ${backupPath}`);
        } else {
            throw new Error('Backup verification failed: size mismatch');
        }

        // Cleanup oude backups (bewaar alleen laatste 10)
        cleanupOldBackups();

        return backupPath;

    } catch (error) {
        console.error('❌ Backup failed:', error.message);
        process.exit(1);
    }
}

function cleanupOldBackups() {
    try {
        const backupFiles = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.startsWith('climbing_club_backup_') && file.endsWith('.db'))
            .map(file => ({
                name: file,
                path: path.join(BACKUP_DIR, file),
                mtime: fs.statSync(path.join(BACKUP_DIR, file)).mtime
            }))
            .sort((a, b) => b.mtime - a.mtime); // Nieuwste eerst

        // Verwijder alles behalve de laatste 10 backups
        if (backupFiles.length > 10) {
            const toDelete = backupFiles.slice(10);
            toDelete.forEach(backup => {
                fs.unlinkSync(backup.path);
                console.log(`🗑️ Removed old backup: ${backup.name}`);
            });
        }

        console.log(`📦 Total backups maintained: ${Math.min(backupFiles.length, 10)}`);

    } catch (error) {
        console.warn('⚠️ Cleanup warning:', error.message);
    }
}

function listBackups() {
    try {
        if (!fs.existsSync(BACKUP_DIR)) {
            console.log('📭 No backups directory found');
            return;
        }

        const backupFiles = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.startsWith('climbing_club_backup_') && file.endsWith('.db'))
            .map(file => {
                const filePath = path.join(BACKUP_DIR, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    size: Math.round(stats.size / 1024),
                    date: stats.mtime.toLocaleDateString(),
                    time: stats.mtime.toLocaleTimeString()
                };
            })
            .sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));

        if (backupFiles.length === 0) {
            console.log('📭 No backup files found');
            return;
        }

        console.log(`\n📋 Found ${backupFiles.length} backup(s):`);
        console.log('─'.repeat(80));
        console.log('FILENAME'.padEnd(40) + 'SIZE'.padEnd(10) + 'DATE'.padEnd(15) + 'TIME');
        console.log('─'.repeat(80));

        backupFiles.forEach(backup => {
            console.log(
                backup.name.padEnd(40) +
                `${backup.size}KB`.padEnd(10) +
                backup.date.padEnd(15) +
                backup.time
            );
        });
        console.log('─'.repeat(80));

    } catch (error) {
        console.error('❌ Error listing backups:', error.message);
    }
}

// Command line interface
if (require.main === module) {
    const command = process.argv[2];

    switch (command) {
        case 'create':
            createBackup();
            break;
        case 'list':
            listBackups();
            break;
        default:
            console.log('📖 Usage:');
            console.log('  node backup-db.js create  - Create a new backup');
            console.log('  node backup-db.js list    - List existing backups');
            break;
    }
}

module.exports = { createBackup, listBackups };
