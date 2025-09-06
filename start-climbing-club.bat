@echo off
title Climbing Club Software - Clean Version (No Admin Dashboard)
color 0A

echo.
echo     ==========================================
echo       CLIMBING CLUB SOFTWARE - CLEAN START
echo     ==========================================
echo.
echo Starting Backend + Tablet UI only (no admin-dashboard)
echo.

REM Kill existing processes to prevent conflicts
echo 1. Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start Backend (Port 3001) - MINIMIZED
echo 2. Starting Backend Server (Port 3001) in background...
cd backend
start "Backend" /min cmd /c "echo ✅ Backend + Admin Interface Starting && node server.js && pause"
cd ..

REM Wait for backend to start
echo   Waiting for backend to initialize...
timeout /t 6 /nobreak >nul

REM Start Tablet UI Frontend (Port 3000) - MINIMIZED
echo 3. Starting Tablet UI Frontend (Port 3000) in background...
if exist tablet-ui (
    cd tablet-ui
    if exist package.json (
        call npm install --silent >nul 2>&1
        start "Tablet UI" /min cmd /c "echo ✅ Tablet UI Starting && npm start && pause"
    ) else (
        start "Tablet UI" /min cmd /c "echo ✅ Tablet UI Static && npx http-server -p 3000 -c-1 && pause"
    )
    cd ..
) else (
    echo   ❌ tablet-ui directory not found
)

REM Wait for services to start
echo 4. Waiting for services to initialize...
timeout /t 8 /nobreak >nul

REM Open the required interfaces
echo 5. Opening web interfaces...
echo   Opening Admin Interface...
start "Admin Interface" http://localhost:3001/admin

timeout /t 3 /nobreak >nul
echo   Opening Tablet Interface...
start "Tablet Interface" http://localhost:3000

echo.
echo ✅ CLEAN SYSTEM STARTED!
echo.
echo 📊 Active Services:
echo   • Backend + Admin:    http://localhost:3001 + /admin ✅
echo   • Tablet Interface:   http://localhost:3000           ✅
echo.
echo 📊 Removed/Not Used:
echo   • admin-dashboard:    localhost:3002 (eliminated)
echo.
echo 💡 Simplified system - only essential components running.
echo 💡 Admin functionality available at localhost:3001/admin
echo 💡 No more unwanted browser windows opening!
echo.
echo Press any key to close this launcher...
pause >nul
