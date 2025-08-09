const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_DIR = path.join(__dirname, 'data');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');
const HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const LOG_FILE = path.join(DATA_DIR, 'export.log');

// Logging functie
const logMessage = (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] EXPORT: ${message}\n`;
  
  console.log(logEntry.trim());
  
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (error) {
    console.error('Fout bij schrijven naar export log:', error);
  }
};

// **FUNCTIE: Zorg dat exports directory bestaat**
const ensureExportsDir = () => {
  if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
    logMessage(`Exports directory aangemaakt: ${EXPORTS_DIR}`);
  }
};

// **NIEUWE FUNCTIE: Maak testdata aan als er geen data is**
const createTestDataIfNeeded = () => {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      logMessage('Geen presence-history.json gevonden, maak testdata aan');
      
      // Maak testdata voor 2024 en 2025
      const testData = [
        {
          date: '2024-12-15',
          presences: [
            {
              id: 'test1',
              type: 'non-adherent',
              nom: 'Dupont',
              prenom: 'Jean',
              date: '2024-12-15T14:30:00.000Z',
              status: 'Payé',
              tarif: 10,
              methodePaiement: 'CB',
              telephone: '0123456789',
              email: 'jean.dupont@email.com',
              dateNaissance: '1985-03-15',
              niveau: '1',
              assuranceAccepted: true
            },
            {
              id: 'test2',
              type: 'adherent',
              nom: 'Martin',
              prenom: 'Marie',
              date: '2024-12-15T15:00:00.000Z',
              status: 'adherent'
            }
          ]
        },
        {
          date: '2025-08-08',
          presences: [
            {
              id: 'test3',
              type: 'non-adherent',
              nom: 'Bernard',
              prenom: 'Pierre',
              date: '2025-08-08T10:15:00.000Z',
              status: 'Payé',
              tarif: 8,
              methodePaiement: 'Especes',
              telephone: '0987654321',
              email: 'pierre.bernard@email.com',
              dateNaissance: '1990-07-22',
              niveau: '0',
              assuranceAccepted: true
            }
          ]
        }
      ];
      
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(testData, null, 2));
      logMessage('Testdata aangemaakt in presence-history.json');
    }
  } catch (error) {
    logMessage(`Fout bij aanmaken testdata: ${error.message}`);
  }
};

// **FUNCTIE: Exporteer jaar naar Excel**
const exportYearToExcel = (year) => {
  try {
    logMessage(`=== JAARLIJKSE EXCEL EXPORT GESTART (${year}) ===`);
    
    ensureExportsDir();
    
    if (!fs.existsSync(HISTORY_FILE)) {
      throw new Error('Geen presence-history.json bestand gevonden');
    }

    const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    
    if (!Array.isArray(historyData) || historyData.length === 0) {
      throw new Error('Presence historiek is leeg of ongeldig');
    }

    // Filter data voor het specifieke jaar
    const yearData = historyData.filter(entry => {
      const entryYear = new Date(entry.date).getFullYear();
      return entryYear === parseInt(year);
    });

    if (yearData.length === 0) {
      throw new Error(`Geen data gevonden voor jaar ${year}`);
    }

    // Converteer alle presences naar Excel format
    const excelData = [];
    
    yearData.forEach(dayEntry => {
      if (!dayEntry.presences || !Array.isArray(dayEntry.presences)) {
        return;
      }
      
      dayEntry.presences.forEach(presence => {
        const row = {
          'Date': dayEntry.date,
          'Heure': presence.date ? new Date(presence.date).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : '',
          'Nom': presence.nom || '',
          'Prénom': presence.prenom || '',
          'Adhérent': presence.type === 'adherent' ? 'Oui' : 'Non',
          'Téléphone': presence.telephone || '',
          'Email': presence.email || '',
          'Date de naissance': presence.dateNaissance || '',
          'Niveau de grimpe': presence.niveau || '',
          'Assurance acceptée': getAssuranceStatus(presence),
          'Montant (€)': presence.tarif !== undefined ? presence.tarif : '',
          'Méthode de paiement': presence.methodePaiement || '',
          'Statut': presence.status || '',
          'Date validation': presence.dateValidation ? new Date(presence.dateValidation).toLocaleDateString('fr-FR') : '',
          'Adresse': presence.adresse || ''
        };
        excelData.push(row);
      });
    });

    if (excelData.length === 0) {
      throw new Error(`Geen presences gevonden voor jaar ${year}`);
    }

    // Créer workbook Excel
    const wb = XLSX.utils.book_new();
    
    // Hoofdwerkblad met alle data
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Kolom breedtes instellen
    const columnWidths = [
      { wch: 12 }, // Date
      { wch: 8 },  // Heure
      { wch: 15 }, // Nom
      { wch: 15 }, // Prénom
      { wch: 10 }, // Adhérent
      { wch: 15 }, // Téléphone
      { wch: 25 }, // Email
      { wch: 15 }, // Date de naissance
      { wch: 15 }, // Niveau de grimpe
      { wch: 18 }, // Assurance acceptée
      { wch: 12 }, // Montant
      { wch: 18 }, // Méthode de paiement
      { wch: 12 }, // Statut
      { wch: 15 }, // Date validation
      { wch: 30 }  // Adresse
    ];
    ws['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Présences');
    
    // Statistieken werkblad
    const stats = generateStatistics(excelData, year);
    const wsStats = XLSX.utils.json_to_sheet(stats);
    XLSX.utils.book_append_sheet(wb, wsStats, 'Statistiques');

    // Bestandsnaam met timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const filename = `presences-${year}-export-${timestamp}.xlsx`;
    const filepath = path.join(EXPORTS_DIR, filename);
    
    // Schrijf Excel bestand
    XLSX.writeFile(wb, filepath);
    
    logMessage(`Excel export succesvol: ${filename}`);
    logMessage(`Totaal ${excelData.length} records geëxporteerd`);
    logMessage(`Bestand opgeslagen: ${filepath}`);
    logMessage(`=== JAARLIJKSE EXCEL EXPORT VOLTOOID (${year}) ===`);
    
    return {
      success: true,
      filename,
      filepath,
      recordCount: excelData.length,
      year: parseInt(year)
    };
    
  } catch (error) {
    logMessage(`FOUT BIJ EXCEL EXPORT: ${error.message}`);
    throw error;
  }
};

// **FUNCTIE: Assurance status bepalen**
const getAssuranceStatus = (presence) => {
  // Als er specifieke assurance velden zijn, gebruik die
  if (presence.assuranceAccepted !== undefined) {
    return presence.assuranceAccepted ? 'Oui' : 'Non';
  }
  
  // Voor non-adherents die door het volledige proces zijn gegaan
  if (presence.type === 'non-adherent' && presence.status !== 'pending') {
    return 'Oui (implicite)';
  }
  
  return 'Non spécifié';
};

// **FUNCTIE: Statistieken genereren**
const generateStatistics = (data, year) => {
  const stats = [
    { 'Statistique': 'Année', 'Valeur': year },
    { 'Statistique': 'Total présences', 'Valeur': data.length },
    { 'Statistique': 'Adhérents', 'Valeur': data.filter(r => r.Adhérent === 'Oui').length },
    { 'Statistique': 'Non-adhérents', 'Valeur': data.filter(r => r.Adhérent === 'Non').length },
    { 'Statistique': '', 'Valeur': '' }, // Lege regel
    
    // Paiements statistieken
    { 'Statistique': 'PAIEMENTS:', 'Valeur': '' },
    { 'Statistique': 'Total facturé (€)', 'Valeur': data.reduce((sum, r) => sum + (parseFloat(r['Montant (€)']) || 0), 0) },
    { 'Statistique': 'Espèces', 'Valeur': data.filter(r => r['Méthode de paiement'] === 'Especes').length },
    { 'Statistique': 'Carte bancaire', 'Valeur': data.filter(r => r['Méthode de paiement'] === 'CB').length },
    { 'Statistique': 'Chèque', 'Valeur': data.filter(r => r['Méthode de paiement'] === 'Cheque').length },
    { 'Statistique': '', 'Valeur': '' }, // Lege regel
    
    // Niveau statistieken
    { 'Statistique': 'NIVEAUX:', 'Valeur': '' },
    { 'Statistique': 'Niveau 0', 'Valeur': data.filter(r => r['Niveau de grimpe'] === '0').length },
    { 'Statistique': 'Niveau 1', 'Valeur': data.filter(r => r['Niveau de grimpe'] === '1').length },
    { 'Statistique': 'Niveau 2', 'Valeur': data.filter(r => r['Niveau de grimpe'] === '2').length },
  ];
  
  return stats;
};

// **FUNCTIE: Jaar data opruimen NA export**
const cleanupYearAfterExport = (year) => {
  try {
    logMessage(`=== CLEANUP NA EXPORT GESTART (${year}) ===`);
    
    if (!fs.existsSync(HISTORY_FILE)) {
      logMessage('Geen presence-history.json bestand gevonden');
      return { success: false, message: 'Geen historie bestand gevonden' };
    }

    const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    
    if (!Array.isArray(historyData)) {
      throw new Error('Ongeldig historie bestand format');
    }

    // Filter data: behoud alles BEHALVE het geëxporteerde jaar
    const originalCount = historyData.length;
    const filteredHistory = historyData.filter(entry => {
      const entryYear = new Date(entry.date).getFullYear();
      return entryYear !== parseInt(year);
    });
    
    const deletedCount = originalCount - filteredHistory.length;
    
    if (deletedCount === 0) {
      logMessage(`Geen entries gevonden voor jaar ${year}`);
      return { success: false, message: `Geen data gevonden voor jaar ${year}` };
    }

    // Schrijf gefilterde data terug
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(filteredHistory, null, 2));

    logMessage(`Behouden: ${filteredHistory.length} entries`);
    logMessage(`Verwijderd: ${deletedCount} entries voor jaar ${year}`);
    logMessage(`=== CLEANUP NA EXPORT VOLTOOID (${year}) ===`);
    
    return {
      success: true,
      deletedCount,
      remainingCount: filteredHistory.length
    };
    
  } catch (error) {
    logMessage(`FOUT BIJ CLEANUP NA EXPORT: ${error.message}`);
    throw error;
  }
};

// **FUNCTIE VERBETERD: Beschikbare jaren ophalen**
const getAvailableYears = () => {
  try {
    logMessage('=== GET AVAILABLE YEARS GESTART ===');
    
    // Zorg eerst voor testdata als er niks is
    createTestDataIfNeeded();
    
    if (!fs.existsSync(HISTORY_FILE)) {
      logMessage('HISTORY_FILE bestaat niet na testdata poging');
      return [];
    }

    const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    logMessage(`Gelezen history data: ${historyData.length} entries`);
    
    if (!Array.isArray(historyData) || historyData.length === 0) {
      logMessage('History data is leeg of geen array');
      return [];
    }

    const years = [...new Set(historyData.map(entry => {
      const year = new Date(entry.date).getFullYear();
      logMessage(`Entry datum: ${entry.date} -> jaar: ${year}`);
      return year;
    }))].sort((a, b) => b - a); // Nieuwste eerst

    logMessage(`Beschikbare jaren gevonden: ${JSON.stringify(years)}`);
    logMessage('=== GET AVAILABLE YEARS VOLTOOID ===');
    return years;
    
  } catch (error) {
    logMessage(`Fout bij ophalen beschikbare jaren: ${error.message}`);
    return [];
  }
};

module.exports = {
  exportYearToExcel,
  cleanupYearAfterExport,
  getAvailableYears,
  ensureExportsDir,
  createTestDataIfNeeded
};
