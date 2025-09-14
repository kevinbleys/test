const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { getMembers, getSeasonInfo } = require('./sync-service');

// ✅ Enhanced data manager import with fallback
let dataManager;
try {
    dataManager = require('./enhanced-data-manager');
    console.log('✅ Enhanced data manager loaded');
} catch (error) {
    console.log('⚠️ Enhanced data manager not found, using fallback');
    dataManager = {
        logAccessAttempt: (type, nom, prenom, status, details, req) => {
            console.log(`📝 Access attempt (fallback): ${type} - ${nom} ${prenom} - ${status}`);
        },
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
        },
        getAccessAttempts: () => [],
        getReturningVisitors: () => []
    };
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ ADMIN STATIC FILES
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Data file paths
const presencesFile = path.join(__dirname, 'data', 'presences.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize presences file
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

// ✅ ROUTES

// Health check
app.get('/', (req, res) => {
    res.json({ 
        message: 'Climbing club backend is running!',
        timestamp: new Date().toISOString(),
        features: {
            enhancedDataManager: !!dataManager.logAccessAttempt,
            membersLoaded: getMembers().length,
            adminPanel: true
        }
    });
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

        const hasUnpaidStatus = member.categories?.some(cat => {
            const label = cat.label?.toLowerCase() || '';
            return label.includes('pas') && (label.includes('payé') || label.includes('paye'));
        });

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

// ✅ ENHANCED member check with detailed debugging
app.get('/members/check-enhanced', async (req, res) => {
    const { nom, prenom } = req.query;

    if (!nom || !prenom) {
        return res.status(400).json({ 
            success: false, 
            error: 'Nom et prénom sont requis' 
        });
    }

    try {
        console.log(`🔍 Enhanced member check: "${nom}" "${prenom}"`);

        const members = getMembers();
        console.log(`📊 Total members loaded: ${members.length}`);

        // Enhanced search with debugging
        const member = members.find(m => {
            const memberNom = m.nom?.toLowerCase().trim() || '';
            const memberPrenom = m.prenom?.toLowerCase().trim() || '';
            const searchNom = nom.toLowerCase().trim();
            const searchPrenom = prenom.toLowerCase().trim();

            const match = memberNom === searchNom && memberPrenom === searchPrenom;

            // Debug for specific names
            if (searchNom.includes('bleys') || searchPrenom.includes('kevin')) {
                console.log(`🔍 Checking: "${memberNom}" "${memberPrenom}" vs "${searchNom}" "${searchPrenom}" → ${match}`);
            }

            return match;
        });

        if (!member) {
            // Show similar names for debugging
            const similarMembers = members.filter(m => {
                const memberNom = m.nom?.toLowerCase() || '';
                const memberPrenom = m.prenom?.toLowerCase() || '';
                const searchNom = nom.toLowerCase();
                const searchPrenom = prenom.toLowerCase();

                return memberNom.includes(searchNom.substring(0, 3)) || 
                       memberPrenom.includes(searchPrenom.substring(0, 3));
            }).slice(0, 5);

            console.log(`❌ Member not found. Similar:`, similarMembers.map(m => `${m.nom} ${m.prenom}`));

            dataManager.logAccessAttempt('member_fail', nom, prenom, 'membre_non_existant', 
                `Total: ${members.length}, Similar: ${similarMembers.length}`, req);

            return res.json({
                success: false,
                error: 'Membre non trouvé dans la base de données. Vérifiez l\'orthographe ou contactez un bénévole.'
            });
        }

        console.log(`✅ Member found: ${member.nom} ${member.prenom}`);

        // Payment status check
        const hasUnpaidStatus = member.categories?.some(cat => {
            const label = cat.label?.toLowerCase() || '';
            return label.includes('pas') && (label.includes('payé') || label.includes('paye'));
        });

        if (hasUnpaidStatus) {
            dataManager.logAccessAttempt('member_fail', nom, prenom, 'membre_pas_encore_paye', 
                JSON.stringify({ categories: member.categories }), req);

            return res.json({
                success: false,
                error: 'Votre adhésion n\'est pas encore réglée. Veuillez contacter un bénévole à l\'accueil.',
                paymentIncomplete: true
            });
        }

        // Success
        dataManager.logAccessAttempt('member_success', nom, prenom, 'success', 
            JSON.stringify({ memberFound: true }), req);

        res.json({ 
            success: true, 
            message: 'Membre vérifié avec succès ! Vous pouvez accéder à l\'escalade.'
        });

    } catch (error) {
        console.error('❌ Enhanced member check error:', error);
        dataManager.logAccessAttempt('member_fail', nom, prenom, 'system_error', error.message, req);

        res.status(500).json({ 
            success: false, 
            error: 'Erreur système. Contactez un bénévole.' 
        });
    }
});

// ✅ DEBUG endpoint for troubleshooting
app.get('/debug/members', (req, res) => {
    try {
        const members = getMembers();
        const seasonInfo = getSeasonInfo();

        // Find test members
        const testMembers = members.filter(m => {
            const fullName = `${m.nom || ''} ${m.prenom || ''}`.toLowerCase();
            return fullName.includes('bleys') || fullName.includes('kevin');
        });

        res.json({
            success: true,
            totalMembers: members.length,
            seasonInfo: seasonInfo,
            testMembers: testMembers,
            sampleMembers: members.slice(0, 5).map(m => ({
                nom: m.nom,
                prenom: m.prenom,
                categories: m.categories?.map(c => c.label)
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ ORIGINAL presence creation
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

// ✅ ENHANCED presence creation with FIXED tariff calculation
app.post('/presences-enhanced', (req, res) => {
    try {
        const { type, nom, prenom, dateNaissance, email, telephone, niveau, assuranceAccepted, isReturningVisitor } = req.body;

        // ✅ ALWAYS calculate tariff from birthdate
        const tarif = dataManager.calculateTarif(dateNaissance);
        const tarifCategory = dataManager.getTarifCategory(dateNaissance);

        console.log(`💰 Enhanced presence - Calculated tariff for ${nom} ${prenom}: ${tarif}€ (${tarifCategory})`);

        const presence = {
            id: generateId(),
            type,
            nom: nom?.trim(),
            prenom: prenom?.trim(),
            dateNaissance,
            email: email || '',
            telephone: telephone || '',
            niveau,
            tarif, // ✅ FIXED: Always use calculated tariff
            tarifCategory,
            assuranceAccepted,
            status: 'pending',
            timestamp: new Date().toISOString(),
            isReturningVisitor: isReturningVisitor || false
        };

        const presences = readPresences();
        presences.push(presence);

        if (writePresences(presences)) {
            // Auto-save returning visitor
            if (type === 'non-adherent' && dataManager.saveReturningVisitor && !isReturningVisitor) {
                dataManager.saveReturningVisitor({
                    nom, prenom, dateNaissance,
                    email: email || '', telephone: telephone || '',
                    niveau, tarif
                });
            }

            console.log(`✅ Enhanced presence created: ${nom} ${prenom} - ${tarif}€`);

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

// ✅ RETURNING VISITORS routes
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
                const currentTarif = dataManager.calculateTarif(dateNaissance);
                const tarifCategory = dataManager.getTarifCategory(dateNaissance);

                res.json({
                    success: true,
                    visitor: {
                        ...visitor,
                        currentTarif,
                        tarifCategory
                    }
                });
            } else {
                res.json({
                    success: false,
                    error: 'Aucune visite précédente trouvée'
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

// ✅ ADMIN API routes
app.get('/admin/api/presences', (req, res) => {
    try {
        const presences = readPresences();
        res.json({
            success: true,
            data: presences,
            count: presences.length
        });
    } catch (error) {
        console.error('Error getting presences for admin:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

app.post('/admin/api/presences/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const presences = readPresences();
        const presenceIndex = presences.findIndex(p => p.id === id);

        if (presenceIndex >= 0) {
            presences[presenceIndex].status = status;
            presences[presenceIndex].updated_at = new Date().toISOString();
            presences[presenceIndex].updated_by = 'admin';

            if (writePresences(presences)) {
                console.log(`✅ Admin updated presence ${id} status to: ${status}`);
                res.json({
                    success: true,
                    presence: presences[presenceIndex]
                });
            } else {
                res.status(500).json({ success: false, error: 'Erreur sauvegarde' });
            }
        } else {
            res.status(404).json({ success: false, error: 'Présence non trouvée' });
        }
    } catch (error) {
        console.error('Error updating presence from admin:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Export access attempts
app.get('/export/access-attempts', (req, res) => {
    try {
        if (dataManager.getAccessAttempts) {
            const attempts = dataManager.getAccessAttempts();
            res.json({
                success: true,
                data: attempts,
                count: attempts.length
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
        res.status(500).json({ error: 'Erreur export' });
    }
});

// Get all members
app.get('/members', (req, res) => {
    try {
        const members = getMembers();
        res.json({ success: true, members, count: members.length });
    } catch (error) {
        console.error('Error getting members:', error);
        res.status(500).json({ success: false, error: 'Erreur membres' });
    }
});

// Get season info
app.get('/season-info', (req, res) => {
    try {
        const seasonInfo = getSeasonInfo();
        res.json({ success: true, ...seasonInfo });
    } catch (error) {
        console.error('Error getting season info:', error);
        res.status(500).json({ success: false, error: 'Erreur saison' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Backend server running on port ${PORT}`);
    console.log(`📊 Members loaded: ${getMembers().length}`);
    console.log(`✅ Enhanced features: ${!!dataManager.logAccessAttempt ? 'Available' : 'Fallback mode'}`);
    console.log(`🔗 Admin panel: http://localhost:${PORT}/admin`);
    console.log(`🔗 Debug members: http://localhost:${PORT}/debug/members`);
});

module.exports = app;