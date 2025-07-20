# Complete restart script met verificatie

param(
    [string]$ProjectPath = "C:\Users\kevin\Documents\beyrede_escalade"
)

Write-Host "=== COMPLETE PROJECT RESTART ===" -ForegroundColor Cyan
Write-Host "Project path: $ProjectPath" -ForegroundColor Yellow

function Stop-AllNodeProcesses {
    Write-Host "`n1. Stopping all Node.js processes..." -ForegroundColor Yellow
    
    # Forceer stop van alle Node processen
    try {
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
        taskkill /F /IM node.exe 2>$null
        Write-Host "   All Node.js processes stopped" -ForegroundColor Green
    } catch {
        Write-Host "   No Node.js processes found" -ForegroundColor Gray
    }
    
    Start-Sleep 3
}

function Start-BackendWithMonitoring {
    Write-Host "`n2. Starting backend with monitoring..." -ForegroundColor Yellow
    
    $backendPath = Join-Path $ProjectPath "backend"
    
    if (-not (Test-Path $backendPath)) {
        Write-Host "   ERROR: Backend path not found!" -ForegroundColor Red
        return $false
    }
    
    # Start backend in nieuwe window met extra debugging
    $backendScript = @"
cd '$backendPath'
Write-Host '=== BACKEND STARTING ===' -ForegroundColor Green
Write-Host 'Monitoring for tarif issues...' -ForegroundColor Yellow
node server.js
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript
    
    # Wacht en test of backend werkt
    Write-Host "   Waiting for backend to start..." -ForegroundColor Gray
    Start-Sleep 5
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4000" -TimeoutSec 10 -UseBasicParsing
        Write-Host "   Backend is responding!" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "   WARNING: Backend may not be ready yet" -ForegroundColor Yellow
        return $false
    }
}

function Start-TabletUI {
    Write-Host "`n3. Starting tablet-ui..." -ForegroundColor Yellow
    
    $tabletPath = Join-Path $ProjectPath "tablet-ui"
    
    if (-not (Test-Path $tabletPath)) {
        Write-Host "   ERROR: Tablet-ui path not found!" -ForegroundColor Red
        return $false
    }
    
    $tabletScript = @"
cd '$tabletPath'
Write-Host '=== TABLET-UI STARTING ===' -ForegroundColor Green
npm start
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $tabletScript
    
    Write-Host "   Tablet-ui started on http://localhost:3001" -ForegroundColor Green
    return $true
}

function Test-TarifFix {
    Write-Host "`n4. Testing tarif fix..." -ForegroundColor Yellow
    
    # Wacht tot alles is gestart
    Start-Sleep 10
    
    Write-Host "   Testing steven carru registration..." -ForegroundColor Gray
    
    try {
        # Test member validation
        $checkUrl = "http://localhost:4000/members/check?nom=carru&prenom=steven"
        $checkResponse = Invoke-RestMethod -Uri $checkUrl -Method Get -TimeoutSec 10
        
        if ($checkResponse.success) {
            Write-Host "   Member validation: PASSED" -ForegroundColor Green
            
            # Test presence registration
            $presenceData = @{
                type = "adherent"
                nom = "carru"
                prenom = "steven"
            } | ConvertTo-Json
            
            $presenceResponse = Invoke-RestMethod -Uri "http://localhost:4000/presences" -Method Post -Body $presenceData -ContentType "application/json" -TimeoutSec 10
            
            if ($presenceResponse.success) {
                $presence = $presenceResponse.presence
                
                if ($presence.PSObject.Properties.Name -contains "tarif") {
                    Write-Host "   FAILED: Tarif found! Value: $($presence.tarif)" -ForegroundColor Red
                    Write-Host "   The tarif problem is NOT fixed!" -ForegroundColor Red
                    return $false
                } else {
                    Write-Host "   SUCCESS: No tarif field found!" -ForegroundColor Green
                    Write-Host "   The tarif problem is FIXED!" -ForegroundColor Green
                    return $true
                }
            } else {
                Write-Host "   FAILED: Presence registration failed" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "   FAILED: Member validation failed" -ForegroundColor Red
            Write-Host "   Error: $($checkResponse.error)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "   FAILED: Test error: $_" -ForegroundColor Red
        return $false
    }
}

function Show-FinalStatus {
    Write-Host "`n=== FINAL STATUS ===" -ForegroundColor Cyan
    
    # Check processes
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "Running Node.js processes: $($nodeProcesses.Count)" -ForegroundColor Green
    } else {
        Write-Host "No Node.js processes running" -ForegroundColor Red
    }
    
    # Check ports
    $port4000 = netstat -ano | findstr :4000
    $port3001 = netstat -ano | findstr :3001
    
    if ($port4000) {
        Write-Host "Backend (port 4000): ACTIVE" -ForegroundColor Green
    } else {
        Write-Host "Backend (port 4000): INACTIVE" -ForegroundColor Red
    }
    
    if ($port3001) {
        Write-Host "Tablet-UI (port 3001): ACTIVE" -ForegroundColor Green
    } else {
        Write-Host "Tablet-UI (port 3001): INACTIVE" -ForegroundColor Yellow
    }
}

# MAIN EXECUTION
Write-Host "Starting complete project restart with tarif fix..." -ForegroundColor Cyan

Stop-AllNodeProcesses

$backendOk = Start-BackendWithMonitoring

if ($backendOk) {
    Start-TabletUI
    
    $testResult = Test-TarifFix
    
    Show-FinalStatus
    
    Write-Host "`n=== RESTART COMPLETE ===" -ForegroundColor Green
    Write-Host "Backend: http://localhost:4000" -ForegroundColor Yellow
    Write-Host "Tablet-UI: http://localhost:3001" -ForegroundColor Yellow
    
    if ($testResult) {
        Write-Host "`n🎉 TARIF PROBLEM FIXED! Test Kevin Bleys now!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  TARIF PROBLEM STILL EXISTS! Check the backend code!" -ForegroundColor Red
    }
} else {
    Write-Host "`nERROR: Backend failed to start properly" -ForegroundColor Red
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
