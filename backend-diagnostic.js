const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 BACKEND DIAGNOSTIC TOOL');
console.log('=' * 50);
console.log('📅 Timestamp:', new Date().toISOString());

const runDiagnostic = () => {
    const results = {
        issues: [],
        recommendations: [],
        status: 'unknown'
    };

    // 1. Check Node.js version
    console.log('\n1️⃣ Checking Node.js version...');
    try {
        const nodeVersion = process.version;
        console.log(`✅ Node.js version: ${nodeVersion}`);

        const majorVersion = parseInt(nodeVersion.split('.')[0].slice(1));
        if (majorVersion < 14) {
            results.issues.push('Node.js version is too old');
            results.recommendations.push('Update Node.js to version 14 or higher');
        } else {
            console.log('✅ Node.js version is compatible');
        }
    } catch (error) {
        results.issues.push('Cannot determine Node.js version');
        console.error('❌ Error checking Node.js:', error.message);
    }

    // 2. Check if we're in the right directory
    console.log('\n2️⃣ Checking project structure...');
    const requiredFiles = ['package.json', 'server.js'];
    const optionalFiles = ['sync-service.js'];

    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ Found: ${file}`);
        } else {
            console.log(`❌ Missing: ${file}`);
            results.issues.push(`Missing required file: ${file}`);
        }
    });

    optionalFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ Found: ${file}`);
        } else {
            console.log(`⚠️ Optional file missing: ${file}`);
        }
    });

    // 3. Check package.json and dependencies
    console.log('\n3️⃣ Checking package.json and dependencies...');
    try {
        if (fs.existsSync('package.json')) {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            console.log(`✅ Package name: ${packageJson.name}`);

            const requiredDeps = ['express', 'cors'];
            const missing = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

            if (missing.length > 0) {
                console.log(`❌ Missing dependencies: ${missing.join(', ')}`);
                results.issues.push(`Missing dependencies: ${missing.join(', ')}`);
                results.recommendations.push('Run: npm install');
            } else {
                console.log('✅ Required dependencies found in package.json');
            }
        }
    } catch (error) {
        results.issues.push('Cannot read package.json');
        console.error('❌ Error reading package.json:', error.message);
    }

    // 4. Check node_modules
    console.log('\n4️⃣ Checking node_modules...');
    if (fs.existsSync('node_modules')) {
        console.log('✅ node_modules directory exists');

        // Check specific modules
        const requiredModules = ['express', 'cors'];
        requiredModules.forEach(module => {
            const modulePath = path.join('node_modules', module);
            if (fs.existsSync(modulePath)) {
                console.log(`✅ Module installed: ${module}`);
            } else {
                console.log(`❌ Module missing: ${module}`);
                results.issues.push(`Module not installed: ${module}`);
            }
        });
    } else {
        console.log('❌ node_modules directory missing');
        results.issues.push('node_modules directory missing');
        results.recommendations.push('Run: npm install');
    }

    // 5. Check data directory permissions
    console.log('\n5️⃣ Checking data directory and permissions...');
    const dataDir = 'data';
    try {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log('✅ Created data directory');
        } else {
            console.log('✅ Data directory exists');
        }

        // Test write permissions
        const testFile = path.join(dataDir, 'test-write.tmp');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log('✅ Data directory is writable');
    } catch (error) {
        console.log('❌ Cannot write to data directory');
        results.issues.push('Data directory is not writable');
        results.recommendations.push('Check file permissions or run as administrator');
    }

    // 6. Check port availability
    console.log('\n6️⃣ Checking port availability...');
    const net = require('net');
    const testPort = (port) => {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.listen(port, (err) => {
                if (err) {
                    resolve(false);
                } else {
                    server.close(() => resolve(true));
                }
            });
            server.on('error', () => resolve(false));
        });
    };

    testPort(3001).then(available => {
        if (available) {
            console.log('✅ Port 3001 is available');
        } else {
            console.log('❌ Port 3001 is in use');
            results.issues.push('Port 3001 is already in use');
            results.recommendations.push('Kill the process using port 3001 or use different port');
        }
    });

    // 7. Try to require all dependencies
    console.log('\n7️⃣ Testing module imports...');
    const testModules = ['express', 'cors', 'fs', 'path'];

    testModules.forEach(module => {
        try {
            require(module);
            console.log(`✅ Can import: ${module}`);
        } catch (error) {
            console.log(`❌ Cannot import: ${module}`);
            results.issues.push(`Cannot import module: ${module}`);
        }
    });

    // 8. Check sync-service specifically
    console.log('\n8️⃣ Testing sync-service...');
    try {
        if (fs.existsSync('sync-service.js')) {
            const syncService = require('./sync-service');
            if (typeof syncService.getMembers === 'function') {
                console.log('✅ sync-service.js loads correctly');
                try {
                    const members = syncService.getMembers();
                    console.log(`✅ sync-service returns ${members.length} members`);
                } catch (testError) {
                    console.log('⚠️ sync-service loads but test failed:', testError.message);
                }
            } else {
                console.log('⚠️ sync-service.js exists but missing getMembers function');
            }
        } else {
            console.log('⚠️ sync-service.js not found (will use fallback)');
        }
    } catch (error) {
        console.log('⚠️ sync-service.js has errors:', error.message);
        results.recommendations.push('Fix sync-service.js or remove it to use fallback');
    }

    // Summary
    console.log('\n' + '=' * 50);
    console.log('📋 DIAGNOSTIC SUMMARY');
    console.log('=' * 50);

    if (results.issues.length === 0) {
        console.log('🎉 No critical issues found!');
        console.log('✅ Backend should start successfully');
        results.status = 'ready';
    } else {
        console.log(`❌ Found ${results.issues.length} issue(s):`);
        results.issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
        });
        results.status = 'issues_found';
    }

    if (results.recommendations.length > 0) {
        console.log('\n💡 RECOMMENDATIONS:');
        results.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
        });
    }

    console.log('\n🚀 QUICK FIX COMMANDS:');
    console.log('   npm install                    # Install dependencies');
    console.log('   netstat -ano | findstr 3001    # Check what uses port 3001');
    console.log('   SET PORT=3002 && npm start     # Use different port');
    console.log('   node diagnostic.js             # Run this diagnostic again');

    return results;
};

// Run diagnostic if called directly
if (require.main === module) {
    runDiagnostic();
}

module.exports = { runDiagnostic };
