@echo off
echo ================================================
echo    LOGICIEL ESCALADE - DEMARRAGE LOCAL
echo ================================================
echo.
echo 🚀 Demarrage des services...
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installe. Telechargez-le depuis https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js detecte
echo.

:: Install main dependencies if needed
if not exist "node_modules" (
    echo 📦 Installation des dependances principales...
    npm install
)

:: Install backend dependencies
echo 📦 Verification backend dependencies...
cd backend
if not exist "node_modules" (
    echo    Installation backend dependencies...
    npm install
)
cd ..

:: Install admin-dashboard dependencies  
echo 📦 Verification admin-dashboard dependencies...
cd admin-dashboard
if not exist "node_modules" (
    echo    Installation admin-dashboard dependencies...
    npm install
)
cd ..

:: Install tablet-ui dependencies
echo 📦 Verification tablet-ui dependencies...
cd tablet-ui
if not exist "node_modules" (
    echo    Installation tablet-ui dependencies...
    npm install
)
cd ..

echo.
echo ================================================
echo    SERVICES STARTING
echo ================================================
echo.
echo 📱 Tablet UI:        http://localhost:3000
echo 🔧 Backend API:      http://localhost:3001  
echo 📊 Admin Dashboard:  http://localhost:3002
echo.
echo ⚡ Demarrage parallel des services...
echo    Appuyez sur Ctrl+C pour arreter tous les services
echo.

:: Start all services in parallel using npm script
npm start

pause
