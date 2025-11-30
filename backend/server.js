const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3001;

const DATA_DIR = path.join(__dirname, 'data');
const PRESENCES_FILE = path.join(DATA_DIR, 'presences.json');
const ATTEMPTS_FILE = path.join(DATA_DIR, 'login-attempts.json');
const PRESENCE_HISTORY_FILE = path.join(DATA_DIR, 'presence-history.json');
const SAVED_NON_MEMBERS_FILE = path.join(DATA_DIR, 'saved-non-members.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJsonFile(p) {
    try {
        if (!fs.existsSync(p)) return [];
        const d = fs.readFileSync(p, 'utf8');
        const result = JSON.parse(d);
        return Array.isArray(result) ? result : [];
    } catch { return []; }
}
function writeJsonFile(p, d) {
    try { fs.writeFileSync(p, JSON.stringify(d, null, 2)); return true; }
    catch { return false; }
}

// DEDUPLICATE: check on nom, prenom, ±same minute, same type!
function deduplicateDayPresences(presences) {
    let result = [];
    let seen = new Set();
    for (const p of presences) {
        const key = `${(p.nom||'').trim().toLowerCase()}|${(p.prenom||'').trim().toLowerCase()}|${new Date(p.date).toISOString().slice(0,16)}|${p.type}`;
        if (!seen.has(key)) { result.push(p); seen.add(key);}
        // als je ECHT milliseconden wil checken: gebruik getTime(), maar in praktijk max 1 inschrijving/minuut/persoon/type
    }
    return result;
}

// ----- EXPRESS MIDDLEWARE -----
app.use(cors({origin:'*'}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));
app.get('/', (req, res) => res.json({ status: 'ok', version: '16.1-patched' }));

// ----- PRESENCES -----
app.get('/presences', (req, res) => {
    const presences = readJsonFile(PRESENCES_FILE);
    const attempts = readJsonFile(ATTEMPTS_FILE);
    res.json({ success:true, presences: [...presences,...attempts] });
});
app.post('/presences', (req, res) => {
    const { type, nom, prenom, tarif=0, ...rest } = req.body;
    if (!type || !nom || !prenom) return res.status(400).json({ success:false });
    const presences = readJsonFile(PRESENCES_FILE);
    // DEDUPLICATE LIVE: nooit 2x binnen 90 seconden (meer dan robuust genoeg)!
    const now = Date.now();
    const already = presences.find(p => 
        (p.nom||'').trim().toLowerCase() === nom.trim().toLowerCase() &&
        (p.prenom||'').trim().toLowerCase() === prenom.trim().toLowerCase() &&
        p.type === type &&
        Math.abs(now - new Date(p.date).getTime()) < 90000
    );
    if (already) return res.json({ success:true, duplicate:true, presence:already });
    const newP = {id:`${now}_${crypto.randomBytes(6).toString('hex')}`,type,nom:nom.trim(),prenom:prenom.trim(),date:new Date().toISOString(),tarif,...rest};
    presences.push(newP);
    writeJsonFile(PRESENCES_FILE, presences);
    res.json({ success:true, presence:newP });
});
app.post('/presences/:id/valider', (req, res) => {
    const presences = readJsonFile(PRESENCES_FILE);
    const idx = presences.findIndex(p=>p.id===req.params.id);
    if(idx===-1) return res.status(404).json({success:false});
    presences[idx].status='Payé';
    if(req.body.montant) presences[idx].tarif = req.body.montant;
    if(req.body.methodePaiement) presences[idx].methodePaiement = req.body.methodePaiement;
    writeJsonFile(PRESENCES_FILE,presences);
    res.json({success:true, presence:presences[idx]});
});
app.delete('/presences/:id',(req,res)=>{
    let presences=readJsonFile(PRESENCES_FILE), attempts=readJsonFile(ATTEMPTS_FILE);
    presences=presences.filter(p=>p.id!==req.params.id);
    attempts=attempts.filter(p=>p.id!==req.params.id);
    writeJsonFile(PRESENCES_FILE,presences);
    writeJsonFile(ATTEMPTS_FILE,attempts);
    res.json({success:true});
});

// ---- HISTORY -----
app.get('/presences/history',(req,res)=>{
    const history=readJsonFile(PRESENCE_HISTORY_FILE);
    const dates=history.filter(h=>h.date?.length===10 && Array.isArray(h.presences)&&h.presences.length>0).map(h=>h.date).sort().reverse();
    res.json({success:true, dates});
});
app.get('/presences/history/:date',(req,res)=>{
    const h=readJsonFile(PRESENCE_HISTORY_FILE).find(h=>h.date===req.params.date);
    if(!h) return res.json({success:true, presences:[]});
    res.json({success:true, presences:deduplicateDayPresences(h.presences)});
});

// ---- ARCHIVE -----
app.post('/presences/archive', (req, res) => {
    const presences = readJsonFile(PRESENCES_FILE);
    const attempts = readJsonFile(ATTEMPTS_FILE);
    let combined = [...presences, ...attempts];
    combined = deduplicateDayPresences(combined);
    if (combined.length === 0) return res.json({ success: false, error: 'No data to archive', archived: 0 });
    const today = new Date().toISOString().slice(0,10);
    const history = readJsonFile(PRESENCE_HISTORY_FILE);
    const idx = history.findIndex(h => h.date === today);
    if (idx >= 0) history[idx].presences = combined;
    else history.push({ date: today, presences: combined });
    writeJsonFile(PRESENCE_HISTORY_FILE, history);
    writeJsonFile(PRESENCES_FILE, []);
    writeJsonFile(ATTEMPTS_FILE, []);
    res.json({ success: true, archived: combined.length });
});

// --------- Overig/Seasons etc ---------
app.get('/admin/seasons',(req,res)=>{
    const history=readJsonFile(PRESENCE_HISTORY_FILE);
    const yearsSet=new Set(),seasons=[];
    history.forEach(h=>{
        if(h.date?.length>=4&&Array.isArray(h.presences)&&h.presences.length>0){
            const y=parseInt(h.date.substring(0,4)); if(y>2000&&y<2100) yearsSet.add(y);
        }
    });
    const years=Array.from(yearsSet);years.forEach(y=>years.includes(y+1)&&seasons.push({startYear:y,endYear:y+1}));
    const now=new Date(),mon=now.getMonth(),curr={startYear:mon>=8?now.getFullYear():now.getFullYear()-1,endYear:mon>=8?now.getFullYear()+1:now.getFullYear()};
    if(!seasons.some(s=>s.startYear===curr.startYear&&s.endYear===curr.endYear)) seasons.push(curr);
    res.json({success:true, seasons:seasons.sort((a,b)=>b.startYear-a.startYear)});
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.listen(PORT, () => console.log(`Server v16.1-patched running on http://localhost:${PORT}`));
