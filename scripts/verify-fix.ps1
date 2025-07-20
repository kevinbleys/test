# Verificatie script om te controleren of de fix werkt

Write-Host "=== VERIFICATIE SCRIPT ===" -ForegroundColor Cyan

function Test-AdherentRegistration {
    Write-Host "`nTesting adherent registration..." -ForegroundColor Yellow
    
    # Test data voor Kevin Bleys (adherent)
    $testData = @{
        type = "adherent"
        nom = "bleys"
        prenom = "kevin"
    } | ConvertTo-Json
    
    try {
        # 1. Test member check
        Write-Host "1. Testing member validation..." -ForegroundColor Gray
        $checkResponse = Invoke-RestMethod -Uri "http://localhost:4000/members/check?nom=bleys&prenom=kevin" -Method Get
        
        if ($checkResponse.success) {
            Write-Host "   checkmark Member found and validated" -ForegroundColor Green
            
            # 2. Test presence registration
            Write-Host "2. Testing presence registration..." -ForegroundColor Gray
            $presenceResponse = Invoke-RestMethod -Uri "http://localhost:4000/presences" -Method Post -Body $testData -ContentType "application/json"
            
            if ($presenceResponse.success) {
                $presence = $presenceResponse.presence
                
                Write-Host "   checkmark Presence registered successfully" -ForegroundColor Green
                Write-Host "   ID: $($presence.id)" -ForegroundColor White
                Write-Host "   Type: $($presence.type)" -ForegroundColor White
                Write-Host "   Status: $($presence.status)" -ForegroundColor White
                
                # KRITIEKE CHECK: Geen tarif field
                if ($presence.PSObject.Properties.Name -contains "tarif") {
                    Write-Host "   X ERROR: Tarif field found! Value: $($presence.tarif)" -ForegroundColor Red
                    return $false
                } else {
                    Write-Host "   checkmark SUCCESS: No tarif field found for adherent!" -ForegroundColor Green
                    return $true
                }
            } else {
                Write-Host "   X ERROR: Presence registration failed" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "   X ERROR: Member validation failed: $($checkResponse.error)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "   X ERROR: Request failed: $_" -ForegroundColor Red
        return $false
    }
}

function Test-NonAdherentRegistration {
    Write-Host "`nTesting non-adherent registration..." -ForegroundColor Yellow
    
    # Test data voor non-adherent
    $testData = @{
        type = "non-adherent"
        nom = "test"
        prenom = "user"
        email = "test@example.com"
        dateNaissance = "1990-01-01"
    } | ConvertTo-Json
    
    try {
        $presenceResponse = Invoke-RestMethod -Uri "http://localhost:4000/presences" -Method Post -Body $testData -ContentType "application/json"
        
        if ($presenceResponse.success) {
            $presence = $presenceResponse.presence
            
            Write-Host "   checkmark Non-adherent registered successfully" -ForegroundColor Green
            
            # CHECK: Moet wel tarif hebben
            if ($presence.PSObject.Properties.Name -contains "tarif" -and $presence.tarif -eq 10) {
                Write-Host "   checkmark SUCCESS: Tarif correctly set to 10 for non-adherent!" -ForegroundColor Green
                return $true
            } else {
                Write-Host "   X ERROR: Tarif missing or incorrect for non-adherent" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "   X ERROR: Non-adherent registration failed" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "   X ERROR: Request failed: $_" -ForegroundColor Red
        return $false
    }
}

# Check if services are running
Write-Host "Checking if services are running..." -ForegroundColor Yellow

$port4000 = netstat -ano | findstr :4000
$port3001 = netstat -ano | findstr :3001

if (-not $port4000) {
    Write-Host "ERROR: Backend niet actief op port 4000!" -ForegroundColor Red
    Write-Host "Start eerst de backend service" -ForegroundColor Yellow
    exit 1
}

if (-not $port3001) {
    Write-Host "WARNING: Tablet-UI niet actief op port 3001!" -ForegroundColor Yellow
}

# Run tests
$adherentTest = Test-AdherentRegistration
$nonAdherentTest = Test-NonAdherentRegistration

Write-Host "`n=== RESULTATEN ===" -ForegroundColor Cyan

if ($adherentTest) {
    Write-Host "checkmark ADHERENT TEST: PASSED" -ForegroundColor Green
} else {
    Write-Host "X ADHERENT TEST: FAILED" -ForegroundColor Red
}

if ($nonAdherentTest) {
    Write-Host "checkmark NON-ADHERENT TEST: PASSED" -ForegroundColor Green
} else {
    Write-Host "X NON-ADHERENT TEST: FAILED" -ForegroundColor Red
}

if ($adherentTest -and $nonAdherentTest) {
    Write-Host "`nparty ALLE TESTS GESLAAGD! Het probleem is opgelost!" -ForegroundColor Green
} else {
    Write-Host "`nwarning SOMMIGE TESTS GEFAALD. Check de code opnieuw." -ForegroundColor Red
}

Write-Host "`nDruk op een toets om af te sluiten..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
