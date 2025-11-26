/**
 * 🧹 ADVANCED PRESENCE HISTORY CLEANUP
 * 
 * Removes duplicate presences caused by double-registration
 * (NFC scan + manual validation both creating entries)
 * 
 * Detection: Same person with timestamps < 1 second apart
 * 
 * Usage: node cleanup-duplicates-advanced.js
 */

const fs = require('fs');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  🧹 ADVANCED DUPLICATE CLEANUP - v3.0                    ║');
console.log('║  Removes double-registration duplicates (<1sec apart)    ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const INPUT_FILE = 'presence-history.json';
const OUTPUT_FILE = 'presence-history-CLEANED.json';
const BACKUP_FILE = `presence-history-backup-${Date.now()}.json`;

try {
    // 1. Check if file exists
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`❌ ERROR: ${INPUT_FILE} not found!`);
        console.log(`\nMake sure you run this script from backend/data/ directory:`);
        console.log(`cd C:\\Users\\kevin\\Documents\\logiciel_escalade_original\\backend\\data`);
        console.log(`node cleanup-duplicates-advanced.js\n`);
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
    let totalDuplicatesRemoved = 0;
    const fixedDates = [];

    // 3. Process each date entry
    const cleanedHistory = history.map(dayEntry => {
        if (!dayEntry.presences || !Array.isArray(dayEntry.presences)) {
            return dayEntry;
        }

        const dateStr = dayEntry.date;
        const beforeCount = dayEntry.presences.length;
        totalBefore += beforeCount;

        // Sort by timestamp for sequential comparison
        const sorted = dayEntry.presences.sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        const deduplicated = [];
        const removed = [];

        for (let i = 0; i < sorted.length; i++) {
            const current = sorted[i];
            const currentTime = new Date(current.date).getTime();
            const currentName = `${(current.nom || '').trim().toLowerCase()}_${(current.prenom || '').trim().toLowerCase()}`;

            // Check if already added in previous iteration
            const alreadyAdded = deduplicated.some(p => {
                const pTime = new Date(p.date).getTime();
                const pName = `${(p.nom || '').trim().toLowerCase()}_${(p.prenom || '').trim().toLowerCase()}`;
                return pName === currentName && Math.abs(pTime - currentTime) < 1000;
            });

            if (alreadyAdded) {
                removed.push({
                    nom: current.nom,
                    prenom: current.prenom,
                    time: new Date(current.date).toISOString()
                });
                continue;
            }

            // Check for duplicates in remaining items
            let isDuplicate = false;
            for (let j = i + 1; j < sorted.length; j++) {
                const next = sorted[j];
                const nextTime = new Date(next.date).getTime();
                const nextName = `${(next.nom || '').trim().toLowerCase()}_${(next.prenom || '').trim().toLowerCase()}`;

                // If same person and within 1 second → keep first, mark next as duplicate
                if (currentName === nextName && Math.abs(nextTime - currentTime) < 1000) {
                    // Mark the NEXT one for removal (keep first registration)
                    // Don't break - there might be more duplicates
                } else if (nextTime - currentTime >= 1000) {
                    // More than 1 second apart - stop checking
                    break;
                }
            }

            // Add current entry if not marked as duplicate
            deduplicated.push(current);
        }

        const afterCount = deduplicated.length;
        totalAfter += afterCount;

        if (beforeCount !== afterCount) {
            const removedCount = beforeCount - afterCount;
            totalDuplicatesRemoved += removedCount;
            console.log(`🧹 ${dateStr}: ${beforeCount} → ${afterCount} (removed ${removedCount} duplicates)`);
            
            if (removed.length > 0) {
                removed.forEach(r => {
                    console.log(`   ⚠️  Removed: ${r.nom} ${r.prenom} at ${r.time}`);
                });
            }
            
            datesFixed++;
            fixedDates.push({
                date: dateStr,
                before: beforeCount,
                after: afterCount,
                removed: removedCount
            });
        }

        return {
            date: dayEntry.date,
            presences: deduplicated
        };
    });

    // 4. Display summary
    console.log(`\n${'='.repeat(70)}`);
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Total dates processed: ${history.length}`);
    console.log(`🧹 Dates with duplicates: ${datesFixed}`);
    console.log(`📥 Total presences BEFORE: ${totalBefore}`);
    console.log(`📤 Total presences AFTER: ${totalAfter}`);
    console.log(`🗑️  Total duplicates REMOVED: ${totalDuplicatesRemoved}`);
    console.log('='.repeat(70));

    if (totalDuplicatesRemoved === 0) {
        console.log('\n✨ No duplicates found! Your file is already clean.\n');
        process.exit(0);
    }

    // 5. Show detailed breakdown
    if (fixedDates.length > 0) {
        console.log('\n📋 DETAILED BREAKDOWN BY DATE:');
        fixedDates.forEach(d => {
            console.log(`   ${d.date}: ${d.before} → ${d.after} (removed ${d.removed})`);
        });
    }

    // 6. Create backup
    console.log(`\n💾 Creating backup: ${BACKUP_FILE}`);
    fs.copyFileSync(INPUT_FILE, BACKUP_FILE);

    // 7. Write cleaned file
    console.log(`💾 Writing cleaned file: ${OUTPUT_FILE}`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanedHistory, null, 2), 'utf8');

    console.log(`\n${'='.repeat(70)}`);
    console.log('✅ SUCCESS! DUPLICATES CLEANED');
    console.log('='.repeat(70));
    console.log(`\n🎉 Successfully removed ${totalDuplicatesRemoved} duplicate registrations!`);
    console.log(`\n📋 FILES CREATED:`);
    console.log(`   ✅ ${BACKUP_FILE} (backup of original)`);
    console.log(`   ✅ ${OUTPUT_FILE} (cleaned version)`);

    console.log(`\n📋 NEXT STEPS:`);
    console.log(`\n   1. Review the cleaned file:`);
    console.log(`      > Open ${OUTPUT_FILE} and verify it looks correct\n`);
    console.log(`   2. Replace original file:`);
    console.log(`      > copy ${OUTPUT_FILE} ${INPUT_FILE}\n`);
    console.log(`   3. Update server.js with duplicate prevention (see instructions)`);
    console.log(`   4. Restart server:`);
    console.log(`      > cd ..`);
    console.log(`      > npm start\n`);
    console.log(`   5. Test in admin panel with historical dates\n`);
    console.log(`   6. Commit to GitHub:`);
    console.log(`      > git add backend/data/presence-history.json`);
    console.log(`      > git commit -m "fix: Remove ${totalDuplicatesRemoved} duplicate double-registrations"`);
    console.log(`      > git push origin main\n`);

    console.log('╚════════════════════════════════════════════════════════════╝\n');

} catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nStack trace:', error.stack);
    console.log('\n💡 TIP: Make sure presence-history.json is valid JSON');
    console.log('   You can validate at: https://jsonlint.com/\n');
    process.exit(1);
}
