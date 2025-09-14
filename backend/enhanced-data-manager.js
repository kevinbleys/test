// 📄 enhanced-data-manager.js
// JSON-based data management voor enhanced features

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const MEMBERS_FILE = path.join(DATA_DIR, 'members.json');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const ACCESS_ATTEMPTS_FILE = path.join(DATA_DIR, 'access-attempts.json');
const RETURNING_VISITORS_FILE = path.join(DATA_DIR, 'returning-visitors.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
function initializeDataFiles() {
    const files = [
        { path: ACCESS_ATTEMPTS_FILE, default: [] },
        { path: RETURNING_VISITORS_FILE, default: [] },
        { path: PRESENCES_FILE, default: [] }
    ];

    files.forEach(({ path, default: defaultData }) => {
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, JSON.stringify(defaultData, null, 2));
            console.log(`✅ Created: ${path}`);
        }
    });
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

// ✅ FEATURE 1: Access Attempts Logging
function logAccessAttempt(type, nom, prenom, status, details = null, req = null) {
    try {
        const attempts = readJSONFile(ACCESS_ATTEMPTS_FILE);

        const attempt = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            type, // 'member_success', 'member_fail', 'non_member'
            nom: nom.trim(),
            prenom: prenom.trim(),
            status, // 'success', 'membre_non_existant', 'membre_pas_encore_paye', 'pending', 'paid', 'cancelled'
            details,
            session_id: uuidv4(),
            ip_address: req ? (req.ip || req.connection.remoteAddress || 'unknown') : null,
            user_agent: req ? req.get('User-Agent') : null
        };

        attempts.push(attempt);

        // Keep only last 1000 attempts to prevent file from growing too large
        if (attempts.length > 1000) {
            attempts.splice(0, attempts.length - 1000);
        }

        writeJSONFile(ACCESS_ATTEMPTS_FILE, attempts);
        console.log(`📝 Logged access attempt: ${type} - ${nom} ${prenom} - ${status}`);

        return attempt.session_id;
    } catch (error) {
        console.error('Error logging access attempt:', error);
        return null;
    }
}

// Get all access attempts
function getAccessAttempts() {
    return readJSONFile(ACCESS_ATTEMPTS_FILE);
}

// ✅ FEATURE 2: Returning Visitors Management
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
                ...visitorData,
                last_visit: new Date().toISOString(),
                visit_count: (visitors[existingIndex].visit_count || 1) + 1
            };
        } else {
            // Add new visitor
            const newVisitor = {
                id: uuidv4(),
                ...visitorData,
                first_visit: new Date().toISOString(),
                last_visit: new Date().toISOString(),
                visit_count: 1
            };
            visitors.push(newVisitor);
        }

        writeJSONFile(RETURNING_VISITORS_FILE, visitors);
        return true;
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

        if (visitor) {
            // Update visit count and last visit
            const visitorIndex = visitors.findIndex(v => v.id === visitor.id);
            if (visitorIndex >= 0) {
                visitors[visitorIndex].last_visit = new Date().toISOString();
                visitors[visitorIndex].visit_count = (visitors[visitorIndex].visit_count || 1) + 1;
                writeJSONFile(RETURNING_VISITORS_FILE, visitors);
            }
        }

        return visitor;
    } catch (error) {
        console.error('Error finding returning visitor:', error);
        return null;
    }
}

// Get all returning visitors
function getReturningVisitors() {
    return readJSONFile(RETURNING_VISITORS_FILE);
}

// ✅ ENHANCED: Presences with logging
function savePresence(presenceData, sessionId = null) {
    try {
        const presences = readJSONFile(PRESENCES_FILE);

        const presence = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            ...presenceData,
            session_id: sessionId
        };

        presences.push(presence);
        writeJSONFile(PRESENCES_FILE, presences);

        // Auto-save to returning visitors if it's a non-member
        if (presenceData.type === 'non-adherent' && !presenceData.isReturningVisitor) {
            saveReturningVisitor({
                nom: presenceData.nom,
                prenom: presenceData.prenom,
                dateNaissance: presenceData.dateNaissance,
                email: presenceData.email || '',
                telephone: presenceData.telephone || '',
                last_level: presenceData.niveau,
                last_tarif: presenceData.tarif
            });
        }

        return presence;
    } catch (error) {
        console.error('Error saving presence:', error);
        return null;
    }
}

// Get all presences
function getPresences() {
    return readJSONFile(PRESENCES_FILE);
}

// Update presence status
function updatePresenceStatus(presenceId, status) {
    try {
        const presences = readJSONFile(PRESENCES_FILE);
        const presenceIndex = presences.findIndex(p => p.id === presenceId);

        if (presenceIndex >= 0) {
            presences[presenceIndex].status = status;
            presences[presenceIndex].updated_at = new Date().toISOString();
            writeJSONFile(PRESENCES_FILE, presences);

            // Update access attempts if session_id exists
            if (presences[presenceIndex].session_id) {
                const attempts = readJSONFile(ACCESS_ATTEMPTS_FILE);
                const attemptIndex = attempts.findIndex(a => a.session_id === presences[presenceIndex].session_id);
                if (attemptIndex >= 0) {
                    attempts[attemptIndex].status = status;
                    writeJSONFile(ACCESS_ATTEMPTS_FILE, attempts);
                }
            }

            return presences[presenceIndex];
        }
        return null;
    } catch (error) {
        console.error('Error updating presence status:', error);
        return null;
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
    savePresence,
    getPresences,
    updatePresenceStatus,
    readJSONFile,
    writeJSONFile,
    MEMBERS_FILE,
    PRESENCES_FILE,
    ACCESS_ATTEMPTS_FILE,
    RETURNING_VISITORS_FILE
};