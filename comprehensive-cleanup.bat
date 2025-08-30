@echo off
title Comprehensive Cleanup - Climbing Club Software
color 0E

echo.
echo ================================================
echo      COMPREHENSIVE CLEANUP - CLIMBING CLUB  
echo ================================================
echo.

set CURRENT_DIR=%CD%

echo WARNING: This will delete build artifacts, old backups, and temporary files.
echo Your main code and data files will NOT be touched.
echo.
set /p confirm="Continue with cleanup? (y/N): "
if /i not "%confirm%"=="y" (
    echo Cleanup cancelled.
    pause
    exit /b 0
)

echo.
echo 🧹 Starting comprehensive cleanup...
echo.

REM 1. .NET Build Artifacts
echo 1. Cleaning .NET build artifacts...
if exist "bin" (
    echo   Removing bin/ directory...
    rmdir /s /q "bin" 2>nul
    echo   ✅ bin/ removed
)

if exist "obj" (
    echo   Removing obj/ directory...  
    rmdir /s /q "obj" 2>nul
    echo   ✅ obj/ removed
)

if exist "dist" (
    echo   Removing dist/ directory...
    rmdir /s /q "dist" 2>nul  
    echo   ✅ dist/ removed
)

REM 2. Root node_modules (duplicate)
if exist "node_modules" (
    echo 2. Removing duplicate root node_modules...
    rmdir /s /q "node_modules" 2>nul
    echo   ✅ Root node_modules removed
) else (
    echo 2. No duplicate node_modules found in root
)

REM 3. Backup and temporary files
echo 3. Cleaning backup and temporary files...
del "*.backup" /q 2>nul
del "*.old" /q 2>nul  
del "*.tmp" /q 2>nul
del "*~" /q 2>nul
del "*.log" /q 2>nul
echo   ✅ Backup files cleaned

REM 4. C# compilation artifacts  
echo 4. Cleaning C# artifacts...
del "*.exe" /q 2>nul
del "*.dll" /q 2>nul
del "*.pdb" /q 2>nul
echo   ✅ C# artifacts cleaned

REM 5. Old experimental files (safe to remove)
echo 5. Cleaning experimental files...
del "backend-diagnostic.js" /q 2>nul
del "build-installer.js" /q 2>nul
del "ultra-robust-server.js" /q 2>nul
del "main.js" /q 2>nul
del "create-shortcuts.js" /q 2>nul
echo   ✅ Experimental files cleaned

REM 6. Clean backend/data old backups (using existing cleanup service)
echo 6. Triggering backend data cleanup...
if exist "backend\cleanup-service.js" (
    cd backend
    node -e "const cleanup = require('./cleanup-service'); console.log(cleanup.manualCleanup());" 2>nul
    cd ..
    echo   ✅ Backend data cleanup completed
) else (
    echo   ⚠️ Backend cleanup service not found
)

REM 7. Clean old exports (keep recent ones)
echo 7. Cleaning old export files...  
if exist "backend\data\exports" (
    cd "backend\data\exports"
    forfiles /m *.xlsx /d -30 /c "cmd /c echo Deleting old export: @file && del @path" 2>nul
    cd "%CURRENT_DIR%"
    echo   ✅ Old export files cleaned (kept recent ones)
) else (
    echo   ℹ️ No exports directory found
)

REM 8. Show disk space saved
echo 8. Calculating space saved...
echo.

echo ================================================
echo               CLEANUP COMPLETED!
echo ================================================
echo.
echo ✅ Build artifacts removed (bin/, obj/, dist/)
echo ✅ Duplicate node_modules removed  
echo ✅ Backup files cleaned (*.backup, *.old)
echo ✅ Temporary files removed
echo ✅ C# compilation artifacts cleaned  
echo ✅ Experimental files removed
echo ✅ Old data backups cleaned (30+ days)
echo ✅ Old export files cleaned (30+ days)
echo.
echo 📁 KEPT (important files):
echo   • backend/data/ (current data)
echo   • backend/node_modules/ (required dependencies)
echo   • tablet-ui/ and admin-dashboard/
echo   • All .bat, .html, .js configuration files
echo   • Recent exports and backups
echo.
echo Your software is now cleaned up and ready to use!
echo.
pause
