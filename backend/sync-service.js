const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const API_KEY = process.env.PEPSUP_API_KEY || '0IOiLeibD6sF6sJtr17oB8VUKBG6NZ2U';
const API_SECRET = process.env.PEPSUP_API_SECRET || 'odakfDvfUMOKpJAe92u76fqCWHtPvPlo';
const API_BASE_URL = 'https://api.pepsup.com/api/v1/dossiers-adhesions';
const MEMBERS_FILE = './data/members.json';

let membersCache = [];

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║ 🔄 PEPSUP SYNC MET PAGINATIE (page parameter)                ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

function extractNames(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return { firstname: '', lastname: '' };
  }
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstname: '', lastname: '' };
  if (parts.length === 1) return { firstname: parts[0], lastname: '' };
  return {
    firstname: parts[0],
    lastname: parts.slice(1).join(' ')
  };
}

async function fetchAllMembers() {
  const allMembers = [];
  let page = 0;
  let hasMore = true;

  console.log('📥 Ophalen leden met paginatie...\n');

  while (hasMore) {
    try {
      console.log(`   Pagina ${page}...`);
      
      const response = await axios.get(API_BASE_URL, {
        headers: { 
          'X-API-KEY': API_KEY,
          'X-API-SECRET': API_SECRET
        },
        params: { page: page },
        timeout: 10000
      });

      const members = response.data;
      
      if (!Array.isArray(members) || members.length === 0) {
        console.log(`   ✅ Geen leden meer op pagina ${page}`);
        hasMore = false;
        break;
      }

      console.log(`   ✅ ${members.length} leden ontvangen`);
      allMembers.push(...members);

      if (members.length < 25) {
        console.log(`   🎯 Laatste pagina bereikt (${members.length} < 25)`);
        hasMore = false;
      } else {
        page++;
      }

    } catch (error) {
      console.error(`   ❌ ERROR op pagina ${page}:`, error.message);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data:`, error.response.data);
      }
      hasMore = false;
    }
  }

  console.log(`\n✅ Totaal ${allMembers.length} leden opgehaald van ${page + 1} pagina's\n`);
  return allMembers;
}

async function syncMembers() {
  try {
    const rawMembers = await fetchAllMembers();

    if (rawMembers.length === 0) {
      console.error('⚠️  WAARSCHUWING: Geen leden opgehaald!');
      console.error('   Check je API credentials in .env file');
      return 0;
    }

    const members = rawMembers.map(member => {
      const { firstname, lastname } = extractNames(member.joinRequestMember || '');
      return {
        ...member,
        firstname,
        lastname
      };
    });

    if (fs.existsSync(MEMBERS_FILE)) {
      const backup = `./data/members_backup_${Date.now()}.json`;
      fs.copyFileSync(MEMBERS_FILE, backup);
      console.log(`💾 Backup: ${backup}`);
    }

    fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members, null, 2));
    console.log(`💾 Opgeslagen: ${MEMBERS_FILE}`);

    const dist = {};
    members.forEach(m => {
      if (m.lastname) {
        const l = m.lastname[0].toUpperCase();
        dist[l] = (dist[l] || 0) + 1;
      }
    });

    console.log('\n📊 ACHTERNAAM DISTRIBUTIE:');
    Object.keys(dist).sort().forEach(l => {
      console.log(`   ${l}: ${dist[l]} leden`);
    });
    console.log(`   Totaal letters: ${Object.keys(dist).length}\n`);

    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log(`║ ✅ SYNC GESLAAGD: ${members.length} leden                          `);
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    membersCache = members;
    return members.length;

  } catch (error) {
    console.error('❌ SYNC FAILED:', error.message);
    return 0;
  }
}

function getMembers() {
  if (membersCache.length === 0 && fs.existsSync(MEMBERS_FILE)) {
    try {
      const data = fs.readFileSync(MEMBERS_FILE, 'utf8');
      membersCache = JSON.parse(data);
      console.log(`[SYNC] Loaded ${membersCache.length} members from cache`);
    } catch (error) {
      console.error('[SYNC] Error loading members:', error.message);
      membersCache = [];
    }
  }
  return membersCache;
}

if (require.main === module) {
  syncMembers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { syncMembers, getMembers };
