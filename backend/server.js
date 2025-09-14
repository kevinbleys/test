const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { getMembers, getSeasonInfo } = require('./sync-service');

// ✅ Enhanced data manager import
let dataManager;
try {
    dataManager = require('./enhanced-data-manager');
    console.log('✅ Enhanced data manager loaded');
} catch (error) {
    console.log('⚠️ Enhanced data manager not found, using fallback');
    // Fallback functions if enhanced-data-manager doesn't exist
    dataManager = {
        logAccessAttempt: () => console.log('Access attempt logged (fallback)'),
        calculateTarif: (dateNaissance) => {
            if (!dateNaissance) return 12;
            const today = new Date();
            const birthDate = new Date(dateNaissance);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) return 8;
            if (age < 26) return 10;
            if (age >= 65) return 10;
            return 12;
        },
        getTarifCategory: (dateNaissance) => {
            if (!dateNaissance) return 'Adulte (26-64 ans)';
            const today = new Date();
            const birthDate = new Date(dateNaissance);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) return `Jeune (${age} ans)`;
            if (age < 26) return `Étudiant (${age} ans)`;
            if (age >= 65) return `Senior (${age} ans)`;
            return `Adulte (${age} ans)`;
        }
    };
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data file paths
const presencesFile = path.join(__dirname, 'data', 'presences.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize presences file if it doesn't exist
if (!fs.existsSync(presencesFile)) {
    fs.writeFileSync(presencesFile, JSON.stringify([], null, 2));
}

// Helper functions
function readPresences() {
    try {
        if (fs.existsSync(presencesFile)) {
            const data = fs.readFileSync(presencesFile, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('Error reading presences:', error);
        return [];
    }
}

function writePresences(presences) {
    try {
        fs.writeFileSync(presencesFile, JSON.stringify(presences, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing presences:', error);
        return false;
    }
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// ✅ EXISTING ROUTES (preserved from your original)

// Basic health check
app.get('/', (req, res) => {
    res.json({ message: 'Climbing club backend is running!' });
});

// Get members (from sync-service)
app.get('/members', (req, res) => {
    try {
        const members = getMembers();
        res.json({ success: true, members, count: members.length });
    } catch (error) {
        console.error('Error getting members:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la récupération des membres' });
    }
});

// Get season info
app.get('/season-info', (req, res) => {
    try {
        const seasonInfo = getSeasonInfo();
        res.json({ success: true, ...seasonInfo });
    } catch (error) {
        console.error('Error getting season info:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la récupération des informations' });
    }
});

// ✅ ORIGINAL member check (preserved)
app.get('/members/check', async (req, res) => {
    const { nom, prenom } = req.query;

    if (!nom || !prenom) {
        return res.status(400).json({ 
            success: false, 
            error: 'Nom et prénom sont requis' 
        });
    }

    try {
        const members = getMembers();
        const member = members.find(m => 
            m.nom?.toLowerCase().trim() === nom.toLowerCase().trim() && 
            m.prenom?.toLowerCase().trim() === prenom.toLowerCase().trim()
        );

        if (!member) {
            return res.json({
                success: false,
                error: 'Membre non trouvé dans la base de données'
            });
        }

        // Check if member has unpaid status
        const hasUnpaidStatus = member.categories?.some(cat => 
            cat.label?.toLowerCase().includes('pas') && cat.label?.toLowerCase().includes('payé')
        );

        if (hasUnpaidStatus) {
            return res.json({
                success: false,
                error: 'Votre adhésion n\'est pas encore réglée. Veuillez contacter un bénévole.',
                paymentIncomplete: true
            });
        }

        res.json({ 
            success: true, 
            message: 'Membre vérifié avec succès'
        });

    } catch (error) {
        console.error('Error in member check:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur système lors de la vérification' 
        });
    }
});

// ✅ ENHANCED member check with logging (fixed syntax)
app.get('/members/check-enhanced', async (req, res) => {
    const { nom, prenom } = req.query;

    if (!nom || !prenom) {
        return res.status(400).json({ 
            success: false, 
            error: 'Nom et prénom sont requis' 
        });
    }

    try {
        const members = getMembers();
        const member = members.find(m => 
            m.nom?.toLowerCase().trim() === nom.toLowerCase().trim() && 
            m.prenom?.toLowerCase().trim() === prenom.toLowerCase().trim()
        );

        if (!member) {
            // ✅ FIXED: Proper string escaping
            dataManager.logAccessAttempt('member_fail', nom, prenom, 'membre_non_existant', 'Member not found in database', req);

            return res.json({
                success: false,
                error: 'Membre non trouvé dans la base de données. Vérifiez l\'orthographe ou contactez un bénévole.'
            });
        }

        // Check if member has unpaid status
        const hasUnpaidStatus = member.categories?.some(cat => 
            cat.label?.toLowerCase().includes('pas') && cat.label?.toLowerCase().includes('payé')
        );

        if (hasUnpaidStatus) {
            dataManager.logAccessAttempt('member_fail', nom, prenom, 'membre_pas_encore_paye', 'Member found but payment incomplete', req);

            return res.json({
                success: false,
                error: 'Votre adhésion n\'est pas encore réglée. Veuillez contacter un bénévole à l\'accueil.',
                paymentIncomplete: true
            });
        }

        // Success
        dataManager.logAccessAttempt('member_success', nom, prenom, 'success', 'Member verified successfully', req);

        res.json({ 
            success: true, 
            message: 'Membre vérifié avec succès ! Vous pouvez accéder à l\'escalade.'
        });

    } catch (error) {
        console.error('Error in enhanced member check:', error);
        dataManager.logAccessAttempt('member_fail', nom, prenom, 'system_error', error.message, req);

        res.status(500).json({ 
            success: false, 
            error: 'Erreur système lors de la vérification. Contactez un bénévole.' 
        });
    }
});

// ✅ ORIGINAL presences creation (preserved)
app.post('/presences', (req, res) => {
    try {
        const { type, nom, prenom, dateNaissance, email, telephone, niveau, tarif, assuranceAccepted } = req.body;

        const presence = {
            id: generateId(),
            type,
            nom: nom?.trim(),
            prenom: prenom?.trim(),
            dateNaissance,
            email: email || '',
            telephone: telephone || '',
            niveau,
            tarif,
            assuranceAccepted,
            status: 'pending',
            timestamp: new Date().toISOString()
        };

        const presences = readPresences();
        presences.push(presence);

        if (writePresences(presences)) {
            res.json({
                success: true,
                presence: presence,
                message: 'Présence enregistrée avec succès'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erreur lors de l\'enregistrement'
            });
        }
    } catch (error) {
        console.error('Error creating presence:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'enregistrement'
        });
    }
});

// ✅ ENHANCED presences creation (fixed tariff calculation)
app.post('/presences-enhanced', (req, res) => {
    try {
        const { type, nom, prenom, dateNaissance, email, telephone, niveau, assuranceAccepted, isReturningVisitor } = req.body;

        // ✅ FIXED: Always calculate tariff from birth date
        const tarif = dataManager.calculateTarif(dateNaissance);
        const tarifCategory = dataManager.getTarifCategory(dateNaissance);

        console.log(`💰 Calculated tariff for ${nom} ${prenom}: ${tarif}€ (${tarifCategory})`);

        const presence = {
            id: generateId(),
            type,
            nom: nom?.trim(),
            prenom: prenom?.trim(),
            dateNaissance,
            email: email || '',
            telephone: telephone || '',
            niveau,
            tarif, // ✅ FIXED: Use calculated tariff
            tarifCategory,
            assuranceAccepted,
            status: 'pending',
            timestamp: new Date().toISOString(),
            isReturningVisitor: isReturningVisitor || false
        };

        const presences = readPresences();
        presences.push(presence);

        if (writePresences(presences)) {
            // Auto-save returning visitor data for non-members
            if (type === 'non-adherent' && dataManager.saveReturningVisitor) {
                dataManager.saveReturningVisitor({
                    nom,
                    prenom,
                    dateNaissance,
                    email: email || '',
                    telephone: telephone || '',
                    niveau,
                    tarif
                });
            }

            console.log(`✅ Presence created: ${nom} ${prenom} - ${tarif}€`);

            res.json({
                success: true,
                presence: presence,
                message: 'Présence enregistrée avec succès'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erreur lors de l\'enregistrement'
            });
        }
    } catch (error) {
        console.error('Error creating enhanced presence:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'enregistrement'
        });
    }
});

// Get presence by ID
app.get('/presences/:id', (req, res) => {
    try {
        const presences = readPresences();
        const presence = presences.find(p => p.id === req.params.id);

        if (presence) {
            res.json({ success: true, presence });
        } else {
            res.status(404).json({ success: false, error: 'Présence non trouvée' });
        }
    } catch (error) {
        console.error('Error getting presence:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Update presence status
app.post('/presences/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const presences = readPresences();
        const presenceIndex = presences.findIndex(p => p.id === req.params.id);

        if (presenceIndex >= 0) {
            presences[presenceIndex].status = status;
            presences[presenceIndex].updated_at = new Date().toISOString();

            if (writePresences(presences)) {
                console.log(`✅ Presence ${req.params.id} status updated to: ${status}`);

                res.json({
                    success: true,
                    presence: presences[presenceIndex],
                    message: 'Statut mis à jour avec succès'
                });
            } else {
                res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour' });
            }
        } else {
            res.status(404).json({ success: false, error: 'Présence non trouvée' });
        }
    } catch (error) {
        console.error('Error updating presence status:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// ✅ NEW ENHANCED ROUTES (if enhanced-data-manager exists)

// Search returning visitors
app.get('/returning-visitors/search', (req, res) => {
    const { nom, prenom, dateNaissance } = req.query;

    if (!nom || !prenom || !dateNaissance) {
        return res.status(400).json({ 
            success: false, 
            error: 'Nom, prénom et date de naissance requis' 
        });
    }

    try {
        if (dataManager.findReturningVisitor) {
            const visitor = dataManager.findReturningVisitor(nom, prenom, dateNaissance);

            if (visitor) {
                console.log(`🔄 Found returning visitor: ${nom} ${prenom} (visit #${visitor.visit_count || 1})`);

                const currentTarif = dataManager.calculateTarif(dateNaissance);
                const tarifCategory = dataManager.getTarifCategory(dateNaissance);

                res.json({
                    success: true,
                    visitor: {
                        id: visitor.id,
                        nom: visitor.nom,
                        prenom: visitor.prenom,
                        dateNaissance: visitor.dateNaissance,
                        email: visitor.email,
                        telephone: visitor.telephone,
                        lastNiveau: visitor.last_niveau,
                        currentTarif: currentTarif,
                        tarifCategory: tarifCategory,
                        visitCount: visitor.visit_count || 1,
                        firstVisit: visitor.first_visit,
                        lastVisit: visitor.last_visit
                    }
                });
            } else {
                console.log(`❌ No returning visitor found: ${nom} ${prenom}`);
                res.json({
                    success: false,
                    error: 'Aucune visite précédente trouvée pour ces informations.'
                });
            }
        } else {
            res.status(501).json({
                success: false,
                error: 'Enhanced features not available'
            });
        }
    } catch (error) {
        console.error('Error searching returning visitor:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la recherche' 
        });
    }
});

// Export access attempts
app.get('/export/access-attempts', (req, res) => {
    try {
        if (dataManager.getAccessAttempts) {
            const attempts = dataManager.getAccessAttempts();

            console.log(`📊 Exporting ${attempts.length} access attempts`);

            res.json({
                success: true,
                data: attempts,
                count: attempts.length,
                summary: {
                    total: attempts.length,
                    member_success: attempts.filter(a => a.status === 'success').length,
                    membre_non_existant: attempts.filter(a => a.status === 'membre_non_existant').length,
                    membre_pas_encore_paye: attempts.filter(a => a.status === 'membre_pas_encore_paye').length,
                    system_errors: attempts.filter(a => a.status === 'system_error').length
                }
            });
        } else {
            res.json({
                success: true,
                data: [],
                count: 0,
                message: 'Enhanced logging not available'
            });
        }
    } catch (error) {
        console.error('Error exporting access attempts:', error);
        res.status(500).json({ error: 'Erreur lors de l\'export' });
    }
});

// Export returning visitors
app.get('/export/returning-visitors', (req, res) => {
    try {
        if (dataManager.getReturningVisitors) {
            const visitors = dataManager.getReturningVisitors();

            console.log(`📊 Exporting ${visitors.length} returning visitors`);

            res.json({
                success: true,
                data: visitors,
                count: visitors.length
            });
        } else {
            res.json({
                success: true,
                data: [],
                count: 0,
                message: 'Enhanced features not available'
            });
        }
    } catch (error) {
        console.error('Error exporting returning visitors:', error);
        res.status(500).json({ error: 'Erreur lors de l\'export' });
    }
});

// Get all presences (for admin)
app.get('/presences', (req, res) => {
    try {
        const presences = readPresences();
        res.json({
            success: true,
            data: presences,
            count: presences.length
        });
    } catch (error) {
        console.error('Error getting all presences:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Backend server running on port ${PORT}`);
    console.log(`📊 Season info:`, getSeasonInfo());
    console.log(`👥 Members loaded:`, getMembers().length);
    if (dataManager.logAccessAttempt) {
        console.log('✅ Enhanced features available');
    } else {
        console.log('⚠️ Enhanced features in fallback mode');
    }
});

module.exports = app;