@echo off
echo.
echo ====================================================
echo     CLIMBING CLUB SOFTWARE - DIAGNOSTIC START
echo ====================================================
echo.

:: Check if Node.js is installed
echo 1. Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo 💡 Download Node.js from: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js is installed: 
node --version

:: Navigate to project root
echo.
echo 2. Navigating to project directory...
cd /d "%~dp0"
echo ✅ Current directory: %CD%

:: Check project structure
echo.
echo 3. Checking project structure...
if not exist "backend" (
    echo ❌ Backend directory not found!
    pause
    exit /b 1
)
echo ✅ Backend directory found

if not exist "package.json" (
    echo ❌ Main package.json not found!
    pause  
    exit /b 1
)
echo ✅ Main package.json found

:: Install main dependencies
echo.
echo 4. Installing main dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install main dependencies
    pause
    exit /b 1
)
echo ✅ Main dependencies installed

:: Check backend
echo.
echo 5. Checking backend setup...
cd backend
if not exist "package.json" (
    echo ❌ Backend package.json not found!
    pause
    exit /b 1
)
echo ✅ Backend package.json found

if not exist "server.js" (
    echo ❌ Backend server.js not found!
    echo 💡 Make sure you copied ultra-robust-server.js to backend/server.js
    pause
    exit /b 1
)
echo ✅ Backend server.js found

:: Install backend dependencies
echo.
echo 6. Installing backend dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

:: Run diagnostic (if exists)
echo.
echo 7. Running backend diagnostic...
if exist "..ackend-diagnostic.js" (
    node ..ackend-diagnostic.js
) else (
    echo ⚠️ Diagnostic script not found, continuing...
)

:: Check port availability
echo.
echo 8. Checking port 3001...
netstat -ano | findstr :3001 >nul
if not errorlevel 1 (
    echo ⚠️ Port 3001 is in use!
    echo 💡 The backend might already be running, or another process is using port 3001
    echo.
    netstat -ano | findstr :3001
    echo.
    set /p choice="Do you want to continue anyway? (y/n): "
    if /i not "%choice%"=="y" (
        echo Startup cancelled
        pause
        exit /b 1
    )
)

:: Start backend server
echo.
echo ====================================================
echo     STARTING BACKEND SERVER
echo ====================================================
echo.
echo 🚀 Starting backend on port 3001...
echo 📊 Health check will be: http://localhost:3001/api/health
echo 👤 Member check will be: http://localhost:3001/members/check
echo 📋 Presences will be: http://localhost:3001/presences
echo.
echo ⏹️ Press Ctrl+C to stop the server
echo.

node server.js

echo.
echo Server stopped.
pause
