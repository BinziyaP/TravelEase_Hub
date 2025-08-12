// Complete OTP registration flow test
import fetch from 'node-fetch';
import readline from 'readline';

const API_BASE = 'http://localhost:3000/api/auth';

// Test user data - CHANGE THIS TO YOUR EMAIL
const TEST_USER = {
    email: 'binziyap2003@gmail.com', // Change to your email
    full_name: 'Binz P Test User',
    phone: '+1234567890',
    date_of_birth: '1990-01-01'
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

// Get user input for OTP
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
        const response = await fetch('http://localhost:3000/health');
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Server is running');
            console.log('📊 Response:', JSON.stringify(data, null, 2));
            return true;
        } else {
            console.log('❌ Health check failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Server not responding:', error.message);
        console.log('🔧 Make sure to start the server with: npm run dev');
        return false;
    }
};

const testCheckEmail = async () => {
    console.log('\n🔍 Step 2: Testing Email Check...');
    console.log('='.repeat(40));
    
    const result = await apiRequest('/check-email', { email: TEST_USER.email }, 'POST');
    
    if (result.data.success) {
        console.log('✅ Email is available for registration');
        return true;
    } else if (result.data.exists) {
        console.log('⚠️ Email already exists - this is expected if you ran the test before');
        
        // Ask user if they want to continue anyway
        const continueTest = await getUserInput('Continue with OTP test anyway? (y/n): ');
        return continueTest.toLowerCase() === 'y';
    } else {
        console.log('❌ Email check failed');
        return false;
    }
};

const testSendOTP = async () => {
    console.log('\n🔍 Step 3: Testing OTP Sending...');
    console.log('='.repeat(40));
    console.log('📧 Sending OTP to:', TEST_USER.email);
    
    const result = await apiRequest('/send-otp', TEST_USER, 'POST');
    
    if (result.data.success) {
        console.log('✅ OTP sent successfully!');
        console.log('📧 Check your email inbox for the OTP');
        console.log('📁 Also check spam/junk folder');
        console.log('⏰ OTP expires in:', result.data.expires_in_minutes, 'minutes');
        return true;
    } else {
        console.log('❌ Failed to send OTP');
        console.log('❌ Error:', result.data.message);
        
        if (result.data.message.includes('already registered')) {
            console.log('💡 This email is already registered. Try with a different email.');
        }
        
        return false;
    }
};

const testVerifyOTP = async () => {
    console.log('\n🔍 Step 4: Testing OTP Verification...');
    console.log('='.repeat(40));
    
    // Get OTP from user
    const otp = await getUserInput('Enter the 6-digit OTP from your email: ');
    
    if (!otp || otp.length !== 6) {
        console.log('❌ Invalid OTP format. Must be 6 digits.');
        return false;
    }
    
    const verifyData = {
        email: TEST_USER.email,
        otp: otp,
        full_name: TEST_USER.full_name,
        phone: TEST_USER.phone,
        date_of_birth: TEST_USER.date_of_birth
    };
    
    const result = await apiRequest('/verify-otp', verifyData, 'POST');
    
    if (result.data.success) {
        console.log('✅ OTP verification successful!');
        console.log('👤 User created:', JSON.stringify(result.data.user, null, 2));
        return true;
    } else {
        console.log('❌ OTP verification failed');
        console.log('❌ Error:', result.data.message);
        
        if (result.data.remaining_attempts !== undefined) {
            console.log('🔢 Remaining attempts:', result.data.remaining_attempts);
        }
        
        return false;
    }
};

// Main test runner
const runCompleteTest = async () => {
    console.log('🧪 Complete OTP Registration Flow Test');
    console.log('='.repeat(50));
    console.log('📧 Test Email:', TEST_USER.email);
    console.log('👤 Test User:', TEST_USER.full_name);
    console.log('='.repeat(50));
    
    try {
        // Step 1: Health check
        const healthOk = await testHealthCheck();
        if (!healthOk) {
            console.log('\n❌ Cannot proceed - server not running');
            return;
        }
        
        // Step 2: Check email
        const emailOk = await testCheckEmail();
        if (!emailOk) {
            console.log('\n❌ Cannot proceed - email check failed');
            return;
        }
        
        // Step 3: Send OTP
        const otpSent = await testSendOTP();
        if (!otpSent) {
            console.log('\n❌ Cannot proceed - OTP sending failed');
            return;
        }
        
        // Wait for user to check email
        console.log('\n⏳ Waiting for you to check your email...');
        await getUserInput('Press Enter when you have the OTP from your email...');
        
        // Step 4: Verify OTP
        const otpVerified = await testVerifyOTP();
        
        if (otpVerified) {
            console.log('\n🎉 Complete registration flow test PASSED!');
            console.log('✅ Email sending works');
            console.log('✅ OTP generation works');
            console.log('✅ OTP verification works');
            console.log('✅ User creation works');
        } else {
            console.log('\n❌ OTP verification failed');
        }
        
    } catch (error) {
        console.error('\n❌ Test error:', error.message);
    }
    
    console.log('\n='.repeat(50));
    console.log('🏁 Test completed');
};

// Check if server is running first
const checkServer = async () => {
    try {
        const response = await fetch('http://localhost:3000/health');
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
        console.log('❌ Server is not running on http://localhost:3000');
        console.log('🔧 Please start the server first with: npm run dev');
        console.log('📍 Make sure you are in the correct directory');
        process.exit(1);
    }
    
    console.log('✅ Server is running\n');
    
    // Important note about email
    console.log('⚠️  IMPORTANT: Make sure to change TEST_USER.email to your actual email address!');
    console.log('📧 Current test email:', TEST_USER.email);
    
    const proceed = await getUserInput('Is this your email address? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
        console.log('🔧 Please edit test-complete-flow.js and change TEST_USER.email to your email');
        process.exit(0);
    }
    
    await runCompleteTest();
    process.exit(0);
};

main();
