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

// **NIEUWE FUNCTIE: Huidige seizoen bepalen (1 juli - 30 juni)**
const getCurrentSeason = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based (0=januari)
  
  // Als we voor 1 juli zijn, behoren we tot het seizoen dat het vorige jaar begon
  if (month < 6) { // Voor juli (maand 6)
    return {
      startYear: year - 1,
      endYear: year,
      seasonName: `${year - 1}-${year}`
    };
  } else {
    // Na 1 juli behoren we tot het seizoen dat dit jaar begon
    return {
      startYear: year,
      endYear: year + 1,
      seasonName: `${year}-${year + 1}`
    };
  }
};

// **NIEUWE FUNCTIE: Leeftijdsgroep bepalen op basis van geboortedatum**
const getAgeGroup = (dateNaissance, visitDate) => {
  if (!dateNaissance) return 'Inconnu';
  
  try {
    const birthDate = new Date(dateNaissance);
    const visitDateObj = new Date(visitDate);
    
    let age = visitDateObj.getFullYear() - birthDate.getFullYear();
    const monthDiff = visitDateObj.getMonth() - birthDate.getMonth();
    
    // Pas leeftijd aan als verjaardag nog niet geweest is dit jaar
    if (monthDiff < 0 || (monthDiff === 0 && visitDateObj.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 8) return '< 8 ans';
    if (age >= 8 && age <= 18) return '8-18 ans';
    return '> 18 ans (adultes)';
    
  } catch (error) {
    logMessage(`Fout bij berekenen leeftijd voor ${dateNaissance}: ${error.message}`);
    return 'Inconnu';
  }
};

// **NIEUWE FUNCTIE: Data voor huidige seizoen ophalen**
const getCurrentSeasonData = () => {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      return [];
    }

    const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    if (!Array.isArray(historyData)) {
      return [];
    }

    const currentSeason = getCurrentSeason();
    const startDate = new Date(currentSeason.startYear, 6, 1); // 1 juli
    const endDate = new Date(currentSeason.endYear, 5, 30); // 30 juni

    logMessage(`Huidige seizoen: ${currentSeason.seasonName} (${startDate.toDateString()} - ${endDate.toDateString()})`);

    return historyData.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });

  } catch (error) {
    logMessage(`Fout bij ophalen seizoen data: ${error.message}`);
    return [];
  }
};

// **NIEUWE FUNCTIE: Seizoen statistieken genereren**
const generateSeasonStatistics = () => {
  try {
    const seasonData = getCurrentSeasonData();
    const currentSeason = getCurrentSeason();
    
    if (seasonData.length === 0) {
      return {
        seasonName: currentSeason.seasonName,
        totalDays: 0,
        totalVisits: 0,
        adherents: { total: 0, ageGroups: {} },
        nonAdherents: { total: 0, ageGroups: {}, totalPaid: 0 },
        paymentMethods: { Especes: 0, CB: 0, Cheque: 0 }
      };
    }

    const stats = {
      seasonName: currentSeason.seasonName,
      totalDays: seasonData.length,
      totalVisits: 0,
      adherents: { 
        total: 0, 
        ageGroups: { '< 8 ans': 0, '8-18 ans': 0, '> 18 ans (adultes)': 0, 'Inconnu': 0 }
      },
      nonAdherents: { 
        total: 0, 
        ageGroups: { '< 8 ans': 0, '8-18 ans': 0, '> 18 ans (adultes)': 0, 'Inconnu': 0 },
        totalPaid: 0
      },
      paymentMethods: { Especes: 0, CB: 0, Cheque: 0 }
    };

    seasonData.forEach(dayEntry => {
      if (!dayEntry.presences || !Array.isArray(dayEntry.presences)) return;
      
      dayEntry.presences.forEach(presence => {
        stats.totalVisits++;
        
        const ageGroup = getAgeGroup(presence.dateNaissance, presence.date || dayEntry.date);
        
        if (presence.type === 'adherent') {
          stats.adherents.total++;
          stats.adherents.ageGroups[ageGroup]++;
        } else if (presence.type === 'non-adherent') {
          stats.nonAdherents.total++;
          stats.nonAdherents.ageGroups[ageGroup]++;
          
          // Betaling statistieken
          if (presence.tarif && presence.tarif > 0) {
            stats.nonAdherents.totalPaid += parseFloat(presence.tarif) || 0;
          }
          
          if (presence.methodePaiement) {
            if (stats.paymentMethods[presence.methodePaiement] !== undefined) {
              stats.paymentMethods[presence.methodePaiement]++;
            }
          }
        }
      });
    });

    logMessage(`Seizoen statistieken gegenereerd: ${JSON.stringify(stats)}`);
    return stats;

  } catch (error) {
    logMessage(`Fout bij genereren seizoen statistieken: ${error.message}`);
    return null;
  }
};

// **NIEUWE FUNCTIE: Maak testdata aan als er geen data is**
const createTestDataIfNeeded = () => {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      logMessage('Geen presence-history.json gevonden, maak testdata aan');
      
      // Maak testdata voor huidige seizoen EN vorig jaar voor historische export
      const currentSeason = getCurrentSeason();
      const testData = [
        // Vorig jaar data (voor historische export)
        {
          date: '2024-03-15',
          presences: [
            {
              id: 'test-old1',
              type: 'non-adherent',
              nom: 'Historique',
              prenom: 'Personne',
              date: '2024-03-15T14:30:00.000Z',
              status: 'Payé',
              tarif: 10,
              methodePaiement: 'CB',
              telephone: '0123456789',
              email: 'historique@email.com',
              dateNaissance: '1990-01-01',
              niveau: '2',
              assuranceAccepted: true
            }
          ]
        },
        // Huidig seizoen data
        {
          date: `${currentSeason.startYear}-07-15`, // Juli
          presences: [
            {
              id: 'test1',
              type: 'non-adherent',
              nom: 'Dupont',
              prenom: 'Jean',
              date: `${currentSeason.startYear}-07-15T14:30:00.000Z`,
              status: 'Payé',
              tarif: 10,
              methodePaiement: 'CB',
              telephone: '0123456789',
              email: 'jean.dupont@email.com',
              dateNaissance: '1985-03-15', // > 18 ans
              niveau: '1',
              assuranceAccepted: true
            },
            {
              id: 'test2',
              type: 'adherent',
              nom: 'Martin',
              prenom: 'Marie',
              date: `${currentSeason.startYear}-07-15T15:00:00.000Z`,
              status: 'adherent',
              dateNaissance: '2010-05-20', // 8-18 ans
              niveau: '0'
            }
          ]
        },
        {
          date: `${currentSeason.endYear}-01-10`, // Januari (hetzelfde seizoen)
          presences: [
            {
              id: 'test3',
              type: 'non-adherent',
              nom: 'Bernard',
              prenom: 'Pierre',
              date: `${currentSeason.endYear}-01-10T10:15:00.000Z`,
              status: 'Payé',
              tarif: 8,
              methodePaiement: 'Especes',
              telephone: '0987654321',
              email: 'pierre.bernard@email.com',
              dateNaissance: '2018-07-22', // < 8 ans
              niveau: '0',
              assuranceAccepted: true
            }
          ]
        }
      ];
      
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(testData, null, 2));
      logMessage('Testdata aangemaakt in presence-history.json voor huidige seizoen EN historische data');
    }
  } catch (error) {
    logMessage(`Fout bij aanmaken testdata: ${error.message}`);
  }
};

// **FUNCTIE: Exporteer jaar naar Excel (voor historische export)**
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
    const stats = generateHistoricalStatistics(excelData, year);
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

// **FUNCTIE: Historische statistieken genereren**
const generateHistoricalStatistics = (data, year) => {
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

// **AANGEPASTE FUNCTIE: Exporteer seizoen naar Excel (update bestaand bestand)**
const exportSeasonToExcel = () => {
  try {
    const currentSeason = getCurrentSeason();
    logMessage(`=== SEIZOEN EXCEL EXPORT GESTART (${currentSeason.seasonName}) ===`);
    
    ensureExportsDir();
    
    const seasonData = getCurrentSeasonData();
    if (seasonData.length === 0) {
      throw new Error(`Geen data gevonden voor seizoen ${currentSeason.seasonName}`);
    }

    // Converteer alle presences naar Excel format
    const excelData = [];
    
    seasonData.forEach(dayEntry => {
      if (!dayEntry.presences || !Array.isArray(dayEntry.presences)) return;
      
      dayEntry.presences.forEach(presence => {
        const ageGroup = getAgeGroup(presence.dateNaissance, presence.date || dayEntry.date);
        
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
          'Groupe d\'âge': ageGroup,
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
      throw new Error(`Geen presences gevonden voor seizoen ${currentSeason.seasonName}`);
    }

    // **BESTANDSNAAM: Update bestaand bestand**
    const filename = `presences-saison-${currentSeason.seasonName}.xlsx`;
    const filepath = path.join(EXPORTS_DIR, filename);
    
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
      { wch: 18 }, // Groupe d'âge
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
    
    // **NIEUWE STATISTIEKEN: Seizoen statistieken**
    const seasonStats = generateSeasonStatistics();
    const statsData = generateDetailedStatisticsForExcel(seasonStats);
    const wsStats = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, wsStats, 'Statistiques');

    // **OVERSCHRIJF bestaand bestand**
    XLSX.writeFile(wb, filepath);
    
    logMessage(`Excel export succesvol (bijgewerkt): ${filename}`);
    logMessage(`Totaal ${excelData.length} records geëxporteerd`);
    logMessage(`Seizoen: ${currentSeason.seasonName}`);
    logMessage(`=== SEIZOEN EXCEL EXPORT VOLTOOID ===`);
    
    return {
      success: true,
      filename,
      filepath,
      recordCount: excelData.length,
      seasonName: currentSeason.seasonName
    };
    
  } catch (error) {
    logMessage(`FOUT BIJ SEIZOEN EXCEL EXPORT: ${error.message}`);
    throw error;
  }
};

// **NIEUWE FUNCTIE: Gedetailleerde statistieken voor Excel**
const generateDetailedStatisticsForExcel = (seasonStats) => {
  if (!seasonStats) return [];
  
  return [
    { 'Statistique': 'SEIZOEN OVERZICHT', 'Valeur': '' },
    { 'Statistique': 'Seizoen', 'Valeur': seasonStats.seasonName },
    { 'Statistique': 'Periode', 'Valeur': '1 juli - 30 juni' },
    { 'Statistique': 'Aantal dagen actief', 'Valeur': seasonStats.totalDays },
    { 'Statistique': 'Totaal bezoeken', 'Valeur': seasonStats.totalVisits },
    { 'Statistique': '', 'Valeur': '' },
    
    // Adherents statistieken
    { 'Statistique': 'LEDEN (ADHERENTS)', 'Valeur': '' },
    { 'Statistique': 'Totaal leden', 'Valeur': seasonStats.adherents.total },
    { 'Statistique': '  • < 8 jaar', 'Valeur': seasonStats.adherents.ageGroups['< 8 ans'] || 0 },
    { 'Statistique': '  • 8-18 jaar', 'Valeur': seasonStats.adherents.ageGroups['8-18 ans'] || 0 },
    { 'Statistique': '  • > 18 jaar (volwassenen)', 'Valeur': seasonStats.adherents.ageGroups['> 18 ans (adultes)'] || 0 },
    { 'Statistique': '  • Onbekende leeftijd', 'Valeur': seasonStats.adherents.ageGroups['Inconnu'] || 0 },
    { 'Statistique': '', 'Valeur': '' },
    
    // Non-adherents statistieken
    { 'Statistique': 'NIET-LEDEN', 'Valeur': '' },
    { 'Statistique': 'Totaal niet-leden', 'Valeur': seasonStats.nonAdherents.total },
    { 'Statistique': '  • < 8 jaar', 'Valeur': seasonStats.nonAdherents.ageGroups['< 8 ans'] || 0 },
    { 'Statistique': '  • 8-18 jaar', 'Valeur': seasonStats.nonAdherents.ageGroups['8-18 ans'] || 0 },
    { 'Statistique': '  • > 18 jaar (volwassenen)', 'Valeur': seasonStats.nonAdherents.ageGroups['> 18 ans (adultes)'] || 0 },
    { 'Statistique': '  • Onbekende leeftijd', 'Valeur': seasonStats.nonAdherents.ageGroups['Inconnu'] || 0 },
    { 'Statistique': 'Totaal betaald door niet-leden (€)', 'Valeur': seasonStats.nonAdherents.totalPaid.toFixed(2) },
    { 'Statistique': '', 'Valeur': '' },
    
    // Betalingsmethodes
    { 'Statistique': 'BETALINGSMETHODES', 'Valeur': '' },
    { 'Statistique': 'Contant (Espèces)', 'Valeur': seasonStats.paymentMethods.Especes || 0 },
    { 'Statistique': 'Bankkaart (CB)', 'Valeur': seasonStats.paymentMethods.CB || 0 },
    { 'Statistique': 'Cheque', 'Valeur': seasonStats.paymentMethods.Cheque || 0 },
  ];
};

// **BESTAANDE FUNCTIES BLIJVEN**
const getAssuranceStatus = (presence) => {
  if (presence.assuranceAccepted !== undefined) {
    return presence.assuranceAccepted ? 'Oui' : 'Non';
  }
  
  if (presence.type === 'non-adherent' && presence.status !== 'pending') {
    return 'Oui (implicite)';
  }
  
  return 'Non spécifié';
};

// **AANGEPASTE FUNCTIE: Beschikbare seizoenen ophalen**
const getAvailableSeasons = () => {
  try {
    logMessage('=== GET AVAILABLE SEASONS GESTART ===');
    
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

    // Bepaal alle unieke seizoenen
    const seasons = new Set();
    
    historyData.forEach(entry => {
      const entryDate = new Date(entry.date);
      const season = getCurrentSeason(entryDate);
      seasons.add(season.seasonName);
      logMessage(`Entry datum: ${entry.date} -> seizoen: ${season.seasonName}`);
    });

    const seasonList = Array.from(seasons).sort().reverse(); // Nieuwste eerst
    logMessage(`Beschikbare seizoenen gevonden: ${JSON.stringify(seasonList)}`);
    logMessage('=== GET AVAILABLE SEASONS VOLTOOID ===');
    return seasonList;
    
  } catch (error) {
    logMessage(`Fout bij ophalen beschikbare seizoenen: ${error.message}`);
    return [];
  }
};

// **NIEUWE FUNCTIE: Beschikbare jaren ophalen (voor historische export)**
const getAvailableYears = () => {
  try {
    logMessage('=== GET AVAILABLE YEARS GESTART ===');
    
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
  exportSeasonToExcel,
  exportYearToExcel,
  cleanupYearAfterExport,
  getAvailableSeasons,
  getAvailableYears,
  generateSeasonStatistics,
  getCurrentSeason,
  getCurrentSeasonData,
  ensureExportsDir,
  createTestDataIfNeeded
};
