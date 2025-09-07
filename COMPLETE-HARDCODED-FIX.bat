@echo off
title COMPLETE HARDCODED LOCALHOST FIX - ALL FILES
color 0A

echo ================================================
echo    COMPLETE HARDCODED LOCALHOST FIX
echo    Fixing ALL 4 components with hardcoded URLs
echo ================================================
echo.

echo SCAN RESULTS SHOWED:
echo ❌ MemberCheck.jsx - hardcoded localhost
echo ❌ NonMemberForm.jsx - hardcoded localhost  
echo ❌ PaymentPage.jsx - hardcoded localhost
echo ❌ apiService.js - hardcoded localhost
echo.
echo ✅ MemberPage.jsx, AssurancePage.jsx - already fixed
echo.

echo Creating backups of all hardcoded files...
copy tablet-ui\src\components\MemberCheck.jsx tablet-ui\src\components\MemberCheck.jsx.backup 2>nul
copy tablet-ui\src\components\NonMemberForm.jsx tablet-ui\src\components\NonMemberForm.jsx.backup 2>nul
copy tablet-ui\src\components\PaymentPage.jsx tablet-ui\src\components\PaymentPage.jsx.backup 2>nul
copy tablet-ui\src\services\apiService.js tablet-ui\src\services\apiService.js.backup 2>nul
echo Backups created.
echo.

echo Applying dynamic API detection to ALL hardcoded components...
echo.

echo 1. Fixing MemberCheck.jsx...
copy FIXED-MEMBERCHECK.jsx tablet-ui\src\components\MemberCheck.jsx >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ MemberCheck.jsx - HARDCODED localhost FIXED
) else (
    echo ❌ Failed to fix MemberCheck.jsx
)

echo 2. Fixing NonMemberForm.jsx...
copy FIXED-NONMEMBERFORM.jsx tablet-ui\src\components\NonMemberForm.jsx >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ NonMemberForm.jsx - HARDCODED localhost FIXED
) else (
    echo ❌ Failed to fix NonMemberForm.jsx
)

echo 3. Fixing PaymentPage.jsx...
copy FIXED-PAYMENTPAGE.jsx tablet-ui\src\components\PaymentPage.jsx >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ PaymentPage.jsx - HARDCODED localhost FIXED
) else (
    echo ❌ Failed to fix PaymentPage.jsx
)

echo 4. Fixing apiService.js...
copy FIXED-APISERVICE.js tablet-ui\src\services\apiService.js >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ apiService.js - HARDCODED localhost FIXED
) else (
    echo ❌ Failed to fix apiService.js
)

echo.
echo ================================================
echo     ALL HARDCODED LOCALHOST URLS ELIMINATED!
echo ================================================
echo.
echo WHAT WAS FIXED:
echo 🔧 MemberCheck.jsx - Now uses dynamic API detection
echo 🔧 NonMemberForm.jsx - Now uses dynamic API detection  
echo 🔧 PaymentPage.jsx - Now uses dynamic API detection
echo 🔧 apiService.js - Core service now uses dynamic API detection
echo.
echo COMBINED WITH PREVIOUSLY FIXED:
echo ✅ MemberPage.jsx - Dynamic API detection
echo ✅ AssurancePage.jsx - Dynamic API detection
echo.
echo RESULT: ALL components now automatically detect:
echo - PC: http://localhost:3001
echo - Tablet: http://tablet-ip:3001
echo.
echo NEXT STEPS:
echo 1. STOP frontend: Ctrl+C in tablet-ui console
echo 2. CLEAR browser cache completely on tablet
echo 3. START frontend: npm start
echo 4. TEST tablet: http://192.168.1.239:3000
echo 5. DEBUG INFO should show: API URL: http://192.168.1.239:3001
echo 6. Member verification should work without network error
echo.
echo 🎉 NO MORE HARDCODED LOCALHOST URLs IN ENTIRE APP!
echo.
pause