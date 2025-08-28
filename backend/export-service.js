const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_DIR = path.join(__dirname, 'data');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');
const HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const LOG_FILE = path.join(DATA_DIR, 'export.log');

// Logging function
const logMessage = (message) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] EXPORT: ${message}\n`;
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.appendFileSync(LOG_FILE, logEntry);
        console.log(`EXPORT: ${message}`);
    } catch (error) {
        console.error('Log error:', error);
    }
};

// Season helpers
function getCurrentSeason(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();
    if (month < 6) { // January to June = previous season
        return { startYear: year - 1, endYear: year, seasonName: `${year - 1}-${year}` };
    } else { // July to December = current season
        return { startYear: year, endYear: year + 1, seasonName: `${year}-${year + 1}` };
    }
}

// Create test data if needed
function createTestDataIfNeeded() {
    let needTestData = false;
    if (!fs.existsSync(HISTORY_FILE)) {
        needTestData = true;
    } else {
        try {
            const content = fs.readFileSync(HISTORY_FILE, 'utf8');
            const data = JSON.parse(content);
            if (!Array.isArray(data) || data.length === 0) needTestData = true;
        } catch {
            needTestData = true;
        }
    }

    if (needTestData) {
        logMessage('📝 presence-history.json ontbreekt of leeg/ongeldig, testdata aanmaken!');
        const currentSeason = getCurrentSeason();
        const currentYear = new Date().getFullYear();

        const testData = [
            {
                date: '2023-01-15', 
                presences: [{
                    id: 'test-2023-1', 
                    type: 'non-adherent', 
                    nom: 'Historique', 
                    prenom: 'Person2023', 
                    date: '2023-01-15T14:30:00.000Z', 
                    status: 'Payé', 
                    tarif: 12, 
                    methodePaiement: 'CB', 
                    dateNaissance: '1990-01-01', 
                    niveau: '2'
                }]
            },
            {
                date: '2023-06-20', 
                presences: [{
                    id: 'test-2023-2', 
                    type: 'adherent', 
                    nom: 'Martin', 
                    prenom: 'Sophie', 
                    date: '2023-06-20T15:00:00.000Z', 
                    status: 'adherent', 
                    dateNaissance: '2008-03-15', 
                    niveau: '1'
                }]
            },
            {
                date: '2024-03-15', 
                presences: [{
                    id: 'test-2024-1', 
                    type: 'non-adherent', 
                    nom: 'Historique', 
                    prenom: 'Person2024', 
                    date: '2024-03-15T14:30:00.000Z', 
                    status: 'Payé', 
                    tarif: 10, 
                    methodePaiement: 'CB', 
                    dateNaissance: '1990-01-01', 
                    niveau: '2'
                }]
            },
            {
                date: `${currentYear}-01-10`, 
                presences: [{
                    id: 'test-current-1', 
                    type: 'non-adherent', 
                    nom: 'Bernard', 
                    prenom: 'Pierre', 
                    date: `${currentYear}-01-10T10:15:00.000Z`, 
                    status: 'Payé', 
                    tarif: 8, 
                    methodePaiement: 'Especes', 
                    dateNaissance: '2018-07-22', 
                    niveau: '0'
                }]
            }
        ];

        fs.writeFileSync(HISTORY_FILE, JSON.stringify(testData, null, 2));
        logMessage(`✅ Testdata aangemaakt voor jaren: 2023, 2024, ${currentYear}`);
    } else {
        logMessage('✅ Er is al geldige presence-history.json aanwezig');
    }
}

// Column widths for Excel
const XLSX_COLS = [
    { wch: 12 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
    { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 15 },
    { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 30 }
];

// Age group helper
function getAgeGroup(dateNaissance, visitDate) {
    if (!dateNaissance) return 'Inconnu';
    try {
        const birthDate = new Date(dateNaissance);
        const visitDateObj = new Date(visitDate);
        let age = visitDateObj.getFullYear() - birthDate.getFullYear();
        const m = visitDateObj.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && visitDateObj.getDate() < birthDate.getDate())) age--;

        if (age < 8) return '< 8 ans';
        if (age <= 18) return '8-18 ans';
        return '> 18 ans (adultes)';
    } catch {
        return 'Inconnu';
    }
}

// Ensure exports directory exists
function ensureExportsDir() {
    if (!fs.existsSync(EXPORTS_DIR)) {
        fs.mkdirSync(EXPORTS_DIR, { recursive: true });
        logMessage(`✅ Created exports directory: ${EXPORTS_DIR}`);
    }
}

// Insurance status helper
function getAssuranceStatus(presence) {
    if (presence.assuranceAccepted !== undefined) {
        return presence.assuranceAccepted ? 'Oui' : 'Non';
    }
    if (presence.type === 'non-adherent' && presence.status !== 'pending') {
        return 'Oui (implicite)';
    }
    return 'Non spécifié';
}

// Get available years from presence history
function getAvailableYears() {
    createTestDataIfNeeded();
    if (!fs.existsSync(HISTORY_FILE)) return [];

    let data;
    try {
        data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch {
        return [];
    }

    if (!Array.isArray(data) || data.length === 0) return [];

    const years = [...new Set(data.map(entry => new Date(entry.date).getFullYear()))]
        .sort((a, b) => b - a);

    return years;
}

// Export specific year to Excel
function exportYearToExcel(year) {
    ensureExportsDir();
    createTestDataIfNeeded();

    if (!fs.existsSync(HISTORY_FILE)) {
        throw new Error('Geen presence-history.json bestand gevonden');
    }

    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    const yearData = data.filter(entry => new Date(entry.date).getFullYear() === Number(year));

    if (!yearData.length) {
        throw new Error(`Geen data gevonden voor jaar ${year}`);
    }

    const excelData = [];
    yearData.forEach(day => {
        (day.presences || []).forEach(presence => {
            excelData.push({
                'Date': day.date,
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
                'Date validation': presence.dateValidation ? 
                    new Date(presence.dateValidation).toLocaleDateString('fr-FR') : '',
                'Adresse': presence.adresse || ''
            });
        });
    });

    if (!excelData.length) {
        throw new Error(`Geen presences voor jaar ${year}`);
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    ws['!cols'] = XLSX_COLS;
    XLSX.utils.book_append_sheet(wb, ws, 'Présences');

    // Add statistics sheet
    const statsData = [
        { Statistique: 'Année', Valeur: year },
        { Statistique: 'Total présences', Valeur: excelData.length },
        { Statistique: 'Adhérents', Valeur: excelData.filter(p => p.Adhérent === 'Oui').length },
        { Statistique: 'Non-adhérents', Valeur: excelData.filter(p => p.Adhérent === 'Non').length }
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statsData), 'Statistiques');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const filename = `presences-${year}-export-${timestamp}.xlsx`;
    const filepath = path.join(EXPORTS_DIR, filename);

    XLSX.writeFile(wb, filepath);
    logMessage(`✅ Excel export created: ${filename} with ${excelData.length} records`);

    return { 
        success: true, 
        filename, 
        filepath, 
        recordCount: excelData.length, 
        year: Number(year) 
    };
}

// Cleanup year after export
function cleanupYearAfterExport(year) {
    if (!fs.existsSync(HISTORY_FILE)) {
        throw new Error('Geen presence-history.json bestand');
    }

    const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    const beforeCount = historyData.length;
    const filtered = historyData.filter(entry => new Date(entry.date).getFullYear() !== Number(year));

    fs.writeFileSync(HISTORY_FILE, JSON.stringify(filtered, null, 2));
    logMessage(`🗑️ Cleaned up year ${year}: ${beforeCount - filtered.length} entries removed`);

    return {
        success: true,
        deletedCount: beforeCount - filtered.length,
        remainingCount: filtered.length
    };
}

// Get available seasons
function getAvailableSeasons() {
    createTestDataIfNeeded();
    if (!fs.existsSync(HISTORY_FILE)) return [];

    let data;
    try {
        data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch {
        return [];
    }

    if (!Array.isArray(data) || data.length === 0) return [];

    const seasons = new Set();
    data.forEach(entry => {
        seasons.add(getCurrentSeason(new Date(entry.date)).seasonName);
    });

    return Array.from(seasons).sort().reverse();
}

// Get current season data
function getCurrentSeasonData() {
    createTestDataIfNeeded();
    if (!fs.existsSync(HISTORY_FILE)) return [];

    const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    const currentSeason = getCurrentSeason();
    const startDate = new Date(currentSeason.startYear, 6, 1); // July 1st
    const endDate = new Date(currentSeason.endYear, 5, 30);   // June 30th

    return historyData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
    });
}

// Generate season statistics
function generateSeasonStatistics() {
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
        (dayEntry.presences || []).forEach(presence => {
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

                if (presence.methodePaiement && stats.paymentMethods[presence.methodePaiement] !== undefined) {
                    stats.paymentMethods[presence.methodePaiement]++;
                }
            }
        });
    });

    return stats;
}

// Export current season to Excel
function exportSeasonToExcel() {
    ensureExportsDir();
    const seasonData = getCurrentSeasonData();
    const currentSeason = getCurrentSeason();

    if (!seasonData.length) {
        throw new Error(`Geen data voor seizoen ${currentSeason.seasonName}`);
    }

    const excelData = [];
    seasonData.forEach(dayEntry => {
        (dayEntry.presences || []).forEach(presence => {
            const ageGroup = getAgeGroup(presence.dateNaissance, presence.date || dayEntry.date);
            excelData.push({
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
                'Date validation': presence.dateValidation ? 
                    new Date(presence.dateValidation).toLocaleDateString('fr-FR') : '',
                'Adresse': presence.adresse || ''
            });
        });
    });

    if (!excelData.length) {
        throw new Error(`Geen presences gevonden voor seizoen ${currentSeason.seasonName}`);
    }

    const filename = `presences-saison-${currentSeason.seasonName}.xlsx`;
    const filepath = path.join(EXPORTS_DIR, filename);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    ws['!cols'] = XLSX_COLS;
    XLSX.utils.book_append_sheet(wb, ws, 'Présences');

    // Add statistics
    const stats = generateSeasonStatistics();
    const statsData = [
        { Statistique: 'Seizoen', Valeur: stats.seasonName },
        { Statistique: 'Totaal bezoeken', Valeur: stats.totalVisits },
        { Statistique: 'Adhérents', Valeur: stats.adherents.total },
        { Statistique: 'Non-adhérents', Valeur: stats.nonAdherents.total },
        { Statistique: 'Omzet (€)', Valeur: stats.nonAdherents.totalPaid }
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statsData), 'Statistiques');

    XLSX.writeFile(wb, filepath);
    logMessage(`✅ Season export created: ${filename} with ${excelData.length} records`);

    return { 
        success: true, 
        filename, 
        filepath, 
        recordCount: excelData.length, 
        seasonName: currentSeason.seasonName 
    };
}

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
