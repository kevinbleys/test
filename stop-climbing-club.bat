@echo off
title Stop Climbing Club Services
color 0C

echo.
echo     ======================================
echo       STOP CLIMBING CLUB SERVICES
echo     ======================================
echo.

echo Stopping all Climbing Club services...

REM Kill Node.js processes (our servers)
echo Stopping Node.js servers...
taskkill /F /IM node.exe >nul 2>&1

REM Kill Chrome/Browser windows (optional)
echo Closing browser windows...
taskkill /F /IM chrome.exe >nul 2>&1
taskkill /F /IM msedge.exe >nul 2>&1
taskkill /F /IM firefox.exe >nul 2>&1

echo.
echo ✅ All services stopped
echo.
pause
