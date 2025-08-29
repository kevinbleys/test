@echo off
title Install Climbing Club Auto-Startup
color 0B

echo.
echo     ======================================
echo       INSTALL AUTO-STARTUP SHORTCUT
echo     ======================================
echo.

set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set CURRENT_DIR=%CD%

echo Installing auto-startup shortcut...
echo.
echo Startup folder: %STARTUP_FOLDER%
echo Current directory: %CURRENT_DIR%

REM Create shortcut in startup folder
echo Creating shortcut to launcher...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTUP_FOLDER%\Climbing Club Software.lnk'); $Shortcut.TargetPath = '%CURRENT_DIR%\start-climbing-club.bat'; $Shortcut.WorkingDirectory = '%CURRENT_DIR%'; $Shortcut.Description = 'Climbing Club Management Software'; $Shortcut.Save()"

if errorlevel 0 (
    echo ✅ Auto-startup installed successfully!
    echo.
    echo The software will now start automatically when Windows boots.
    echo.
    echo To remove auto-startup: delete this file:
    echo %STARTUP_FOLDER%\Climbing Club Software.lnk
) else (
    echo ❌ Failed to create startup shortcut
)

echo.
pause
