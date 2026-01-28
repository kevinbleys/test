@echo off
setlocal enabledelayedexpansion

cd /d %~dp0

echo.
echo ==========================================
echo   🔄 PRESENCE-HISTORY MIGRATION TOOL
echo ==========================================
echo.
echo This tool converts presence-history.json between different formats
echo

REM Check if node is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ ERROR: Node.js is not installed
    echo Please download from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if migrate script exists
if not exist migrate-data.js (
    echo ❌ ERROR: migrate-data.js not found in backend folder
    echo.
    pause
    exit /b 1
)

echo 🔍 Checking data/presence-history.json...

if not exist data\presence-history.json (
    echo ❌ ERROR: data\presence-history.json not found
    echo Please ensure you have presence-history.json in the data folder
    echo.
    pause
    exit /b 1
)

echo.
echo ℹ️ What would you like to do?
echo.
echo 1. Analyze current format
echo 2. Convert to standard format
echo 3. Backup and repair corrupted file
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo 🔍 Analyzing presence-history.json...
    call node migrate-data.js analyze
) else if "%choice%"=="2" (
    echo.
    echo 🔄 Converting to standard format...
    echo ⚠️ A backup will be created automatically
    call node migrate-data.js convert
) else if "%choice%"=="3" (
    echo.
    echo 🔧 Attempting repair of corrupted file...
    echo ⚠️ A backup will be created automatically
    call node migrate-data.js repair
) else (
    echo ❌ Invalid choice
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   ✅ Migration complete!
echo ==========================================
echo.
pause