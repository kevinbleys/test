@echo off
title Service Status Checker - Climbing Club
color 0B

echo.
echo ===============================================
echo        SERVICE STATUS CHECKER
echo ===============================================
echo.

echo 1. Checking running Node.js processes...
echo.
tasklist /FI "IMAGENAME eq node.exe" /FO TABLE 2>nul | findstr "node.exe"
if errorlevel 1 (
    echo ❌ No Node.js processes running
) else (
    echo ✅ Node.js processes found
)

echo.
echo 2. Checking port usage...
echo.

echo Backend (Port 3001):
netstat -ano | findstr :3001
if errorlevel 1 (
    echo ❌ Port 3001 not in use - Backend not running
) else (
    echo ✅ Port 3001 active - Backend running
)

echo.
echo Tablet UI (Port 3000):  
netstat -ano | findstr :3000
if errorlevel 1 (
    echo ❌ Port 3000 not in use - Tablet UI not running
) else (
    echo ✅ Port 3000 active - Tablet UI running
)

echo.
echo Admin Dashboard (Port 3002):
netstat -ano | findstr :3002
if errorlevel 1 (
    echo ❌ Port 3002 not in use - Admin Dashboard not running  
) else (
    echo ✅ Port 3002 active - Admin Dashboard running
)

echo.
echo 3. Testing HTTP responses...
echo.

REM Test Backend
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 3; Write-Host '✅ Backend HTTP: OK ('$r.StatusCode')' -ForegroundColor Green } catch { Write-Host '❌ Backend HTTP: FAILED' -ForegroundColor Red }"

REM Test Tablet UI
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 3; Write-Host '✅ Tablet UI HTTP: OK ('$r.StatusCode')' -ForegroundColor Green } catch { Write-Host '❌ Tablet UI HTTP: FAILED' -ForegroundColor Red }"

REM Test Admin Dashboard  
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3002' -TimeoutSec 3; Write-Host '✅ Admin Dashboard HTTP: OK ('$r.StatusCode')' -ForegroundColor Green } catch { Write-Host '❌ Admin Dashboard HTTP: FAILED' -ForegroundColor Red }"

echo.
echo ===============================================
echo           TROUBLESHOOTING TIPS
echo ===============================================
echo.
echo If services are not running:
echo 1. Run: fix-port-conflicts.bat
echo 2. Run: start-climbing-club.bat  
echo 3. Wait 10-15 seconds for all services to start
echo 4. Check individual console windows for errors
echo.
echo If HTTP tests fail but ports are active:
echo • Services might still be starting up
echo • Check Windows Firewall settings
echo • Restart services with stop-climbing-club.bat then start-climbing-club.bat
echo.
pause
