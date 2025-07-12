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

async function syncMembers() {
  try {
    console.log(`[${new Date().toISOString()}] Synchronisation en cours...`);
    const response = await axios.get(API_URL, { headers: API_HEADERS });
    if (!Array.isArray(response.data)) {
      throw new Error(`Réponse API inattendue: ${typeof response.data}`);
    }
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(response.data, null, 2));
    console.log(`Écriture de ${response.data.length} membres dans: ${DATA_FILE}`);
    return response.data.length;
  } catch (error) {
    if (error.response) {
      throw new Error(`Erreur API ${error.response.status}: ${error.response.data?.message || JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error("Pas de réponse du serveur PEPsup - Vérifiez votre connexion");
    } else {
      throw new Error(`Erreur de synchronisation: ${error.message}`);
    }
  }
}

module.exports = {
  syncMembers,
  getMembers: function () {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        return [];
      }
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (error) {
      console.error('Erreur lors de la lecture des membres:', error);
      return [];
    }
  }
};
