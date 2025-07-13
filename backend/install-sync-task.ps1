# PowerShell script om automatische synchronisatie elk uur in te stellen

# Controleer of PowerShell als administrator wordt uitgevoerd
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Dit script moet als administrator worden uitgevoerd!" -ForegroundColor Red
    Write-Host "Klik rechts op PowerShell en kies 'Run as administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

# Paden instellen
$scriptPath = $PSScriptRoot
$batchFile = Join-Path $scriptPath "schedule-sync.bat"
$taskName = "PEPsup-Sync-Hourly"

Write-Host "Installatie van automatische PEPsup synchronisatie..." -ForegroundColor Green
Write-Host "Script locatie: $scriptPath" -ForegroundColor Yellow

# Controleer of batch bestand bestaat
if (-not (Test-Path $batchFile)) {
    Write-Host "Fout: $batchFile niet gevonden!" -ForegroundColor Red
    Write-Host "Maak eerst het bestand schedule-sync.bat aan" -ForegroundColor Yellow
    pause
    exit 1
}

# Maak het batch bestand executable
try {
    $acl = Get-Acl $batchFile
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Everyone", "FullControl", "Allow")
    $acl.SetAccessRule($accessRule)
    Set-Acl -Path $batchFile -AclObject $acl
    Write-Host "Batch bestand permissies ingesteld" -ForegroundColor Green
} catch {
    Write-Host "Waarschuwing: Kon permissies niet instellen: $_" -ForegroundColor Yellow
}

try {
    # Verwijder bestaande taak als deze bestaat
    $existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-Host "Verwijder bestaande taak..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    }

    # Definieer actie (wat moet uitgevoerd worden)
    $action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$batchFile`"" -WorkingDirectory $scriptPath

    # Definieer trigger (elk uur) - OPLOSSING: Gebruik een redelijke duration
    # In plaats van 36500 dagen, gebruiken we 10 jaar = 3650 dagen
    $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Days 3650)

    # Definieer settings
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RunOnlyIfNetworkAvailable -StartWhenAvailable

    # Definieer principal (als systeem)
    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

    # Registreer de taak
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "Automatische synchronisatie van PEPsup ledenlijst elk uur"

    Write-Host "Taak '$taskName' succesvol geïnstalleerd!" -ForegroundColor Green
    Write-Host "De synchronisatie wordt nu elk uur uitgevoerd voor de komende 10 jaar" -ForegroundColor Green
    
    # Test de taak
    Write-Host "Test de taak nu..." -ForegroundColor Yellow
    
    # Controleer eerst of de taak bestaat voordat we hem proberen te starten
    $newTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($newTask) {
        Start-ScheduledTask -TaskName $taskName
        Write-Host "Taak gestart voor test" -ForegroundColor Green
    } else {
        Write-Host "Waarschuwing: Taak niet gevonden voor test" -ForegroundColor Yellow
    }
    
    Write-Host "Installatie voltooid!" -ForegroundColor Green
    Write-Host "Je kunt de taak bekijken in Windows Task Scheduler" -ForegroundColor Yellow
    
} catch {
    Write-Host "Fout bij installatie: $_" -ForegroundColor Red
    Write-Host "Controleer of alle bestanden aanwezig zijn en probeer opnieuw" -ForegroundColor Yellow
}

Write-Host "Druk op een toets om af te sluiten..."
pause
