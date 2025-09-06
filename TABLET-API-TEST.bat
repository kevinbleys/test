@echo off
title TABLET API CONNECTION TEST
color 0A

echo ================================================
echo    TABLET API CONNECTION TEST
echo ================================================
echo.

REM Get PC IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do set PCIP=%%a
set PCIP=%PCIP: =%
echo PC IP Address: %PCIP%
echo.

echo 1. Testing local API (should work)...
curl -v -m 10 "http://localhost:3001/api/health"
echo.

echo 2. Testing network API (tablet access)...
curl -v -m 10 "http://%PCIP%:3001/api/health"
echo.

echo 3. Testing CORS preflight...
curl -v -X OPTIONS -H "Origin: http://%PCIP%:3000" -H "Access-Control-Request-Method: GET" "http://%PCIP%:3001/api/health"
echo.

echo 4. Testing member check API...
curl -v -m 10 "http://%PCIP%:3001/members/check?nom=Test&prenom=User"
echo.

echo ================================================
echo If network API fails but local works:
echo 1. Check Windows Firewall (should be OFF)
echo 2. Check antivirus firewall
echo 3. Try PC mobile hotspot
echo 4. Check router AP isolation
echo.
echo If all fail:
echo - Router may block device-to-device communication
echo - Try different network (mobile hotspot)
echo ================================================
pause