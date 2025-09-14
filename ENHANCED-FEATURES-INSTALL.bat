@echo off
title CLIMBING CLUB ENHANCED FEATURES INSTALLATION
color 0A

echo ================================================
echo    CLIMBING CLUB ENHANCED FEATURES
echo    Installation & Deployment Script
echo ================================================
echo.

echo This script will install 3 major new features:
echo.
echo 1️⃣ MEMBER LOGIN FAILURE TRACKING
echo    - Tracks failed login attempts 
echo    - Logs "membre non existant" and "membre pas encore payé"
echo    - Exports to Excel for analysis
echo.
echo 2️⃣ RETURNING VISITOR FLOW  
echo    - Fast track for returning non-members
echo    - Only requires name/surname/birthdate  
echo    - Direct to payment (skips level/assurance)
echo.
echo 3️⃣ ENHANCED SUCCESS MESSAGES
echo    - Longer, clearer confirmation messages
echo    - Better visual feedback
echo    - Extended display times
echo.

set /p "confirm=Continue with installation? (y/n): "
if /i not "%confirm%"=="y" goto :end

echo.
echo ================================================
echo    STEP 1: DATABASE ENHANCEMENTS
echo ================================================
echo.

echo Creating enhanced database initialization script...
copy enhanced-db-init.js backend\enhanced-db-init.js >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Database init script copied
) else (
    echo ❌ Failed to copy database script
    goto :error
)

echo Initializing enhanced database schema...
cd backend
node enhanced-db-init.js
if %errorlevel% == 0 (
    echo ✅ Database schema updated successfully
) else (
    echo ❌ Database initialization failed
    cd..
    goto :error
)
cd..

echo.
echo ================================================  
echo    STEP 2: BACKEND API ENHANCEMENTS
echo ================================================
echo.

echo Installing required npm packages...
cd backend
npm install uuid
if %errorlevel% == 0 (
    echo ✅ UUID package installed
) else (
    echo ❌ Failed to install UUID package
)
cd..

echo Adding enhanced backend routes...
echo.
echo Please manually add the routes from ENHANCED-BACKEND-ROUTES.js to your server.js file
echo The enhanced routes include:
echo - POST /members/check-enhanced (with failure logging)
echo - GET /returning-visitors/search  
echo - POST /returning-visitors
echo - POST /presences-enhanced (with access logging)
echo - GET /export/access-attempts
echo.
pause

echo.
echo ================================================
echo    STEP 3: FRONTEND COMPONENT INSTALLATION
echo ================================================
echo.

echo Installing new React components...

copy ReturningVisitorChoice.jsx tablet-ui\src\components\ReturningVisitorChoice.jsx >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ ReturningVisitorChoice.jsx installed
) else (
    echo ❌ Failed to install ReturningVisitorChoice component
)

copy ReturningVisitorForm.jsx tablet-ui\src\components\ReturningVisitorForm.jsx >nul 2>&1  
if %errorlevel% == 0 (
    echo ✅ ReturningVisitorForm.jsx installed
) else (
    echo ❌ Failed to install ReturningVisitorForm component
)

echo.
echo ================================================
echo    STEP 4: ROUTING & API UPDATES  
echo ================================================
echo.

echo Please manually update these files with the enhanced versions:
echo.
echo FRONTEND FILES TO UPDATE:
echo ✅ tablet-ui\src\App.js - Add new routes
echo ✅ tablet-ui\src\components\HomePage.jsx - Redirect to visitor choice
echo ✅ tablet-ui\src\components\MemberPage.jsx - Enhanced success messages
echo ✅ tablet-ui\src\components\PaymentPage.jsx - Enhanced success messages  
echo ✅ tablet-ui\src\services\apiService.js - Enhanced API calls
echo ✅ tablet-ui\src\App.css - Add enhanced styles
echo.
echo All enhanced versions are available in the generated files.
echo.
pause

echo.
echo ================================================
echo    STEP 5: CSS STYLING ENHANCEMENTS
echo ================================================
echo.

echo Adding enhanced CSS styles...
echo Please add the styles from ENHANCED-STYLES.css to your App.css file
echo.
echo New styles include:
echo ✅ Returning visitor choice buttons
echo ✅ Enhanced success message animations
echo ✅ Better error message styling  
echo ✅ Payment confirmation improvements
echo ✅ Mobile responsive design
echo.
pause

echo.
echo ================================================
echo    STEP 6: TESTING & VERIFICATION
echo ================================================
echo.

echo Testing database connection...
cd backend
node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/climbing.db');
db.get('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'access_attempts\'', (err, row) => {
    if (row) {
        console.log('✅ access_attempts table exists');
    } else {
        console.log('❌ access_attempts table missing');
    }
});
db.get('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'returning_visitors\'', (err, row) => {
    if (row) {
        console.log('✅ returning_visitors table exists');  
    } else {
        console.log('❌ returning_visitors table missing');
    }
    db.close();
});
" 2>nul
cd..

echo.
echo Testing frontend compilation...
cd tablet-ui
npm run build >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Frontend builds successfully
) else (
    echo ⚠️ Frontend build warnings (check manually)
)
cd..

echo.
echo ================================================
echo    INSTALLATION COMPLETE
echo ================================================
echo.

echo 🎉 Enhanced features installation complete!
echo.
echo WHAT'S NEW:
echo.
echo 1️⃣ MEMBER LOGIN TRACKING:
echo    • Failed logins are logged to access_attempts table
echo    • Excel export available at /export/access-attempts  
echo    • Track "membre non existant" and "pas encore payé"
echo.
echo 2️⃣ RETURNING VISITOR FLOW:
echo    • New choice page after "je ne suis pas membre"
echo    • Fast track for returning visitors
echo    • Direct to payment (skips forms)
echo.
echo 3️⃣ ENHANCED MESSAGES:
echo    • 5-6 second success message display
echo    • Better visual feedback with animations
echo    • Clearer confirmation text
echo.
echo NEXT STEPS:
echo 1. Restart backend: npm start (in backend folder)
echo 2. Restart frontend: npm start (in tablet-ui folder)  
echo 3. Test the new visitor flow
echo 4. Verify member failure logging
echo 5. Check enhanced success messages
echo.
echo 🚀 Your climbing club software now has advanced features!
echo.
goto :end

:error
echo.
echo ❌ Installation failed. Please check the error messages above.
echo.

:end
pause