@echo off
echo ====================================================
echo Désinstallation des Services - Club d'Escalade
echo ====================================================

echo.
echo 1. Arrêt des services...
net stop "ClimbingClub-Backend" 2>nul
net stop "ClimbingClub-Frontend" 2>nul
net stop "ClimbingClub-Admin" 2>nul

echo.
echo 2. Désinstallation des services...
node uninstall-backend-service.js 2>nul
node uninstall-frontend-service.js 2>nul
node uninstall-admin-service.js 2>nul

echo.
echo Services désinstallés avec succès !
pause
