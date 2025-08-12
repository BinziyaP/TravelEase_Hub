// Complete OTP system test for TravelEase backend
const fetch = require('node-fetch');
const readline = require('readline');

const API_BASE = 'http://localhost:5000';

// Test user data - using your email
const TEST_USER = {
    email: 'binziyap2003@gmail.com',
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
            console.log('📤 Request:', JSON.stringify(data, null, 2));
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
    console.log('='.repeat(50));
    
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        if (data.status === 'OK' || data.success) {
            console.log('✅ Server is running');
            return true;
        } else {
            console.log('❌ Health check failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Server not responding:', error.message);
        console.log('🔧 Make sure to start the server with: npm start');
        return false;
    }
};

const testCheckEmail = async () => {
    console.log('\n🔍 Step 2: Testing Email Check...');
    console.log('='.repeat(50));
    
    const result = await apiRequest('/api/auth/check-email', { 
        email: TEST_USER.email 
    }, 'POST');
    
    if (result.data.success && !result.data.exists) {
        console.log('✅ Email is available for registration');
        return true;
    } else if (result.data.exists) {
        console.log('⚠️ Email already exists');
        const proceed = await getUserInput('Continue with test anyway? (y/n): ');
        return proceed.toLowerCase() === 'y';
    } else {
        console.log('❌ Email check failed');
        return false;
    }
};

const testSendOTP = async () => {
    console.log('\n🔍 Step 3: Testing OTP Sending...');
    console.log('='.repeat(50));
    console.log('📧 Sending OTP to:', TEST_USER.email);
    
    const result = await apiRequest('/api/auth/send-otp', TEST_USER, 'POST');
    
    if (result.data.success) {
        console.log('✅ OTP sent successfully!');
        console.log('📧 Check your email inbox for the OTP');
        console.log('📁 Also check spam/junk folder');
        console.log('⏰ OTP expires in:', result.data.expires_in_minutes, 'minutes');
        return true;
    } else {
        console.log('❌ Failed to send OTP');
        console.log('❌ Error:', result.data.message);
        return false;
    }
};

const testVerifyOTP = async () => {
    console.log('\n🔍 Step 4: Testing OTP Verification...');
    console.log('='.repeat(50));
    
    // Get OTP from user
    const otp = await getUserInput('Enter the 6-digit OTP from your email: ');
    
    if (!otp || otp.length !== 6) {
        console.log('❌ Invalid OTP format. Must be 6 digits.');
        return false;
    }
    
    const verifyData = {
        email: TEST_USER.email,
        otp: otp,
        full_name: TEST_USER.full_name, // This will be mapped to 'name' column in backend
        phone: TEST_USER.phone,
        date_of_birth: TEST_USER.date_of_birth
    };
    
    const result = await apiRequest('/api/auth/verify-otp', verifyData, 'POST');
    
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

const testSupabaseConnection = async () => {
    console.log('\n🔍 Step 5: Testing Supabase Connection...');
    console.log('='.repeat(50));
    
    // Test by trying to fetch users (this will test our Supabase setup)
    try {
        const result = await apiRequest('/api/auth/check-email', { 
            email: 'test@example.com' 
        }, 'POST');
        
        if (result.status === 200 || result.status === 409) {
            console.log('✅ Supabase connection working');
            return true;
        } else {
            console.log('❌ Supabase connection issue');
            return false;
        }
    } catch (error) {
        console.log('❌ Supabase connection failed:', error.message);
        return false;
    }
};

// Main test runner
const runCompleteTest = async () => {
    console.log('🧪 TravelEase Complete OTP System Test');
    console.log('='.repeat(60));
    console.log('📧 Test Email:', TEST_USER.email);
    console.log('👤 Test User:', TEST_USER.full_name);
    console.log('🌐 API Base:', API_BASE);
    console.log('='.repeat(60));
    
    try {
        // Step 1: Health check
        const healthOk = await testHealthCheck();
        if (!healthOk) {
            console.log('\n❌ Cannot proceed - server not running');
            return;
        }
        
        // Step 2: Test Supabase connection
        const supabaseOk = await testSupabaseConnection();
        if (!supabaseOk) {
            console.log('\n❌ Cannot proceed - Supabase connection failed');
            console.log('🔧 Check your SUPABASE_SERVICE_ROLE_KEY in .env file');
            return;
        }
        
        // Step 3: Check email
        const emailOk = await testCheckEmail();
        if (!emailOk) {
            console.log('\n❌ Cannot proceed - email check failed');
            return;
        }
        
        // Step 4: Send OTP
        const otpSent = await testSendOTP();
        if (!otpSent) {
            console.log('\n❌ Cannot proceed - OTP sending failed');
            console.log('🔧 Check your email configuration in .env file');
            return;
        }
        
        // Wait for user to check email
        console.log('\n⏳ Waiting for you to check your email...');
        await getUserInput('Press Enter when you have the OTP from your email...');
        
        // Step 5: Verify OTP
        const otpVerified = await testVerifyOTP();
        
        if (otpVerified) {
            console.log('\n🎉 COMPLETE OTP SYSTEM TEST PASSED!');
            console.log('✅ Server running');
            console.log('✅ Supabase connection working');
            console.log('✅ Email sending working');
            console.log('✅ OTP generation working');
            console.log('✅ OTP verification working');
            console.log('✅ User creation working');
            console.log('\n🚀 Your OTP email verification system is ready!');
        } else {
            console.log('\n❌ OTP verification failed');
        }
        
    } catch (error) {
        console.error('\n❌ Test error:', error.message);
    }
    
    console.log('\n='.repeat(60));
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
    
    // Important note about setup
    console.log('⚠️  IMPORTANT SETUP REQUIRED:');
    console.log('1. Add OTP tables to Supabase (run database/add-otp-tables.sql)');
    console.log('2. Get your Supabase service role key and add to .env');
    console.log('3. Make sure email configuration is correct in .env');
    console.log('📧 Test email:', TEST_USER.email);
    
    const proceed = await getUserInput('\nHave you completed the setup? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
        console.log('🔧 Please complete the setup first');
        process.exit(0);
    }
    
    await runCompleteTest();
    process.exit(0);
};

main();
