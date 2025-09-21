
// scripts/migrate-json.js - Migratie van JSON naar SQLite database
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const JSON_FILE_PATH = path.join(__dirname, '../data/non-members.json');
const DB_PATH = path.join(__dirname, '../database/climbing_club.db');

class JsonToSqlMigrator {
    constructor() {
        this.db = null;
        this.migrationStats = {
            totalRecords: 0,
            successfulMigrations: 0,
            errors: 0,
            duplicates: 0
        };
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    reject(new Error(`Database connection failed: ${err.message}`));
                } else {
                    console.log('🔗 Connected to SQLite database');
                    resolve();
                }
            });
        });
    }

    async loadJsonData() {
        try {
            if (!fs.existsSync(JSON_FILE_PATH)) {
                throw new Error(`JSON file not found: ${JSON_FILE_PATH}`);
            }

            const rawData = fs.readFileSync(JSON_FILE_PATH, 'utf8');
            const jsonData = JSON.parse(rawData);

            if (!jsonData.non_members || !Array.isArray(jsonData.non_members)) {
                throw new Error('Invalid JSON structure: expected non_members array');
            }

            console.log(`📄 Loaded ${jsonData.non_members.length} records from JSON`);
            return jsonData.non_members;

        } catch (error) {
            throw new Error(`Failed to load JSON data: ${error.message}`);
        }
    }

    async checkDuplicate(email) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT id FROM non_members WHERE LOWER(email) = LOWER(?)';
            this.db.get(query, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? true : false);
                }
            });
        });
    }

    async migrateRecord(record, index) {
        try {
            // Valideer verplichte velden
            if (!record.nom || !record.prenom || !record.email) {
                throw new Error(`Record ${index + 1}: Missing required fields (nom, prenom, email)`);
            }

            // Controleer duplicaten
            const isDuplicate = await this.checkDuplicate(record.email);
            if (isDuplicate) {
                console.log(`⚠️ Record ${index + 1}: Duplicate email ${record.email} - skipping`);
                this.migrationStats.duplicates++;
                return;
            }

            // Prepare data voor SQL insert
            const memberData = {
                nom: record.nom.trim(),
                prenom: record.prenom.trim(),
                email: record.email.trim().toLowerCase(),
                telephone: record.telephone || '',
                date_naissance: record.date_naissance || null,
                assurance_type: this.mapAssuranceType(record.assurance_type),
                niveau_escalade: this.mapNiveauEscalade(record.niveau_escalade),
                date_inscription: record.date_inscription || new Date().toISOString(),
                actif: record.actif !== undefined ? record.actif : true,
                notes: record.notes || ''
            };

            // Insert non-member
            const memberId = await this.insertNonMember(memberData);
            console.log(`✅ Record ${index + 1}: Migrated ${memberData.nom} ${memberData.prenom} (ID: ${memberId})`);

            // Migreer visites als ze bestaan
            if (record.visites && Array.isArray(record.visites)) {
                await this.migrateVisites(memberId, record.visites, index + 1);
            }

            this.migrationStats.successfulMigrations++;

        } catch (error) {
            console.error(`❌ Record ${index + 1}: ${error.message}`);
            this.migrationStats.errors++;
        }
    }

    async insertNonMember(memberData) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO non_members (
                    nom, prenom, email, telephone, date_naissance,
                    assurance_type, niveau_escalade, date_inscription, actif, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            this.db.run(query, [
                memberData.nom, memberData.prenom, memberData.email,
                memberData.telephone, memberData.date_naissance,
                memberData.assurance_type, memberData.niveau_escalade,
                memberData.date_inscription, memberData.actif, memberData.notes
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    async migrateVisites(memberId, visites, recordIndex) {
        try {
            for (let i = 0; i < visites.length; i++) {
                const visite = visites[i];

                await this.insertVisite({
                    member_id: memberId,
                    date_visite: visite.date || new Date().toISOString(),
                    montant: visite.montant || 0,
                    type_paiement: this.mapPaymentType(visite.type_paiement),
                    notes: `Migrated from JSON - Record ${recordIndex}`
                });
            }
            console.log(`  📈 Migrated ${visites.length} visites for record ${recordIndex}`);
        } catch (error) {
            console.error(`  ❌ Error migrating visites for record ${recordIndex}: ${error.message}`);
        }
    }

    async insertVisite(visiteData) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO visites (member_id, date_visite, montant, type_paiement, notes)
                VALUES (?, ?, ?, ?, ?)
            `;

            this.db.run(query, [
                visiteData.member_id, visiteData.date_visite,
                visiteData.montant, visiteData.type_paiement, visiteData.notes
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    mapAssuranceType(type) {
        const mapping = {
            'base': 'base',
            'base+': 'base+',
            'base++': 'base++',
            'basic': 'base',
            'standard': 'base+',
            'premium': 'base++'
        };
        return mapping[type] || 'base';
    }

    mapNiveauEscalade(niveau) {
        const mapping = {
            'debutant': 'debutant',
            'intermediaire': 'intermediaire', 
            'avance': 'avance',
            'beginner': 'debutant',
            'intermediate': 'intermediaire',
            'advanced': 'avance',
            'expert': 'avance'
        };
        return mapping[niveau] || 'debutant';
    }

    mapPaymentType(type) {
        const mapping = {
            'carte': 'carte',
            'especes': 'especes',
            'cheque': 'cheque',
            'virement': 'virement',
            'card': 'carte',
            'cash': 'especes',
            'check': 'cheque',
            'transfer': 'virement'
        };
        return mapping[type] || 'carte';
    }

    async createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
            const backupPath = path.join(__dirname, `../backups/pre-migration-backup-${timestamp}.db`);

            // Zorg dat backups directory bestaat
            const backupDir = path.dirname(backupPath);
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            fs.copyFileSync(DB_PATH, backupPath);
            console.log(`💾 Created backup: ${path.basename(backupPath)}`);

        } catch (error) {
            console.warn(`⚠️ Backup creation failed: ${error.message}`);
        }
    }

    async migrate() {
        try {
            console.log('🚀 Starting JSON to SQL migration...');

            // Maak backup van bestaande database
            await this.createBackup();

            // Verbind met database
            await this.connect();

            // Laad JSON data
            const jsonRecords = await this.loadJsonData();
            this.migrationStats.totalRecords = jsonRecords.length;

            console.log(`\n📊 Processing ${jsonRecords.length} records...`);
            console.log('─'.repeat(60));

            // Migreer elk record
            for (let i = 0; i < jsonRecords.length; i++) {
                await this.migrateRecord(jsonRecords[i], i);
            }

            await this.printMigrationSummary();

        } catch (error) {
            console.error('💥 Migration failed:', error.message);
            throw error;
        } finally {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('❌ Error closing database:', err.message);
                    } else {
                        console.log('🔒 Database connection closed');
                    }
                });
            }
        }
    }

    async printMigrationSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total records in JSON:     ${this.migrationStats.totalRecords}`);
        console.log(`Successfully migrated:     ${this.migrationStats.successfulMigrations}`);
        console.log(`Duplicates skipped:        ${this.migrationStats.duplicates}`);
        console.log(`Errors encountered:        ${this.migrationStats.errors}`);
        console.log('─'.repeat(60));

        const successRate = ((this.migrationStats.successfulMigrations / this.migrationStats.totalRecords) * 100).toFixed(1);
        console.log(`Success rate:              ${successRate}%`);

        if (this.migrationStats.errors === 0) {
            console.log('\n🎉 Migration completed successfully!');
        } else {
            console.log('\n⚠️ Migration completed with errors. Check logs above for details.');
        }
        console.log('='.repeat(60));
    }
}

// Command line execution
async function runMigration() {
    const migrator = new JsonToSqlMigrator();

    try {
        await migrator.migrate();
        process.exit(0);
    } catch (error) {
        console.error('💥 Migration process failed:', error.message);
        process.exit(1);
    }
}

// Voer migratie uit als script direct wordt uitgevoerd
if (require.main === module) {
    console.log('🔄 JSON to SQLite Migration Tool');
    console.log('================================\n');

    // Controleer of JSON bestand bestaat
    if (!fs.existsSync(JSON_FILE_PATH)) {
        console.error(`❌ JSON file not found: ${JSON_FILE_PATH}`);
        console.log('\n💡 Please ensure your non-members.json file is in the correct location.');
        process.exit(1);
    }

    runMigration();
}

module.exports = { JsonToSqlMigrator };
