const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Data file paths - aangepast voor jouw setup
const DATA_DIR = path.join(__dirname, 'data');
const ACCESS_ATTEMPTS_FILE = path.join(DATA_DIR, 'access-attempts.json');
const RETURNING_VISITORS_FILE = path.join(DATA_DIR, 'returning-visitors.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize empty JSON files if they don't exist
function initializeDataFiles() {
    if (!fs.existsSync(ACCESS_ATTEMPTS_FILE)) {
        fs.writeFileSync(ACCESS_ATTEMPTS_FILE, JSON.stringify([], null, 2));
        console.log('✅ Created access-attempts.json');
    }
    if (!fs.existsSync(RETURNING_VISITORS_FILE)) {
        fs.writeFileSync(RETURNING_VISITORS_FILE, JSON.stringify([], null, 2));
        console.log('✅ Created returning-visitors.json');
    }
}

// Read JSON file safely
function readJSONFile(filePath, defaultValue = []) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        return defaultValue;
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return defaultValue;
    }
}

// Write JSON file safely
function writeJSONFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// ✅ FEATURE 1: Log member access attempts (success + failures)
function logAccessAttempt(type, nom, prenom, status, details = null, req = null) {
    try {
        const attempts = readJSONFile(ACCESS_ATTEMPTS_FILE);

        const attempt = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('fr-FR'),
            time: new Date().toLocaleTimeString('fr-FR'),
            type, // 'member_success', 'member_fail', 'non_member'
            nom: nom.trim(),
            prenom: prenom.trim(),
            status, // 'success', 'membre_non_existant', 'membre_pas_encore_paye', 'pending', 'paid'
            details: details || '',
            ip_address: req ? (req.ip || req.connection.remoteAddress || 'unknown') : 'unknown'
        };

        attempts.push(attempt);

        // Keep only last 500 attempts to prevent file from growing too large
        if (attempts.length > 500) {
            attempts.splice(0, attempts.length - 500);
        }

        writeJSONFile(ACCESS_ATTEMPTS_FILE, attempts);
        console.log(`📝 Logged: ${type} - ${nom} ${prenom} - ${status}`);

        return attempt.id;
    } catch (error) {
        console.error('Error logging access attempt:', error);
        return null;
    }
}

// Get all access attempts for Excel export
function getAccessAttempts() {
    return readJSONFile(ACCESS_ATTEMPTS_FILE);
}

// ✅ FEATURE 2: Returning visitor management
function saveReturningVisitor(visitorData) {
    try {
        const visitors = readJSONFile(RETURNING_VISITORS_FILE);

        // Check if visitor already exists
        const existingIndex = visitors.findIndex(v => 
            v.nom.toLowerCase() === visitorData.nom.toLowerCase() &&
            v.prenom.toLowerCase() === visitorData.prenom.toLowerCase() &&
            v.dateNaissance === visitorData.dateNaissance
        );

        if (existingIndex >= 0) {
            // Update existing visitor
            visitors[existingIndex] = {
                ...visitors[existingIndex],
                email: visitorData.email || visitors[existingIndex].email,
                telephone: visitorData.telephone || visitors[existingIndex].telephone,
                last_niveau: visitorData.niveau,
                last_tarif: visitorData.tarif,
                last_visit: new Date().toISOString(),
                visit_count: (visitors[existingIndex].visit_count || 1) + 1,
                updated_at: new Date().toISOString()
            };
            console.log(`🔄 Updated returning visitor: ${visitorData.nom} ${visitorData.prenom} (visit #${visitors[existingIndex].visit_count})`);
        } else {
            // Add new visitor
            const newVisitor = {
                id: uuidv4(),
                nom: visitorData.nom.trim(),
                prenom: visitorData.prenom.trim(),
                dateNaissance: visitorData.dateNaissance,
                email: visitorData.email || '',
                telephone: visitorData.telephone || '',
                last_niveau: visitorData.niveau,
                last_tarif: visitorData.tarif,
                first_visit: new Date().toISOString(),
                last_visit: new Date().toISOString(),
                visit_count: 1,
                created_at: new Date().toISOString()
            };
            visitors.push(newVisitor);
            console.log(`✅ Added new returning visitor: ${visitorData.nom} ${visitorData.prenom}`);
        }

        return writeJSONFile(RETURNING_VISITORS_FILE, visitors);
    } catch (error) {
        console.error('Error saving returning visitor:', error);
        return false;
    }
}

// Search for returning visitor
function findReturningVisitor(nom, prenom, dateNaissance) {
    try {
        const visitors = readJSONFile(RETURNING_VISITORS_FILE);

        const visitor = visitors.find(v => 
            v.nom.toLowerCase().trim() === nom.toLowerCase().trim() &&
            v.prenom.toLowerCase().trim() === prenom.toLowerCase().trim() &&
            v.dateNaissance === dateNaissance
        );

        return visitor || null;
    } catch (error) {
        console.error('Error finding returning visitor:', error);
        return null;
    }
}

// Get all returning visitors
function getReturningVisitors() {
    return readJSONFile(RETURNING_VISITORS_FILE);
}

// ✅ Tariff calculation helper (FIXED)
function calculateTarif(dateNaissance) {
    if (!dateNaissance) return 12; // Default adult price

    try {
        const today = new Date();
        const birthDate = new Date(dateNaissance);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // Tariff logic
        if (age < 18) return 8;      // Jeune
        if (age < 26) return 10;     // Étudiant
        if (age >= 65) return 10;    // Senior
        return 12;                   // Adulte
    } catch (error) {
        console.error('Error calculating tariff:', error);
        return 12; // Default
    }
}

function getTarifCategory(dateNaissance) {
    if (!dateNaissance) return 'Adulte (26-64 ans)';

    try {
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
    } catch (error) {
        return 'Adulte';
    }
}

// Initialize on module load
initializeDataFiles();

module.exports = {
    logAccessAttempt,
    getAccessAttempts,
    saveReturningVisitor,
    findReturningVisitor,
    getReturningVisitors,
    calculateTarif,
    getTarifCategory,
    ACCESS_ATTEMPTS_FILE,
    RETURNING_VISITORS_FILE
};