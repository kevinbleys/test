@echo off
title SEASON FILTERING DEBUG
color 0B

echo ================================================
echo    SEASON FILTERING DEBUG
echo ================================================
echo.

echo Testing specific member scenarios...
echo.

echo 1. Testing Anna Verdoux (should be REJECTED - old season)...
curl -s "http://localhost:3001/members/check?nom=Verdoux&prenom=Anna" | findstr success
if %errorlevel% == 0 (
    echo ❌ Anna Verdoux ACCEPTED - Season filtering BROKEN!
    echo Full response:
    curl -s "http://localhost:3001/members/check?nom=Verdoux&prenom=Anna"
) else (
    echo ✅ Anna Verdoux correctly rejected
)
echo.

echo 2. Testing Isaure Clarens (current season, not paid - may be correct)...
curl -s "http://localhost:3001/members/check?nom=Clarens&prenom=Isaure" | findstr success  
if %errorlevel% == 0 (
    echo ⚠️ Isaure Clarens ACCEPTED - Check if this is correct
    echo Full response:
    curl -s "http://localhost:3001/members/check?nom=Clarens&prenom=Isaure"
) else (
    echo ❌ Isaure Clarens rejected - May need to check categories
)
echo.

echo 3. Checking current season configuration...
curl -s http://localhost:3001/api/health | findstr season
echo.

echo 4. Checking members.json for season info...
type backend\data\members.json | findstr "season" | head -5
echo.

echo 5. Checking sync service season filtering...
findstr /C:"isInCurrentSeason" backend\sync-service.js >nul
if %errorlevel% == 0 (
    echo ✅ Season filtering functions found in sync-service
) else (
    echo ❌ Season filtering functions MISSING from sync-service
)

findstr /C:"getCurrentSeasonName" backend\server.js >nul  
if %errorlevel% == 0 (
    echo ✅ Season functions found in server.js
) else (
    echo ❌ Season functions MISSING from server.js  
)
echo.

echo 6. Manual season check for current date...
echo Current date: %DATE%
echo Expected season for September 2025: 2025-2026
echo.

echo 7. Testing with manual member check...
echo Testing member categories structure...
type backend\data\members.json | findstr /C:"lastname.*Verdoux" -A 10 -B 2 2>nul
echo.

echo ================================================
echo    SEASON DEBUG COMPLETE
echo ================================================
echo.
echo IF ANNA VERDOUX WAS ACCEPTED:
echo   1. Season filtering is not working
echo   2. Need to check sync-service.js implementation  
echo   3. Need to re-run sync with correct filtering
echo.
echo IF ISAURE CLARENS WAS ACCEPTED:
echo   1. May be correct if registered for current season
echo   2. Check PepsUp categories for "not paid" vs "registered"
echo.
pause