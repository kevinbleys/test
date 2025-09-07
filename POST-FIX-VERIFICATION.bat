@echo off
title POST-FIX VERIFICATION - All Components
color 0B

echo ================================================
echo    POST-FIX VERIFICATION
echo ================================================
echo.

echo Verifying that ALL hardcoded localhost URLs are eliminated...
echo.

echo 1. Scanning for remaining hardcoded localhost in components...
echo.

echo MemberCheck.jsx:
findstr /C:"const API_BASE_URL = 'http://localhost:3001'" tablet-ui\src\components\MemberCheck.jsx >nul
if %errorlevel% == 0 (
    echo ❌ Still contains hardcoded localhost!
) else (
    echo ✅ No hardcoded localhost found
)

echo NonMemberForm.jsx:
findstr /C:"const API_BASE_URL = 'http://localhost:3001'" tablet-ui\src\components\NonMemberForm.jsx >nul
if %errorlevel% == 0 (
    echo ❌ Still contains hardcoded localhost!
) else (
    echo ✅ No hardcoded localhost found
)

echo PaymentPage.jsx:
findstr /C:"const API_BASE_URL = 'http://localhost:3001'" tablet-ui\src\components\PaymentPage.jsx >nul
if %errorlevel% == 0 (
    echo ❌ Still contains hardcoded localhost!
) else (
    echo ✅ No hardcoded localhost found
)

echo apiService.js:
findstr /C:"const API_BASE_URL = 'http://localhost:3001'" tablet-ui\src\services\apiService.js >nul
if %errorlevel% == 0 (
    echo ❌ Still contains hardcoded localhost!
) else (
    echo ✅ No hardcoded localhost found
)

echo.
echo 2. Checking for dynamic API detection functions...
echo.

echo Looking for getApiBaseUrl functions:
findstr /C:"getApiBaseUrl" tablet-ui\src\components\*.jsx tablet-ui\src\services\*.js 2>nul | find /C "getApiBaseUrl" >temp.txt
set /p count=<temp.txt
del temp.txt
echo Found %count% dynamic API detection functions

echo.
echo 3. Manual test checklist:
echo.
echo ON TABLET (http://192.168.1.239:3000):
echo [ ] Interface loads successfully
echo [ ] Debug panels show: API URL: http://192.168.1.239:3001
echo [ ] Debug panels show: Host: 192.168.1.239  
echo [ ] Member verification works (no network error)
echo [ ] Non-member registration works
echo [ ] Payment page loads and works
echo.
echo If ALL above items check ✅:
echo 🎉 COMPLETE SUCCESS - All hardcoded localhost eliminated!
echo.
echo If ANY item fails ❌:
echo 🔍 Check browser console for remaining JavaScript errors
echo.
pause