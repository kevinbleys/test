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
    logMessage('=== Synchronisation PEPsup démarrée ===');
    
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
    
    // Nieuwe data schrijven
    fs.writeFileSync(DATA_FILE, JSON.stringify(response.data, null, 2));
    
    logMessage(`Synchronisation réussie: ${response.data.length} membres synchronisés`);
    logMessage('=== Synchronisation PEPsup terminée ===');
    
    return response.data.length;
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
    logMessage(`Script voltooid: ${count} leden gesynchroniseerd`);
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

module.exports = {
  syncMembers,
  getMembers: function () {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        logMessage('Geen members.json bestand gevonden');
        return [];
      }
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      return data;
    } catch (error) {
      logMessage(`Fout bij lezen van members: ${error.message}`);
      return [];
    }
  }
};
