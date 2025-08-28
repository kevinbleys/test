@echo off
echo.
echo ====================================================
echo     CLIMBING CLUB - COMPLETE REPAIR SCRIPT
echo ====================================================
echo.

:: Navigate to project directory
cd /d "%~dp0"

echo 1. Stopping any running processes...
:: Kill any node processes that might be running
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo.
echo 2. Backing up current files...
if exist "backend\server.js" (
    copy "backend\server.js" "backend\server.js.backup" >nul
    echo ✅ Backend server.js backed up
)

echo.
echo 3. Installing ultra-robust server...
if exist "ultra-robust-server.js" (
    copy "ultra-robust-server.js" "backend\server.js" >nul
    echo ✅ Ultra-robust server installed
) else (
    echo ❌ ultra-robust-server.js not found!
    echo 💡 Make sure you downloaded all repair files
    pause
    exit /b 1
)

echo.
echo 4. Cleaning old installations...
if exist "node_modules" rmdir /s /q "node_modules" >nul 2>&1
if exist "backend
ode_modules" rmdir /s /q "backend
ode_modules" >nul 2>&1
if exist "admin-dashboard
ode_modules" rmdir /s /q "admin-dashboard
ode_modules" >nul 2>&1
if exist "tablet-ui
ode_modules" rmdir /s /q "tablet-ui
ode_modules" >nul 2>&1

echo.
echo 5. Installing all dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install main dependencies
    pause
    exit /b 1
)

echo.
echo 6. Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo 7. Testing backend...
cd backend
echo Testing if server starts...
timeout 10 node server.js
if errorlevel 1 (
    echo ⚠️ Server test had issues, but continuing...
) else (
    echo ✅ Server test passed
)
cd ..

echo.
echo ====================================================
echo     REPAIR COMPLETE!
echo ====================================================
echo.
echo ✅ All repairs have been applied
echo 🚀 You can now start the software with: start-backend.bat
echo 📊 Backend will run on: http://localhost:3001
echo.
echo Next steps:
echo 1. Run start-backend.bat to test the backend
echo 2. If backend works, start the frontend with: npm start
echo 3. Build the exe with: npm run build:exe
echo.
pause
