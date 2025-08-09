const exportService = require('./export-service');

console.log('=== TEST SCRIPT VOOR JAREN ===');

try {
  console.log('Roep getAvailableYears aan...');
  const years = exportService.getAvailableYears();
  console.log('Resultaat:', years);
  console.log('Type:', typeof years);
  console.log('Is array:', Array.isArray(years));
  console.log('Lengte:', years.length);
} catch (error) {
  console.error('Fout:', error.message);
}
