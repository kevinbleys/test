# Gefixt PowerShell script voor backend startup probleem

param(
    [string]$ProjectPath = "C:\Users\kevin\Documents\beyrede_escalade"
)

Write-Host "=== FIXED PROJECT RESTART ===" -ForegroundColor Cyan
Write-Host "Project path: $ProjectPath" -ForegroundColor Yellow

function Stop-AllNodeProcesses {
    Write-Host "`n1. Stopping all Node.js processes..." -ForegroundColor Yellow
    
    try {
        # Forceer stop van alle Node processen
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
        taskkill /F /IM node.exe 2>$null
        
        # Forceer stop van processen op specifieke poorten
        $port4000Processes = netstat -ano | findstr :4000
        $port3001Processes = netstat -ano | findstr :3001
        
        if ($port4000Processes) {
            $port4000Processes | ForEach-Object {
                $pid = ($_ -split '\s+')[4]
                if ($pid -and $pid -match '^\d+$') {
                    taskkill /F /PID $pid 2>$null
                    Write-Host "   Killed process on port 4000 (PID: $pid)" -ForegroundColor Green
                }
            }
        }
        
        if ($port3001Processes) {
            $port3001Processes | ForEach-Object {
                $pid = ($_ -split '\s+')[4]
                if ($pid -and $pid -match '^\d+$') {
                    taskkill /F /PID $pid 2>$null
                    Write-Host "   Killed process on port 3001 (PID: $pid)" -ForegroundColor Green
                }
            }
        }
        
        Write-Host "   All processes stopped" -ForegroundColor Green
    } catch {
        Write-Host "   Warning: Some processes may not have been stopped" -ForegroundColor Yellow
    }
    
    Start-Sleep 5
}

function Test-BackendPrerequisites {
    Write-Host "`n2. Checking backend prerequisites..." -ForegroundColor Yellow
    
    $backendPath = Join-Path $ProjectPath "backend"
    
    # Check if backend directory exists
    if (-not (Test-Path $backendPath)) {
        Write-Host "   ERROR: Backend directory not found at $backendPath" -ForegroundColor Red
        return $false
    }
    
    # Check if server.js exists
    $serverFile = Join-Path $backendPath "server.js"
    if (-not (Test-Path $serverFile)) {
        Write-Host "   ERROR: server.js not found at $serverFile" -ForegroundColor Red
        return $false
    }
    
    # Check if package.json exists
    $packageFile = Join-Path $backendPath "package.json"
    if (-not (Test-Path $packageFile)) {
        Write-Host "   WARNING: package.json not found" -ForegroundColor Yellow
    }
    
    # Check if node_modules exists
    $nodeModules = Join-Path $backendPath "node_modules"
    if (-not (Test-Path $nodeModules)) {
        Write-Host "   WARNING: node_modules directory not found" -ForegroundColor Yellow
        Write-Host "   Running npm install..." -ForegroundColor Gray
        
        try {
            Set-Location $backendPath
            $npmResult = npm install 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   npm install completed successfully" -ForegroundColor Green
            } else {
                Write-Host "   ERROR: npm install failed" -ForegroundColor Red
                Write-Host "   npm output: $npmResult" -ForegroundColor Gray
                return $false
            }
        } catch {
            Write-Host "   ERROR: Failed to run npm install: $_" -ForegroundColor Red
            return $false
        }
    }
    
    # Check if Node.js is available
    try {
        $nodeVersion = node --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   Node.js version: $nodeVersion" -ForegroundColor Green
        } else {
            Write-Host "   ERROR: Node.js not found or not working" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "   ERROR: Node.js not available: $_" -ForegroundColor Red
        return $false
    }
    
    Write-Host "   Prerequisites check completed" -ForegroundColor Green
    return $true
}

function Start-BackendWithDiagnostics {
    Write-Host "`n3. Starting backend with diagnostics..." -ForegroundColor Yellow
    
    $backendPath = Join-Path $ProjectPath "backend"
    
    # Create a detailed startup script
    $startupScript = @"
# Backend startup diagnostic script
Write-Host '=== BACKEND STARTUP DIAGNOSTICS ===' -ForegroundColor Cyan
Write-Host 'Current directory:' (Get-Location) -ForegroundColor Gray
Write-Host 'Backend path: $backendPath' -ForegroundColor Gray
Write-Host 'Node.js version:' (node --version) -ForegroundColor Gray

Set-Location '$backendPath'
Write-Host 'Changed to directory:' (Get-Location) -ForegroundColor Gray

# List key files
Write-Host 'Files in backend directory:' -ForegroundColor Gray
Get-ChildItem . | Select-Object Name | Format-Table -AutoSize

# Check if server.js exists and show first few lines
if (Test-Path 'server.js') {
    Write-Host 'server.js found - first 10 lines:' -ForegroundColor Gray
    Get-Content 'server.js' -Head 10
} else {
    Write-Host 'ERROR: server.js not found!' -ForegroundColor Red
    exit 1
}

# Start the server with verbose output
Write-Host '=== STARTING SERVER ===' -ForegroundColor Green
Write-Host 'Running: node server.js' -ForegroundColor Yellow
node server.js
"@
    
    # Start backend in new window with diagnostics
    try {
        Start-Process powershell -ArgumentList @(
            "-NoExit",
            "-WindowStyle", "Normal",
            "-Command", $startupScript
        ) -WorkingDirectory $backendPath
        
        Write-Host "   Backend started in new window with diagnostics" -ForegroundColor Green
        
        # Wait longer for backend to start
        Write-Host "   Waiting 15 seconds for backend to initialize..." -ForegroundColor Gray
        Start-Sleep 15
        
        # Test if backend is responding
        $maxRetries = 6
        $retryCount = 0
        $backendRunning = $false
        
        while ($retryCount -lt $maxRetries -and -not $backendRunning) {
            try {
                Write-Host "   Testing backend (attempt $($retryCount + 1)/$maxRetries)..." -ForegroundColor Gray
                $response = Invoke-WebRequest -Uri "http://localhost:4000" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
                $backendRunning = $true
                Write-Host "   Backend is responding!" -ForegroundColor Green
            } catch {
                $retryCount++
                if ($retryCount -lt $maxRetries) {
                    Write-Host "   Backend not ready yet, waiting 5 seconds..." -ForegroundColor Yellow
                    Start-Sleep 5
                } else {
                    Write-Host "   Backend failed to respond after all retries" -ForegroundColor Red
                    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
        
        return $backendRunning
        
    } catch {
        Write-Host "   ERROR: Failed to start backend process: $_" -ForegroundColor Red
        return $false
    }
}

function Start-TabletUIFixed {
    Write-Host "`n4. Starting tablet-ui..." -ForegroundColor Yellow
    
    $tabletPath = Join-Path $ProjectPath "tablet-ui"
    
    if (-not (Test-Path $tabletPath)) {
        Write-Host "   ERROR: Tablet-ui path not found!" -ForegroundColor Red
        return $false
    }
    
    # Check if node_modules exists in tablet-ui
    $nodeModules = Join-Path $tabletPath "node_modules"
    if (-not (Test-Path $nodeModules)) {
        Write-Host "   Running npm install for tablet-ui..." -ForegroundColor Gray
        try {
            Set-Location $tabletPath
            npm install
            if ($LASTEXITCODE -ne 0) {
                Write-Host "   WARNING: npm install for tablet-ui had issues" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "   ERROR: Failed to run npm install for tablet-ui" -ForegroundColor Red
        }
    }
    
    $tabletScript = @"
Set-Location '$tabletPath'
Write-Host '=== TABLET-UI STARTING ===' -ForegroundColor Green
Write-Host 'Current directory:' (Get-Location) -ForegroundColor Gray
npm start
"@
    
    try {
        Start-Process powershell -ArgumentList @(
            "-NoExit",
            "-WindowStyle", "Normal",
            "-Command", $tabletScript
        ) -WorkingDirectory $tabletPath
        
        Write-Host "   Tablet-ui started" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "   ERROR: Failed to start tablet-ui: $_" -ForegroundColor Red
        return $false
    }
}

function Show-DetailedStatus {
    Write-Host "`n=== DETAILED STATUS ===" -ForegroundColor Cyan
    
    # Check Node.js processes
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "Running Node.js processes:" -ForegroundColor Green
        $nodeProcesses | ForEach-Object {
            Write-Host "  PID: $($_.Id) - Started: $($_.StartTime) - CPU: $($_.CPU)" -ForegroundColor White
        }
    } else {
        Write-Host "No Node.js processes running" -ForegroundColor Red
    }
    
    # Check ports with more detail
    Write-Host "`nPort Analysis:" -ForegroundColor Cyan
    
    $port4000 = netstat -ano | findstr :4000
    $port3001 = netstat -ano | findstr :3001
    
    if ($port4000) {
        Write-Host "Port 4000 (Backend):" -ForegroundColor Green
        $port4000 | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    } else {
        Write-Host "Port 4000 (Backend): NOT ACTIVE" -ForegroundColor Red
    }
    
    if ($port3001) {
        Write-Host "Port 3001 (Tablet-UI):" -ForegroundColor Green
        $port3001 | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    } else {
        Write-Host "Port 3001 (Tablet-UI): NOT ACTIVE" -ForegroundColor Yellow
    }
    
    # Test HTTP responses
    Write-Host "`nHTTP Response Tests:" -ForegroundColor Cyan
    
    try {
        $backendTest = Invoke-WebRequest -Uri "http://localhost:4000" -TimeoutSec 3 -UseBasicParsing
        Write-Host "Backend HTTP: RESPONDING ($($backendTest.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "Backend HTTP: NOT RESPONDING ($($_.Exception.Message))" -ForegroundColor Red
    }
    
    try {
        $tabletTest = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 3 -UseBasicParsing
        Write-Host "Tablet-UI HTTP: RESPONDING ($($tabletTest.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "Tablet-UI HTTP: NOT RESPONDING ($($_.Exception.Message))" -ForegroundColor Yellow
    }
}

# MAIN EXECUTION
Write-Host "Starting fixed project restart with diagnostics..." -ForegroundColor Cyan

try {
    # Step 1: Stop all processes
    Stop-AllNodeProcesses
    
    # Step 2: Check prerequisites
    $prereqsOk = Test-BackendPrerequisites
    
    if (-not $prereqsOk) {
        Write-Host "`nERROR: Prerequisites check failed. Cannot continue." -ForegroundColor Red
        exit 1
    }
    
    # Step 3: Start backend with diagnostics
    $backendOk = Start-BackendWithDiagnostics
    
    if ($backendOk) {
        Write-Host "`nBackend started successfully!" -ForegroundColor Green
        
        # Step 4: Start tablet-ui
        Start-TabletUIFixed
        
        # Step 5: Show detailed status
        Start-Sleep 5
        Show-DetailedStatus
        
        Write-Host "`n=== RESTART COMPLETE ===" -ForegroundColor Green
        Write-Host "Backend: http://localhost:4000" -ForegroundColor Yellow
        Write-Host "Tablet-UI: http://localhost:3001" -ForegroundColor Yellow
        Write-Host "`nDiagnostic windows are open to show any errors." -ForegroundColor Cyan
        
    } else {
        Write-Host "`nERROR: Backend failed to start. Check the diagnostic window for details." -ForegroundColor Red
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "- Port 4000 already in use" -ForegroundColor Gray
        Write-Host "- Missing node_modules (run 'npm install' in backend directory)" -ForegroundColor Gray
        Write-Host "- server.js file missing or has errors" -ForegroundColor Gray
        Write-Host "- Node.js not properly installed" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "`nCRITICAL ERROR: $_" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Gray
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
