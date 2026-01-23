# 🏔️ BEYEREDE ESCALADE - QUICK START

## ALLE BESTANDEN DOWNLOADEN

Je hebt deze 5 bestanden gekregen:
1. ✅ `README-NL.md` - Complete documentatie
2. ✅ `server.js` - Backend server
3. ✅ `admin.html` - Frontend interface
4. ✅ `package.json` - Dependencies
5. ✅ `fix-history-format.js` - Data repair script
6. ✅ `setup.sh` - Automatische setup (Mac/Linux)

---

## STAP-VOOR-STAP INSTALATIE (5 minuten)

### ⚡ SUPER SNELLE SETUP (Mac/Linux)
```bash
# 1. Maak een folder voor je project
mkdir beyerede-escalade
cd beyerede-escalade

# 2. Plaats ALLE bestanden in deze folder

# 3. Run setup script
chmod +x setup.sh
./setup.sh

# 4. Fix je bestaande data
npm run fix-history

# 5. Start server
npm start

# 6. Open in browser: http://localhost:3001
```

### 🪟 WINDOWS SETUP
```cmd
REM 1. Maak folder
mkdir beyerede-escalade
cd beyerede-escalade

REM 2. Plaats alle bestanden

REM 3. Install npm packages
npm install

REM 4. Fix je data
npm run fix-history

REM 5. Start server
npm start

REM 6. Open browser: http://localhost:3001
```

### 📋 HANDMATIGE SETUP (als scripts niet werken)
```bash
# 1. Plaats alle bestanden in een folder
# 2. Open terminal/CMD in die folder
# 3. Run:
npm install
node fix-history-format.js
npm start
```

---

## JE FOLDER STRUCTURE MOET ERUITZIEN ALS:

```
beyerede-escalade/
├── server.js                    ← Backend server
├── admin.html                   ← Frontend interface
├── fix-history-format.js        ← Data repair tool
├── package.json                 ← Dependencies
├── README-NL.md                 ← Documentatie
├── setup.sh                     ← Auto setup script
└── data/                        ← Wordt automatisch gemaakt
    ├── presences.json
    ├── presence-history.json
    ├── members.json
    └── archive.json
```

---

## 🔧 STAP 1: DATA REPAREREN (EENMALIG!)

```bash
npm run fix-history
```

Dit zal:
- ✅ Je `presence-history.json` checken
- ✅ Automatisch naar correct formaat converteren
- ✅ Een backup maken (presence-history.backup.XXXXX.json)
- ✅ Je vertellen wat er gedaan is

Output voorbeeld:
```
🔧 FIXING PRESENCE HISTORY FORMAT...

📊 Current format: Object ✗
🔄 Converting...
   Backup: presence-history.backup.1737644400000.json
   ✅ Fixed: 45 date entries

✅ SUCCESS!
   Type: Array
   Entries: 45
   First date: 2024-12-15
   Last date: 2024-01-10
```

---

## 🚀 STAP 2: SERVER STARTEN

```bash
npm start
```

Je zult dit zien:
```
🏔️  BEYEREDE ESCALADE SERVER RUNNING 🏔️
=====================================
✅ API: http://localhost:3001
📁 Data: /path/to/data
=====================================
```

**Server blijft lopen!** Terminal niet sluiten.

---

## 🌐 STAP 3: ADMIN INTERFACE OPENEN

### Optie A: Direct HTML file
1. Open `admin.html` in je browser
2. Of: `file:///absolute/path/to/admin.html`

### Optie B: Via webserver (beter)
```bash
# In nieuwe terminal:
npx http-server . -p 8080
```
Dan open: `http://localhost:8080/admin.html`

---

## ✅ TESTEN OF HET WERKT

1. **Homepage openen** - Admin interface laadt
2. **Server status** - Ziet groene indicator
3. **Presences toevoegen** - Button werkt
4. **Historiek laden** - Date picker werkt
5. **Export** - Seasons laden

---

## 🛠️ TROUBLESHOOTING

### ❌ "Cannot find module express"
```bash
npm install
```

### ❌ "Port 3001 already in use"
```bash
# Kill process on port 3001:
# macOS/Linux:
lsof -ti:3001 | xargs kill -9

# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### ❌ "Cannot read property 'date' of undefined"
```bash
node fix-history-format.js
```

### ❌ "CORS error in browser"
- `server.js` heeft CORS enabled
- Als nog error: check API_URL in admin.html

### ❌ "History dates empty"
```bash
# Check data folder exists:
ls -la data/

# Check presence-history.json format:
cat data/presence-history.json | head -20
```

---

## 📞 QUICK REFERENCE

### Start development:
```bash
npm start
```

### Fix data:
```bash
npm run fix-history
```

### API running on:
```
http://localhost:3001
```

### Admin interface:
```
admin.html (any browser)
```

### Stop server:
```
Press Ctrl+C in terminal
```

---

## 🎯 DAGELIJKS WORKFLOW

1. Start server: `npm start`
2. Open admin.html
3. Register presences
4. Validate payments
5. End of day: Click "Archiver"
6. Check history as needed

---

## 📝 WICHTIGE NOTES

- ✅ Je oude presence-history.json wordt automatisch gerepareerd
- ✅ Backup wordt gemaakt voordat reparatie
- ✅ Alle dates in YYYY-MM-DD format
- ✅ Server draait op localhost:3001
- ✅ Admin.html communiceert met API
- ✅ Data wordt opgeslagen in ./data/ folder

---

## 🎉 KLAAR!

Je hebt nu:
- ✅ Complete backend server
- ✅ Admin interface
- ✅ Data reparatie tool
- ✅ Al je presences archief

Veel sterkte met je escalade club management! 🏔️

---

## EXTRA: DOCKER SETUP (Optional)

Als je Docker wilt gebruiken:

```bash
# Maak Dockerfile aan
echo 'FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3001
CMD ["npm", "start"]' > Dockerfile

# Build en run
docker build -t beyerede-escalade .
docker run -p 3001:3001 -v $(pwd)/data:/app/data beyerede-escalade
```

---

Vragen? Check README-NL.md voor compleet documentatie!
