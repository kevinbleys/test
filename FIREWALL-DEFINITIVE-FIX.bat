@echo off
title FIREWALL FIX - Open Climbing Club Ports
color 0C

echo ================================================
echo    FIREWALL FIX - OPEN CLIMBING CLUB PORTS
echo ================================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if not %errorLevel% == 0 (
    echo ❌ ERROR: This script must be run as Administrator!
    echo.
    echo Please right-click on this file and select:
    echo "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo ✅ Running as Administrator - proceeding...
echo.

echo Opening Windows Firewall for Climbing Club...
echo.

REM Delete existing rules (if any)
echo 1. Cleaning existing rules...
netsh advfirewall firewall delete rule name="Climbing Club Port 3000" >nul 2>&1
netsh advfirewall firewall delete rule name="Climbing Club Port 3001" >nul 2>&1
netsh advfirewall firewall delete rule name="Climbing Club 3000" >nul 2>&1
netsh advfirewall firewall delete rule name="Climbing Club 3001" >nul 2>&1

REM Create comprehensive rules for port 3000
echo 2. Creating Port 3000 rules (Tablet UI)...
netsh advfirewall firewall add rule name="Climbing Club Port 3000 - Inbound TCP" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Climbing Club Port 3000 - Outbound TCP" dir=out action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Climbing Club Port 3000 - Inbound UDP" dir=in action=allow protocol=UDP localport=3000
netsh advfirewall firewall add rule name="Climbing Club Port 3000 - Outbound UDP" dir=out action=allow protocol=UDP localport=3000

REM Create comprehensive rules for port 3001  
echo 3. Creating Port 3001 rules (Backend API)...
netsh advfirewall firewall add rule name="Climbing Club Port 3001 - Inbound TCP" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="Climbing Club Port 3001 - Outbound TCP" dir=out action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="Climbing Club Port 3001 - Inbound UDP" dir=in action=allow protocol=UDP localport=3001
netsh advfirewall firewall add rule name="Climbing Club Port 3001 - Outbound UDP" dir=out action=allow protocol=UDP localport=3001

echo.
echo 4. Verifying created rules...
netsh advfirewall firewall show rule name="Climbing Club Port 3000 - Inbound TCP"
netsh advfirewall firewall show rule name="Climbing Club Port 3001 - Inbound TCP"

echo.
echo ================================================
echo        FIREWALL CONFIGURATION COMPLETE!
echo ================================================
echo.
echo ✅ Successfully opened:
echo   • Port 3000 (Tablet UI) - TCP/UDP Inbound/Outbound
echo   • Port 3001 (Backend API) - TCP/UDP Inbound/Outbound
echo.
echo 📱 TABLET ACCESS NOW ENABLED:
echo   • Tablet Interface: http://192.168.1.100:3000
echo   • Admin Interface:  http://192.168.1.100:3001/admin
echo.
echo 🧪 IMMEDIATE TEST:
echo   1. Restart services if needed
echo   2. Test from tablet browser
echo   3. Check for "network error" - should be gone!
echo.
echo Press any key to close...
pause >nul