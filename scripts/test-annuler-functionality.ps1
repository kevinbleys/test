# Script om de nieuwe annuler functionaliteit te testen

Write-Host "=== TEST ANNULER FUNCTIONALITEIT ===" -ForegroundColor Cyan

# Check of backend draait
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000" -TimeoutSec 5 -UseBasicParsing
    Write-Host "Backend is actief" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Backend niet actief op port 4000!" -ForegroundColor Red
    exit 1
}

Write-Host "`nTesting annuler functionality..." -ForegroundColor Yellow

# Registreer eerst een test adherent
Write-Host "1. Registreer een test-adherent..." -ForegroundColor Gray
$testData = @{
    type = "adherent"
    nom = "test"
    prenom = "annuler"
} | ConvertTo-Json

try {
    $presenceResponse = Invoke-RestMethod -Uri "http://localhost:4000/presences" -Method Post -Body $testData -ContentType "application/json"
    
    if ($presenceResponse.success) {
        $presenceId = $presenceResponse.presence.id
        Write-Host "   Test-adherent geregistreerd met ID: $presenceId" -ForegroundColor Green
        
        # Voeg een tarief toe
        Write-Host "2. Voeg tarief van 5€ toe..." -ForegroundColor Gray
        $tarifData = @{ montant = 5 } | ConvertTo-Json
        $tarifResponse = Invoke-RestMethod -Uri "http://localhost:4000/presences/$presenceId/ajouter-tarif" -Method Post -Body $tarifData -ContentType "application/json"
        
        if ($tarifResponse.success) {
            Write-Host "   Tarief toegevoegd: 5€" -ForegroundColor Green
            
            # Test annulering
            Write-Host "3. Test annulering (tarief moet op 0 komen)..." -ForegroundColor Gray
            $annulerResponse = Invoke-RestMethod -Uri "http://localhost:4000/presences/$presenceId/annuler" -Method Post -ContentType "application/json"
            
            if ($annulerResponse.success) {
                $updatedPresence = $annulerResponse.presence
                
                Write-Host "`nResultaat:" -ForegroundColor Cyan
                Write-Host "   Status: $($updatedPresence.status)" -ForegroundColor White
                Write-Host "   Tarief: $($updatedPresence.tarif)€" -ForegroundColor White
                Write-Host "   Origineel tarief: $($updatedPresence.tarifOriginal)€" -ForegroundColor White
                
                if ($updatedPresence.status -eq "Annulé" -and $updatedPresence.tarif -eq 0) {
                    Write-Host "`n✅ TEST GESLAAGD: Annulering zet tarief correct op 0€!" -ForegroundColor Green
                } else {
                    Write-Host "`n❌ TEST GEFAALD: Tarief niet correct op 0 gezet" -ForegroundColor Red
                }
            } else {
                Write-Host "   FAILED: Annulering gefaald" -ForegroundColor Red
            }
        } else {
            Write-Host "   FAILED: Tarief toevoegen gefaald" -ForegroundColor Red
        }
    } else {
        Write-Host "   FAILED: Test-adherent registratie gefaald" -ForegroundColor Red
    }
} catch {
    Write-Host "Test gefaald met error: $_" -ForegroundColor Red
}

Write-Host "`nOpen de admin interface om het resultaat visueel te controleren:" -ForegroundColor Yellow
Write-Host "http://localhost:4000/admin" -ForegroundColor Cyan

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
