# Script om handmatig backend te testen

param(
    [string]$BackendPath = "C:\Users\kevin\Documents\beyrede_escalade\backend"
)

Write-Host "=== BACKEND MANUAL TEST ===" -ForegroundColor Cyan

# Check if backend directory exists
if (-not (Test-Path $BackendPath)) {
    Write-Host "ERROR: Backend directory not found at $BackendPath" -ForegroundColor Red
    exit 1
}

Set-Location $BackendPath

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Gray
Write-Host "Files in directory:" -ForegroundColor Gray
Get-ChildItem . | Select-Object Name, Length, LastWriteTime | Format-Table

# Check Node.js
Write-Host "`nTesting Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found!" -ForegroundColor Red
    exit 1
}

# Check server.js
if (-not (Test-Path "server.js")) {
    Write-Host "ERROR: server.js not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`nserver.js found. First 15 lines:" -ForegroundColor Green
Get-Content "server.js" -Head 15

# Check dependencies
Write-Host "`nChecking dependencies..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "package.json found" -ForegroundColor Green
    if (-not (Test-Path "node_modules")) {
        Write-Host "node_modules not found. Running npm install..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: npm install failed!" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "node_modules directory exists" -ForegroundColor Green
    }
} else {
    Write-Host "WARNING: package.json not found" -ForegroundColor Yellow
}

Write-Host "`n=== STARTING SERVER ===" -ForegroundColor Green
Write-Host "If successful, server will start on http://localhost:4000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server when ready" -ForegroundColor Yellow
Write-Host "Starting in 3 seconds..." -ForegroundColor Gray

Start-Sleep 3

node server.js
