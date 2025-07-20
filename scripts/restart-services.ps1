# PowerShell script voor het restarten van alle services

param(
    [string]$ProjectPath = "C:\Users\kevin\Documents\beyrede_escalade"
)

Write-Host "=== SERVICE RESTART SCRIPT ===" -ForegroundColor Cyan
Write-Host "Project path: $ProjectPath" -ForegroundColor Yellow

function Stop-AllNodeProcesses {
    Write-Host "`nStopping all Node.js processes..." -ForegroundColor Yellow
    
    # Stop alle Node.js processen
    try {
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
        Write-Host "All Node.js processes stopped" -ForegroundColor Green
    } catch {
        Write-Host "No Node.js processes found or already stopped" -ForegroundColor Gray
    }
    
    # Extra check: kill via taskkill
    try {
        taskkill /F /IM node.exe 2>$null
    } catch {
        # Geen probleem als het faalt
    }
    
    Write-Host "Waiting 3 seconds for processes to fully stop..." -ForegroundColor Gray
    Start-Sleep 3
}

function Start-BackendService {
    Write-Host "`nStarting backend service..." -ForegroundColor Yellow
    
    $backendPath = Join-Path $ProjectPath "backend"
    
    if (-not (Test-Path $backendPath)) {
        Write-Host "ERROR: Backend path not found: $backendPath" -ForegroundColor Red
        return $false
    }
    
    # Check if server.js exists
    $serverFile = Join-Path $backendPath "server.js"
    if (-not (Test-Path $serverFile)) {
        Write-Host "ERROR: server.js not found: $serverFile" -ForegroundColor Red
        return $false
    }
    
    # Start backend in nieuwe PowerShell window
    $backendArgs = "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Starting backend server...' -ForegroundColor Green; node server.js"
    Start-Process powershell -ArgumentList $backendArgs
    
    Write-Host "Backend service started on http://localhost:4000" -ForegroundColor Green
    
    # Wacht even en check of de service draait
    Start-Sleep 5
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4000" -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host "Backend is responding!" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "WARNING: Backend may not be responding yet" -ForegroundColor Yellow
        return $false
    }
}

function Start-TabletService {
    Write-Host "`nStarting tablet-ui service..." -ForegroundColor Yellow
    
    $tabletPath = Join-Path $ProjectPath "tablet-ui"
    
    if (-not (Test-Path $tabletPath)) {
        Write-Host "ERROR: Tablet-ui path not found: $tabletPath" -ForegroundColor Red
        return $false
    }
    
    # Start tablet-ui in nieuwe PowerShell window
    $tabletArgs = "-NoExit", "-Command", "cd '$tabletPath'; Write-Host 'Starting tablet-ui...' -ForegroundColor Green; npm start"
    Start-Process powershell -ArgumentList $tabletArgs
    
    Write-Host "Tablet-ui service started on http://localhost:3001" -ForegroundColor Green
    return $true
}

function Show-ServiceStatus {
    Write-Host "`n=== SERVICE STATUS ===" -ForegroundColor Cyan
    
    # Check Node.js processen
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "Running Node.js processes:" -ForegroundColor Green
        $nodeProcesses | ForEach-Object {
            Write-Host "  PID: $($_.Id) - Started: $($_.StartTime)" -ForegroundColor White
        }
    } else {
        Write-Host "No Node.js processes running" -ForegroundColor Red
    }
    
    # Check poorten
    Write-Host "`nPort Status:" -ForegroundColor Cyan
    $port4000 = netstat -ano | findstr :4000
    $port3001 = netstat -ano | findstr :3001
    
    if ($port4000) {
        Write-Host "  Port 4000 (Backend): ACTIVE" -ForegroundColor Green
    } else {
        Write-Host "  Port 4000 (Backend): INACTIVE" -ForegroundColor Red
    }
    
    if ($port3001) {
        Write-Host "  Port 3001 (Tablet-UI): ACTIVE" -ForegroundColor Green
    } else {
        Write-Host "  Port 3001 (Tablet-UI): INACTIVE" -ForegroundColor Red
    }
}

# Hoofdfunctie
function Restart-AllServices {
    Write-Host "Starting complete service restart..." -ForegroundColor Cyan
    
    # Stop alle services
    Stop-AllNodeProcesses
    
    # Start backend
    $backendOk = Start-BackendService
    
    if ($backendOk) {
        # Start tablet-ui
        Start-TabletService
        
        # Show final status
        Start-Sleep 3
        Show-ServiceStatus
        
        Write-Host "`n=== RESTART COMPLETE ===" -ForegroundColor Green
        Write-Host "Backend: http://localhost:4000" -ForegroundColor Yellow
        Write-Host "Tablet-UI: http://localhost:3001" -ForegroundColor Yellow
        Write-Host "`nTest nu Kevin Bleys opnieuw!" -ForegroundColor Cyan
    } else {
        Write-Host "`nERROR: Backend failed to start properly" -ForegroundColor Red
    }
}

# Run het script
Restart-AllServices

Write-Host "`nDruk op een toets om af te sluiten..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
