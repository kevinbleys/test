@echo off
echo ================================================
echo    ESCALADE - DEVELOPMENT MODE
echo ================================================
echo.
echo 🔄 Demarrage en mode developpement avec hot reload...
echo.
echo Services avec auto-reload:
echo 📱 Tablet UI (webpack dev):     http://localhost:3000
echo 🔧 Backend API (nodemon):       http://localhost:3001  
echo 📊 Admin Dashboard (react dev): http://localhost:3002
echo.
echo ⚠️  Les changements de code rechargeront automatiquement
echo    Appuyez sur Ctrl+C pour arreter tous les services
echo.

:: Verifieer Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installe
    pause
    exit /b 1
)

:: Start development servers met hot reload
npm run dev

pause
