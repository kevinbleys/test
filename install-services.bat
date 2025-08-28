@echo off
echo ====================================================
echo Installation des Services Windows - Club d'Escalade
echo ====================================================

cd /d "%~dp0"

echo.
echo 1. Installation du service Backend...
node install-backend-service.js
if errorlevel 1 (
    echo ERREUR: Echec installation service Backend
    pause
    exit /b 1
)

echo.
echo 2. Installation du service Frontend...
node install-frontend-service.js
if errorlevel 1 (
    echo ERREUR: Echec installation service Frontend
    pause
    exit /b 1
)

echo.
echo 3. Installation du service Admin Dashboard...
node install-admin-service.js
if errorlevel 1 (
    echo ERREUR: Echec installation service Admin Dashboard
    pause
    exit /b 1
)

echo.
echo 4. Démarrage des services...
net start "ClimbingClub-Backend"
net start "ClimbingClub-Frontend" 
net start "ClimbingClub-Admin"

echo.
echo ====================================================
echo Tous les services sont installés et démarrés !
echo ====================================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo Admin: http://localhost:3001/admin
echo.
pause
