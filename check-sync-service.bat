@echo off
title DIAGNOSE - Sync Service Check
color 0B

echo ================================================  
echo    DIAGNOSE: SYNC SERVICE CONFIGURATION
echo ================================================
echo.

echo Checking backend/sync-service.js...
echo.

REM Check for season filtering functions
echo 1. Checking season filtering functions...
findstr /C:"getCurrentSeasonName" backend\sync-service.js >nul
if %errorlevel% == 0 (
    echo ✅ Season filtering functions present [CORRECT]
) else (
    echo ❌ Season filtering functions missing [PROBLEM FOUND!]
    echo    File was not updated correctly!
)
echo.

echo 2. Checking members.json structure...
if exist backend\data\members.json (
    echo ✅ Members.json exists
    echo Checking structure...
    findstr /C:"season" backend\data\members.json >nul
    if %errorlevel% == 0 (
        echo ✅ Season info found in members.json [CORRECT]
        findstr /C:""season":" backend\data\members.json
    ) else (
        echo ❌ No season info in members.json [OLD FORMAT]
        echo    Need to re-run sync service!
    )
) else (
    echo ❌ Members.json missing
)
echo.

echo 3. Testing sync service manually...
echo Running sync service to check output...
cd backend
node sync-service.js
cd..
echo.

echo ================================================
echo Press any key to continue to next check...
pause >nul