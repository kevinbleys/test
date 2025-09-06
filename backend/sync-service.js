const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'https://api.pepsup.com/api/v1/contacts';
const API_HEADERS = {
 'X-API-KEY': '0IOiLeibD6sF6sJtr17oB8VUKBG6NZ2U',
 'X-API-SECRET': 'odakfDvfUMOKpJAe92u76fqCWHtPvPlo',
 'Accept': 'application/json'
};
const DATA_FILE = path.join(__dirname, 'data', 'members.json');
const LOG_FILE = path.join(__dirname, 'data', 'sync.log');

// Season helpers
function getCurrentSeasonBounds() {
 const now = new Date();
 const currentYear = now.getFullYear();
 const currentMonth = now.getMonth(); // 0-11

 let seasonStart, seasonEnd;

 if (currentMonth >= 8) { // September onwards (month 8+)
 seasonStart = new Date(currentYear, 8, 1); // Sept 1 this year
 seasonEnd = new Date(currentYear + 1, 7, 31); // Aug 31 next year
 } else { // Before September
 seasonStart = new Date(currentYear - 1, 8, 1); // Sept 1 last year  
 seasonEnd = new Date(currentYear, 7, 31); // Aug 31 this year
 }

 return { seasonStart, seasonEnd };
}

function getCurrentSeasonName() {
 const { seasonStart } = getCurrentSeasonBounds();
 return `${seasonStart.getFullYear()}-${seasonStart.getFullYear() + 1}`;
}

function isInCurrentSeason(dateStr) {
 if (!dateStr) return false;

 try {
 const date = new Date(dateStr);
 const { seasonStart, seasonEnd } = getCurrentSeasonBounds();
 return date >= seasonStart && date <= seasonEnd;
 } catch (error) {
 return false;
 }
}

// Logging functie
const logMessage = (message) => {
 const timestamp = new Date().toISOString();
 const logEntry = `[${timestamp}] ${message}\n`;

 // Console output
 console.log(logEntry.trim());

 // Write to log file
 try {
 // Zorg dat data directory bestaat
 const dataDir = path.dirname(LOG_FILE);
 if (!fs.existsSync(dataDir)) {
 fs.mkdirSync(dataDir, { recursive: true });
 }
 fs.appendFileSync(LOG_FILE, logEntry);
 } catch (error) {
 console.error('Fout bij schrijven naar log:', error);
 }
};

async function syncMembers() {
 try {
 const currentSeason = getCurrentSeasonName();
 logMessage(`=== Synchronisation PEPsup démarrée voor seizoen ${currentSeason} ===`);

 // Test internet verbinding
 try {
 const testResponse = await axios.get('https://google.com', { timeout: 5000 });
 logMessage('Internet verbinding OK');
 } catch (error) {
 throw new Error('Geen internet verbinding beschikbaar');
 }

 const response = await axios.get(API_URL, { 
 headers: API_HEADERS,
 timeout: 30000 // 30 seconden timeout
 });

 if (!Array.isArray(response.data)) {
 throw new Error(`Réponse API inattendue: ${typeof response.data}`);
 }

 // ✅ SEASON-AWARE FILTERING
 const allMembers = response.data;
 const currentSeasonMembers = [];
 const oldMembers = [];

 allMembers.forEach(member => {
 let hasCurrentMembership = false;

 if (Array.isArray(member.categories)) {
 // Check for current season 'adhérent' categories
 const currentMemberships = member.categories.filter(category => {
 if (typeof category.label === 'string' && category.label.toLowerCase().includes('adhérent')) {
 // Check if membership is from current season
 if (category.created_at && isInCurrentSeason(category.created_at)) {
 return true;
 }
 if (category.updated_at && isInCurrentSeason(category.updated_at)) {
 return true;
 }
 // If no dates, assume recent (within last 2 years for safety)
 if (!category.created_at && !category.updated_at) {
 return true;
 }
 }
 return false;
 });

 if (currentMemberships.length > 0) {
 hasCurrentMembership = true;
 // Add season info to member
 member.currentSeasonMemberships = currentMemberships;
 member.seasonInfo = {
 season: currentSeason,
 isCurrentSeason: true
 };
 }
 }

 if (hasCurrentMembership) {
 currentSeasonMembers.push(member);
 } else {
 oldMembers.push(member);
 }
 });

 logMessage(`📊 FILTERING RESULTS:`);
 logMessage(`   Total members in database: ${allMembers.length}`);
 logMessage(`   Current season (${currentSeason}): ${currentSeasonMembers.length}`);
 logMessage(`   Old/inactive members: ${oldMembers.length}`);

 const dir = path.dirname(DATA_FILE);
 if (!fs.existsSync(dir)) {
 fs.mkdirSync(dir, { recursive: true });
 logMessage(`Data directory aangemaakt: ${dir}`);
 }

 // Backup van oude data
 if (fs.existsSync(DATA_FILE)) {
 const backupFile = DATA_FILE.replace('.json', `_backup_${Date.now()}.json`);
 fs.copyFileSync(DATA_FILE, backupFile);
 logMessage(`Backup gemaakt: ${backupFile}`);
 }

 // ✅ SAVE ONLY CURRENT SEASON MEMBERS
 const dataToSave = {
 season: currentSeason,
 lastSync: new Date().toISOString(),
 totalMembers: currentSeasonMembers.length,
 members: currentSeasonMembers,
 // Keep summary for reference
 summary: {
 totalInDatabase: allMembers.length,
 currentSeason: currentSeasonMembers.length,
 oldMembers: oldMembers.length
 }
 };

 fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));

 logMessage(`✅ Synchronisation réussie: ${currentSeasonMembers.length} current members synchronized`);
 logMessage(`🗓️ Season: ${currentSeason}`);
 logMessage('=== Synchronisation PEPsup terminée ===');

 return currentSeasonMembers.length;
 } catch (error) {
 let errorMessage = 'Erreur de synchronisation inconnue';

 if (error.response) {
 errorMessage = `Erreur API ${error.response.status}: ${error.response.data?.message || JSON.stringify(error.response.data)}`;
 } else if (error.request) {
 errorMessage = "Pas de réponse du serveur PEPsup - Vérifiez votre connexion";
 } else {
 errorMessage = `Erreur de synchronisation: ${error.message}`;
 }

 logMessage(`ERREUR: ${errorMessage}`);
 throw new Error(errorMessage);
 }
}

// Functie voor command line uitvoering
async function runSync() {
 try {
 logMessage('Script gestart vanuit command line');
 const count = await syncMembers();
 logMessage(`Script voltooid: ${count} current season members synchronized`);
 process.exit(0);
 } catch (error) {
 logMessage(`FOUT: ${error.message}`);
 process.exit(1);
 }
}

// Check of dit script direct uitgevoerd wordt
if (require.main === module) {
 runSync();
}

// ✅ SEASON-AWARE GET MEMBERS FUNCTION
function getMembers() {
 try {
 if (!fs.existsSync(DATA_FILE)) {
 logMessage('Geen members.json bestand gevonden');
 return [];
 }

 const fileData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

 // Handle both old format (array) and new format (object with members)
 if (Array.isArray(fileData)) {
 logMessage('Using legacy members format');
 return fileData;
 }

 if (fileData.members && Array.isArray(fileData.members)) {
 logMessage(`Loaded ${fileData.members.length} members for season ${fileData.season || 'unknown'}`);
 return fileData.members;
 }

 logMessage('Invalid members file format');
 return [];
 } catch (error) {
 logMessage(`Fout bij lezen van members: ${error.message}`);
 return [];
 }
}

// Get season info
function getSeasonInfo() {
 try {
 if (!fs.existsSync(DATA_FILE)) {
 return {
 season: getCurrentSeasonName(),
 lastSync: null,
 totalMembers: 0
 };
 }

 const fileData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

 if (!Array.isArray(fileData) && fileData.season) {
 return {
 season: fileData.season,
 lastSync: fileData.lastSync,
 totalMembers: fileData.totalMembers || 0,
 summary: fileData.summary
 };
 }

 return {
 season: getCurrentSeasonName(),
 lastSync: null,
 totalMembers: Array.isArray(fileData) ? fileData.length : 0
 };
 } catch (error) {
 return {
 season: getCurrentSeasonName(),
 lastSync: null,
 totalMembers: 0,
 error: error.message
 };
 }
}

module.exports = {
 syncMembers,
 getMembers,
 getSeasonInfo,
 getCurrentSeasonName,
 getCurrentSeasonBounds,
 isInCurrentSeason
};