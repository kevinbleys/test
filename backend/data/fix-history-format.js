#!/usr/bin/env node
/**
 * FIX PRESENCE HISTORY FORMAT
 * Zet flat presence-history.json om naar correct array format
 * 
 * GEBRUIK:
 * 1. Zet dit bestand in je project root
 * 2. Run: node fix-history-format.js
 * 3. Je presence-history.json wordt gerepareerd!
 */

const fs = require('fs');
const path = require('path');

const HISTORY_FILE = path.join(__dirname, 'data', 'presence-history.json');

console.log('\n🔧 FIXING PRESENCE HISTORY FORMAT...\n');

if (!fs.existsSync(HISTORY_FILE)) {
  console.error('❌ File not found:', HISTORY_FILE);
  process.exit(1);
}

try {
  const rawData = fs.readFileSync(HISTORY_FILE, 'utf8');
  const currentData = JSON.parse(rawData);
  
  console.log('📊 Current format:', Array.isArray(currentData) ? 'Array ✓' : 'Object ✗');
  
  // If already correct array format, skip
  if (Array.isArray(currentData) && currentData.length > 0) {
    const isCorrect = currentData.every(item => 
      item && item.date && Array.isArray(item.presences)
    );
    if (isCorrect) {
      console.log('✅ Format is already correct!\n');
      process.exit(0);
    }
  }
  
  // Convert to correct format
  console.log('🔄 Converting...');
  
  const dateMap = new Map();
  
  if (Array.isArray(currentData)) {
    // Array - extract valid entries
    currentData.forEach(item => {
      if (item && item.date && Array.isArray(item.presences)) {
        dateMap.set(item.date, item.presences);
      }
    });
  } else {
    // Object - look for date fields
    Object.values(currentData).forEach(item => {
      if (item && item.date && Array.isArray(item.presences)) {
        dateMap.set(item.date, item.presences);
      }
    });
  }
  
  const dates = Array.from(dateMap.keys()).sort().reverse();
  const newHistory = dates.map(date => ({
    date: date,
    presences: dateMap.get(date)
  }));
  
  // Backup original
  const backupFile = HISTORY_FILE.replace('.json', `.backup.${Date.now()}.json`);
  fs.copyFileSync(HISTORY_FILE, backupFile);
  console.log(`   Backup: ${path.basename(backupFile)}`);
  
  // Write corrected file
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(newHistory, null, 2), 'utf8');
  console.log(`   ✅ Fixed: ${newHistory.length} date entries`);
  
  // Verify
  const verify = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  console.log(`\n✅ SUCCESS!`);
  console.log(`   Type: Array`);
  console.log(`   Entries: ${verify.length}`);
  if (verify.length > 0) {
    console.log(`   First date: ${verify[0].date}`);
    console.log(`   Last date: ${verify[verify.length - 1].date}`);
  }
  console.log('\n');
  
} catch (error) {
  console.error('❌ ERROR:', error.message);
  process.exit(1);
}
