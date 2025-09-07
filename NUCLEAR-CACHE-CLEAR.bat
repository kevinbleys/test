@echo off
title NUCLEAR CACHE CLEAR - All Levels
color 0C

echo ================================================
echo    NUCLEAR CACHE CLEAR - ALL LEVELS
echo ================================================
echo.

echo This will clear ALL possible caches that could
echo be interfering with the localhost to tablet IP change.
echo.
pause

echo 1. Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.exe 2>nul
timeout /t 3 >nul

echo 2. Clearing npm cache...
npm cache clean --verify
npm cache clean --force

echo 3. Clearing React build cache...
rd /S /Q tablet-ui\build 2>nul
rd /S /Q tablet-ui\.cache 2>nul
rd /S /Q tablet-ui\node_modules\.cache 2>nul

echo 4. Clearing Webpack dev server cache...
rd /S /Q tablet-ui\.webpack 2>nul
rd /S /Q tablet-ui\webpack-cache 2>nul

echo 5. Clearing all temporary build files...
del /Q tablet-ui\*.log 2>nul
rd /S /Q tablet-ui\dist 2>nul

echo 6. Clearing environment-specific caches...
del /Q tablet-ui\.env.local 2>nul
del /Q tablet-ui\.env.development.local 2>nul

echo 7. Reinstalling dependencies (nuclear option)...
echo WARNING: This will take several minutes!
set /p "choice=Reinstall node_modules? (y/n): "
if /i "%choice%"=="y" (
    rd /S /Q tablet-ui\node_modules 2>nul
    cd tablet-ui
    npm install
    cd..
)

echo.
echo ================================================
echo     NUCLEAR CACHE CLEAR COMPLETE
echo ================================================
echo.
echo Next steps:
echo 1. Start backend: cd backend && node server.js
echo 2. Start frontend: cd tablet-ui && npm start
echo 3. Wait for complete build (may take longer than usual)
echo 4. Hard refresh browser: Ctrl+F5
echo 5. Check debug info on tablet
echo.
pause