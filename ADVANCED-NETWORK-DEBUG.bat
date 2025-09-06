@echo off
title ADVANCED NETWORK TROUBLESHOOTING
color 0E

echo ================================================
echo    ADVANCED NETWORK TROUBLESHOOTING
echo ================================================
echo.

echo 1. Testing detailed network connectivity...
echo.

REM Get PC IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do set PCIP=%%a
set PCIP=%PCIP: =%
echo PC IP Address: %PCIP%
echo.

REM Test different network scenarios
echo 2. Testing PC to PC network access...
curl -m 5 -s http://%PCIP%:3001/api/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ PC can reach itself via network IP
) else (
    echo ❌ PC CANNOT reach itself via network IP [MAJOR ISSUE]
    echo    This indicates network/routing problems
)
echo.

echo 3. Testing PC to PC with detailed output...
curl -v http://%PCIP%:3001/api/health
echo.

echo 4. Testing port accessibility with telnet...
echo Testing if ports are actually reachable...
(echo quit) | telnet %PCIP% 3000 2>nul
if %errorlevel% == 0 (
    echo ✅ Port 3000 is reachable
) else (
    echo ❌ Port 3000 NOT reachable - deeper network issue
)

(echo quit) | telnet %PCIP% 3001 2>nul  
if %errorlevel% == 0 (
    echo ✅ Port 3001 is reachable
) else (
    echo ❌ Port 3001 NOT reachable - deeper network issue
)
echo.

echo 5. Checking for multiple firewalls...
echo Windows Defender Firewall:
netsh advfirewall show allprofiles state
echo.

echo Third-party security software check...
wmic product where "name like '%%Antivirus%%' or name like '%%Security%%' or name like '%%Firewall%%'" get name,version 2>nul
echo.

echo 6. Network adapter configuration...
ipconfig /all | findstr /C:"Ethernet" /C:"WiFi" /C:"IPv4" /C:"Subnet"
echo.

echo 7. Routing table check...
route print | findstr 0.0.0.0
echo.

echo 8. Testing alternative ports...
echo If standard ports blocked, testing alternatives...
netstat -ano | findstr :8080
netstat -ano | findstr :8000
netstat -ano | findstr :9000

echo.
echo ================================================
echo    NETWORK TROUBLESHOOTING COMPLETE
echo ================================================
echo.
echo RESULTS ANALYSIS:
echo - If PC cannot reach itself via network IP = Network interface issue
echo - If telnet fails = Port blocking at network level  
echo - If antivirus found = May have separate firewall
echo - If routing issues = Network configuration problem
echo.
pause