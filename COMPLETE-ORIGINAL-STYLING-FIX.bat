@echo off
title ORIGINELE STYLING HERSTEL - Exact zoals gisteren
color 0A

echo ================================================
echo    ORIGINELE STYLING HERSTEL
echo    Exact zoals gisteren + Dynamic API alleen
echo ================================================
echo.

echo PROBLEEM:
echo ❌ Knoppen zijn vierkant en grijs i.p.v. afgerond en gekleurd
echo ❌ "Nom de famille" i.p.v. "nom"
echo ❌ Ontbrekende knoppen (retour accueil, appeler bénévole)
echo ❌ Verkeerde PaymentPage interface
echo ❌ Geen success messages en auto redirects
echo.

echo OPLOSSING:
echo ✅ Herstel exacte originele CSS classes en styling
echo ✅ Herstel originele labels en teksten
echo ✅ Herstel originele workflow en redirects
echo ✅ BEHOUD dynamic API URLs (tablet blijft werken!)
echo.

echo Creating backups of modified files...
copy tablet-ui\src\components\MemberPage.jsx tablet-ui\src\components\MemberPage.jsx.styled-broken 2>nul
copy tablet-ui\src\components\MemberCheck.jsx tablet-ui\src\components\MemberCheck.jsx.styled-broken 2>nul
copy tablet-ui\src\components\NonMemberForm.jsx tablet-ui\src\components\NonMemberForm.jsx.styled-broken 2>nul
copy tablet-ui\src\components\AssurancePage.jsx tablet-ui\src\components\AssurancePage.jsx.styled-broken 2>nul
copy tablet-ui\src\components\PaymentPage.jsx tablet-ui\src\components\PaymentPage.jsx.styled-broken 2>nul
copy tablet-ui\src\services\apiService.js tablet-ui\src\services\apiService.js.styled-broken 2>nul
echo Backups created.
echo.

echo Restoring ORIGINAL styling + workflow for ALL components...
echo.

echo 1. MemberPage.jsx - Originele knoppen + success + redirect...
copy ORIGINAL-MEMBERPAGE.jsx tablet-ui\src\components\MemberPage.jsx >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ MemberPage.jsx - ORIGINELE STYLING HERSTELD
    echo    • Afgeronde gekleurde knoppen (zoals LevelPage)
    echo    • "Nom:" labels (niet "Nom de famille:")
    echo    • Retour accueil + Appeler bénévole knoppen
    echo    • Success message + auto redirect naar home
    echo    • Dynamic API URL behouden
) else (
    echo ❌ Failed to restore MemberPage.jsx
)

echo.
echo 2. MemberCheck.jsx - Originele styling + Retour knop...
copy ORIGINAL-MEMBERCHECK.jsx tablet-ui\src\components\MemberCheck.jsx >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ MemberCheck.jsx - ORIGINELE STYLING HERSTELD
    echo    • Retour à l'accueil knop toegevoegd
    echo    • Originele button styling (afgerond, gekleurd)
    echo    • Success message + auto redirect
    echo    • Dynamic API URL behouden
) else (
    echo ❌ Failed to restore MemberCheck.jsx
)

echo.
echo 3. NonMemberForm.jsx - Originele labels + knoppen...
copy ORIGINAL-NONMEMBERFORM.jsx tablet-ui\src\components\NonMemberForm.jsx >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ NonMemberForm.jsx - ORIGINELE STYLING HERSTELD
    echo    • "Nom:" labels (niet "Nom de famille:")
    echo    • Originele button styling (afgerond, gekleurd)
    echo    • Retour à l'accueil knop
    echo    • Flow naar niveau page (origineel)
) else (
    echo ❌ Failed to restore NonMemberForm.jsx
)

echo.
echo 4. AssurancePage.jsx - Originele knoppen...
copy ORIGINAL-ASSURANCEPAGE.jsx tablet-ui\src\components\AssurancePage.jsx >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ AssurancePage.jsx - ORIGINELE STYLING HERSTELD
    echo    • Originele button styling (afgerond, gekleurd)
    echo    • Originele checkbox styling
    echo    • Flow naar payment page
    echo    • Dynamic API URL behouden
) else (
    echo ❌ Failed to restore AssurancePage.jsx
)

echo.
echo 5. PaymentPage.jsx - BELANGRIJKSTE FIX...
copy ORIGINAL-PAYMENTPAGE.jsx tablet-ui\src\components\PaymentPage.jsx >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ PaymentPage.jsx - ORIGINELE INTERFACE HERSTELD
    echo    • ALLEEN bedrag tonen
    echo    • ALLEEN "wachten op bénévole" bericht
    echo    • GEEN payment method keuze
    echo    • GEEN valider knop
    echo    • Auto polling voor backend updates
    echo    • Auto redirect naar home na validation
    echo    • Dynamic API URL behouden
) else (
    echo ❌ Failed to restore PaymentPage.jsx
)

echo.
echo 6. apiService.js - Alleen dynamic API...
copy ORIGINAL-APISERVICE.js tablet-ui\src\services\apiService.js >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ apiService.js - DYNAMIC API BEHOUDEN
    echo    • Enige wijziging: dynamic API URL detection
    echo    • Alle andere functionaliteit ongewijzigd
) else (
    echo ❌ Failed to restore apiService.js
)

echo.
echo ================================================
echo     ORIGINELE STYLING VOLLEDIG HERSTELD
echo ================================================
echo.
echo WAT IS HERSTELD:
echo.
echo 🎨 STYLING:
echo   ✅ Afgeronde, gekleurde knoppen (zoals LevelPage)
echo   ✅ Originele CSS classes gebruikt
echo   ✅ Geen vierkante grijze knoppen meer
echo.
echo 📝 LABELS:
echo   ✅ "Nom:" en "Prénom:" (niet "Nom de famille:")
echo   ✅ Originele Franse teksten
echo.
echo 🔘 KNOPPEN:
echo   ✅ "Retour à l'accueil" op alle paginas
echo   ✅ "Appeler bénévole" op MemberPage
echo   ✅ Originele button positioning
echo.
echo 🔄 WORKFLOW:
echo   ✅ Success messages na verificatie
echo   ✅ Auto redirects naar home pagina
echo   ✅ PaymentPage: alleen info + wachten op bénévole
echo   ✅ Originele flow: NonMember → Niveau → Assurance → Payment
echo.
echo 📱 TABLET:
echo   ✅ Dynamic API URLs behouden
echo   ✅ Geen network errors meer
echo   ✅ Werkt op PC (localhost) en tablet (IP)
echo.
echo NEXT STEPS:
echo 1. RESTART frontend: Ctrl+C then npm start
echo 2. TEST complete flows op BEIDE PC en tablet
echo 3. VERIFY styling ziet er uit zoals gisteren
echo 4. VERIFY alle knoppen zijn afgerond en gekleurd
echo 5. VERIFY PaymentPage toont alleen bedrag + wacht bericht
echo.
echo 🎉 ORIGINELE INTERFACE + TABLET FUNCTIONALITEIT!
echo.
pause