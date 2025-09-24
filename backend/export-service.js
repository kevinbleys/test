const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const DATA_DIR = path.join(__dirname, 'data');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');

// Logging functie
const logMessage = (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;

  console.log(logEntry.trim());

  try {
    const logPath = path.join(DATA_DIR, 'export.log');
    fs.appendFileSync(logPath, logEntry);
  } catch (error) {
    console.error('Fout bij schrijven naar export.log:', error);
  }
};

// Ensure exports directory exists
const ensureExportsDir = () => {
  if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
    logMessage(`Created exports directory: ${EXPORTS_DIR}`);
  }
};

// Read JSON file helper
const readJsonFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logMessage(`Error reading ${path.basename(filePath)}: ${error.message}`);
    return [];
  }
};

// Get all presence data (current + history)
const getAllPresences = () => {
  const currentPresences = readJsonFile(PRESENCES_FILE);
  const history = readJsonFile(PRESENCE_HISTORY_FILE);

  let allPresences = [...currentPresences];

  // Add historical presences
  history.forEach(dayData => {
    if (dayData.presences && Array.isArray(dayData.presences)) {
      allPresences = allPresences.concat(dayData.presences);
    }
  });

  return allPresences;
};

// Get current season dates (July 1 - June 30)
const getCurrentSeason = () => {
  const now = new Date();
  const currentYear = now.getFullYear();

  // If we're before July, the season started last year
  const seasonStartYear = now.getMonth() >= 6 ? currentYear : currentYear - 1;
  const seasonEndYear = seasonStartYear + 1;

  const startDate = new Date(seasonStartYear, 6, 1); // July 1
  const endDate = new Date(seasonEndYear, 5, 30); // June 30

  return {
    startDate,
    endDate,
    name: `${seasonStartYear}-${seasonEndYear}`
  };
};

// Export season data to Excel
const exportSeasonToExcel = () => {
  try {
    ensureExportsDir();
    logMessage('=== EXPORT SEASON TO EXCEL STARTED ===');

    const season = getCurrentSeason();
    const allPresences = getAllPresences();

    // Filter presences for current season
    const seasonPresences = allPresences.filter(presence => {
      if (!presence.date) return false;
      const presenceDate = new Date(presence.date);
      return presenceDate >= season.startDate && presenceDate <= season.endDate;
    });

    logMessage(`Found ${seasonPresences.length} presences for season ${season.name}`);

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Saison ${season.name}`);

    // Add headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Prénom', key: 'prenom', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Téléphone', key: 'telephone', width: 15 },
      { header: 'Date Naissance', key: 'dateNaissance', width: 15 },
      { header: 'Niveau', key: 'niveau', width: 10 },
      { header: 'Tarif', key: 'tarif', width: 8 },
      { header: 'Méthode Paiement', key: 'methodePaiement', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Assurance', key: 'assuranceAccepted', width: 12 }
    ];

    // Add data rows
    seasonPresences.forEach(presence => {
      worksheet.addRow({
        date: presence.date ? new Date(presence.date).toLocaleDateString('fr-FR') : '',
        type: presence.type || '',
        nom: presence.nom || '',
        prenom: presence.prenom || '',
        email: presence.email || '',
        telephone: presence.telephone || '',
        dateNaissance: presence.dateNaissance || '',
        niveau: presence.niveau || '',
        tarif: presence.tarif || '',
        methodePaiement: presence.methodePaiement || '',
        status: presence.status || '',
        assuranceAccepted: presence.assuranceAccepted ? 'Oui' : 'Non'
      });
    });

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Save file
    const filename = `Export_Saison_${season.name}.xlsx`;
    const filepath = path.join(EXPORTS_DIR, filename);

    await workbook.xlsx.writeFile(filepath);

    logMessage(`Excel export saved: ${filename}`);
    logMessage('=== EXPORT SEASON TO EXCEL COMPLETED ===');

    return {
      filename,
      recordCount: seasonPresences.length,
      seasonName: season.name,
      filepath
    };

  } catch (error) {
    logMessage(`ERROR in exportSeasonToExcel: ${error.message}`);
    throw error;
  }
};

// Export specific year data to Excel
const exportYearToExcel = async (year) => {
  try {
    ensureExportsDir();
    logMessage(`=== EXPORT YEAR ${year} TO EXCEL STARTED ===`);

    const allPresences = getAllPresences();

    // Filter presences for specific year
    const yearPresences = allPresences.filter(presence => {
      if (!presence.date) return false;
      const presenceDate = new Date(presence.date);
      return presenceDate.getFullYear() === year;
    });

    logMessage(`Found ${yearPresences.length} presences for year ${year}`);

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Année ${year}`);

    // Add headers (same as season export)
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Prénom', key: 'prenom', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Téléphone', key: 'telephone', width: 15 },
      { header: 'Date Naissance', key: 'dateNaissance', width: 15 },
      { header: 'Niveau', key: 'niveau', width: 10 },
      { header: 'Tarif', key: 'tarif', width: 8 },
      { header: 'Méthode Paiement', key: 'methodePaiement', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Assurance', key: 'assuranceAccepted', width: 12 }
    ];

    // Add data rows
    yearPresences.forEach(presence => {
      worksheet.addRow({
        date: presence.date ? new Date(presence.date).toLocaleDateString('fr-FR') : '',
        type: presence.type || '',
        nom: presence.nom || '',
        prenom: presence.prenom || '',
        email: presence.email || '',
        telephone: presence.telephone || '',
        dateNaissance: presence.dateNaissance || '',
        niveau: presence.niveau || '',
        tarif: presence.tarif || '',
        methodePaiement: presence.methodePaiement || '',
        status: presence.status || '',
        assuranceAccepted: presence.assuranceAccepted ? 'Oui' : 'Non'
      });
    });

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Save file
    const filename = `Export_Année_${year}.xlsx`;
    const filepath = path.join(EXPORTS_DIR, filename);

    await workbook.xlsx.writeFile(filepath);

    logMessage(`Excel export saved: ${filename}`);
    logMessage(`=== EXPORT YEAR ${year} TO EXCEL COMPLETED ===`);

    return {
      filename,
      recordCount: yearPresences.length,
      filepath
    };

  } catch (error) {
    logMessage(`ERROR in exportYearToExcel: ${error.message}`);
    throw error;
  }
};

// Get available years from data
const getAvailableYears = () => {
  try {
    const allPresences = getAllPresences();
    const years = new Set();

    allPresences.forEach(presence => {
      if (presence.date) {
        const year = new Date(presence.date).getFullYear();
        years.add(year);
      }
    });

    return Array.from(years).sort((a, b) => b - a); // Most recent first

  } catch (error) {
    logMessage(`ERROR in getAvailableYears: ${error.message}`);
    return [];
  }
};

module.exports = {
  exportSeasonToExcel,
  exportYearToExcel,
  getAvailableYears
};