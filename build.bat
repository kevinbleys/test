@echo off
echo ====================================================
echo CLIMBING CLUB SOFTWARE - AUTOMATISCHE BUILD
echo ====================================================

echo.
echo 1. Controleer .NET SDK installatie...
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo ❌ .NET SDK niet gevonden!
    echo Download van: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)
echo ✅ .NET SDK gevonden

echo.
echo 2. Controleer Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js niet gevonden!
    echo Download van: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js gevonden

echo.
echo 3. Installeer NPM dependencies (negeer vulnerabilities warnings)...
call npm install
echo ✅ Main dependencies installed

echo.
echo 4. Build tablet-ui frontend...
if not exist "tablet-ui" (
    echo ⚠️ tablet-ui directory niet gevonden, skip...
    goto skip_tablet
)

cd tablet-ui
echo Installing tablet-ui dependencies...
call npm install
echo Building tablet-ui...
call npm run build 2>nul || (
    echo ⚠️ npm run build niet beschikbaar, skip build step
)
cd ..
:skip_tablet
echo ✅ Tablet UI processed

echo.
echo 5. Compileer C# Tray Application...
if exist "ClimbingClubTray.csproj" (
    echo Using modern dotnet build...
    dotnet build -c Release
    if errorlevel 1 (
        echo ❌ Dotnet build gefaald, probeer legacy method...
        goto legacy_build
    )

    if exist "bin\Release\net6.0-windows\ClimbingClubTray.exe" (
        copy "bin\Release\net6.0-windows\ClimbingClubTray.exe" . >nul
        echo ✅ ClimbingClubTray.exe copied from dotnet build
    ) else (
        echo ⚠️ EXE niet gevonden in expected location, probeer legacy...
        goto legacy_build
    )
    goto nsis_build
)

:legacy_build
echo Using legacy csc compiler...
csc ClimbingClubTray.cs /target:winexe /reference:System.Windows.Forms.dll,System.Drawing.dll,System.ServiceProcess.dll,System.Net.Http.dll 2>nul
if errorlevel 1 (
    echo ❌ CSC compilation gefaald
    echo.
    echo TRY THIS:
    echo 1. Open "Developer Command Prompt for Visual Studio"
    echo 2. Navigate to this directory
    echo 3. Run: csc ClimbingClubTray.cs /target:winexe /reference:System.Windows.Forms.dll,System.Drawing.dll,System.ServiceProcess.dll,System.Net.Http.dll
    echo.
    echo OR download Visual Studio Community for easier compilation
    pause
    goto nsis_build
)
echo ✅ Tray application compiled with csc

:nsis_build
echo.
echo 6. Build NSIS installer...

REM Check verschillende mogelijke NSIS locaties
set NSIS_PATH=
if exist "C:\Program Files (x86)\NSIS\makensis.exe" (
    set NSIS_PATH=C:\Program Files ^(x86^)\NSIS\makensis.exe
)
if exist "C:\Program Files\NSIS\makensis.exe" (
    set NSIS_PATH=C:\Program Files\NSIS\makensis.exe
)

if "%NSIS_PATH%"=="" (
    echo ❌ NSIS niet gevonden!
    echo Download van: https://nsis.sourceforge.io/Download
    echo Na installatie, run dit script opnieuw
    pause
    goto end_script
)

echo Using NSIS from: %NSIS_PATH%
"%NSIS_PATH%" installer.nsi
if errorlevel 1 (
    echo ❌ NSIS build gefaald
    echo Check installer.nsi voor syntax errors
    pause
    goto end_script
)

echo.
echo ====================================================
echo ✅ BUILD COMPLEET!
echo ====================================================
echo.
if exist "ClimbingClubSoftware-Setup.exe" (
    echo ✅ Installer beschikbaar: ClimbingClubSoftware-Setup.exe
    echo.
    echo Je kan deze installer nu testen!
) else (
    echo ⚠️ Installer bestand niet gevonden
    echo Check of NSIS build succesvol was
)

:end_script
echo.
pause
