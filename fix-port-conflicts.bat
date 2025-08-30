@echo off
title Fix Port Conflicts - Climbing Club Software
color 0C

echo.
echo ===============================================
echo       FIX PORT CONFLICTS - KILL PROCESSES
echo ===============================================
echo.

echo 1. Checking current port usage...
echo.
echo Processes using port 3001 (Backend):
netstat -ano | findstr :3001
echo.
echo Processes using port 3000 (Frontend):  
netstat -ano | findstr :3000
echo.

echo 2. Killing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if errorlevel 1 (
    echo No Node.js processes found
) else (
    echo ✅ Node.js processes killed
)

echo.
echo 3. Force kill processes on specific ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    if "%%a" NEQ "" (
        echo Killing process %%a on port 3001
        taskkill /F /PID %%a >nul 2>&1
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if "%%a" NEQ "" (
        echo Killing process %%a on port 3000  
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo 4. Waiting for ports to be released...
timeout /t 5 /nobreak >nul

echo.
echo 5. Final port check...
netstat -ano | findstr :3001
if errorlevel 1 (
    echo ✅ Port 3001 is now free
) else (
    echo ❌ Port 3001 still in use
)

netstat -ano | findstr :3000  
if errorlevel 1 (
    echo ✅ Port 3000 is now free
) else (
    echo ❌ Port 3000 still in use
)

echo.
echo ===============================================
echo PORT CLEANUP COMPLETED
echo ===============================================
echo.
echo You can now start the services with:
echo   start-climbing-club.bat
echo.
pause
