# Script om het tarief display probleem definitief op te lossen

Write-Host "=== TARIEF DISPLAY FIX ===" -ForegroundColor Cyan
Write-Host "Probleem: Adherents tonen 10 euro in admin interface" -ForegroundColor Yellow
Write-Host "Oplossing: Pas admin.html tarief display logica aan" -ForegroundColor Green

$BackendPath = "C:\Users\kevin\Documents\beyrede_escalade\backend"
$AdminHtmlPath = Join-Path $BackendPath "public\admin.html"

# Controleer of admin.html bestaat
if (-not (Test-Path $AdminHtmlPath)) {
    Write-Host "ERROR: admin.html niet gevonden op $AdminHtmlPath" -ForegroundColor Red
    exit 1
}

Write-Host "`nMaak backup van huidige admin.html..." -ForegroundColor Yellow
$BackupPath = $AdminHtmlPath.Replace(".html", "_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').html")
Copy-Item $AdminHtmlPath $BackupPath
Write-Host "Backup gemaakt: $BackupPath" -ForegroundColor Green

Write-Host "`nVervang admin.html met gefifte versie..." -ForegroundColor Yellow
Write-Host "BELANGRIJK: Kopieer de nieuwe admin.html code handmatig!" -ForegroundColor Red
Write-Host "De getTarifDisplay functie is aangepast om adherents zonder tarif '-' te tonen" -ForegroundColor Green

Write-Host "`nTest stappen:" -ForegroundColor Cyan
Write-Host "1. Vervang admin.html met de nieuwe code" -ForegroundColor White
Write-Host "2. Herstart backend: node server.js" -ForegroundColor White  
Write-Host "3. Ga naar http://localhost:4000/admin" -ForegroundColor White
Write-Host "4. Adherents zonder tarif tonen nu '-' in plaats van 10€" -ForegroundColor White

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
