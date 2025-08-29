@echo off
title Create Desktop Shortcuts
color 09

echo.
echo     ======================================
echo       CREATE DESKTOP SHORTCUTS
echo     ======================================
echo.

set DESKTOP=%USERPROFILE%\Desktop
set CURRENT_DIR=%CD%

echo Creating desktop shortcuts...

REM Admin Interface Shortcut
echo Creating Admin Interface shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\Club Admin.lnk'); $Shortcut.TargetPath = 'http://localhost:3001/admin'; $Shortcut.Description = 'Club Administration Interface'; $Shortcut.Save()"

REM Tablet Interface Shortcut  
echo Creating Tablet Interface shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\Club Tablette.lnk'); $Shortcut.TargetPath = 'http://localhost:3000'; $Shortcut.Description = 'Club Tablet Interface'; $Shortcut.Save()"

REM Start Services Shortcut
echo Creating Start Services shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\Start Club Software.lnk'); $Shortcut.TargetPath = '%CURRENT_DIR%\start-climbing-club.bat'; $Shortcut.WorkingDirectory = '%CURRENT_DIR%'; $Shortcut.Description = 'Start Climbing Club Software'; $Shortcut.Save()"

REM Stop Services Shortcut
echo Creating Stop Services shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\Stop Club Software.lnk'); $Shortcut.TargetPath = '%CURRENT_DIR%\stop-climbing-club.bat'; $Shortcut.WorkingDirectory = '%CURRENT_DIR%'; $Shortcut.Description = 'Stop Climbing Club Software'; $Shortcut.Save()"

echo.
echo ✅ Desktop shortcuts created!
echo.
echo You now have these shortcuts on your desktop:
echo • Club Admin - Opens admin interface
echo • Club Tablette - Opens tablet interface  
echo • Start Club Software - Starts all services
echo • Stop Club Software - Stops all services
echo.
pause
