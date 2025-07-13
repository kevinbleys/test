# Test script om synchronisatie te testen

Write-Host "Test synchronisatie..." -ForegroundColor Yellow

# Ga naar de juiste directory
Set-Location $PSScriptRoot

# Controleer of Node.js beschikbaar is
try {
    $nodeVersion = node --version
    Write-Host "Node.js versie: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js niet gevonden!" -ForegroundColor Red
    exit 1
}

# Controleer of sync-service.js bestaat
if (-not (Test-Path "sync-service.js")) {
    Write-Host "ERROR: sync-service.js niet gevonden!" -ForegroundColor Red
    exit 1
}

# Voer synchronisatie uit
Write-Host "Voer synchronisatie uit..." -ForegroundColor Yellow
node sync-service.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "Synchronisatie succesvol!" -ForegroundColor Green
    
    # Controleer of members.json is aangemaakt
    if (Test-Path "data/members.json") {
        $members = Get-Content "data/members.json" | ConvertFrom-Json
        Write-Host "Aantal leden gesynchroniseerd: $($members.Count)" -ForegroundColor Green
    }
    
    # Toon laatste log entries
    if (Test-Path "data/sync.log") {
        Write-Host "`nLaatste log entries:" -ForegroundColor Yellow
        Get-Content "data/sync.log" | Select-Object -Last 5
    }
} else {
    Write-Host "Synchronisatie gefaald!" -ForegroundColor Red
}

pause
