@echo off
title FILE REPLACEMENT VERIFICATION
color 0D

echo ================================================
echo    FILE REPLACEMENT VERIFICATION
echo ================================================
echo.

echo Checking if files were correctly replaced...
echo.

echo 1. Checking MemberPage.jsx for dynamic API function...
findstr /C:"getApiBaseUrl" tablet-ui\src\components\MemberPage.jsx >nul
if %errorlevel% == 0 (
    echo ✅ MemberPage.jsx contains getApiBaseUrl function
    findstr /C:"getApiBaseUrl" tablet-ui\src\components\MemberPage.jsx
) else (
    echo ❌ MemberPage.jsx MISSING getApiBaseUrl function - FILE NOT REPLACED!
)
echo.

echo 2. Checking AssurancePage.jsx for dynamic API function...
findstr /C:"getApiBaseUrl" tablet-ui\src\components\AssurancePage.jsx >nul
if %errorlevel% == 0 (
    echo ✅ AssurancePage.jsx contains getApiBaseUrl function
    findstr /C:"getApiBaseUrl" tablet-ui\src\components\AssurancePage.jsx
) else (
    echo ❌ AssurancePage.jsx MISSING getApiBaseUrl function - FILE NOT REPLACED!
)
echo.

echo 3. Checking server.js for comprehensive CORS...
findstr /C:"COMPREHENSIVE" backend\server.js >nul
if %errorlevel% == 0 (
    echo ✅ Server.js contains COMPREHENSIVE_TABLET_SUPPORT
) else (
    echo ❌ Server.js MISSING comprehensive CORS - FILE NOT REPLACED!
)
echo.

echo 4. Checking server.js for wildcard CORS origin...
findstr /C:"'*'" backend\server.js >nul
if %errorlevel% == 0 (
    echo ✅ Server.js contains wildcard CORS origin
) else (
    echo ❌ Server.js MISSING wildcard origin - CORS may be incomplete!
)
echo.

echo 5. File modification times...
forfiles /p tablet-ui\src\components /m MemberPage.jsx /c "cmd /c echo MemberPage.jsx: @fdate @ftime" 2>nul
forfiles /p tablet-ui\src\components /m AssurancePage.jsx /c "cmd /c echo AssurancePage.jsx: @fdate @ftime" 2>nul
forfiles /p backend /m server.js /c "cmd /c echo Server.js: @fdate @ftime" 2>nul

echo.
echo ================================================
echo    VERIFICATION SUMMARY
echo ================================================
echo.
echo If ANY file shows ❌ MISSING:
echo   1. That file was NOT correctly replaced
echo   2. Re-replace the file with correct content
echo   3. Restart the corresponding service
echo.
echo If ALL files show ✅:
echo   1. Files are correctly replaced
echo   2. Issue is likely browser cache or network layer
echo   3. Focus on tablet browser debugging
echo.
pause