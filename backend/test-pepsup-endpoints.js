const axios = require('axios');
require('dotenv').config();

// PepSup API credentials
const API_KEY = process.env.PEPSUP_API_KEY || '0IOiLeibD6s5u0FgwFT5gS6yUdOatKqK';
const API_BASE = 'https://api.pepsup.com/api/v1';

// Test verschillende endpoints
const ENDPOINTS_TO_TEST = [
  {
    name: 'Dossiers Adhésions (basis)',
    url: '/dossiers-adhesions',
    params: {}
  },
  {
    name: 'Dossiers Adhésions (limit=500)',
    url: '/dossiers-adhesions',
    params: { limit: 500 }
  },
  {
    name: 'Dossiers Adhésions (size=500)',
    url: '/dossiers-adhesions',
    params: { size: 500 }
  },
  {
    name: 'Dossiers Adhésions (per_page=500)',
    url: '/dossiers-adhesions',
    params: { per_page: 500 }
  },
  {
    name: 'Dossiers Adhésions (offset=0&limit=500)',
    url: '/dossiers-adhesions',
    params: { offset: 0, limit: 500 }
  },
  {
    name: 'Dossiers Adhésions (page=0&size=500)',
    url: '/dossiers-adhesions',
    params: { page: 0, size: 500 }
  },
  {
    name: 'Adhérents endpoint (als die bestaat)',
    url: '/adherents',
    params: {}
  },
  {
    name: 'Members endpoint (als die bestaat)',
    url: '/members',
    params: {}
  },
  {
    name: 'Users endpoint (als die bestaat)',
    url: '/users',
    params: {}
  },
  {
    name: 'Dossiers endpoint (zonder -adhesions)',
    url: '/dossiers',
    params: {}
  },
  {
    name: 'Personnes endpoint',
    url: '/personnes',
    params: {}
  },
  {
    name: 'Contacts endpoint',
    url: '/contacts',
    params: {}
  }
];

async function testEndpoint(endpoint) {
  const fullUrl = `${API_BASE}${endpoint.url}`;
  
  try {
    console.log(`\n🔍 Testing: ${endpoint.name}`);
    console.log(`   URL: ${fullUrl}`);
    console.log(`   Params:`, endpoint.params);
    
    const response = await axios.get(fullUrl, {
      headers: {
        'X-API-KEY': API_KEY,
        'Accept': 'application/json'
      },
      params: endpoint.params,
      timeout: 10000
    });

    // Analyse response
    const data = response.data;
    const dataIsArray = Array.isArray(data);
    const count = dataIsArray ? data.length : (data.content?.length || 'N/A');
    
    console.log(`   ✅ SUCCESS!`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Data type: ${dataIsArray ? 'Array' : 'Object'}`);
    console.log(`   Count: ${count}`);
    
    // Check headers voor paginatie info
    const headers = response.headers;
    const paginationHeaders = Object.keys(headers).filter(h => 
      h.toLowerCase().includes('page') || 
      h.toLowerCase().includes('total') || 
      h.toLowerCase().includes('count') ||
      h.toLowerCase().includes('limit')
    );
    
    if (paginationHeaders.length > 0) {
      console.log(`   📊 Paginatie headers gevonden!`);
      paginationHeaders.forEach(h => {
        console.log(`      ${h}: ${headers[h]}`);
      });
    }

    // Check response structure
    if (!dataIsArray && data.content) {
      console.log(`   📦 Response heeft 'content' property!`);
      console.log(`      content.length: ${data.content.length}`);
      if (data.totalElements !== undefined) {
        console.log(`      totalElements: ${data.totalElements} ⭐ IMPORTANT!`);
      }
      if (data.totalPages !== undefined) {
        console.log(`      totalPages: ${data.totalPages}`);
      }
      if (data.size !== undefined) {
        console.log(`      size: ${data.size}`);
      }
      if (data.number !== undefined) {
        console.log(`      number (page): ${data.number}`);
      }
    }

    // Als we meer dan 25 records krijgen, is dit belangrijk!
    if (count > 25) {
      console.log(`\n   🎯 ⭐⭐⭐ BELANGRIJKE ONTDEKKING! ⭐⭐⭐`);
      console.log(`   Dit endpoint geeft ${count} records - MEER dan 25!`);
      console.log(`   Dit kan de oplossing zijn!`);
    }

    return {
      success: true,
      endpoint: endpoint.name,
      url: fullUrl,
      count: count,
      hasMore: count > 25,
      paginationHeaders: paginationHeaders,
      responseStructure: dataIsArray ? 'array' : 'object',
      totalElements: data.totalElements
    };

  } catch (error) {
    if (error.response) {
      console.log(`   ❌ ERROR: ${error.response.status} ${error.response.statusText}`);
      if (error.response.status === 404) {
        console.log(`   ℹ️  Endpoint bestaat niet`);
      } else if (error.response.status === 403) {
        console.log(`   ℹ️  Geen toegang (forbidden)`);
      } else {
        console.log(`   Data:`, error.response.data);
      }
    } else if (error.code === 'ECONNABORTED') {
      console.log(`   ⏱️  Timeout (meer dan 10 seconden)`);
    } else {
      console.log(`   ❌ Network error:`, error.message);
    }
    
    return {
      success: false,
      endpoint: endpoint.name,
      error: error.message
    };
  }
}

async function testAllEndpoints() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║ 🔍 PEPSUP API ENDPOINT DISCOVERY                             ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting ${ENDPOINTS_TO_TEST.length} verschillende endpoints...\n`);

  const results = [];

  for (const endpoint of ENDPOINTS_TO_TEST) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Wacht 500ms tussen requests (rate limiting)
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Samenvatting
  console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║ 📊 SAMENVATTING                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  const successful = results.filter(r => r.success);
  const withMoreThan25 = results.filter(r => r.hasMore);

  console.log(`✅ Succesvolle endpoints: ${successful.length}/${results.length}`);
  console.log(`🎯 Endpoints met meer dan 25 records: ${withMoreThan25.length}`);

  if (withMoreThan25.length > 0) {
    console.log('\n🌟 BELANGRIJKE ONTDEKKINGEN:');
    withMoreThan25.forEach(r => {
      console.log(`\n   Endpoint: ${r.endpoint}`);
      console.log(`   URL: ${r.url}`);
      console.log(`   Aantal records: ${r.count}`);
      if (r.totalElements) {
        console.log(`   Totaal beschikbaar: ${r.totalElements}`);
      }
      console.log(`   ⭐ DIT IS WAARSCHIJNLIJK DE OPLOSSING!`);
    });
  } else {
    console.log('\n⚠️  GEEN endpoints gevonden met meer dan 25 records');
    console.log('   Oplossing: Contacteer PepSup support!');
  }

  // Print alle succesvolle endpoints
  console.log('\n📋 ALLE WERKENDE ENDPOINTS:');
  successful.forEach(r => {
    console.log(`   - ${r.endpoint}: ${r.count} records`);
  });

  console.log('\n💡 VOLGENDE STAPPEN:');
  if (withMoreThan25.length > 0) {
    console.log('   1. Gebruik het endpoint met meeste records');
    console.log('   2. Update sync-service.js met nieuwe endpoint');
    console.log('   3. Test sync opnieuw');
  } else {
    console.log('   1. Stuur email naar PepSup support (zie PEPSUP-API-LIMIET-PROBLEEM.md)');
    console.log('   2. Vraag naar paginatie parameters');
    console.log('   3. Of vraag naar bulk export endpoint');
  }

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║ ✅ TEST VOLTOOID                                              ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
}

// Run tests
testAllEndpoints().catch(error => {
  console.error('\n❌ FATAL ERROR:', error.message);
  process.exit(1);
});
