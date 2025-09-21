
// scripts/init-db.js - Database initialisatie script
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '../database/climbing_club.db');
const SCHEMA_PATH = path.join(__dirname, '../climbing_club.sql');

async function initializeDatabase() {
    try {
        console.log('🚀 Starting database initialization...');

        // Zorg dat database directory bestaat
        const dbDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
            console.log('📁 Created database directory');
        }

        // Lees schema bestand
        if (!fs.existsSync(SCHEMA_PATH)) {
            throw new Error(`Schema file not found: ${SCHEMA_PATH}`);
        }

        const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
        console.log('📄 Schema file loaded');

        // Maak database verbinding
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                throw new Error(`Database connection failed: ${err.message}`);
            }
            console.log('🔗 Connected to SQLite database');
        });

        // Voer schema uit
        return new Promise((resolve, reject) => {
            db.exec(schema, (err) => {
                if (err) {
                    console.error('❌ Schema execution failed:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Schema executed successfully');

                    // Verificeer tabellen
                    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
                        if (err) {
                            reject(err);
                        } else {
                            console.log('📊 Created tables:', tables.map(t => t.name).join(', '));

                            // Tel records in sample data
                            db.get("SELECT COUNT(*) as count FROM non_members", [], (err, result) => {
                                if (err) {
                                    console.warn('⚠️ Could not count sample records:', err.message);
                                } else {
                                    console.log(`👥 Sample non-members loaded: ${result.count}`);
                                }

                                db.close((err) => {
                                    if (err) {
                                        console.error('❌ Error closing database:', err.message);
                                    } else {
                                        console.log('🔒 Database connection closed');
                                    }
                                    resolve();
                                });
                            });
                        }
                    });
                }
            });
        });

    } catch (error) {
        console.error('❌ Initialization failed:', error.message);
        process.exit(1);
    }
}

// Voer initialisatie uit als script direct wordt uitgevoerd
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('\n🎉 Database initialization completed successfully!');
            console.log(`Database location: ${DB_PATH}`);
            console.log('You can now start the server with: npm start');
        })
        .catch((error) => {
            console.error('\n💥 Initialization failed:', error);
            process.exit(1);
        });
}

module.exports = { initializeDatabase };
