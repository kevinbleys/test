# Script om te testen of het display probleem is opgelost

Write-Host "=== VERIFICATIE TARIEF DISPLAY FIX ===" -ForegroundColor Cyan

# Check of backend draait
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000" -TimeoutSec 5 -UseBasicParsing
    Write-Host "Backend is actief" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Backend niet actief op port 4000!" -ForegroundColor Red
    exit 1
}

Write-Host "`nOpenen van admin interface..." -ForegroundColor Yellow
Start-Process "http://localhost:4000/admin"

Write-Host "`nControleer het volgende in de admin interface:" -ForegroundColor Cyan
Write-Host "1. Steven Carru (adherent) toont '-' in plaats van 10€" -ForegroundColor White
Write-Host "2. Non-adherents tonen nog steeds hun tarief (10€)" -ForegroundColor White
Write-Host "3. Alleen adherents MET een tarif tonen een bedrag" -ForegroundColor White

Write-Host "`nTest ook door een nieuwe adherent te registreren:" -ForegroundColor Yellow
Write-Host "http://localhost:3001 - registreer een lid" -ForegroundColor White
Write-Host "Controleer daarna of deze GEEN 10€ toont in admin" -ForegroundColor White

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
