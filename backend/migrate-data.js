const fs = require('fs');
const path = require('path');

console.log('=== DATA MIGRATIE SCRIPT - FIXED VERSIE ===');
console.log('Dit script verplaatst oude data naar history\n');

const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');

// Lees presences
let allPresences = [];
try {
    const presencesData = fs.readFileSync(PRESENCES_FILE, 'utf8');
    allPresences = JSON.parse(presencesData);
    console.log(`✅ Gelezen: ${allPresences.length} presences uit presences.json`);
} catch (error) {
    console.error(`❌ Fout bij lezen presences.json:`, error.message);
    process.exit(1);
}

// Groepeer per dag
const today = new Date().toISOString().split('T')[0];
const presencesByDate = {};

allPresences.forEach(presence => {
    if (!presence.date) {
        console.warn('⚠️ Presence zonder datum gevonden, wordt overgeslagen');
        return;
    }
    
    try {
        const presenceDate = new Date(presence.date).toISOString().split('T')[0];
        
        if (!presencesByDate[presenceDate]) {
            presencesByDate[presenceDate] = [];
        }
        presencesByDate[presenceDate].push(presence);
    } catch (error) {
        console.warn(`⚠️ Ongeldige datum: ${presence.date}`);
    }
});

console.log(`\n📊 Gevonden datums: ${Object.keys(presencesByDate).length}`);
Object.keys(presencesByDate).sort().forEach(date => {
    const isToday = date === today;
    console.log(`  ${date}: ${presencesByDate[date].length} presences ${isToday ? '(VANDAAG)' : ''}`);
});

// Lees bestaande history
let history = [];
try {
    if (fs.existsSync(HISTORY_FILE)) {
        const historyData = fs.readFileSync(HISTORY_FILE, 'utf8');
        history = JSON.parse(historyData);
        console.log(`\n✅ Bestaande history: ${history.length} dagen`);
    } else {
        console.log('\n⚠️ Geen bestaande history gevonden, nieuwe wordt aangemaakt');
    }
} catch (error) {
    console.warn('⚠️ Fout bij lezen history, nieuwe wordt aangemaakt');
    history = [];
}

// Verplaats ALLEEN oude dagen naar history (niet vandaag)
const datesToMigrate = Object.keys(presencesByDate)
    .filter(date => date !== today)
    .sort();

console.log(`\n🔄 Migreren van ${datesToMigrate.length} oude dagen naar history...`);

datesToMigrate.forEach(date => {
    const existingIndex = history.findIndex(h => h.date === date);
    
    if (existingIndex >= 0) {
        // Update bestaande entry
        history[existingIndex].presences = presencesByDate[date];
        console.log(`  ✅ ${date}: Updated ${presencesByDate[date].length} presences`);
    } else {
        // Nieuwe entry
        history.push({
            date: date,
            presences: presencesByDate[date]
        });
        console.log(`  ✅ ${date}: Added ${presencesByDate[date].length} presences`);
    }
});

// Sorteer history op datum (nieuwste eerst)
history.sort((a, b) => b.date.localeCompare(a.date));

// Schrijf history
try {
    // Maak backup van oude history
    if (fs.existsSync(HISTORY_FILE)) {
        fs.copyFileSync(HISTORY_FILE, HISTORY_FILE + '.backup');
        console.log('\n💾 Backup gemaakt: presence-history.json.backup');
    }
    
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    console.log(`✅ History bijgewerkt: ${history.length} dagen opgeslagen`);
} catch (error) {
    console.error('❌ Fout bij schrijven history:', error.message);
    process.exit(1);
}

// Behoud ALLEEN vandaag in presences.json
const todayPresences = presencesByDate[today] || [];

try {
    // Maak backup van oude presences
    fs.copyFileSync(PRESENCES_FILE, PRESENCES_FILE + '.backup');
    console.log('💾 Backup gemaakt: presences.json.backup');
    
    fs.writeFileSync(PRESENCES_FILE, JSON.stringify(todayPresences, null, 2));
    console.log(`✅ Presences.json bijgewerkt: ${todayPresences.length} presences voor vandaag (${today})`);
} catch (error) {
    console.error('❌ Fout bij schrijven presences:', error.message);
    process.exit(1);
}

console.log('\n=== MIGRATIE VOLTOOID ===');
console.log('✅ Oude data verplaatst naar presence-history.json');
console.log('✅ Alleen vandaag blijft in presences.json');
console.log('✅ Backups gemaakt (.backup bestanden)');
console.log('\n🚀 Je kan nu de server herstarten!');
console.log('   cd backend');
console.log('   npm start');
