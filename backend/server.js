
// server.js - SQLite gebaseerde server voor klimzaal management
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Database configuratie
const DB_PATH = path.join(__dirname, 'database', 'climbing_club.db');

// Database connectie klasse
class DatabaseManager {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.init();
    }

    init() {
        // Zorg dat database directory bestaat
        const dbDir = path.dirname(this.dbPath);
        if (!require('fs').existsSync(dbDir)) {
            require('fs').mkdirSync(dbDir, { recursive: true });
        }
    }

    getConnection() {
        return new sqlite3.Database(this.dbPath, (err) => {
            if (err) {
                console.error('Database connection error:', err.message);
            } else {
                console.log('Connected to SQLite database');
            }
        });
    }

    async runQuery(query, params = []) {
        return new Promise((resolve, reject) => {
            const db = this.getConnection();
            db.run(query, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
                db.close();
            });
        });
    }

    async getQuery(query, params = []) {
        return new Promise((resolve, reject) => {
            const db = this.getConnection();
            db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
                db.close();
            });
        });
    }

    async allQuery(query, params = []) {
        return new Promise((resolve, reject) => {
            const db = this.getConnection();
            db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
                db.close();
            });
        });
    }
}

// Database manager instance
const dbManager = new DatabaseManager(DB_PATH);

// Database initialisatie functie
async function initializeDatabase() {
    try {
        const fs = require('fs');
        const schemaPath = path.join(__dirname, 'climbing_club.sql');

        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            const db = dbManager.getConnection();

            // Voer schema uit
            db.exec(schema, (err) => {
                if (err) {
                    console.error('Schema execution error:', err.message);
                } else {
                    console.log('Database schema initialized successfully');
                }
                db.close();
            });
        }
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// API Routes

// 1. Verificatie van bestaande niet-lid
app.post('/api/verify-non-member', async (req, res) => {
    try {
        const { nom, prenom, email } = req.body;

        // Input validatie
        if (!nom || !prenom || !email) {
            return res.status(400).json({
                success: false,
                error: 'Champs obligatoires manquants (nom, prénom, email)'
            });
        }

        console.log('Vérification non-membre:', { nom, prenom, email });

        // Query voor gebruiker zoeken (case insensitive)
        const query = `
            SELECT id, nom, prenom, email, telephone, assurance_type, niveau_escalade, 
                   date_inscription, actif, notes,
                   (SELECT COUNT(*) FROM visites WHERE member_id = non_members.id) as nombre_visites
            FROM non_members 
            WHERE LOWER(nom) = LOWER(?) 
            AND LOWER(prenom) = LOWER(?) 
            AND LOWER(email) = LOWER(?)
            AND actif = 1
        `;

        const user = await dbManager.getQuery(query, [nom, prenom, email]);

        if (user) {
            console.log('Utilisateur trouvé:', user.id);
            return res.json({
                success: true,
                userExists: true,
                userData: {
                    id: user.id,
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    telephone: user.telephone,
                    assuranceType: user.assurance_type,
                    niveauEscalade: user.niveau_escalade,
                    dateInscription: user.date_inscription,
                    nombreVisites: user.nombre_visites,
                    notes: user.notes
                }
            });
        } else {
            console.log('Utilisateur non trouvé');
            return res.json({
                success: true,
                userExists: false,
                message: 'Utilisateur non trouvé dans nos records. Veuillez procéder à une première inscription.'
            });
        }

    } catch (error) {
        console.error('Erreur vérification non-membre:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la vérification'
        });
    }
});

// 2. Ajouter nouvelle visite
app.post('/api/add-visit', async (req, res) => {
    try {
        const { userId, montant, typePaiement, notes = '' } = req.body;

        console.log('Ajout visite:', { userId, montant, typePaiement });

        // Validatie
        if (!userId || !montant || !typePaiement) {
            return res.status(400).json({
                success: false,
                error: 'Données de visite incomplètes (userId, montant, typePaiement requis)'
            });
        }

        // Controleer of gebruiker bestaat
        const userExists = await dbManager.getQuery(
            'SELECT id FROM non_members WHERE id = ? AND actif = 1',
            [userId]
        );

        if (!userExists) {
            return res.status(404).json({
                success: false,
                error: 'Utilisateur non trouvé ou inactif'
            });
        }

        // Voeg visite toe
        const query = `
            INSERT INTO visites (member_id, montant, type_paiement, notes)
            VALUES (?, ?, ?, ?)
        `;

        const result = await dbManager.runQuery(query, [userId, montant, typePaiement, notes]);

        console.log('Visite ajoutée avec ID:', result.id);

        return res.json({
            success: true,
            message: 'Visite enregistrée avec succès',
            visitId: result.id,
            visitData: {
                id: result.id,
                memberId: userId,
                montant: montant,
                typePaiement: typePaiement,
                date: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Erreur ajout visite:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de l\'ajout de la visite'
        });
    }
});

// 3. Ajouter nouveau niet-lid (eerste inschrijving)
app.post('/api/add-non-member', async (req, res) => {
    try {
        const { 
            nom, prenom, email, telephone, dateNaissance,
            assuranceType, niveauEscalade, notes = '',
            montant, typePaiement 
        } = req.body;

        console.log('Ajout nouveau non-membre:', { nom, prenom, email });

        // Validatie verplichte velden
        if (!nom || !prenom || !email || !assuranceType || !niveauEscalade) {
            return res.status(400).json({
                success: false,
                error: 'Champs obligatoires manquants (nom, prénom, email, assuranceType, niveauEscalade)'
            });
        }

        // Controleer duplicaten
        const existingUser = await dbManager.getQuery(
            'SELECT id FROM non_members WHERE LOWER(email) = LOWER(?)',
            [email]
        );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Un utilisateur avec cet email existe déjà'
            });
        }

        // Voeg nieuwe gebruiker toe
        const insertQuery = `
            INSERT INTO non_members (
                nom, prenom, email, telephone, date_naissance,
                assurance_type, niveau_escalade, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await dbManager.runQuery(insertQuery, [
            nom, prenom, email, telephone, dateNaissance,
            assuranceType, niveauEscalade, notes
        ]);

        const newUserId = result.id;
        console.log('Nouveau non-membre créé avec ID:', newUserId);

        // Voeg eerste visite toe als betaling is gedaan
        if (montant && typePaiement) {
            await dbManager.runQuery(
                'INSERT INTO visites (member_id, montant, type_paiement, notes) VALUES (?, ?, ?, ?)',
                [newUserId, montant, typePaiement, 'Première visite']
            );
            console.log('Première visite ajoutée');
        }

        return res.json({
            success: true,
            message: 'Non-membre ajouté avec succès',
            userData: {
                id: newUserId,
                nom: nom,
                prenom: prenom,
                email: email,
                telephone: telephone,
                assuranceType: assuranceType,
                niveauEscalade: niveauEscalade
            }
        });

    } catch (error) {
        console.error('Erreur ajout non-membre:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de l\'ajout du non-membre'
        });
    }
});

// 4. Haal tarief op basis van assurance type
app.get('/api/tarifs/:assuranceType', async (req, res) => {
    try {
        const { assuranceType } = req.params;

        const tarif = await dbManager.getQuery(
            `SELECT montant, description FROM tarifs 
             WHERE type_client = 'non-membre' AND assurance_type = ? AND actif = 1`,
            [assuranceType]
        );

        if (tarif) {
            return res.json({
                success: true,
                tarif: {
                    montant: tarif.montant,
                    description: tarif.description
                }
            });
        } else {
            return res.json({
                success: false,
                error: 'Tarif non trouvé pour ce type d\'assurance'
            });
        }

    } catch (error) {
        console.error('Erreur récupération tarif:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la récupération du tarif'
        });
    }
});

// 5. Statistieken voor admin (optioneel)
app.get('/api/admin/stats', async (req, res) => {
    try {
        const stats = {};

        // Nombre total de non-membres actifs
        const totalMembers = await dbManager.getQuery(
            'SELECT COUNT(*) as count FROM non_members WHERE actif = 1'
        );
        stats.totalNonMembers = totalMembers.count;

        // Nombre de visites aujourd'hui
        const todayVisits = await dbManager.getQuery(`
            SELECT COUNT(*) as count FROM visites 
            WHERE DATE(date_visite) = DATE('now')
        `);
        stats.visitesToday = todayVisits.count;

        // Revenue d'aujourd'hui
        const todayRevenue = await dbManager.getQuery(`
            SELECT COALESCE(SUM(montant), 0) as total FROM visites 
            WHERE DATE(date_visite) = DATE('now') AND statut = 'confirme'
        `);
        stats.revenueToday = todayRevenue.total;

        return res.json({
            success: true,
            stats: stats
        });

    } catch (error) {
        console.error('Erreur récupération statistiques:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la récupération des statistiques'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Server starten
async function startServer() {
    try {
        // Initialiseer database
        await initializeDatabase();

        // Start server
        app.listen(PORT, () => {
            console.log(`\n=== KLIMZAAL SERVER GESTART ===`);
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Database: ${DB_PATH}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
            console.log(`================================\n`);
        });
    } catch (error) {
        console.error('Server start error:', error);
        process.exit(1);
    }
}

// Start de server
startServer();

module.exports = app;
