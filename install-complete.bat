@echo off
title Climbing Club Software - Complete Installer
color 0B

echo.
echo     ==========================================
echo       CLIMBING CLUB SOFTWARE - INSTALLER
echo     ==========================================
echo.

set CURRENT_DIR=%CD%

echo Installing Climbing Club Software...
echo.

echo 1. Installing desktop shortcuts...
call create-desktop-shortcuts.bat

echo.
echo 2. Installing auto-startup...
call install-auto-startup.bat

echo.
echo 3. Testing services...
echo Starting services for test...
call start-climbing-club.bat

echo.
echo Waiting 10 seconds for services to start...
timeout /t 10 /nobreak

echo.
echo 4. Opening control panel...
start "Control Panel" control-panel.html

echo.
echo ==========================================
echo   INSTALLATION COMPLETE!
echo ==========================================
echo.
echo Your Climbing Club software is now installed with:
echo.
echo ✅ Auto-startup (starts with Windows)
echo ✅ Desktop shortcuts
echo ✅ Control panel interface
echo ✅ Admin interface: http://localhost:3001/admin
echo ✅ Tablet interface: http://localhost:3000
echo.
echo The software will start automatically when you boot Windows.
echo.
echo Manual controls:
echo • Start: Double-click "Start Club Software" on desktop
echo • Stop: Double-click "Stop Club Software" on desktop  
echo • Admin: Double-click "Club Admin" on desktop
echo • Tablet: Double-click "Club Tablette" on desktop
echo.
pause
