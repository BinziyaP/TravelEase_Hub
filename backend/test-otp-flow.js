#!/usr/bin/env node

/**
 * Test script for OTP Email Verification Flow
 * This script tests the complete OTP verification flow
 * 
 * Usage: node test-otp-flow.js
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api/auth';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = 'Test User';

async function testOTPFlow() {
  console.log('🚀 Starting OTP Flow Test...\n');

  try {
    // Step 1: Register user (should send OTP)
    console.log('📝 Step 1: Register user...');
    const registerResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD
      })
    });

    const registerData = await registerResponse.json();
    console.log(`Status: ${registerResponse.status}`);
    console.log(`Response:`, registerData);

    if (registerResponse.ok) {
      console.log('✅ Registration successful - OTP should be sent to email\n');
    } else {
      console.log('❌ Registration failed\n');
      return;
    }

    // Step 2: Try to login without verification (should fail)
    console.log('🔐 Step 2: Try login without verification...');
    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });

    const loginData = await loginResponse.json();
    console.log(`Status: ${loginResponse.status}`);
    console.log(`Response:`, loginData);

    if (!loginResponse.ok && loginData.requiresVerification) {
      console.log('✅ Login correctly blocked - email verification required\n');
    } else {
      console.log('❌ Login should have been blocked\n');
    }

    // Step 3: Test resend OTP
    console.log('📬 Step 3: Test resend OTP...');
    const resendResponse = await fetch(`${BASE_URL}/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL
      })
    });

    const resendData = await resendResponse.json();
    console.log(`Status: ${resendResponse.status}`);
    console.log(`Response:`, resendData);

    if (resendResponse.ok) {
      console.log('✅ OTP resend successful\n');
    } else {
      console.log('❌ OTP resend failed\n');
    }

    // Step 4: Test verify with wrong OTP (should fail)
    console.log('🔍 Step 4: Test verify with wrong OTP...');
    const wrongVerifyResponse = await fetch(`${BASE_URL}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        otp: '123456'  // Wrong OTP
      })
    });

    const wrongVerifyData = await wrongVerifyResponse.json();
    console.log(`Status: ${wrongVerifyResponse.status}`);
    console.log(`Response:`, wrongVerifyData);

    if (!wrongVerifyResponse.ok) {
      console.log('✅ Wrong OTP correctly rejected\n');
    } else {
      console.log('❌ Wrong OTP should have been rejected\n');
    }

    // Note: For Step 5 (verify with correct OTP), you'd need the actual OTP from email
    console.log('📧 To complete the test, check your email for the OTP and run:');
    console.log(`curl -X POST ${BASE_URL}/verify-email \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"email":"${TEST_EMAIL}","otp":"XXXXXX"}'`);
    console.log('\nThen test login again with the same credentials.\n');

    console.log('🎉 OTP Flow Test Complete!\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testOTPFlow();
}

module.exports = { testOTPFlow };