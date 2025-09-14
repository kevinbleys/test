@echo off
title JSON SETUP VERIFICATION
color 0E

echo ================================================
echo    JSON SETUP VERIFICATION
echo    Test jouw JSON-based enhanced features
echo ================================================
echo.

echo Dit script test of de JSON-based setup correct werkt
echo.

echo 🔍 STEP 1: File Structure Check
echo ================================
echo.

if exist "backend\enhanced-data-manager.js" (
    echo ✅ enhanced-data-manager.js exists
) else (
    echo ❌ enhanced-data-manager.js missing
    echo    Copy from generated file to backend\ folder
)

if exist "backend\server.js" (
    echo ✅ server.js exists

    findstr "enhanced-data-manager" backend\server.js >nul
    if %errorlevel% == 0 (
        echo ✅ server.js contains enhanced-data-manager import
    ) else (
        echo ❌ server.js missing enhanced-data-manager import
        echo    Add: const dataManager = require('./enhanced-data-manager');
    )
) else (
    echo ❌ server.js not found
)

if exist "backend\data" (
    echo ✅ backend\data folder exists
) else (
    echo ⚠️ backend\data folder missing (will be auto-created)
)

echo.
echo 🔍 STEP 2: Dependencies Check
echo =============================
echo.

cd backend
echo Checking for uuid package...
npm list uuid >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ uuid package installed
) else (
    echo ❌ uuid package missing
    echo    Run: npm install uuid
)

echo.
echo 🔍 STEP 3: Backend Server Test
echo ==============================
echo.

echo Testing backend startup...
start /min cmd /c "npm start"
echo ⏳ Waiting for server to start...
timeout /t 5 >nul

echo Testing API endpoints...
curl -s http://localhost:3001/export/access-attempts >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Export endpoint accessible
) else (
    echo ❌ Export endpoint not accessible
    echo    Check if backend is running on port 3001
)

cd..

echo.
echo 🔍 STEP 4: Data Files Check
echo ===========================
echo.

if exist "backend\data\access-attempts.json" (
    echo ✅ access-attempts.json created
    for %%f in ("backend\data\access-attempts.json") do (
        echo    Size: %%~zf bytes
    )
) else (
    echo ⚠️ access-attempts.json not yet created (created on first use)
)

if exist "backend\data\returning-visitors.json" (
    echo ✅ returning-visitors.json created
) else (
    echo ⚠️ returning-visitors.json not yet created (created on first use)
)

if exist "backend\data\members.json" (
    echo ✅ members.json exists (from PEPsup sync)
    for %%f in ("backend\data\members.json") do (
        echo    Last modified: %%~tf
    )
) else (
    echo ❌ members.json missing
    echo    Run PEPsup sync first
)

echo.
echo ================================================
echo    VERIFICATION COMPLETE
echo ================================================
echo.

echo SUMMARY:
echo --------
if exist "backend\enhanced-data-manager.js" (
    if exist "backend\server.js" (
        echo ✅ Core files present
    ) else (
        echo ❌ Missing server.js
    )
) else (
    echo ❌ Missing enhanced-data-manager.js
)

echo.
echo NEXT STEPS:
echo -----------
echo 1. If ❌ errors above: Fix missing files/packages
echo 2. Restart backend: npm start (in backend folder)
echo 3. Test member login failure on tablet
echo 4. Check backend\data\access-attempts.json file
echo 5. Visit: http://localhost:3001/export/access-attempts
echo.

echo 📊 EXPECTED BEHAVIOR:
echo ---------------------
echo • Wrong member login → Creates access-attempts.json entry
echo • Non-member registration → Auto-saved to returning-visitors.json
echo • Excel export works via backend admin interface
echo.

echo 🎉 Your JSON-based enhanced features should now be working!
echo.
pause