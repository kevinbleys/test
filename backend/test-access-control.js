// ════════════════════════════════════════════════════════════════════
// 🧪 TEST SCRIPT - PRODUCT ACCESS CONTROL
// ════════════════════════════════════════════════════════════════════
// 
// Dit script test de nieuwe access control logica op je members.json
// Gebruik: node test-access-control.js
// ════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const MEMBERS_FILE = path.join(__dirname, 'data', 'members.json');

// ════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS (kopieer van server.js)
// ════════════════════════════════════════════════════════════════════

function parsePepSupDate(dateString) {
if (!dateString || typeof dateString !== 'string') return null;
try {
const parts = dateString.split(',')[0].trim().split('/');
if (parts.length !== 3) return null;
const day = parseInt(parts[0]);
const month = parseInt(parts[1]) - 1;
const year = parseInt(parts[2]);
return new Date(year, month, day);
} catch {
return null;
}
}

function addMonths(date, months) {
const result = new Date(date);
result.setMonth(result.getMonth() + months);
return result;
}

function checkProductAccess(member) {
if (!Array.isArray(member.joinRequestProducts) || member.joinRequestProducts.length === 0) {
return {
hasAccess: false,
reason: "Aucun produit trouvé dans votre dossier",
productType: 'NONE'
};
}

const hasValidProduct = member.joinRequestProducts.some(product => {
const productName = (product.displayProductPrice || '').toLowerCase();
return productName.includes('creneaux libres') || productName.includes('cours');
});

if (!hasValidProduct) {
return {
hasAccess: false,
reason: "Votre adhésion ne donne pas accès à la salle (pas de 'créneaux libres' ou 'cours')",
productType: 'NO_ACCESS'
};
}

const hasSaisonProduct = member.joinRequestProducts.some(product => {
const productName = (product.displayProductPrice || '').toLowerCase();
return productName.includes('creneaux libres saison 4 mois');
});

if (hasSaisonProduct) {
const creationDate = parsePepSupDate(member.dateCreation);
if (!creationDate) {
return {
hasAccess: false,
reason: "Date de création du dossier invalide",
productType: 'SAISON_4MOIS'
};
}

const expiryDate = addMonths(creationDate, 4);
const today = new Date();
today.setHours(0, 0, 0, 0);
expiryDate.setHours(0, 0, 0, 0);

if (today > expiryDate) {
const expiryString = expiryDate.toLocaleDateString('fr-FR');
return {
hasAccess: false,
reason: `Votre adhésion 'saison 4 mois' a expiré le ${expiryString}`,
productType: 'SAISON_4MOIS_EXPIRED'
};
}

return {
hasAccess: true,
reason: `Accès valide jusqu'au ${expiryDate.toLocaleDateString('fr-FR')}`,
productType: 'SAISON_4MOIS'
};
}

return {
hasAccess: true,
reason: "Accès valide",
productType: 'FULL_ACCESS'
};
}

// ════════════════════════════════════════════════════════════════════
// TEST RUNNER
// ════════════════════════════════════════════════════════════════════

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║ 🧪 TEST: PRODUCT ACCESS CONTROL ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

try {
// Lees members.json
if (!fs.existsSync(MEMBERS_FILE)) {
console.error('❌ members.json niet gevonden in data/ folder!');
process.exit(1);
}

const members = JSON.parse(fs.readFileSync(MEMBERS_FILE, 'utf8'));
console.log(`📊 Totaal aantal leden: ${members.length}\n`);

// Test categorieën
const results = {
fullAccess: [],
saison4mois: [],
saison4moisExpired: [],
noAccess: [],
noProducts: [],
paymentIssue: []
};

// Test elk lid
members.forEach(member => {
const memberName = member.joinRequestMember || 'Onbekend';
const paymentStatus = member.statusLabel;

// Check payment eerst
if (paymentStatus !== 'Payé' && paymentStatus !== 'En cours de paiement') {
results.paymentIssue.push({
name: memberName,
status: paymentStatus,
products: member.joinRequestProducts?.map(p => p.displayProductPrice) || []
});
return;
}

// Check product access
const accessCheck = checkProductAccess(member);

switch (accessCheck.productType) {
case 'FULL_ACCESS':
results.fullAccess.push({
name: memberName,
products: member.joinRequestProducts?.map(p => p.displayProductPrice) || []
});
break;
case 'SAISON_4MOIS':
results.saison4mois.push({
name: memberName,
dateCreation: member.dateCreation,
reason: accessCheck.reason,
products: member.joinRequestProducts?.map(p => p.displayProductPrice) || []
});
break;
case 'SAISON_4MOIS_EXPIRED':
results.saison4moisExpired.push({
name: memberName,
dateCreation: member.dateCreation,
reason: accessCheck.reason,
products: member.joinRequestProducts?.map(p => p.displayProductPrice) || []
});
break;
case 'NO_ACCESS':
results.noAccess.push({
name: memberName,
reason: accessCheck.reason,
products: member.joinRequestProducts?.map(p => p.displayProductPrice) || []
});
break;
case 'NONE':
results.noProducts.push({
name: memberName,
reason: accessCheck.reason
});
break;
}
});

// ════════════════════════════════════════════════════════════════════
// RESULTATEN
// ════════════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════════════');
console.log('✅ VOLLEDIGE TOEGANG (Creneaux libres / Cours)');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Aantal: ${results.fullAccess.length}\n`);
results.fullAccess.forEach(m => {
console.log(`👤 ${m.name}`);
m.products.forEach(p => console.log(` ├─ ${p}`));
console.log('');
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log('🟢 SAISON 4 MOIS - ACTIEF');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Aantal: ${results.saison4mois.length}\n`);
results.saison4mois.forEach(m => {
console.log(`👤 ${m.name}`);
console.log(` ├─ Aangemaakt: ${m.dateCreation}`);
console.log(` ├─ Status: ${m.reason}`);
m.products.forEach(p => console.log(` ├─ ${p}`));
console.log('');
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log('🔴 SAISON 4 MOIS - VERLOPEN');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Aantal: ${results.saison4moisExpired.length}\n`);
results.saison4moisExpired.forEach(m => {
console.log(`👤 ${m.name}`);
console.log(` ├─ Aangemaakt: ${m.dateCreation}`);
console.log(` ├─ Status: ${m.reason}`);
m.products.forEach(p => console.log(` ├─ ${p}`));
console.log('');
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log('❌ GEEN TOEGANG (Geen Creneaux/Cours product)');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Aantal: ${results.noAccess.length}\n`);
results.noAccess.forEach(m => {
console.log(`👤 ${m.name}`);
console.log(` ├─ Reden: ${m.reason}`);
m.products.forEach(p => console.log(` ├─ ${p}`));
console.log('');
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log('⚠️ BETALINGSPROBLEMEN');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Aantal: ${results.paymentIssue.length}\n`);
results.paymentIssue.forEach(m => {
console.log(`👤 ${m.name}`);
console.log(` ├─ Status: ${m.status}`);
m.products.forEach(p => console.log(` ├─ ${p}`));
console.log('');
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log('📊 SAMENVATTING');
console.log('═══════════════════════════════════════════════════════════');
console.log(`✅ Volledige toegang: ${results.fullAccess.length}`);
console.log(`🟢 Saison 4 mois actief: ${results.saison4mois.length}`);
console.log(`🔴 Saison 4 mois verlopen: ${results.saison4moisExpired.length}`);
console.log(`❌ Geen toegang (product): ${results.noAccess.length}`);
console.log(`⚠️ Betalingsproblemen: ${results.paymentIssue.length}`);
console.log(`📋 Geen producten: ${results.noProducts.length}`);
console.log(`───────────────────────────────────────────────────────────`);
console.log(`📊 TOTAAL: ${members.length}`);
console.log('═══════════════════════════════════════════════════════════\n');

// ════════════════════════════════════════════════════════════════════
// SPECIFIEKE PRODUCT ANALYSE
// ════════════════════════════════════════════════════════════════════

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║ 📦 PRODUCT ANALYSE ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const productCounts = {};
members.forEach(member => {
if (Array.isArray(member.joinRequestProducts)) {
member.joinRequestProducts.forEach(product => {
const productName = product.displayProductPrice || 'Onbekend';
productCounts[productName] = (productCounts[productName] || 0) + 1;
});
}
});

const sortedProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]);

console.log('Alle producten in de database:\n');
sortedProducts.forEach(([product, count]) => {
const hasAccess = product.toLowerCase().includes('creneaux libres') || 
product.toLowerCase().includes('cours');
const icon = hasAccess ? '✅' : '❌';
console.log(`${icon} ${product}: ${count}x`);
});

console.log('\n✅ = Geeft toegang tot de zaal');
console.log('❌ = Geeft GEEN toegang tot de zaal\n');

} catch (error) {
console.error('❌ ERROR:', error.message);
process.exit(1);
}
