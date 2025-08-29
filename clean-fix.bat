@echo off
echo ================================================
echo CLEAN FIX - Remove Duplicates and Rebuild
echo ================================================

echo.
echo 1. Backup current problematic file...
if exist ClimbingClubTray.cs (
    copy ClimbingClubTray.cs ClimbingClubTray-PROBLEM.cs.backup
    echo ✅ Backup created
)

echo.
echo 2. Delete problematic file...
del ClimbingClubTray.cs
echo ✅ Problematic file deleted

echo.
echo 3. Copy clean debug version...
if exist ClimbingClubTray-DEBUG.cs (
    copy ClimbingClubTray-DEBUG.cs ClimbingClubTray.cs
    echo ✅ Clean debug version copied
) else (
    echo ❌ ClimbingClubTray-DEBUG.cs not found
    echo Using simple test version instead...
    copy TEST-ClimbingClubTray.cs ClimbingClubTray.cs
    echo ✅ Simple test version copied
)

echo.
echo 4. Clean build...
dotnet clean
dotnet build -c Release
if errorlevel 1 (
    echo ❌ Build failed - trying simple compiler...
    csc ClimbingClubTray.cs /target:winexe /reference:System.Windows.Forms.dll
    if errorlevel 1 (
        echo ❌ Simple compiler also failed
        pause
        exit /b 1
    )
    echo ✅ Simple compiler succeeded
    goto test_exe
)

echo ✅ Dotnet build succeeded

echo.
echo 5. Copy EXE...
copy "bin\Release\net6.0-windows\ClimbingClubTray.exe" . /Y
if errorlevel 1 (
    echo ⚠️ Copy from build output failed, EXE might be in current directory already
)

:test_exe
echo.
echo 6. Test EXE...
echo Starting ClimbingClubTray.exe...
if exist ClimbingClubTray.exe (
    start ClimbingClubTray.exe
    echo ✅ EXE started - check for console/MessageBox
) else (
    echo ❌ ClimbingClubTray.exe not found
)

echo.
echo ================================================
echo CLEAN BUILD COMPLETED!
echo ================================================
echo Look for:
echo • Console window (if debug version)
echo • MessageBox confirmation  
echo • System tray icon (if full version)
echo.
pause
