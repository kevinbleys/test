/**
 * 🧹 PRESENCE HISTORY CLEANUP - Node.js Version
 * 
 * Removes duplicate presences from presence-history.json
 * Run from backend/data/ directory
 * 
 * Usage: node cleanup-history.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  🧹 PRESENCE HISTORY CLEANUP TOOL v2.0                   ║');
console.log('║  Node.js Edition - GUARANTEED TO WORK                    ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const INPUT_FILE = 'presence-history.json';
const OUTPUT_FILE = 'presence-history-cleaned.json';
const BACKUP_FILE = 'presence-history-backup.json';

try {
    // 1. Check if file exists
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`❌ ERROR: ${INPUT_FILE} not found!`);
        console.log(`\nMake sure you run this script from backend/data/ directory:`);
        console.log(`cd backend/data`);
        console.log(`node cleanup-history.js\n`);
        process.exit(1);
    }

    console.log(`📁 Reading: ${INPUT_FILE}\n`);

    // 2. Read and parse JSON
    const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
    const history = JSON.parse(rawData);

    console.log(`📊 Total date entries: ${history.length}\n`);

    let totalBefore = 0;
    let totalAfter = 0;
    let datesFixed = 0;
    const fixedDates = [];

    // 3. Process each date entry
    const cleanedHistory = history.map(dayEntry => {
        if (!dayEntry.presences || !Array.isArray(dayEntry.presences)) {
            return dayEntry;
        }

        const dateStr = dayEntry.date;
        const beforeCount = dayEntry.presences.length;
        totalBefore += beforeCount;

        // Deduplicate using Map for better performance
        const seen = new Map();
        const deduplicated = [];

        dayEntry.presences.forEach(presence => {
            // Create unique key: nom + prenom + timestamp
            const nom = (presence.nom || '').trim().toLowerCase();
            const prenom = (presence.prenom || '').trim().toLowerCase();
            const dateTimestamp = new Date(presence.date).getTime();
            const uniqueKey = `${nom}_${prenom}_${dateTimestamp}`;

            if (!seen.has(uniqueKey)) {
                seen.set(uniqueKey, true);
                deduplicated.push(presence);
            }
        });

        const afterCount = deduplicated.length;
        totalAfter += afterCount;

        if (beforeCount !== afterCount) {
            const removed = beforeCount - afterCount;
            console.log(`🧹 ${dateStr}: ${beforeCount} → ${afterCount} (removed ${removed} duplicates)`);
            datesFixed++;
            fixedDates.push({
                date: dateStr,
                before: beforeCount,
                after: afterCount,
                removed: removed
            });
        }

        return {
            date: dayEntry.date,
            presences: deduplicated
        };
    });

    const totalRemoved = totalBefore - totalAfter;

    // 4. Display summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Total dates processed: ${history.length}`);
    console.log(`🧹 Dates with duplicates: ${datesFixed}`);
    console.log(`📥 Total presences BEFORE: ${totalBefore}`);
    console.log(`📤 Total presences AFTER: ${totalAfter}`);
    console.log(`🗑️  Duplicates REMOVED: ${totalRemoved}`);
    console.log('='.repeat(60));

    if (totalRemoved === 0) {
        console.log('\n✨ No duplicates found! Your file is already clean.\n');
        process.exit(0);
    }

    // 5. Show detailed breakdown
    if (fixedDates.length > 0) {
        console.log('\n📋 DETAILED BREAKDOWN:');
        fixedDates.forEach(d => {
            console.log(`   ${d.date}: Removed ${d.removed} duplicate(s)`);
        });
    }

    // 6. Create backup
    console.log(`\n💾 Creating backup: ${BACKUP_FILE}`);
    fs.copyFileSync(INPUT_FILE, BACKUP_FILE);

    // 7. Write cleaned file
    console.log(`💾 Writing cleaned file: ${OUTPUT_FILE}`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanedHistory, null, 2), 'utf8');

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ SUCCESS!');
    console.log('='.repeat(60));
    console.log(`\n🎉 Successfully cleaned ${totalRemoved} duplicates!`);
    console.log(`\n📋 FILES CREATED:`);
    console.log(`   ✅ ${BACKUP_FILE} (backup of original)`);
    console.log(`   ✅ ${OUTPUT_FILE} (cleaned version)`);

    console.log(`\n📋 NEXT STEPS:`);
    console.log(`   1. Review ${OUTPUT_FILE} to verify it's correct`);
    console.log(`   2. Replace original file:`);
    console.log(`      > copy ${OUTPUT_FILE} ${INPUT_FILE}`);
    console.log(`   3. Restart your server: npm start`);
    console.log(`   4. Test admin panel with historical dates`);
    console.log(`   5. Commit to GitHub:\n`);
    console.log(`      > git add backend/data/presence-history.json`);
    console.log(`      > git commit -m "fix: Remove ${totalRemoved} duplicate presences from history"`);
    console.log(`      > git push\n`);

    console.log('╚════════════════════════════════════════════════════════════╝\n');

} catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
}
