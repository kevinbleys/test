const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_DIR = path.join(__dirname, 'data');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');
const HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const LOG_FILE = path.join(DATA_DIR, 'export.log');

// Logging
const logMessage = (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] EXPORT: ${message}\n`;
  console.log(`🔍 EXPORT-SERVICE: ${message}`);
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch {}
};

// Huidige seizoen
const getCurrentSeason = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month < 6) {
    return { startYear: year - 1, endYear: year, seasonName: `${year - 1}-${year}` };
  } else {
    return { startYear: year, endYear: year + 1, seasonName: `${year}-${year + 1}` };
  }
};

// Testdata altijd toevoegen bij leeg of ongeldig bestand!
const createTestDataIfNeeded = () => {
  let needTestData = false;
  if (!fs.existsSync(HISTORY_FILE)) {
    needTestData = true;
  } else {
    try {
      const content = fs.readFileSync(HISTORY_FILE, 'utf8');
      const data = JSON.parse(content);
      if (!Array.isArray(data) || data.length === 0) {
        needTestData = true;
      }
    } catch {
      needTestData = true;
    }
  }
  if (needTestData) {
    logMessage('📝 presence-history.json ontbreekt of leeg/ongeldig, testdata aanmaken!');
    const currentSeason = getCurrentSeason();
    const currentYear = new Date().getFullYear();
    const testData = [
      {date: '2023-01-15', presences: [{id: 'test-2023-1', type: 'non-adherent', nom: 'Historique', prenom: 'Person2023', date: '2023-01-15T14:30:00.000Z', status: 'Payé', tarif: 12, methodePaiement: 'CB', dateNaissance: '1990-01-01', niveau: '2'}]},
      {date: '2023-06-20', presences: [{id: 'test-2023-2', type: 'adherent', nom: 'Martin', prenom: 'Sophie', date: '2023-06-20T15:00:00.000Z', status: 'adherent', dateNaissance: '2008-03-15', niveau: '1'}]},
      {date: '2024-03-15', presences: [{id: 'test-2024-1', type: 'non-adherent', nom: 'Historique', prenom: 'Person2024', date: '2024-03-15T14:30:00.000Z', status: 'Payé', tarif: 10, methodePaiement: 'CB', dateNaissance: '1990-01-01', niveau: '2'}]},
      {date: '2024-09-25', presences: [{id: 'test-2024-3', type: 'non-adherent', nom: 'Petit', prenom: 'Emma', date: '2024-09-25T10:15:00.000Z', status: 'Payé', tarif: 8, methodePaiement: 'Especes', dateNaissance: '2016-12-05', niveau: '0'}]},
      {date: `${currentSeason.startYear}-07-15`, presences: [{id: 'test-current-1', type: 'non-adherent', nom: 'Dupont', prenom: 'Jean', date: `${currentSeason.startYear}-07-15T14:30:00.000Z`, status: 'Payé', tarif: 10, methodePaiement: 'CB', dateNaissance: '1985-03-15', niveau: '1'}, {id: 'test-current-2', type: 'adherent', nom: 'Martin', prenom: 'Marie', date: `${currentSeason.startYear}-07-15T15:00:00.000Z`, status: 'adherent', dateNaissance: '2010-05-20', niveau: '0'}]},
      {date: `${currentYear}-01-10`, presences: [{id: 'test-current-3', type: 'non-adherent', nom: 'Bernard', prenom: 'Pierre', date: `${currentYear}-01-10T10:15:00.000Z`, status: 'Payé', tarif: 8, methodePaiement: 'Especes', dateNaissance: '2018-07-22', niveau: '0'}]}
    ];
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(testData, null, 2));
    logMessage(`✅ Testdata aangemaakt voor jaren: 2023, 2024, ${currentYear}`);
  } else {
    logMessage('✅ Er is al geldige presence-history.json aanwezig');
  }
};

// ...rest van het bestand: ALLE FUNCTIES BLIJVEN (zoals `getAvailableYears`, `exportSeasonToExcel`, etc.)
// Zet de hierboven geleverde versie verder (neem alle functies uit mijn vorige antwoord, of je werkende versie)...
// ZORG DAT ONDERAAN **getAvailableYears**, **exportYearToExcel**, **exportSeasonToExcel** en **createTestDataIfNeeded** worden geëxporteerd:

module.exports = {
  exportSeasonToExcel,
  getAvailableSeasons,
  generateSeasonStatistics,
  getCurrentSeason,
  getCurrentSeasonData,
  exportYearToExcel,
  getAvailableYears,
  cleanupYearAfterExport,
  ensureExportsDir,
  createTestDataIfNeeded
};
