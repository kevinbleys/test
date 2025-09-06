const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 CLIMBING CLUB - FINAL TABLET + PAYMENT FIX');
console.log('Port:', PORT);

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const NON_MEMBERS_FILE = path.join(DATA_DIR, 'non-members.json');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');

// Season helper
function getCurrentSeasonName() {
 const now = new Date();
 const currentYear = now.getFullYear();
 const currentMonth = now.getMonth();

 if (currentMonth >= 8) {
 return `${currentYear}-${currentYear + 1}`;
 } else {
 return `${currentYear - 1}-${currentYear}`;
 }
}

// Ensure data directories exist
if (!fs.existsSync(DATA_DIR)) {
 fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files
const initDataFile = (filePath, defaultData = []) => {
 try {
 if (!fs.existsSync(filePath)) {
 fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
 console.log(`✅ Initialized ${path.basename(filePath)}`);
 }
 } catch (error) {
 console.error(`❌ Failed to initialize ${path.basename(filePath)}:`, error);
 }
};

initDataFile(PRESENCES_FILE);
initDataFile(NON_MEMBERS_FILE);
initDataFile(PRESENCE_HISTORY_FILE);

// File operations
const readJsonFile = (filePath) => {
 try {
 if (!fs.existsSync(filePath)) return [];
 const data = fs.readFileSync(filePath, 'utf8');
 return JSON.parse(data) || [];
 } catch (error) {
 console.error(`Error reading ${path.basename(filePath)}:`, error);
 return [];
 }
};

const writeJsonFile = (filePath, data) => {
 try {
 fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
 return true;
 } catch (error) {
 console.error(`Error writing ${path.basename(filePath)}:`, error);
 return false;
 }
};

// ✅ ULTIMATE TABLET CORS CONFIGURATION - COMPREHENSIVE
app.use(cors({
 origin: [
 // Local development
 'http://localhost:3000',
 'http://localhost:3001', 
 'http://localhost:3002',
 'http://127.0.0.1:3000',
 'http://127.0.0.1:3001',
 'http://127.0.0.1:3002',
 // ✅ ALL POSSIBLE TABLET IP RANGES - COMPREHENSIVE
 // Class C: 192.168.x.x (most common home/office networks)
 /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:300[0-2]$/,
 // Class A: 10.x.x.x (corporate networks)  
 /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:300[0-2]$/,
 // Class B: 172.16-31.x.x (corporate networks)
 /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:300[0-2]$/,
 // ✅ WILDCARD FOR ANY REMAINING CASES
 '*'
 ],
 credentials: true,
 methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
 allowedHeaders: [
 'Content-Type', 
 'Authorization', 
 'X-Requested-With', 
 'Accept', 
 'Origin',
 'Cache-Control',
 'X-File-Name'
 ],
 exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));

// ✅ EXPLICIT PREFLIGHT HANDLING FOR ALL ROUTES
app.options('*', (req, res) => {
 res.header('Access-Control-Allow-Origin', '*');
 res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,HEAD,PATCH');
 res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name');
 res.header('Access-Control-Allow-Credentials', 'true');
 res.sendStatus(200);
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
if (fs.existsSync(path.join(__dirname, 'public'))) {
 app.use(express.static(path.join(__dirname, 'public')));
}

// ✅ COMPREHENSIVE LOGGING FOR TABLET DEBUG
app.use((req, res, next) => {
 const timestamp = new Date().toISOString();
 const origin = req.get('Origin') || 'none';
 const userAgent = req.get('User-Agent')?.substring(0, 100) || 'none';

 console.log(`🌐 ${timestamp} - ${req.method} ${req.path}`);
 console.log(`   Origin: ${origin}`);
 console.log(`   User-Agent: ${userAgent}`);

 if (req.query && Object.keys(req.query).length > 0) {
 console.log('   Query:', JSON.stringify(req.query));
 }

 if (req.body && Object.keys(req.body).length > 0) {
 console.log('   Body keys:', Object.keys(req.body));
 }

 next();
});

// Sync service with fallback
let syncService = null;
try {
 syncService = require('./sync-service');
 console.log('✅ Sync service loaded');
} catch (error) {
 console.warn('⚠️ Using fallback sync service');
 syncService = {
 getMembers: () => []
 };
}

// Basic routes
app.get('/', (req, res) => {
 res.json({
 status: 'success',
 message: 'Climbing Club API - Final Tablet + Payment Fix',
 currentSeason: getCurrentSeasonName(),
 timestamp: new Date().toISOString(),
 corsMode: 'COMPREHENSIVE_TABLET_SUPPORT',
 paymentCheckEnabled: true,
 tabletAccessEnabled: true
 });
});

app.get('/api/health', (req, res) => {
 const health = {
 status: 'healthy',
 currentSeason: getCurrentSeasonName(),
 timestamp: new Date().toISOString(),
 uptime: process.uptime(),
 corsMode: 'COMPREHENSIVE_TABLET_SUPPORT',
 paymentCheckEnabled: true,
 tabletAccess: true,
 requestOrigin: req.get('Origin') || 'none'
 };

 console.log('💚 Health check from:', health.requestOrigin);
 res.json(health);
});

// Admin route
app.get('/admin', (req, res) => {
 const adminPath = path.join(__dirname, 'public', 'admin.html');
 if (fs.existsSync(adminPath)) {
 res.sendFile(adminPath);
 } else {
 res.json({ message: 'Admin interface not found' });
 }
});

// ✅ MEMBER CHECK: ULTIMATE STRICT VERSION WITH PAYMENT
app.get('/members/check', (req, res) => {
 const { nom, prenom } = req.query;
 const origin = req.get('Origin') || 'localhost';

 console.log(`=== ULTIMATE MEMBER + PAYMENT CHECK ===`);
 console.log(`Request: ${nom} ${prenom} from ${origin}`);

 if (!nom || !prenom) {
 return res.status(400).json({
 success: false,
 error: "Paramètres 'nom' et 'prenom' requis"
 });
 }

 try {
 const members = syncService.getMembers();
 console.log(`Searching in ${members.length} members`);

 const member = members.find(m =>
 m.lastname?.trim().toLowerCase() === nom.trim().toLowerCase() &&
 m.firstname?.trim().toLowerCase() === prenom.trim().toLowerCase()
 );

 if (!member) {
 console.log('❌ Member not found');
 return res.json({
 success: false,
 error: "Aucun membre trouvé avec ce nom et prénom"
 });
 }

 console.log('✅ Member found:', member.firstname, member.lastname);
 console.log('Categories:', member.categories?.map(c => c.label) || []);
 console.log('Payment status:', member.joinFileStatusLabel || 'none');

 // ✅ ULTRA-STRICT CATEGORY CHECK
 let hasValidMembership = false;
 let rejectionReason = '';

 if (Array.isArray(member.categories)) {
 member.categories.forEach(category => {
 if (typeof category.label === 'string') {
 const categoryLower = category.label.toLowerCase().trim();

 if (categoryLower === 'adhérent') {
 hasValidMembership = true;
 console.log('✅ VALID: Exact "Adhérent" found');
 } else if (categoryLower.includes('ancien')) {
 console.log('❌ REJECTED: "Ancien adhérent" detected');
 rejectionReason = 'Former member (Ancien adhérent)';
 } else {
 console.log(`❌ OTHER: "${category.label}" not recognized`);
 }
 }
 });
 }

 if (!hasValidMembership) {
 console.log(`❌ MEMBERSHIP REJECTED: ${rejectionReason || 'No valid Adhérent category'}`);
 return res.json({
 success: false,
 error: `Vous n'avez pas d'adhésion valide pour la saison ${getCurrentSeasonName()}. Merci de vous inscrire comme visiteur.`,
 reason: rejectionReason || 'No valid membership',
 season: getCurrentSeasonName()
 });
 }

 // ✅ ULTRA-STRICT PAYMENT CHECK
 const paymentStatus = member.joinFileStatusLabel;
 console.log(`Payment validation: "${paymentStatus}"`);

 if (paymentStatus) {
 const statusLower = paymentStatus.toLowerCase();

 // Check for "à payer" (not paid) - STRICT REJECTION
 if (statusLower.includes('payer') && !statusLower.includes('payé')) {
 console.log('❌ PAYMENT BLOCKED: à payer status detected');
 return res.json({
 success: false,
 error: "Votre adhésion n'est pas encore payée. Merci de contacter un bénévole pour finaliser le paiement.",
 reason: 'Payment incomplete',
 paymentStatus: paymentStatus,
 season: getCurrentSeasonName(),
 requiresVolunteer: true,
 paymentIncomplete: true
 });
 }
 }

 // ✅ ALL CHECKS PASSED - GRANT ACCESS
 console.log('✅ FULL ACCESS GRANTED - Valid membership and payment');
 return res.json({
 success: true,
 isPaid: true,
 message: `Adhésion reconnue pour la saison ${getCurrentSeasonName()}. Bienvenue !`,
 membre: member,
 season: getCurrentSeasonName(),
 paymentStatus: paymentStatus || 'Confirmed'
 });

 } catch (error) {
 console.error('❌ Member check error:', error);
 return res.status(500).json({
 success: false,
 error: 'Erreur lors de la vérification du membre'
 });
 }
});

app.get('/members/all', (req, res) => {
 try {
 const members = syncService.getMembers();
 res.json({
 success: true,
 members,
 count: members.length,
 season: getCurrentSeasonName()
 });
 } catch (error) {
 res.status(500).json({ success: false, error: error.message });
 }
});

// Presences routes
app.get('/presences', (req, res) => {
 console.log('📋 GET /presences from:', req.get('Origin') || 'localhost');
 try {
 const presences = readJsonFile(PRESENCES_FILE);
 res.json({
 success: true,
 presences,
 count: presences.length
 });
 } catch (error) {
 res.status(500).json({ success: false, error: 'Server error' });
 }
});

app.get('/presences/:id', (req, res) => {
 try {
 const presences = readJsonFile(PRESENCES_FILE);
 const presence = presences.find(p => p.id === req.params.id);

 if (!presence) {
 return res.status(404).json({ success: false, error: 'Not found' });
 }

 res.json({ success: true, presence });
 } catch (error) {
 res.status(500).json({ success: false, error: 'Server error' });
 }
});

app.post('/presences', (req, res) => {
 console.log('=== NEW PRESENCE from:', req.get('Origin') || 'localhost');

 const { type, nom, prenom, ...otherData } = req.body;

 if (!type || !nom || !prenom) {
 return res.status(400).json({
 success: false,
 error: 'Type, nom, prenom requis'
 });
 }

 try {
 const presences = readJsonFile(PRESENCES_FILE);
 const newPresence = {
 id: Date.now().toString(),
 type,
 nom: nom.trim(),
 prenom: prenom.trim(),
 date: new Date().toISOString(),
 season: getCurrentSeasonName(),
 ...otherData
 };

 if (type === 'adherent') {
 newPresence.status = 'adherent';
 } else {
 newPresence.status = 'pending';
 newPresence.tarif = otherData.tarif || 10;
 }

 presences.push(newPresence);

 if (writeJsonFile(PRESENCES_FILE, presences)) {
 console.log('✅ Presence created:', newPresence.id);
 res.json({
 success: true,
 message: 'Présence enregistrée avec succès',
 presence: newPresence
 });
 } else {
 throw new Error('Write failed');
 }
 } catch (error) {
 console.error('❌ Presence error:', error);
 res.status(500).json({
 success: false,
 error: 'Erreur lors de l\'enregistrement'
 });
 }
});

app.post('/presences/:id/valider', (req, res) => {
 try {
 const presences = readJsonFile(PRESENCES_FILE);
 const index = presences.findIndex(p => p.id === req.params.id);

 if (index === -1) {
 return res.status(404).json({ success: false, error: 'Not found' });
 }

 presences[index].status = 'Payé';
 presences[index].dateValidation = new Date().toISOString();

 if (req.body.montant) presences[index].tarif = req.body.montant;
 if (req.body.methodePaiement) presences[index].methodePaiement = req.body.methodePaiement;

 if (writeJsonFile(PRESENCES_FILE, presences)) {
 res.json({ success: true, presence: presences[index] });
 } else {
 throw new Error('Write failed');
 }
 } catch (error) {
 res.status(500).json({ success: false, error: 'Server error' });
 }
});

app.delete('/presences/:id', (req, res) => {
 try {
 const presences = readJsonFile(PRESENCES_FILE);
 const filtered = presences.filter(p => p.id !== req.params.id);

 if (writeJsonFile(PRESENCES_FILE, filtered)) {
 res.json({ success: true });
 } else {
 throw new Error('Write failed');
 }
 } catch (error) {
 res.status(500).json({ success: false, error: 'Server error' });
 }
});

// Stats
app.get('/api/stats/today', (req, res) => {
 try {
 const presences = readJsonFile(PRESENCES_FILE);
 const today = new Date().toISOString().split('T')[0];
 const todayPresences = presences.filter(p => p.date?.startsWith(today));

 res.json({
 success: true,
 stats: {
 date: today,
 total: todayPresences.length,
 adherents: todayPresences.filter(p => p.type === 'adherent').length,
 nonAdherents: todayPresences.filter(p => p.type === 'non-adherent').length,
 season: getCurrentSeasonName()
 }
 });
 } catch (error) {
 res.status(500).json({ success: false, error: 'Server error' });
 }
});

// Non-members routes
app.get('/non-members', (req, res) => {
 try {
 const nonMembers = readJsonFile(NON_MEMBERS_FILE);
 res.json({
 success: true,
 nonMembers,
 count: nonMembers.length
 });
 } catch (error) {
 res.status(500).json({ success: false, error: 'Server error' });
 }
});

app.post('/non-members', (req, res) => {
 console.log('=== NEW NON-MEMBER from:', req.get('Origin') || 'localhost');

 try {
 const nonMembers = readJsonFile(NON_MEMBERS_FILE);
 const newNonMember = {
 id: Date.now().toString(),
 ...req.body,
 dateCreated: new Date().toISOString(),
 season: getCurrentSeasonName()
 };

 nonMembers.push(newNonMember);

 if (writeJsonFile(NON_MEMBERS_FILE, nonMembers)) {
 res.json({
 success: true,
 message: 'Non-membre enregistré avec succès',
 nonMember: newNonMember
 });
 } else {
 throw new Error('Write failed');
 }
 } catch (error) {
 console.error('❌ Non-member error:', error);
 res.status(500).json({
 success: false,
 error: 'Erreur lors de l\'enregistrement'
 });
 }
});

// 404 handler
app.use((req, res) => {
 console.log(`❌ 404 - ${req.method} ${req.path} from ${req.get('Origin') || 'unknown'}`);
 res.status(404).json({
 error: 'Endpoint non trouvé',
 path: req.path,
 method: req.method
 });
});

// Error handler
app.use((error, req, res, next) => {
 console.error('💥 Global error:', error);
 res.status(500).json({
 error: 'Erreur serveur',
 message: error.message
 });
});

// ✅ START SERVER WITH ULTIMATE TABLET SUPPORT
const server = app.listen(PORT, '0.0.0.0', () => {
 console.log('🎉 ==========================================');
 console.log('🎉 ULTIMATE TABLET + PAYMENT FIX ACTIVE   ');
 console.log('🎉 ==========================================');
 console.log(`✅ Local:      http://localhost:${PORT}`);
 console.log(`✅ Network:    http://[PC-IP]:${PORT}`);
 console.log(`🗓️ Season:     ${getCurrentSeasonName()}`);
 console.log('🔒 CATEGORY:   Only exact "Adhérent" accepted');
 console.log('💳 PAYMENT:    "à payer" = STRICT BLOCK');
 console.log('🌐 CORS:       COMPREHENSIVE tablet support');
 console.log('📱 TABLET:     All IP ranges supported');
 console.log('🎉 ==========================================');

 setTimeout(() => {
 try {
 const members = syncService.getMembers();
 console.log(`👥 Members loaded: ${members.length}`);
 } catch (error) {
 console.log('⚠️ Sync service fallback active');
 }
 }, 1000);
});

server.on('error', (error) => {
 console.error('💥 Server error:', error);
 if (error.code === 'EADDRINUSE') {
 console.error(`❌ Port ${PORT} in use!`);
 process.exit(1);
 }
});

process.on('SIGINT', () => {
 console.log('📴 Shutting down...');
 server.close(() => process.exit(0));
});

module.exports = app;