console.log('=== EXPORT TEST SCRIPT ===');

// Test XLSX import
try {
  const XLSX = require('xlsx');
  console.log('✅ XLSX package loaded successfully');
} catch (error) {
  console.error('❌ XLSX package not found:', error.message);
  console.log('Run: npm install xlsx');
  process.exit(1);
}

// Test export service
try {
  const exportService = require('./export-service');
  console.log('✅ Export service loaded successfully');
  
  // Test available years function
  console.log('Testing getAvailableYears...');
  const years = exportService.getAvailableYears();
  console.log('Available years:', years);
  
  if (years.length === 0) {
    console.log('⚠️ No years found - this might be the issue');
    
    // Test creating test data
    console.log('Creating test data...');
    exportService.createTestDataIfNeeded();
    
    // Try again
    const yearsAfter = exportService.getAvailableYears();
    console.log('Years after creating test data:', yearsAfter);
  }
  
} catch (error) {
  console.error('❌ Export service error:', error.message);
  console.error('Stack:', error.stack);
}

console.log('=== TEST COMPLETED ===');
