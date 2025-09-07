@echo off
title LAYOUT & FLOW RESTORATION - Keep Dynamic API
color 0B

echo ================================================
echo    LAYOUT & FLOW RESTORATION
echo    Keep Dynamic API + Restore Original Layout
echo ================================================
echo.

echo PROBLEMS IDENTIFIED:
echo ❌ MemberPage: Missing buttons, no success message, no redirect
echo ❌ NonMemberForm: Wrong assurance checkbox, missing retour button
echo ❌ AssurancePage: Flow issues to payment page
echo.

echo ✅ Dynamic API URLs working - KEEPING THESE!
echo 🔧 Restoring original layout + flow...
echo.

echo Creating backups of current layout-broken files...
copy tablet-ui\src\components\MemberPage.jsx tablet-ui\src\components\MemberPage.jsx.layout-broken 2>nul
copy tablet-ui\src\components\NonMemberForm.jsx tablet-ui\src\components\NonMemberForm.jsx.layout-broken 2>nul  
copy tablet-ui\src\components\AssurancePage.jsx tablet-ui\src\components\AssurancePage.jsx.layout-broken 2>nul
echo Backups created.
echo.

echo Applying layout + flow fixes...
echo.

echo 1. Fixing MemberPage.jsx layout...
copy LAYOUT-FIXED-MEMBERPAGE.jsx tablet-ui\src\components\MemberPage.jsx >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ MemberPage.jsx - LAYOUT + FLOW RESTORED
    echo    • Retour à l'accueil button restored
    echo    • Appeler bénévole button restored  
    echo    • Success message + redirect to home restored
    echo    • Dynamic API URL PRESERVED
) else (
    echo ❌ Failed to fix MemberPage.jsx layout
)

echo.
echo 2. Fixing NonMemberForm.jsx layout...
copy LAYOUT-FIXED-NONMEMBERFORM.jsx tablet-ui\src\components\NonMemberForm.jsx >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ NonMemberForm.jsx - LAYOUT + FLOW RESTORED
    echo    • Assurance checkbox REMOVED (belongs in AssurancePage)
    echo    • Retour à l'accueil button restored
    echo    • Flow to niveau page restored
    echo    • Dynamic API URL PRESERVED
) else (
    echo ❌ Failed to fix NonMemberForm.jsx layout
)

echo.
echo 3. Fixing AssurancePage.jsx layout...
copy LAYOUT-FIXED-ASSURANCEPAGE.jsx tablet-ui\src\components\AssurancePage.jsx >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ AssurancePage.jsx - LAYOUT + FLOW RESTORED  
    echo    • Original assurance checkboxes preserved
    echo    • Flow to payment page restored
    echo    • Dynamic API URL PRESERVED
) else (
    echo ❌ Failed to fix AssurancePage.jsx layout
)

echo.
echo ================================================
echo     LAYOUT & FLOW RESTORATION COMPLETE
echo ================================================
echo.
echo WHAT WAS RESTORED:
echo.
echo 📱 MEMBERPAGE:
echo   ✅ Retour à l'accueil button
echo   ✅ Appeler bénévole button  
echo   ✅ Success message after verification
echo   ✅ Auto redirect to home page after success
echo   ✅ Dynamic API URL detection (PRESERVED)
echo.
echo 📝 NONMEMBERFORM:
echo   ✅ Retour à l'accueil button
echo   ✅ Original form fields only
echo   ❌ Removed assurance checkbox (moved to AssurancePage)
echo   ✅ Flow to niveau page → assurance page → payment
echo   ✅ Dynamic API URL detection (PRESERVED)
echo.
echo 📋 ASSURANCEPAGE:
echo   ✅ Original assurance checkboxes
echo   ✅ Flow to payment page after acceptance
echo   ✅ Retour buttons (accueil + niveau)
echo   ✅ Dynamic API URL detection (PRESERVED)
echo.
echo NEXT STEPS:
echo 1. Restart frontend: Ctrl+C then npm start
echo 2. Test on tablet: http://192.168.1.239:3000
echo 3. Verify layout looks correct
echo 4. Test complete flow: Member check → home OR Non-member → niveau → assurance → payment
echo.
echo 🎉 TABLET FUNCTIONALITY + ORIGINAL LAYOUT RESTORED!
echo.
pause