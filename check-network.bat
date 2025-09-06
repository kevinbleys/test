@echo off
title DIAGNOSE - Network Configuration Check
color 0D

echo ================================================
echo    DIAGNOSE: NETWORK CONFIGURATION CHECK
echo ================================================  
echo.

echo Checking network binding and accessibility...
echo.

echo 1. Current server binding status:
netstat -ano | findstr :3000
netstat -ano | findstr :3001
echo.

echo 2. Testing PC network access...
echo Trying to connect to own network IP...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do set IP=%%a
set IP=%IP: =%
echo PC IP Address: %IP%

echo Testing network connection to self...
ping -n 1 %IP% >nul
if %errorlevel% == 0 (
    echo ✅ PC network ping successful
) else (
    echo ❌ PC network ping failed [NETWORK ISSUE]
)

echo.
echo 3. Testing HTTP endpoints...
echo Testing localhost:3001/api/health...
curl -s http://localhost:3001/api/health > temp_health.json 2>nul
if %errorlevel% == 0 (
    echo ✅ Local API endpoint accessible
    type temp_health.json
    del temp_health.json
) else (
    echo ❌ Local API endpoint not accessible [SERVICE ISSUE]
)

echo.
echo 4. Windows Firewall Status...
netsh advfirewall show allprofiles state
echo.

echo 5. Firewall Rules for Climbing Club...
netsh advfirewall firewall show rule name="Climbing Club Port 3000" >nul 2>nul
if %errorlevel% == 0 (
    echo ✅ Port 3000 firewall rule exists
) else (
    echo ❌ Port 3000 firewall rule missing
)

netsh advfirewall firewall show rule name="Climbing Club Port 3001" >nul 2>nul  
if %errorlevel% == 0 (
    echo ✅ Port 3001 firewall rule exists
) else (
    echo ❌ Port 3001 firewall rule missing
)
echo.

echo ================================================
echo DIAGNOSE COMPLETE - Review results above
echo ================================================
pause