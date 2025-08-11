# 🏗️ Klimzaal Presence Management - Complete Setup Gids

## 📋 Vereisten

1. **Node.js** (versie 16 of hoger) - Download van https://nodejs.org
2. **Windows 10/11** (64-bit)
3. **Administrator rechten** voor installatie

## 🚀 Stap-voor-stap Installatie

### Stap 1: Dependencies installeren

```bash
# In je hoofdproject directory
npm install --save-dev electron electron-builder
npm install --save node-windows
```

### Stap 2: Project structuur voorbereiden

Zorg dat je de volgende bestanden hebt aangemaakt:

```
project-root/
├── main.js                    # Electron main process
├── package.json               # Updated met build config
├── build-installer.js         # Builder script
├── installer-script.nsh       # NSIS custom script
├── create-shortcuts.js        # Desktop shortcuts
├── assets/                    # Iconen directory
│   ├── icon.ico              # Admin dashboard icoon
│   ├── tablet-icon.ico       # Tablet interface icoon  
│   └── tray-icon.ico         # System tray icoon
├── backend/
│   ├── server.js             # Je bestaande backend
│   ├── install-service.js    # Service installer
│   ├── uninstall-service.js  # Service uninstaller
│   └── [alle andere backend bestanden]
├── admin-dashboard/          # Je admin interface
└── tablet-ui/               # Je tablet interface
```

### Stap 3: Iconen toevoegen

Maak de `assets/` directory aan en voeg toe:
- `icon.ico` - 256x256 ICO bestand voor admin dashboard
- `tablet-icon.ico` - 256x256 ICO bestand voor tablet interface  
- `tray-icon.ico` - 32x32 ICO bestand voor system tray

### Stap 4: Installer bouwen

```bash
# Installer bouwen (dit maakt een .exe bestand)
node build-installer.js
```

De installer wordt opgeslagen in de `dist/` directory.

## 📦 Wat doet de installer?

### Tijdens installatie:
1. ✅ Installeert alle bestanden naar `Program Files`
2. ✅ Installeert Windows service dependencies 
3. ✅ Maakt Windows service aan die automatisch start
4. ✅ Start de backend service
5. ✅ Maakt desktop shortcuts aan:
   - "Klimzaal Admin Dashboard" → http://localhost:3001
   - "Klimzaal Tablet Interface" → http://localhost:3001/tablet
6. ✅ Maakt Start Menu shortcuts aan
7. ✅ Configureert automatische herstart bij reboot

### Na installatie:
- 🌐 Backend draait op `http://localhost:3001`
- 📊 Admin dashboard: `http://localhost:3001` 
- 📱 Tablet interface: `http://localhost:3001/tablet`
- 🔄 Service herstart automatisch bij reboot
- 🖥️ System tray icoon voor snelle toegang

## 🎯 Deployment naar Klimzaal Computer

1. **Kopieer de installer**: `Klimzaal Presence Management-Setup-1.0.0.exe`
2. **Start als Administrator** (rechtermuisklik → "Als administrator uitvoeren")
3. **Volg installatiestappen**
4. **Test de shortcuts** op het bureaublad
5. **Verifieer service**: Win+R → `services.msc` → zoek naar "KlimzaalPresenceManagement"

## 🔧 Handmatige Service Management

Als de automatische service installatie niet werkt:

```bash
# Service handmatig installeren
cd "C:\Program Files\Klimzaal Presence Management\resources\app\backend"
node install-service.js

# Service handmatig verwijderen  
node uninstall-service.js

# Service status controleren
sc query KlimzaalPresenceManagement
```

## 🛠️ Troubleshooting

### Probleem: Service start niet
**Oplossing**: Controleer Windows Event Viewer → Windows Logs → Application

### Probleem: Poort 3001 al in gebruik
**Oplossing**: Wijzig PORT in backend/server.js en update shortcuts

### Probleem: Firewall blokkeert verbindingen
**Oplossing**: Windows Defender Firewall → Allow app → Zoek "node.exe"

### Probleem: Shortcuts werken niet
**Oplossing**: Run handmatig: `node create-shortcuts.js` als Administrator

## 📝 Uninstall

1. **Via Control Panel**: Programs → Uninstall "Klimzaal Presence Management"
2. **Of via Start Menu**: Klimzaal Presence Management → Uninstall

Dit zal:
- ✅ Windows service stoppen en verwijderen
- ✅ Alle bestanden verwijderen
- ✅ Desktop shortcuts verwijderen
- ✅ Start Menu entries verwijderen

## 🎉 Klaar!

Je hebt nu een professionele installer die:
- 🔧 Automatisch alles installeert
- 🚀 Service automatisch start
- 🖥️ Desktop shortcuts maakt
- 🔄 Automatisch herstart na reboot
- 📱 Beide interfaces beschikbaar maakt

Perfect voor deployment in de klimzaal! 🧗‍♀️