@echo off
title Install Climbing Club as Windows Services
color 0B

echo.
echo ================================================
echo    INSTALL CLIMBING CLUB AS WINDOWS SERVICES
echo ================================================
echo.
echo This will install the climbing club software as Windows Services
echo that run automatically in the background, even after restart.
echo.

set /p confirm="Continue with service installation? (y/N): "
if /i not "%confirm%"=="y" (
    echo Installation cancelled.
    pause
    exit /b 0
)

echo.
echo Installing Node.js Windows Service Manager...
npm install -g node-windows
if errorlevel 1 (
    echo ❌ Failed to install node-windows
    echo Try running as Administrator
    pause
    exit /b 1
)

echo.
echo 1. Installing Backend Service...
cd backend
node -e "
const Service = require('node-windows').Service;
const svc = new Service({
  name: 'ClimbingClub Backend',
  description: 'Climbing Club Backend Server',
  script: require('path').join(__dirname, 'server.js'),
  nodeOptions: ['--max_old_space_size=256'],
  env: {name: 'NODE_ENV', value: 'production'}
});
svc.on('install', () => {
  console.log('✅ Backend service installed');
  svc.start();
});
svc.on('alreadyinstalled', () => {
  console.log('Backend service already installed');
});
svc.install();
"
cd ..

echo.
echo 2. Installing Tablet UI Service...
if exist tablet-ui (
    cd tablet-ui
    node -e "
const Service = require('node-windows').Service;
const svc = new Service({
  name: 'ClimbingClub Tablet UI',
  description: 'Climbing Club Tablet Interface',
  script: 'C:\\Windows\\System32\\cmd.exe',
  scriptOptions: '/c npm start',
  nodeOptions: ['--max_old_space_size=128']
});
svc.on('install', () => {
  console.log('✅ Tablet UI service installed');
  svc.start();
});
svc.install();
    "
    cd ..
)

echo.
echo ================================================
echo           WINDOWS SERVICES INSTALLED!
echo ================================================
echo.
echo Services installed and started:
echo • ClimbingClub Backend - Automatic startup
echo • ClimbingClub Tablet UI - Automatic startup
echo.
echo Services will now:
echo ✅ Start automatically when Windows boots
echo ✅ Run in background (no visible windows)
echo ✅ Restart automatically if they crash
echo ✅ Continue running even if user logs out
echo.
echo To manage services:
echo • Windows Services Manager (services.msc)
echo • Or use uninstall-windows-services.bat
echo.
pause
