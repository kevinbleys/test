const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_DIR = path.join(__dirname, 'data');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');
const HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const LOG_FILE = path.join(DATA_DIR, 'export.log');

// **LOGGING FUNCTIE**
const logMessage = (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] EXPORT: ${message}\n`;
  
  console.log(`🔍 EXPORT-SERVICE: ${message}`);
  
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (error) {
    console.error('❌ Fout bij schrijven naar export log:', error);
  }
};

// **FUNCTIE: Zorg dat exports directory bestaat**
const ensureExportsDir = () => {
  if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
    logMessage(`📁 Exports directory aangemaakt: ${EXPORTS_DIR}`);
  }
};

// **FUNCTIE: Huidige seizoen bepalen**
const getCurrentSeason = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  if (month < 6) {
    return {
      startYear: year - 1,
      endYear: year,
      seasonName: `${year - 1}-${year}`
    };
  } else {
    return {
      startYear: year,
      endYear: year + 1,
      seasonName: `${year}-${year + 1}`
    };
  }
};

// **FUNCTIE: Leeftijdsgroep bepalen**
const getAgeGroup = (dateNaissance, visitDate) => {
  if (!dateNaissance) return 'Inconnu';
  
  try {
    const birthDate = new Date(dateNaissance);
    const visitDateObj = new Date(visitDate);
    
    let age = visitDateObj.getFullYear() - birthDate.getFullYear();
    const monthDiff = visitDateObj.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && visitDateObj.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 8) return '< 8 ans';
    if (age >= 8 && age <= 18) return '8-18 ans';
    return '> 18 ans (adultes)';
    
  } catch (error) {
    logMessage(`❌ Fout bij berekenen leeftijd voor ${dateNaissance}: ${error.message}`);
    return 'Inconnu';
  }
};

// **FUNCTIE: Data voor huidige seizoen ophalen**
const getCurrentSeasonData = () => {
  try {
    logMessage('📊 getCurrentSeasonData gestart');
    
    if (!fs.existsSync(HISTORY_FILE)) {
      logMessage(`❌ HISTORY_FILE bestaat niet: ${HISTORY_FILE}`);
      return [];
    }

    const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    if (!Array.isArray(historyData)) {
      logMessage('❌ History data is niet een array');
      return [];
    }

    const currentSeason = getCurrentSeason();
    const startDate = new Date(currentSeason.startYear, 6, 1);
    const endDate = new Date(currentSeason.endYear, 5, 30);

    logMessage(`📅 Huidige seizoen: ${currentSeason.seasonName} (${startDate.toDateString()} - ${endDate.toDateString()})`);

    const filteredData = historyData.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    logMessage(`✅ getCurrentSeasonData: ${filteredData.length} entries gevonden`);
    return filteredData;

  } catch (error) {
    logMessage(`❌ Fout bij ophalen seizoen data: ${error.message}`);
    return [];
  }
};

// **FUNCTIE: Seizoen statistieken genereren**
const generateSeasonStatistics = () => {
  try {
    logMessage('📊 generateSeasonStatistics gestart');
    const seasonData = getCurrentSeasonData();
    const currentSeason = getCurrentSeason();
    
    if (seasonData.length === 0) {
      logMessage('⚠️ Geen seizoen data voor statistieken');
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

    logMessage(`✅ Seizoen statistieken gegenereerd: ${JSON.stringify(stats)}`);
    return stats;

  } catch (error) {
    logMessage(`❌ Fout bij genereren seizoen statistieken: ${error.message}`);
    return null;
  }
};

// **KRITIEKE FUNCTIE: Maak testdata aan**
const createTestDataIfNeeded = () => {
  try {
    logMessage('🔄 createTestDataIfNeeded gestart');
    
    if (!fs.existsSync(HISTORY_FILE)) {
      logMessage('📝 Geen presence-history.json gevonden, maak uitgebreide testdata aan');
      
      const currentSeason = getCurrentSeason();
      const currentYear = new Date().getFullYear();
      
      const testData = [
        // **2023 DATA**
        {
          date: '2023-01-15',
          presences: [
            {
              id: 'test-2023-1',
              type: 'non-adherent',
              nom: 'Historique',
              prenom: 'Person2023',
              date: '2023-01-15T14:30:00.000Z',
              status: 'Payé',
              tarif: 12,
              methodePaiement: 'CB',
              telephone: '0123456789',
              email: 'historique2023@email.com',
              dateNaissance: '1990-01-01',
              niveau: '2',
              assuranceAccepted: true
            }
          ]
        },
        {
          date: '2023-06-20',
          presences: [
            {
              id: 'test-2023-2',
              type: 'adherent',
              nom: 'Martin',
              prenom: 'Sophie',
              date: '2023-06-20T15:00:00.000Z',
              status: 'adherent',
              dateNaissance: '2008-03-15',
              niveau: '1'
            }
          ]
        },
        
        // **2024 DATA**
        {
          date: '2024-03-15',
          presences: [
            {
              id: 'test-2024-1',
              type: 'non-adherent',
              nom: 'Historique',
              prenom: 'Person2024',
              date: '2024-03-15T14:30:00.000Z',
              status: 'Payé',
              tarif: 10,
              methodePaiement: 'CB',
              telephone: '0123456789',
              email: 'historique2024@email.com',
              dateNaissance: '1990-01-01',
              niveau: '2',
              assuranceAccepted: true
            }
          ]
        },
        {
          date: '2024-05-10',
          presences: [
            {
              id: 'test-2024-2',
              type: 'adherent',
              nom: 'Durand',
              prenom: 'Michel',
              date: '2024-05-10T16:00:00.000Z',
              status: 'adherent',
              dateNaissance: '1985-07-20',
              niveau: '2'
            }
          ]
        },
        {
          date: '2024-09-25',
          presences: [
            {
              id: 'test-2024-3',
              type: 'non-adherent',
              nom: 'Petit',
              prenom: 'Emma',
              date: '2024-09-25T10:15:00.000Z',
              status: 'Payé',
              tarif: 8,
              methodePaiement: 'Especes',
              telephone: '0987654321',
              email: 'emma.petit@email.com',
              dateNaissance: '2016-12-05',
              niveau: '0',
              assuranceAccepted: true
            }
          ]
        },
        
        // **HUIDIGE SEIZOEN DATA**
        {
          date: `${currentSeason.startYear}-07-15`,
          presences: [
            {
              id: 'test-current-1',
              type: 'non-adherent',
              nom: 'Dupont',
              prenom: 'Jean',
              date: `${currentSeason.startYear}-07-15T14:30:00.000Z`,
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
              id: 'test-current-2',
              type: 'adherent',
              nom: 'Martin',
              prenom: 'Marie',
              date: `${currentSeason.startYear}-07-15T15:00:00.000Z`,
              status: 'adherent',
              dateNaissance: '2010-05-20',
              niveau: '0'
            }
          ]
        },
        {
          date: `${currentYear}-01-10`,
          presences: [
            {
              id: 'test-current-3',
              type: 'non-adherent',
              nom: 'Bernard',
              prenom: 'Pierre',
              date: `${currentYear}-01-10T10:15:00.000Z`,
              status: 'Payé',
              tarif: 8,
              methodePaiement: 'Especes',
              telephone: '0987654321',
              email: 'pierre.bernard@email.com',
              dateNaissance: '2018-07-22',
              niveau: '0',
              assuranceAccepted: true
            }
          ]
        }
      ];
      
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(testData, null, 2));
      logMessage(`✅ Uitgebreide testdata aangemaakt met jaren: 2023, 2024, ${currentYear}`);
      
    } else {
      logMessage('✅ presence-history.json bestaat al');
    }
  } catch (error) {
    logMessage(`❌ Fout bij aanmaken testdata: ${error.message}`);
  }
};

// **KRITIEKE FUNCTIE: Beschikbare jaren ophalen**
const getAvailableYears = () => {
  try {
    logMessage('🔍 ===== GET AVAILABLE YEARS GESTART =====');
    
    createTestDataIfNeeded();
    
    if (!fs.existsSync(HISTORY_FILE)) {
      logMessage(`❌ HISTORY_FILE bestaat niet: ${HISTORY_FILE}`);
      return [];
    }

    const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    logMessage(`📊 Gelezen history data: ${historyData.length} entries`);
    
    if (!Array.isArray(historyData) || historyData.length === 0) {
      logMessage('❌ History data is leeg of geen array');
      return [];
    }

    const yearCounts = {};
    historyData.forEach((entry, index) => {
      if (!entry.date) {
        logMessage(`⚠️ Entry ${index} heeft geen datum`);
        return;
      }
      
      const year = new Date(entry.date).getFullYear();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
      logMessage(`📅 Entry ${index}: datum=${entry.date} -> jaar=${year}`);
    });

    const years = Object.keys(yearCounts).map(y => parseInt(y)).sort((a, b) => b - a);
    
    logMessage(`🎯 Jaren gevonden met aantallen:`);
    Object.keys(yearCounts).forEach(year => {
      logMessage(`   ${year}: ${yearCounts[year]} dagen`);
    });
    
    logMessage(`✅ Finale jaren lijst: ${JSON.stringify(years)}`);
    logMessage('🔍 ===== GET AVAILABLE YEARS VOLTOOID =====');
    
    return years;
    
  } catch (error) {
    logMessage(`❌ FOUT bij ophalen beschikbare jaren: ${error.message}`);
    logMessage(`❌ Stack trace: ${error.stack}`);
    return [];
  }
};

// **FUNCTIE: Exporteer jaar naar Excel**
const exportYearToExcel = (year) => {
  try {
    logMessage(`📊 === JAAR EXCEL EXPORT GESTART (${year}) ===`);
    
    ensureExportsDir();
    
    if (!fs.existsSync(HISTORY_FILE)) {
      throw new Error('Geen presence-history.json bestand gevonden');
    }

    const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    
    if (!Array.isArray(historyData) || historyData.length === 0) {
      throw new Error('Presence historiek is leeg of ongeldig');
    }

    const yearData = historyData.filter(entry => {
      const entryYear = new Date(entry.date).getFullYear();
      return entryYear === parseInt(year);
    });

    if (yearData.length === 0) {
      throw new Error(`Geen data gevonden voor jaar ${year}`);
    }

    logMessage(`📊 Gevonden ${yearData.length} dagen voor jaar ${year}`);

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

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    const columnWidths = [
      { wch: 12 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
      { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 18 },
      { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 30 }
    ];
    ws['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Présences');
    
    const stats = generateHistoricalStatistics(excelData, year);
    const wsStats = XLSX.utils.json_to_sheet(stats);
    XLSX.utils.book_append_sheet(wb, wsStats, 'Statistiques');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const filename = `presences-${year}-export-${timestamp}.xlsx`;
    const filepath = path.join(EXPORTS_DIR, filename);
    
    XLSX.writeFile(wb, filepath);
    
    logMessage(`✅ Excel export succesvol: ${filename} (${excelData.length} records)`);
    
    return {
      success: true,
      filename,
      filepath,
      recordCount: excelData.length,
      year: parseInt(year)
    };
    
  } catch (error) {
    logMessage(`❌ FOUT BIJ EXCEL EXPORT: ${error.message}`);
    throw error;
  }
};

// **FUNCTIE: Cleanup jaar na export**
const cleanupYearAfterExport = (year) => {
  try {
    logMessage(`🧹 === CLEANUP NA EXPORT GESTART (${year}) ===`);
    
    if (!fs.existsSync(HISTORY_FILE)) {
      throw new Error('Geen presence-history.json bestand gevonden');
    }

    const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    
    if (!Array.isArray(historyData)) {
      throw new Error('Ongeldig historie bestand format');
    }

    const originalCount = historyData.length;
    const filteredHistory = historyData.filter(entry => {
      const entryYear = new Date(entry.date).getFullYear();
      return entryYear !== parseInt(year);
    });
    
    const deletedCount = originalCount - filteredHistory.length;
    
    if (deletedCount === 0) {
      logMessage(`⚠️ Geen entries gevonden voor jaar ${year}`);
      return { success: false, message: `Geen data gevonden voor jaar ${year}` };
    }

    fs.writeFileSync(HISTORY_FILE, JSON.stringify(filteredHistory, null, 2));

    logMessage(`✅ Cleanup voltooid: ${deletedCount} entries verwijderd, ${filteredHistory.length} behouden`);
    
    return {
      success: true,
      deletedCount,
      remainingCount: filteredHistory.length
    };
    
  } catch (error) {
    logMessage(`❌ FOUT BIJ CLEANUP: ${error.message}`);
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
    { 'Statistique': '', 'Valeur': '' },
    { 'Statistique': 'PAIEMENTS:', 'Valeur': '' },
    { 'Statistique': 'Total facturé (€)', 'Valeur': data.reduce((sum, r) => sum + (parseFloat(r['Montant (€)']) || 0), 0) },
    { 'Statistique': 'Espèces', 'Valeur': data.filter(r => r['Méthode de paiement'] === 'Especes').length },
    { 'Statistique': 'Carte bancaire', 'Valeur': data.filter(r => r['Méthode de paiement'] === 'CB').length },
    { 'Statistique': 'Chèque', 'Valeur': data.filter(r => r['Méthode de paiement'] === 'Cheque').length },
    { 'Statistique': '', 'Valeur': '' },
    { 'Statistique': 'NIVEAUX:', 'Valeur': '' },
    { 'Statistique': 'Niveau 0', 'Valeur': data.filter(r => r['Niveau de grimpe'] === '0').length },
    { 'Statistique': 'Niveau 1', 'Valeur': data.filter(r => r['Niveau de grimpe'] === '1').length },
    { 'Statistique': 'Niveau 2', 'Valeur': data.filter(r => r['Niveau de grimpe'] === '2').length },
  ];
  
  return stats;
};

// **FUNCTIE: Seizoen export**
const exportSeasonToExcel = () => {
  try {
    const currentSeason = getCurrentSeason();
    logMessage(`📊 === SEIZOEN EXCEL EXPORT GESTART (${currentSeason.seasonName}) ===`);
    
    ensureExportsDir();
    
    const seasonData = getCurrentSeasonData();
    if (seasonData.length === 0) {
      throw new Error(`Geen data gevonden voor seizoen ${currentSeason.seasonName}`);
    }

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

    const filename = `presences-saison-${currentSeason.seasonName}.xlsx`;
    const filepath = path.join(EXPORTS_DIR, filename);
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    const columnWidths = [
      { wch: 12 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
      { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 15 },
      { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 30 }
    ];
    ws['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Présences');
    
    const seasonStats = generateSeasonStatistics();
    const statsData = generateDetailedStatisticsForExcel(seasonStats);
    const wsStats = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, wsStats, 'Statistiques');

    XLSX.writeFile(wb, filepath);
    
    logMessage(`✅ Seizoen Excel export succesvol: ${filename} (${excelData.length} records)`);
    
    return {
      success: true,
      filename,
      filepath,
      recordCount: excelData.length,
      seasonName: currentSeason.seasonName
    };
    
  } catch (error) {
    logMessage(`❌ FOUT BIJ SEIZOEN EXCEL EXPORT: ${error.message}`);
    throw error;
  }
};

// **FUNCTIE: Gedetailleerde statistieken voor Excel**
const generateDetailedStatisticsForExcel = (seasonStats) => {
  if (!seasonStats) return [];
  
  return [
    { 'Statistique': 'SEIZOEN OVERZICHT', 'Valeur': '' },
    { 'Statistique': 'Seizoen', 'Valeur': seasonStats.seasonName },
    { 'Statistique': 'Periode', 'Valeur': '1 juli - 30 juni' },
    { 'Statistique': 'Aantal dagen actief', 'Valeur': seasonStats.totalDays },
    { 'Statistique': 'Totaal bezoeken', 'Valeur': seasonStats.totalVisits },
    { 'Statistique': '', 'Valeur': '' },
    { 'Statistique': 'LEDEN (ADHERENTS)', 'Valeur': '' },
    { 'Statistique': 'Totaal leden', 'Valeur': seasonStats.adherents.total },
    { 'Statistique': '  • < 8 jaar', 'Valeur': seasonStats.adherents.ageGroups['< 8 ans'] || 0 },
    { 'Statistique': '  • 8-18 jaar', 'Valeur': seasonStats.adherents.ageGroups['8-18 ans'] || 0 },
    { 'Statistique': '  • > 18 jaar (volwassenen)', 'Valeur': seasonStats.adherents.ageGroups['> 18 ans (adultes)'] || 0 },
    { 'Statistique': '  • Onbekende leeftijd', 'Valeur': seasonStats.adherents.ageGroups['Inconnu'] || 0 },
    { 'Statistique': '', 'Valeur': '' },
    { 'Statistique': 'NIET-LEDEN', 'Valeur': '' },
    { 'Statistique': 'Totaal niet-leden', 'Valeur': seasonStats.nonAdherents.total },
    { 'Statistique': '  • < 8 jaar', 'Valeur': seasonStats.nonAdherents.ageGroups['< 8 ans'] || 0 },
    { 'Statistique': '  • 8-18 jaar', 'Valeur': seasonStats.nonAdherents.ageGroups['8-18 ans'] || 0 },
    { 'Statistique': '  • > 18 jaar (volwassenen)', 'Valeur': seasonStats.nonAdherents.ageGroups['> 18 ans (adultes)'] || 0 },
    { 'Statistique': '  • Onbekende leeftijd', 'Valeur': seasonStats.nonAdherents.ageGroups['Inconnu'] || 0 },
    { 'Statistique': 'Totaal betaald door niet-leden (€)', 'Valeur': seasonStats.nonAdherents.totalPaid.toFixed(2) },
    { 'Statistique': '', 'Valeur': '' },
    { 'Statistique': 'BETALINGSMETHODES', 'Valeur': '' },
    { 'Statistique': 'Contant (Espèces)', 'Valeur': seasonStats.paymentMethods.Especes || 0 },
    { 'Statistique': 'Bankkaart (CB)', 'Valeur': seasonStats.paymentMethods.CB || 0 },
    { 'Statistique': 'Cheque', 'Valeur': seasonStats.paymentMethods.Cheque || 0 },
  ];
};

// **FUNCTIE: Beschikbare seizoenen ophalen**
const getAvailableSeasons = () => {
  try {
    logMessage('📊 === GET AVAILABLE SEASONS GESTART ===');
    
    createTestDataIfNeeded();
    
    if (!fs.existsSync(HISTORY_FILE)) {
      logMessage('❌ HISTORY_FILE bestaat niet na testdata poging');
      return [];
    }

    const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    logMessage(`📊 Gelezen history data: ${historyData.length} entries`);
    
    if (!Array.isArray(historyData) || historyData.length === 0) {
      logMessage('❌ History data is leeg of geen array');
      return [];
    }

    const seasons = new Set();
    
    historyData.forEach(entry => {
      const entryDate = new Date(entry.date);
      const season = getCurrentSeason(entryDate);
      seasons.add(season.seasonName);
      logMessage(`📅 Entry datum: ${entry.date} -> seizoen: ${season.seasonName}`);
    });

    const seasonList = Array.from(seasons).sort().reverse();
    logMessage(`✅ Beschikbare seizoenen gevonden: ${JSON.stringify(seasonList)}`);
    
    return seasonList;
    
  } catch (error) {
    logMessage(`❌ Fout bij ophalen beschikbare seizoenen: ${error.message}`);
    return [];
  }
};

// **HELPER FUNCTIE: Assurance status**
const getAssuranceStatus = (presence) => {
  if (presence.assuranceAccepted !== undefined) {
    return presence.assuranceAccepted ? 'Oui' : 'Non';
  }
  
  if (presence.type === 'non-adherent' && presence.status !== 'pending') {
    return 'Oui (implicite)';
  }
  
  return 'Non spécifié';
};

// **KRITIEKE MODULE EXPORTS - ALLE FUNCTIES EXPLICIET**
module.exports = {
  // Seizoen functies
  exportSeasonToExcel,
  getAvailableSeasons,
  generateSeasonStatistics,
  getCurrentSeason,
  getCurrentSeasonData,
  
  // Jaar functies
  exportYearToExcel,
  getAvailableYears,
  cleanupYearAfterExport,
  
  // Utility functies
  ensureExportsDir,
  createTestDataIfNeeded
};
