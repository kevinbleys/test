// 🔍 PepSup API DIAGNOSE SCRIPT
// Dit script test de PepSup API en checkt waarom we niet alle leden krijgen

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'https://api.pepsup.com/api/v1/dossiers-adhesions';
const API_HEADERS = {
  'X-API-KEY': '0IOiLeibD6sF6sJtr17oB8VUKBG6NZ2U',
  'X-API-SECRET': 'odakfDvfUMOKpJAe92u76fqCWHtPvPlo',
  'Accept': 'application/json'
};

async function diagnosePepSupAPI() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║  🔍 PEPSUP API DIAGNOSE                                      ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  try {
    // STAP 1: Basis API call
    console.log('[1] Testing basic API call...');
    const response = await axios.get(API_URL, {
      headers: API_HEADERS,
      timeout: 30000
    });

    const data = response.data;
    console.log(`✅ API Response received`);
    console.log(`   Type: ${typeof data}`);
    console.log(`   Is Array: ${Array.isArray(data)}`);
    
    if (Array.isArray(data)) {
      console.log(`   Count: ${data.length} items\n`);
    } else {
      console.log(`   ⚠️ Response is NOT an array!\n`);
      console.log('   Response structure:', JSON.stringify(data, null, 2).substring(0, 500));
      return;
    }

    // STAP 2: Check response headers voor paginatie
    console.log('[2] Checking response headers for pagination...');
    const headers = response.headers;
    console.log('   Headers:', JSON.stringify({
      'content-type': headers['content-type'],
      'x-total-count': headers['x-total-count'],
      'x-page': headers['x-page'],
      'x-per-page': headers['x-per-page'],
      'link': headers['link']
    }, null, 2));

    // STAP 3: Analyseer data distributie
    console.log('\n[3] Analyzing member distribution...');
    const achternaamDistributie = {};
    
    data.forEach(member => {
      if (member.joinRequestMember) {
        // joinRequestMember is SOMS een string, SOMS een object!
        let lastname;
        
        if (typeof member.joinRequestMember === 'string') {
          // Parse string: "VOORNAAM ACHTERNAAM"
          const parts = member.joinRequestMember.split(' ');
          lastname = parts[parts.length - 1]; // Laatste deel = achternaam
        } else if (typeof member.joinRequestMember === 'object') {
          lastname = member.joinRequestMember.lastname;
        }
        
        if (lastname) {
          const eersteLetters = lastname.substring(0, 1).toUpperCase();
          achternaamDistributie[eersteLetters] = (achternaamDistributie[eersteLetters] || 0) + 1;
        }
      }
    });

    console.log('   Achternaam distributie (eerste letter):');
    Object.keys(achternaamDistributie).sort().forEach(letter => {
      console.log(`     ${letter}: ${achternaamDistributie[letter]} members`);
    });

    const totaalLetters = Object.keys(achternaamDistributie).length;
    console.log(`\n   Totaal verschillende letters: ${totaalLetters}`);
    
    if (totaalLetters === 1) {
      console.log('   ⚠️ PROBLEEM BEVESTIGD: Alleen 1 letter - API geeft gefilterde data!');
    } else if (totaalLetters < 10) {
      console.log('   ⚠️ MOGELIJK PROBLEEM: Weinig variatie - mogelijk paginatie nodig');
    } else {
      console.log('   ✅ Data lijkt compleet');
    }

    // STAP 4: Check eerste en laatste members
    console.log('\n[4] Inspecting first and last members...');
    console.log('   Eerste member:', JSON.stringify(data[0], null, 2).substring(0, 300));
    console.log('   ...');
    console.log('   Laatste member:', JSON.stringify(data[data.length - 1], null, 2).substring(0, 300));

    // STAP 5: Test verschillende URL variants
    console.log('\n[5] Testing API URL variants...');
    const urlVariants = [
      API_URL,
      API_URL + '?limit=1000',
      API_URL + '?page=1&size=1000',
      API_URL + '?per_page=1000',
      'https://api.pepsup.com/api/v1/dossiers-adhesions?limit=1000'
    ];

    for (const url of urlVariants) {
      try {
        const testResponse = await axios.get(url, { 
          headers: API_HEADERS, 
          timeout: 10000,
          validateStatus: () => true // Accept all status codes
        });
        console.log(`   ${url}`);
        console.log(`     Status: ${testResponse.status}`);
        if (testResponse.status === 200 && Array.isArray(testResponse.data)) {
          console.log(`     Count: ${testResponse.data.length} items`);
        }
      } catch (e) {
        console.log(`   ${url} - Error: ${e.message}`);
      }
    }

    // STAP 6: Save full response
    const outputFile = path.join(__dirname, 'data', 'pepsup-api-diagnose.json');
    fs.writeFileSync(outputFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      memberCount: data.length,
      headers: response.headers,
      firstMember: data[0],
      lastMember: data[data.length - 1],
      achternaamDistributie,
      fullData: data
    }, null, 2));
    console.log(`\n[6] Full diagnostic data saved to: ${outputFile}`);

    // DIAGNOSE RESULTAAT
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║  🎯 DIAGNOSE RESULTAAT                                       ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    
    if (data.length < 50) {
      console.log('\n⚠️ PROBLEEM: API geeft slechts', data.length, 'members');
      console.log('   Verwachting: 200+ members');
      console.log('\n🔧 MOGELIJKE OPLOSSINGEN:');
      console.log('   1. Check PepSup API documentatie voor paginatie parameters');
      console.log('   2. Contacteer PepSup support over limit/pagination');
      console.log('   3. Check of er filters actief zijn in de API call');
      console.log('   4. Test URL met ?limit=1000 parameter');
    } else {
      console.log('\n✅ Data lijkt compleet -', data.length, 'members ontvangen');
    }

  } catch (error) {
    console.error('\n❌ API FOUT:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run diagnostic
diagnosePepSupAPI();
