@echo off
echo =========================================
echo QUICK FIX - Climbing Club EXE Builder
echo =========================================

echo.
echo 1. Backup oude bestanden...
if exist ClimbingClubTray.csproj copy ClimbingClubTray.csproj ClimbingClubTray.csproj.backup
if exist ClimbingClubTray.cs copy ClimbingClubTray.cs ClimbingClubTray.cs.backup

echo.
echo 2. Vervang met gefixte bestanden...
copy ClimbingClubTray-FIXED.csproj ClimbingClubTray.csproj
copy ClimbingClubTray-FIXED.cs ClimbingClubTray.cs

echo.
echo 3. Build C# Tray Application...
dotnet build -c Release
if errorlevel 1 (
    echo ❌ Build gefaald
    pause
    exit /b 1
)

echo.
echo 4. Kopieer EXE naar root...
if exist "bin\Release\net6.0-windows\ClimbingClubTray.exe" (
    copy "bin\Release\net6.0-windows\ClimbingClubTray.exe" .
    echo ✅ ClimbingClubTray.exe ready!
) else (
    echo ❌ EXE niet gevonden in expected location
    dir "bin\Release\net6.0-windows\" /b
    pause
    exit /b 1
)

echo.
echo 5. Build NSIS Installer...
set NSIS_PATH=
if exist "C:\Program Files (x86)\NSIS\makensis.exe" (
    set NSIS_PATH=C:\Program Files ^(x86^)\NSIS\makensis.exe
)
if exist "C:\Program Files\NSIS\makensis.exe" (
    set NSIS_PATH=C:\Program Files\NSIS\makensis.exe
)

if "%NSIS_PATH%"=="" (
    echo ❌ NSIS niet gevonden, skip installer build
    echo Je hebt nu ClimbingClubTray.exe - dat is al bruikbaar!
    goto success
)

"%NSIS_PATH%" installer.nsi
if errorlevel 1 (
    echo ❌ NSIS build gefaald, maar EXE is wel klaar
    goto success
)

echo ✅ Installer created: ClimbingClubSoftware-Setup.exe

:success
echo.
echo =========================================
echo ✅ SUCCESS! 
echo =========================================
echo.
if exist ClimbingClubTray.exe (
    echo ✅ ClimbingClubTray.exe - Klaar voor gebruik
)
if exist ClimbingClubSoftware-Setup.exe (
    echo ✅ ClimbingClubSoftware-Setup.exe - Complete installer
)
echo.
echo Je kan nu ClimbingClubTray.exe testen door erop te dubbelklikken!
echo.
pause
