@echo off
title DIAGNOSE - Server Configuration Check
color 0E

echo ================================================
echo    DIAGNOSE: SERVER CONFIGURATION CHECK
echo ================================================
echo.

echo Checking backend/server.js configuration...
echo.

REM Check if server listens on 0.0.0.0
echo 1. Checking server network binding...
findstr /C:"'0.0.0.0'" backend\server.js >nul
if %errorlevel% == 0 (
    echo ✅ Server configured to listen on 0.0.0.0 [CORRECT]
    findstr /C:"app.listen(PORT, '0.0.0.0'" backend\server.js
) else (
    echo ❌ Server still listening on localhost [PROBLEM FOUND!]
    findstr /C:"app.listen" backend\server.js
)
echo.

REM Check CORS configuration  
echo 2. Checking CORS configuration...
findstr /C:"192.168" backend\server.js >nul
if %errorlevel% == 0 (
    echo ✅ CORS includes tablet IP ranges [CORRECT]
) else (
    echo ❌ CORS missing tablet IP ranges [PROBLEM FOUND!]
)
echo.

REM Check season functions
echo 3. Checking season validation functions...
findstr /C:"getCurrentSeasonName" backend\server.js >nul
if %errorlevel% == 0 (
    echo ✅ Season validation functions present [CORRECT]
) else (
    echo ❌ Season validation functions missing [PROBLEM FOUND!]
)
echo.

REM Check current running processes
echo 4. Checking current server process...
netstat -ano | findstr :3001
echo.

echo 5. Checking file modification dates...
forfiles /p backend /m server.js /c "cmd /c echo Server.js: @fdate @ftime"
forfiles /p backend /m sync-service.js /c "cmd /c echo Sync-service.js: @fdate @ftime"
echo.

echo ================================================
echo Press any key to continue to next check...
pause >nul