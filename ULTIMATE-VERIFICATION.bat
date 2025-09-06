@echo off
title ULTIMATE FIX VERIFICATION
color 0A

echo ================================================
echo    ULTIMATE FIX VERIFICATION
echo ================================================
echo.

echo This script verifies that the ultimate fix is working
echo properly on both PC and tablet.
echo.

REM Get PC IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do set PCIP=%%a
set PCIP=%PCIP: =%
echo PC Network IP: %PCIP%
echo.

echo 1. Testing server CORS configuration...
curl -v -X OPTIONS -H "Origin: http://%PCIP%:3000" -H "Access-Control-Request-Method: GET" "http://%PCIP%:3001/api/health" 2>&1 | findstr "Access-Control-Allow-Origin"
echo.

echo 2. Testing member check from network IP...
curl -s "http://%PCIP%:3001/members/check?nom=Test&prenom=User" | findstr "success"
echo.

echo 3. Testing comprehensive CORS headers...
curl -s -I "http://%PCIP%:3001/api/health" | findstr "Access-Control"
echo.

echo 4. Checking server console for CORS mode...
echo Look for: "COMPREHENSIVE_TABLET_SUPPORT" in server console
echo.

echo 5. Tablet verification checklist:
echo.
echo ON TABLET - Check these items:
echo [ ] Interface loads: http://%PCIP%:3000
echo [ ] Debug info shows: "API URL: http://%PCIP%:3001"
echo [ ] Debug info shows: "Host: %PCIP%"
echo [ ] Debug info shows: "Ultimate tablet support"
echo [ ] Member verification works (no network error)
echo [ ] Non-member registration works (no "impossible de verifier")
echo [ ] Payment blocking works ("à payer" rejected)
echo.

echo ================================================
echo If ALL items check ✅, the fix is successful!
echo If ANY item fails ❌, review file replacements.
echo ================================================
pause