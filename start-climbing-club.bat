@echo off
title Climbing Club Software - Final Version
color 0A

echo.
echo     ==========================================
echo       CLIMBING CLUB SOFTWARE - STARTUP
echo     ==========================================
echo.

REM Kill existing processes to prevent conflicts
echo 1. Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start Backend (Port 3001) - MINIMIZED
echo 2. Starting Backend Server (Port 3001) in background...
cd backend
start "Backend" /min cmd /c "echo ✅ Backend Server Starting && node server.js && pause"
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

REM Start Admin Dashboard (Port 3002) - MINIMIZED BUT NO BROWSER OPENING
echo 4. Starting Admin Dashboard (Port 3002) in background only...
if exist admin-dashboard (
    cd admin-dashboard
    if exist package.json (
        call npm install --silent >nul 2>&1
        start "Admin Dashboard" /min cmd /c "echo ✅ Admin Dashboard Starting && npm start && pause"
    )
    cd ..
)

REM Wait for all services to start
echo 5. Waiting for all services to initialize...
timeout /t 8 /nobreak >nul

REM Open ONLY the required interfaces - NO localhost:3002
echo 6. Opening web interfaces...
echo   Opening Admin Interface...
start "Admin Interface" http://localhost:3001/admin

timeout /t 3 /nobreak >nul
echo   Opening Tablet Interface...
start "Tablet Interface" http://localhost:3000

echo.
echo ✅ ALL SERVICES STARTED!
echo.
echo 📊 Opened in Browser:
echo   • Admin Interface:    http://localhost:3001/admin ✅
echo   • Tablet Interface:   http://localhost:3000       ✅
echo.
echo 📊 Running in Background Only:
echo   • Admin Dashboard:    http://localhost:3002       (not opened)
echo.
echo 💡 Services are running minimized in background.
echo 💡 Close minimized windows = services stop!
echo 💡 To stop all: stop-climbing-club.bat
echo.
echo Press any key to close this launcher...
pause >nul
