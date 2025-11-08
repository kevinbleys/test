@echo off
REM Clean data folder on Windows (PowerShell compatible)
echo Cleaning data folder...

if exist "data\presence-history.json" del "data\presence-history.json"
if exist "data\presences.json" del "data\presences.json"
if exist "data\login-attempts.json" del "data\login-attempts.json"

echo Data folder cleaned!
echo.
echo Starting server...
npm start