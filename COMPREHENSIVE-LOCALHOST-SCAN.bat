@echo off
title COMPREHENSIVE LOCALHOST SCAN
color 0E

echo ================================================
echo    COMPREHENSIVE LOCALHOST HARDCODING SCAN
echo ================================================
echo.

echo Scanning ALL files for hardcoded localhost references...
echo.

echo 1. Scanning tablet-ui JavaScript files...
findstr /S /N /C:"localhost" tablet-ui\src\*.js tablet-ui\src\*.jsx 2>nul
findstr /S /N /C:"localhost" tablet-ui\src\components\*.js tablet-ui\src\components\*.jsx 2>nul
findstr /S /N /C:"localhost" tablet-ui\src\utils\*.js 2>nul
echo.

echo 2. Scanning for API_BASE_URL or similar constants...
findstr /S /N /C:"API_BASE_URL" tablet-ui\src\*.js tablet-ui\src\*.jsx 2>nul
findstr /S /N /C:"API_URL" tablet-ui\src\*.js tablet-ui\src\*.jsx 2>nul
findstr /S /N /C:"baseURL" tablet-ui\src\*.js tablet-ui\src\*.jsx 2>nul
echo.

echo 3. Scanning package.json for proxy configuration...
findstr /N /C:"proxy" tablet-ui\package.json 2>nul
echo.

echo 4. Scanning for webpack or development configuration...
dir tablet-ui\webpack*.* 2>nul
dir tablet-ui\*.config.js 2>nul
echo.

echo 5. Scanning environment files...
dir tablet-ui\.env* 2>nul
type tablet-ui\.env 2>nul
type tablet-ui\.env.local 2>nul
echo.

echo 6. Checking for service worker...
dir tablet-ui\public\sw.js 2>nul
dir tablet-ui\src\sw.js 2>nul
findstr /S /N /C:"localhost" tablet-ui\public\*.js 2>nul
echo.

echo 7. Scanning ALL build-related files...
findstr /S /N /C:"localhost" tablet-ui\build\*.js 2>nul
echo.

echo 8. Checking axios default configuration...
findstr /S /N /C:"axios.defaults" tablet-ui\src\*.js tablet-ui\src\*.jsx 2>nul
findstr /S /N /C:"baseURL" tablet-ui\src\*.js tablet-ui\src\*.jsx 2>nul
echo.

echo ================================================
echo    SCAN COMPLETE
echo ================================================
echo.
echo Look for ANY line that contains hardcoded localhost!
echo Common culprits:
echo - axios.defaults.baseURL = "http://localhost:3001"
echo - const API_URL = "http://localhost:3001"
echo - "proxy": "http://localhost:3001" in package.json
echo - .env files with REACT_APP_API_URL=localhost
echo.
pause