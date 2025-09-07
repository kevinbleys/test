@echo off
title WEBPACK DEV SERVER PROXY CHECK
color 0B

echo ================================================
echo    WEBPACK DEV SERVER PROXY CONFIGURATION
echo ================================================
echo.

echo Checking for automatic localhost proxying...
echo.

echo 1. Checking package.json for proxy field...
type tablet-ui\package.json | findstr /C:"proxy"
echo.

echo 2. Checking for webpack configuration files...
dir tablet-ui\webpack*.js 2>nul
dir tablet-ui\webpack*.config.js 2>nul
echo.

echo 3. Checking for Create React App setupProxy.js...
type tablet-ui\src\setupProxy.js 2>nul
echo.

echo 4. Checking React scripts configuration...
npm list react-scripts 2>nul
echo.

echo 5. Checking development server configuration...
type tablet-ui\public\manifest.json | findstr localhost 2>nul
echo.

echo 6. Environment variables check...
echo Current NODE_ENV: %NODE_ENV%
echo Current REACT_APP_API_URL: %REACT_APP_API_URL%
echo.

echo 7. Checking for hardcoded development URLs...
findstr /S /C:"3001" tablet-ui\src\*.js tablet-ui\src\*.jsx 2>nul
echo.

echo ================================================
echo If you see "proxy": "http://localhost:3001" in
echo package.json, this OVERRIDES all frontend API calls!
echo.
echo Solution: Remove or modify proxy configuration
echo ================================================
pause