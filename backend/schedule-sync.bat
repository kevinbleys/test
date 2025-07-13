@echo off
cd /d "%~dp0"

echo [%date% %time%] Starting PEPsup synchronization...
echo [%date% %time%] Working directory: %CD%

REM Controleer of Node.js beschikbaar is
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [%date% %time%] ERROR: Node.js not found in PATH
    exit /b 1
)

REM Controleer of sync-service.js bestaat
if not exist "sync-service.js" (
    echo [%date% %time%] ERROR: sync-service.js not found in current directory
    exit /b 1
)

REM Voer de synchronisatie uit
node sync-service.js
set EXIT_CODE=%errorlevel%

if %EXIT_CODE% neq 0 (
    echo [%date% %time%] Synchronization failed with error code %EXIT_CODE%
    exit /b %EXIT_CODE%
) else (
    echo [%date% %time%] Synchronization completed successfully
)

exit /b 0
