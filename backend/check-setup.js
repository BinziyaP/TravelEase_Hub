#!/usr/bin/env node

/**
 * Setup Status Checker for OTP Email Verification
 * This script checks if all components are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 TravelEase OTP Setup Status Check\n');

// Check .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'EMAIL_HOST',
    'EMAIL_USER', 
    'EMAIL_PASS',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET'
  ];
  
  const optionalVars = [
    'OTP_EXPIRY_MINUTES',
    'BCRYPT_ROUNDS'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`  ✅ ${varName} configured`);
    } else {
      console.log(`  ❌ ${varName} missing`);
    }
  });
  
  optionalVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`  ✅ ${varName} configured`);
    } else {
      console.log(`  ⚠️  ${varName} using default`);
    }
  });
} else {
  console.log('❌ .env file not found');
}

console.log();

// Check required files
const requiredFiles = [
  'routes/auth.js',
  'utils/emailService.js',
  'utils/otp.js',
  'config/supabase.js',
  'database/create-pending-users-table.sql'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log();

// Check package.json dependencies
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredDeps = [
    'express',
    'bcryptjs', 
    'jsonwebtoken',
    'nodemailer',
    '@supabase/supabase-js',
    'express-validator',
    'express-rate-limit'
  ];
  
  const dependencies = { ...packageContent.dependencies, ...packageContent.devDependencies };
  
  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`✅ ${dep} installed (${dependencies[dep]})`);
    } else {
      console.log(`❌ ${dep} not installed`);
    }
  });
} else {
  console.log('❌ package.json not found');
}

console.log();

// Frontend check
const frontendPath = path.join(__dirname, '..', 'vite-project', 'src', 'components', 'AuthModal.jsx');
if (fs.existsSync(frontendPath)) {
  console.log('✅ Frontend AuthModal.jsx found');
  
  const modalContent = fs.readFileSync(frontendPath, 'utf8');
  if (modalContent.includes('verify-email') && modalContent.includes('resend-otp')) {
    console.log('  ✅ OTP verification endpoints integrated');
  } else {
    console.log('  ❌ OTP verification not fully integrated');
  }
} else {
  console.log('❌ Frontend AuthModal.jsx not found');
}

console.log('\n📋 Next Steps:');
console.log('1. Execute the SQL migration in Supabase Dashboard');
console.log('2. Start backend: npm start');
console.log('3. Start frontend: cd ../vite-project && npm run dev'); 
console.log('4. Test registration with a real email address');
console.log('5. Run: node test-otp-flow.js (for automated testing)');

console.log('\n🎉 Setup check complete!');