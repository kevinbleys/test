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
      console.log(`⚠️ File ${path.basename(filePath)} does not exist, returning empty array`);
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`❌ Error reading ${path.basename(filePath)}:`, error.message);
    return [];
  }
};

// Get all presence data (current + history) - ✅ INCLUDES FAILED ATTEMPTS
const getAllPresences = () => {
  console.log('🔍 Loading all presences from files (including failed attempts)...');
  const currentPresences = readJsonFile(PRESENCES_FILE);
  const history = readJsonFile(PRESENCE_HISTORY_FILE);

  let allPresences = [...currentPresences];
  console.log(`📋 Current presences: ${currentPresences.length}`);

  // Add historical presences
  if (Array.isArray(history)) {
    history.forEach(dayData => {
      if (dayData.presences && Array.isArray(dayData.presences)) {
        allPresences = allPresences.concat(dayData.presences);
      }
    });
  }

  console.log(`📊 Total presences loaded (including failed attempts): ${allPresences.length}`);

  // ✅ Log breakdown by type
  const breakdown = {
    adherents: allPresences.filter(p => p.type === 'adherent').length,
    nonAdherents: allPresences.filter(p => p.type === 'non-adherent').length,
    failedAttempts: allPresences.filter(p => p.type === 'failed-login').length
  };

  console.log(`📊 Breakdown - Adherents: ${breakdown.adherents}, Non-adherents: ${breakdown.nonAdherents}, Failed attempts: ${breakdown.failedAttempts}`);

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

// ✅ UPDATED: Export season data to Excel INCLUDING FAILED ATTEMPTS
const exportSeasonToExcel = async () => {
  try {
    ensureExportsDir();
    logMessage('=== EXPORT SEASON TO EXCEL STARTED (INCLUDING FAILED ATTEMPTS) ===');

    const season = getCurrentSeason();
    const allPresences = getAllPresences();

    // Filter presences for current season
    const seasonPresences = allPresences.filter(presence => {
      if (!presence.date) return false;
      const presenceDate = new Date(presence.date);
      return presenceDate >= season.startDate && presenceDate <= season.endDate;
    });

    logMessage(`Found ${seasonPresences.length} total presences for season ${season.name}`);

    // ✅ Breakdown by type including failed attempts
    const breakdown = {
      adherents: seasonPresences.filter(p => p.type === 'adherent').length,
      nonAdherents: seasonPresences.filter(p => p.type === 'non-adherent').length,
      failedAttempts: seasonPresences.filter(p => p.type === 'failed-login').length
    };

    logMessage(`Season breakdown - Adherents: ${breakdown.adherents}, Non-adherents: ${breakdown.nonAdherents}, Failed attempts: ${breakdown.failedAttempts}`);

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Saison ${season.name}`);

    // ✅ UPDATED: Add headers with status column to show failed attempts
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Prénom', key: 'prenom', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Téléphone', key: 'telephone', width: 15 },
      { header: 'Date Naissance', key: 'dateNaissance', width: 15 },
      { header: 'Niveau', key: 'niveau', width: 10 },
      { header: 'Tarif', key: 'tarif', width: 8 },
      { header: 'Méthode Paiement', key: 'methodePaiement', width: 15 },
      { header: 'Statut', key: 'status', width: 20 },
      { header: 'Assurance', key: 'assuranceAccepted', width: 12 },
      { header: 'Type Tentative', key: 'attemptType', width: 25 }
    ];

    // Add data rows
    seasonPresences.forEach(presence => {
      // ✅ UPDATED: Handle different types including failed attempts
      let typeDisplay, statusDisplay, attemptTypeDisplay = '';

      if (presence.type === 'failed-login') {
        typeDisplay = 'Tentative Échec';
        statusDisplay = presence.status || 'Failed Login';
        attemptTypeDisplay = presence.failedLoginReason || presence.status || 'Login Failed';
      } else if (presence.type === 'adherent') {
        typeDisplay = 'Adhérent';
        statusDisplay = 'Adhérent Valide';
        attemptTypeDisplay = 'Login Réussi';
      } else {
        typeDisplay = 'Non-adhérent';
        statusDisplay = presence.status || 'Pending';
        attemptTypeDisplay = 'Registration Réussie';
      }

      worksheet.addRow({
        date: presence.date ? new Date(presence.date).toLocaleDateString('fr-FR') : '',
        type: typeDisplay,
        nom: presence.nom || '',
        prenom: presence.prenom || '',
        email: presence.email || '',
        telephone: presence.telephone || '',
        dateNaissance: presence.dateNaissance || '',
        niveau: presence.niveau || '',
        tarif: presence.type === 'failed-login' ? 'N/A' : (presence.tarif || ''),
        methodePaiement: presence.type === 'failed-login' ? 'N/A' : (presence.methodePaiement || ''),
        status: statusDisplay,
        assuranceAccepted: presence.assuranceAccepted ? 'Oui' : (presence.type === 'failed-login' ? 'N/A' : 'Non'),
        attemptType: attemptTypeDisplay
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

    // ✅ NOUVEAU: Highlight failed attempts in red
    for (let i = 2; i <= seasonPresences.length + 1; i++) {
      const row = worksheet.getRow(i);
      const typeCell = row.getCell(2); // Type column

      if (typeCell.value === 'Tentative Échec') {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEE2E2' } // Light red background
        };

        // Make text red for failed attempts
        row.font = { color: { argb: 'FFDC2626' } };
      }
    }

    // Save file
    const filename = `Export_Saison_${season.name}_avec_tentatives.xlsx`;
    const filepath = path.join(EXPORTS_DIR, filename);

    await workbook.xlsx.writeFile(filepath);

    logMessage(`Excel export saved: ${filename}`);
    logMessage(`Total records: ${seasonPresences.length} (Adherents: ${breakdown.adherents}, Non-adherents: ${breakdown.nonAdherents}, Failed: ${breakdown.failedAttempts})`);
    logMessage('=== EXPORT SEASON TO EXCEL COMPLETED ===');

    return {
      filename,
      recordCount: seasonPresences.length,
      seasonName: season.name,
      breakdown,
      filepath
    };

  } catch (error) {
    logMessage(`ERROR in exportSeasonToExcel: ${error.message}`);
    throw error;
  }
};

// ✅ UPDATED: Export specific year data to Excel INCLUDING FAILED ATTEMPTS
const exportYearToExcel = async (year) => {
  try {
    ensureExportsDir();
    logMessage(`=== EXPORT YEAR ${year} TO EXCEL STARTED (INCLUDING FAILED ATTEMPTS) ===`);

    const allPresences = getAllPresences();

    // Filter presences for specific year
    const yearPresences = allPresences.filter(presence => {
      if (!presence.date) return false;
      const presenceDate = new Date(presence.date);
      return presenceDate.getFullYear() === year;
    });

    logMessage(`Found ${yearPresences.length} total presences for year ${year}`);

    // ✅ Breakdown by type including failed attempts
    const breakdown = {
      adherents: yearPresences.filter(p => p.type === 'adherent').length,
      nonAdherents: yearPresences.filter(p => p.type === 'non-adherent').length,
      failedAttempts: yearPresences.filter(p => p.type === 'failed-login').length
    };

    logMessage(`Year ${year} breakdown - Adherents: ${breakdown.adherents}, Non-adherents: ${breakdown.nonAdherents}, Failed attempts: ${breakdown.failedAttempts}`);

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Année ${year}`);

    // ✅ UPDATED: Same headers as season export
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Prénom', key: 'prenom', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Téléphone', key: 'telephone', width: 15 },
      { header: 'Date Naissance', key: 'dateNaissance', width: 15 },
      { header: 'Niveau', key: 'niveau', width: 10 },
      { header: 'Tarif', key: 'tarif', width: 8 },
      { header: 'Méthode Paiement', key: 'methodePaiement', width: 15 },
      { header: 'Statut', key: 'status', width: 20 },
      { header: 'Assurance', key: 'assuranceAccepted', width: 12 },
      { header: 'Type Tentative', key: 'attemptType', width: 25 }
    ];

    // Add data rows
    yearPresences.forEach(presence => {
      // ✅ Same logic as season export
      let typeDisplay, statusDisplay, attemptTypeDisplay = '';

      if (presence.type === 'failed-login') {
        typeDisplay = 'Tentative Échec';
        statusDisplay = presence.status || 'Failed Login';
        attemptTypeDisplay = presence.failedLoginReason || presence.status || 'Login Failed';
      } else if (presence.type === 'adherent') {
        typeDisplay = 'Adhérent';
        statusDisplay = 'Adhérent Valide';
        attemptTypeDisplay = 'Login Réussi';
      } else {
        typeDisplay = 'Non-adhérent';
        statusDisplay = presence.status || 'Pending';
        attemptTypeDisplay = 'Registration Réussie';
      }

      worksheet.addRow({
        date: presence.date ? new Date(presence.date).toLocaleDateString('fr-FR') : '',
        type: typeDisplay,
        nom: presence.nom || '',
        prenom: presence.prenom || '',
        email: presence.email || '',
        telephone: presence.telephone || '',
        dateNaissance: presence.dateNaissance || '',
        niveau: presence.niveau || '',
        tarif: presence.type === 'failed-login' ? 'N/A' : (presence.tarif || ''),
        methodePaiement: presence.type === 'failed-login' ? 'N/A' : (presence.methodePaiement || ''),
        status: statusDisplay,
        assuranceAccepted: presence.assuranceAccepted ? 'Oui' : (presence.type === 'failed-login' ? 'N/A' : 'Non'),
        attemptType: attemptTypeDisplay
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

    // ✅ Highlight failed attempts in red
    for (let i = 2; i <= yearPresences.length + 1; i++) {
      const row = worksheet.getRow(i);
      const typeCell = row.getCell(2); // Type column

      if (typeCell.value === 'Tentative Échec') {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEE2E2' } // Light red background
        };

        // Make text red for failed attempts
        row.font = { color: { argb: 'FFDC2626' } };
      }
    }

    // Save file
    const filename = `Export_Année_${year}_avec_tentatives.xlsx`;
    const filepath = path.join(EXPORTS_DIR, filename);

    await workbook.xlsx.writeFile(filepath);

    logMessage(`Excel export saved: ${filename}`);
    logMessage(`Total records: ${yearPresences.length} (Adherents: ${breakdown.adherents}, Non-adherents: ${breakdown.nonAdherents}, Failed: ${breakdown.failedAttempts})`);
    logMessage(`=== EXPORT YEAR ${year} TO EXCEL COMPLETED ===`);

    return {
      filename,
      recordCount: yearPresences.length,
      breakdown,
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
    console.log('🔍 Getting available years from presence data...');
    const allPresences = getAllPresences();
    const years = new Set();

    allPresences.forEach(presence => {
      if (presence.date) {
        const year = new Date(presence.date).getFullYear();
        if (year >= 2020 && year <= 2030) { // Reasonable range
          years.add(year);
        }
      }
    });

    const yearList = Array.from(years).sort((a, b) => b - a); // Most recent first
    console.log(`📊 Available years: ${yearList.join(', ')}`);

    return yearList;

  } catch (error) {
    console.error(`❌ ERROR in getAvailableYears: ${error.message}`);
    return [];
  }
};

module.exports = {
  exportSeasonToExcel,
  exportYearToExcel,
  getAvailableYears,
  getAllPresences,
  getCurrentSeason
};