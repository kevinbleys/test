@echo off
title QUICK FIX - Most Common Issues
color 0A

echo ===============================================
echo    QUICK FIX - MOST COMMON ISSUES
echo ===============================================
echo.

echo This script will attempt to fix the most common
echo issues that prevent the fixes from working.
echo.
echo Press any key to start quick fix...
pause >nul

echo.
echo 1. Stopping all services...
call stop-climbing-club.bat 2>nul
timeout /t 3 >nul

echo 2. Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.exe 2>nul
timeout /t 2 >nul

echo 3. Checking file replacements...
findstr /C:"'0.0.0.0'" backend\server.js >nul
if %errorlevel% == 0 (
    echo ✅ Server.js correctly updated
) else (
    echo ❌ Server.js NOT updated - files not replaced!
    echo    Please manually replace backend\server.js with new content
    pause
)

findstr /C:"getCurrentSeasonName" backend\sync-service.js >nul
if %errorlevel% == 0 (
    echo ✅ Sync-service.js correctly updated  
) else (
    echo ❌ Sync-service.js NOT updated - files not replaced!
    echo    Please manually replace backend\sync-service.js with new content
    pause
)

echo.
echo 4. Re-running sync service with new season filtering...
cd backend
echo Running season-aware sync...
node sync-service.js
cd..

echo.
echo 5. Starting services...
start start-climbing-club.bat
echo Waiting for services to start...
timeout /t 10 >nul

echo.
echo 6. Testing server binding...
netstat -ano | findstr :3001
echo.

echo 7. Testing health endpoint...
timeout /t 5 >nul
curl -s http://localhost:3001/api/health | findstr season
if %errorlevel% == 0 (
    echo ✅ Season info found in health endpoint
) else (
    echo ❌ No season info - server not correctly updated
)

echo.
echo ===============================================
echo          QUICK FIX COMPLETED
echo ===============================================
echo.
echo Next steps:
echo 1. Clear browser cache (Ctrl+Shift+Delete)
echo 2. Hard refresh tablet browser (Ctrl+F5)  
echo 3. Test tablet access: http://[PC-IP]:3000
echo 4. If still not working, run complete-diagnose.bat
echo.
pause