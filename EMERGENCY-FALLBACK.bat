@echo off
title EMERGENCY FALLBACK - All Solutions
color 0C

echo ================================================
echo    EMERGENCY FALLBACK - ALL SOLUTIONS
echo ================================================
echo.

echo This script tries EVERY possible solution
echo when normal fixes don't work.
echo.
pause

echo.
echo 1. COMPLETE SERVICE RESTART...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.exe 2>nul  
timeout /t 3 >nul
start-climbing-club.bat
echo Waiting for services to start...
timeout /t 15 >nul

echo.
echo 2. TESTING BASIC CONNECTIVITY...
curl -m 5 http://localhost:3001/api/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Local API works
) else (
    echo ❌ Local API broken - service issue!
    goto :SERVICE_ISSUE
)

echo.  
echo 3. TESTING NETWORK BINDING...
netstat -ano | findstr :3001 | findstr 0.0.0.0
if %errorlevel% == 0 (
    echo ✅ Server listens on network
) else (
    echo ❌ Server not listening on network!
    goto :CONFIG_ISSUE
)

echo.
echo 4. TESTING SEASON FILTERING...
curl -s "http://localhost:3001/members/check?nom=Verdoux&prenom=Anna" | findstr "success.*true" >nul
if %errorlevel% == 0 (
    echo ❌ Season filtering BROKEN - Anna Verdoux accepted!
    goto :SEASON_ISSUE
) else (
    echo ✅ Season filtering works
)

echo.
echo 5. TESTING SELF NETWORK ACCESS...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do set IP=%%a
set IP=%IP: =%
curl -m 10 http://%IP%:3001/api/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Self network access works
    goto :SUCCESS_PATH
) else (
    echo ❌ Self network access FAILS - router/network issue!
    goto :NETWORK_ISSUE
)

:SERVICE_ISSUE
echo.
echo === SERVICE ISSUE DETECTED ===
echo 1. Check if ports already in use
echo 2. Restart computer
echo 3. Check antivirus blocking Node.js
goto :END

:CONFIG_ISSUE  
echo.
echo === CONFIGURATION ISSUE DETECTED ===
echo 1. Server.js not correctly replaced
echo 2. Re-replace backend/server.js with correct content
echo 3. Ensure app.listen(PORT, '0.0.0.0') is present
goto :END

:SEASON_ISSUE
echo.
echo === SEASON FILTERING ISSUE DETECTED ===  
echo 1. Season filtering not working
echo 2. Need to fix server.js member check function
echo 3. Apply SEASON-FILTERING-FIX.md
goto :END

:NETWORK_ISSUE
echo.
echo === NETWORK/ROUTER ISSUE DETECTED ===
echo 1. TP-Link MR6400 AP Isolation enabled
echo 2. Follow TP-LINK-ROUTER-FIX.md
echo 3. Or try PC hotspot as alternative
goto :END

:SUCCESS_PATH
echo.
echo === BASIC FUNCTIONALITY WORKS ===
echo Server and network OK, issue may be:
echo 1. Tablet-specific browser issues
echo 2. WiFi band differences (2.4GHz vs 5GHz)  
echo 3. Tablet firewall/security apps
echo 4. Try different tablet browser
goto :END

:END
echo.
echo ================================================
echo    EMERGENCY DIAGNOSTICS COMPLETE
echo ================================================
pause