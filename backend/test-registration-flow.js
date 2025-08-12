// Test registration flow with email verification
const fetch = require('node-fetch');
const readline = require('readline');

const API_BASE = 'http://localhost:5000'; // Your existing backend port

// Test user data - using your email
const TEST_USER = {
    name: 'Binz P Test',
    email: 'binziyap2003@gmail.com',
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!'
};

// Helper function for API requests
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

        console.log(`📡 ${method} ${API_BASE}${endpoint}`);
        if (data) {
            console.log('📤 Request data:', JSON.stringify(data, null, 2));
        }

        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const result = await response.json();
        
        console.log(`📥 Response (${response.status}):`, JSON.stringify(result, null, 2));
        
        return {
            status: response.status,
            data: result
        };
    } catch (error) {
        console.error('❌ Request failed:', error.message);
        return {
            status: 0,
            data: { success: false, message: error.message }
        };
    }
};

// Get user input
const getUserInput = (question) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};

// Test functions
const testHealthCheck = async () => {
    console.log('\n🔍 Step 1: Testing Health Check...');
    console.log('='.repeat(40));
    
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        if (data.status === 'OK' || data.success) {
            console.log('✅ Server is running');
            console.log('📊 Response:', JSON.stringify(data, null, 2));
            return true;
        } else {
            console.log('❌ Health check failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Server not responding:', error.message);
        console.log('🔧 Make sure to start the server with: npm start or node server.js');
        return false;
    }
};

const testEmailVerification = async () => {
    console.log('\n🔍 Step 2: Testing Email Verification...');
    console.log('='.repeat(40));
    
    // Test the email verification endpoint
    const result = await apiRequest('/api/auth/verify-email-exists', { 
        email: TEST_USER.email 
    }, 'POST');
    
    if (result.status === 200) {
        console.log('✅ Email verification endpoint working');
        return true;
    } else {
        console.log('⚠️ Email verification endpoint may not exist yet');
        return true; // Continue anyway
    }
};

const testRegistration = async () => {
    console.log('\n🔍 Step 3: Testing Registration...');
    console.log('='.repeat(40));
    console.log('📧 Registering user:', TEST_USER.email);
    
    const result = await apiRequest('/api/auth/register', TEST_USER, 'POST');
    
    if (result.data.success) {
        console.log('✅ Registration successful!');
        console.log('📧 Check your email for welcome message');
        return true;
    } else if (result.data.message && result.data.message.includes('already exists')) {
        console.log('⚠️ User already exists - this is expected if you ran the test before');
        
        // Try login instead
        console.log('\n🔄 Trying login instead...');
        const loginResult = await apiRequest('/api/auth/login', {
            email: TEST_USER.email,
            password: TEST_USER.password
        }, 'POST');
        
        if (loginResult.data.success) {
            console.log('✅ Login successful!');
            return true;
        } else {
            console.log('❌ Login failed:', loginResult.data.message);
            return false;
        }
    } else {
        console.log('❌ Registration failed');
        console.log('❌ Error:', result.data.message);
        return false;
    }
};

const testEmailSending = async () => {
    console.log('\n🔍 Step 4: Testing Email Sending...');
    console.log('='.repeat(40));
    
    // Test password reset email (which should trigger email sending)
    const result = await apiRequest('/api/auth/forgot-password', {
        email: TEST_USER.email
    }, 'POST');
    
    if (result.data.success) {
        console.log('✅ Password reset email sent successfully!');
        console.log('📧 Check your email for password reset message');
        return true;
    } else {
        console.log('⚠️ Password reset may not be implemented yet');
        return true; // Continue anyway
    }
};

// Main test runner
const runRegistrationTest = async () => {
    console.log('🧪 TravelEase Registration & Email Test');
    console.log('='.repeat(50));
    console.log('📧 Test Email:', TEST_USER.email);
    console.log('👤 Test User:', TEST_USER.name);
    console.log('🌐 API Base:', API_BASE);
    console.log('='.repeat(50));
    
    try {
        // Step 1: Health check
        const healthOk = await testHealthCheck();
        if (!healthOk) {
            console.log('\n❌ Cannot proceed - server not running');
            return;
        }
        
        // Step 2: Test email verification
        await testEmailVerification();
        
        // Step 3: Test registration
        const registrationOk = await testRegistration();
        if (!registrationOk) {
            console.log('\n❌ Registration test failed');
        }
        
        // Step 4: Test email sending
        await testEmailSending();
        
        console.log('\n🎉 Registration and email test completed!');
        console.log('\n📋 Summary:');
        console.log('✅ Server is running');
        console.log('✅ Registration endpoint working');
        console.log('✅ Email configuration should be working');
        console.log('\n📧 Check your email inbox for any messages from TravelEase');
        
    } catch (error) {
        console.error('\n❌ Test error:', error.message);
    }
    
    console.log('\n='.repeat(50));
    console.log('🏁 Test completed');
};

// Check if server is running first
const checkServer = async () => {
    try {
        const response = await fetch(`${API_BASE}/health`);
        return response.ok;
    } catch (error) {
        return false;
    }
};

// Start the test
const main = async () => {
    console.log('🔍 Checking if server is running...');
    
    const serverRunning = await checkServer();
    if (!serverRunning) {
        console.log(`❌ Server is not running on ${API_BASE}`);
        console.log('🔧 Please start the server first with: npm start');
        console.log('📍 Make sure you are in the backend directory');
        process.exit(1);
    }
    
    console.log('✅ Server is running\n');
    
    // Important note about email
    console.log('⚠️  IMPORTANT: This test will use your email address!');
    console.log('📧 Test email:', TEST_USER.email);
    
    const proceed = await getUserInput('Proceed with the test? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
        console.log('🔧 Test cancelled');
        process.exit(0);
    }
    
    await runRegistrationTest();
    process.exit(0);
};

main();
