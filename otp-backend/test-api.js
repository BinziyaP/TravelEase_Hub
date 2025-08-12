// API testing script
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api/auth';
const TEST_EMAIL = 'test@example.com';
const TEST_USER = {
    email: TEST_EMAIL,
    full_name: 'Test User',
    phone: '+1234567890',
    date_of_birth: '1990-01-01'
};

// Helper function to make API requests
const apiRequest = async (endpoint, data = null, method = 'GET') => {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const result = await response.json();
        
        return {
            status: response.status,
            data: result
        };
    } catch (error) {
        return {
            status: 0,
            data: { success: false, message: error.message }
        };
    }
};

// Test functions
const testHealthCheck = async () => {
    console.log('🔍 Testing health check...');
    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();
    
    if (data.success) {
        console.log('✅ Health check passed');
    } else {
        console.log('❌ Health check failed');
    }
    console.log('Response:', data);
    console.log('');
};

const testCheckEmail = async () => {
    console.log('🔍 Testing email check...');
    
    // Test valid email
    const result1 = await apiRequest('/check-email', { email: TEST_EMAIL }, 'POST');
    console.log('Valid email check:', result1);
    
    // Test invalid email
    const result2 = await apiRequest('/check-email', { email: 'invalid-email' }, 'POST');
    console.log('Invalid email check:', result2);
    
    console.log('');
};

const testSendOTP = async () => {
    console.log('🔍 Testing OTP sending...');
    
    const result = await apiRequest('/send-otp', TEST_USER, 'POST');
    console.log('Send OTP result:', result);
    
    if (result.data.success) {
        console.log('✅ OTP sent successfully');
        console.log('📧 Check your email for the OTP code');
        
        // Prompt for OTP input
        const readline = await import('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        return new Promise((resolve) => {
            rl.question('Enter the OTP you received: ', (otp) => {
                rl.close();
                resolve(otp);
            });
        });
    } else {
        console.log('❌ Failed to send OTP');
        return null;
    }
};

const testVerifyOTP = async (otp) => {
    if (!otp) {
        console.log('⏭️ Skipping OTP verification (no OTP provided)');
        return;
    }
    
    console.log('🔍 Testing OTP verification...');
    
    const result = await apiRequest('/verify-otp', {
        email: TEST_EMAIL,
        otp: otp
    }, 'POST');
    
    console.log('Verify OTP result:', result);
    
    if (result.data.success) {
        console.log('✅ OTP verification successful');
        console.log('👤 User created:', result.data.user);
    } else {
        console.log('❌ OTP verification failed');
    }
    
    console.log('');
};

const testInvalidOTP = async () => {
    console.log('🔍 Testing invalid OTP...');
    
    const result = await apiRequest('/verify-otp', {
        email: TEST_EMAIL,
        otp: '000000'
    }, 'POST');
    
    console.log('Invalid OTP result:', result);
    console.log('');
};

// Main test runner
const runTests = async () => {
    console.log('🧪 Starting API Tests\n');
    console.log('='.repeat(50));
    console.log('');
    
    try {
        // Test health check
        await testHealthCheck();
        
        // Test email checking
        await testCheckEmail();
        
        // Test OTP sending and get OTP from user
        const otp = await testSendOTP();
        
        // Test OTP verification
        await testVerifyOTP(otp);
        
        // Test invalid OTP
        await testInvalidOTP();
        
        console.log('='.repeat(50));
        console.log('🎉 All tests completed!');
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
};

// Check if server is running
const checkServer = async () => {
    try {
        const response = await fetch('http://localhost:3000/health');
        if (response.ok) {
            return true;
        }
    } catch (error) {
        return false;
    }
    return false;
};

// Start tests
const main = async () => {
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        console.log('❌ Server is not running on http://localhost:3000');
        console.log('Please start the server first with: npm run dev');
        process.exit(1);
    }
    
    await runTests();
    process.exit(0);
};

main();
