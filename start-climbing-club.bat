@echo off
title Climbing Club Software Launcher
color 0A

echo.
echo     ======================================
echo       CLIMBING CLUB SOFTWARE LAUNCHER
echo     ======================================
echo.

REM Check if ports are already in use
echo Checking if services are already running...
netstat -an | find ":3001" >nul
if not errorlevel 1 (
    echo ⚠️ Port 3001 already in use - Backend might be running
)

netstat -an | find ":3000" >nul  
if not errorlevel 1 (
    echo ⚠️ Port 3000 already in use - Frontend might be running
)

echo.
echo Starting Climbing Club Software...
echo.

REM Start backend in background
echo 1. Starting Backend (Port 3001)...
cd backend
start "Backend Server" cmd /k "echo Backend Server Started && node server.js"
cd ..

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend if it exists  
if exist tablet-ui (
    echo 2. Starting Frontend (Port 3000)...
    cd tablet-ui
    start "Frontend Server" cmd /k "echo Frontend Server Started && npm start"
    cd ..
) else (
    echo 2. Frontend directory not found, skipping...
)

REM Wait a bit more
timeout /t 3 /nobreak >nul

REM Open admin interface
echo 3. Opening Admin Interface...
start "Admin Interface" http://localhost:3001/admin

echo.
echo ✅ Climbing Club Software Started!
echo.
echo Services running:
echo • Backend: http://localhost:3001
echo • Admin: http://localhost:3001/admin  
echo • Frontend: http://localhost:3000 (if available)
echo.
echo Press any key to close this launcher...
echo (Services will continue running in background)
pause >nul
