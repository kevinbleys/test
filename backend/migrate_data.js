const fs = require('fs');
const path = require('path');

console.log('=== DATA MIGRATIE SCRIPT ===');
console.log('Dit script verplaatst oude presences naar history');

const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');

// Lees presences
const presencesData = fs.readFileSync(PRESENCES_FILE, 'utf8');
const allPresences = JSON.parse(presencesData);

console.log(`Totaal presences gevonden: ${allPresences.length}`);

// Groepeer per dag
const today = new Date().toISOString().split('T')[0];
const presencesByDate = {};

allPresences.forEach(presence => {
    if (!presence.date) return;

    const presenceDate = new Date(presence.date).toISOString().split('T')[0];

    if (!presencesByDate[presenceDate]) {
        presencesByDate[presenceDate] = [];
    }
    presencesByDate[presenceDate].push(presence);
});

console.log(`Gevonden datums: ${Object.keys(presencesByDate).length}`);
Object.keys(presencesByDate).sort().forEach(date => {
    console.log(`  ${date}: ${presencesByDate[date].length} presences`);
});

// Lees bestaande history
let history = [];
try {
    const historyData = fs.readFileSync(HISTORY_FILE, 'utf8');
    history = JSON.parse(historyData);
    console.log(`Bestaande history entries: ${history.length}`);
} catch (error) {
    console.log('Geen bestaande history gevonden');
}

// Voeg ALLEEN OUDE dagen toe aan history (niet vandaag)
const datesToMigrate = Object.keys(presencesByDate)
    .filter(date => date !== today)
    .sort();

console.log(`\nMigreren van ${datesToMigrate.length} oude dagen naar history...`);

datesToMigrate.forEach(date => {
    const existingIndex = history.findIndex(h => h.date === date);

    if (existingIndex >= 0) {
        // Update bestaande
        history[existingIndex].presences = presencesByDate[date];
        console.log(`  ${date}: Updated ${presencesByDate[date].length} presences`);
    } else {
        // Nieuwe entry
        history.push({
            date: date,
            presences: presencesByDate[date]
        });
        console.log(`  ${date}: Added ${presencesByDate[date].length} presences`);
    }
});

// Schrijf history
fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
console.log(`\n✅ History bijgewerkt: ${history.length} dagen opgeslagen`);

// Behoud ALLEEN vandaag in presences.json
const todayPresences = presencesByDate[today] || [];
fs.writeFileSync(PRESENCES_FILE, JSON.stringify(todayPresences, null, 2));
console.log(`✅ Presences.json bijgewerkt: ${todayPresences.length} presences voor vandaag (${today})`);

console.log('\n=== MIGRATIE VOLTOOID ===');
console.log('Je kan nu de server opnieuw starten');
