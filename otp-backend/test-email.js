// Email testing script
import dotenv from 'dotenv';
import { sendOTPEmail, testEmailConfig } from './utils/email.js';
import { generateOTP } from './utils/otp.js';

dotenv.config();

// Test data
const TEST_EMAIL = 'binziyap2003@gmail.com'; // Your email for testing
const TEST_USER_NAME = 'Binz P';
const TEST_OTP = generateOTP();

console.log('🧪 Testing Email Functionality\n');
console.log('='.repeat(50));

// Test 1: Check email configuration
const testEmailConfiguration = async () => {
    console.log('\n1️⃣ Testing Email Configuration...');
    console.log('📧 SMTP Host:', process.env.SMTP_HOST);
    console.log('📧 SMTP Port:', process.env.SMTP_PORT);
    console.log('📧 SMTP User:', process.env.SMTP_USER);
    console.log('📧 From Name:', process.env.EMAIL_FROM_NAME);
    
    const isValid = await testEmailConfig();
    
    if (isValid) {
        console.log('✅ Email configuration is valid');
        return true;
    } else {
        console.log('❌ Email configuration failed');
        console.log('\n🔧 Check these settings in your .env file:');
        console.log('- SMTP_USER: Your Gmail address');
        console.log('- SMTP_PASS: Your 16-character app password');
        console.log('- Make sure 2FA is enabled on Gmail');
        return false;
    }
};

// Test 2: Send actual OTP email
const testSendOTPEmail = async () => {
    console.log('\n2️⃣ Sending Test OTP Email...');
    console.log('📧 To:', TEST_EMAIL);
    console.log('👤 User:', TEST_USER_NAME);
    console.log('🔢 OTP:', TEST_OTP);
    console.log('⏰ Expiry:', process.env.OTP_EXPIRY_MINUTES || 5, 'minutes');
    
    const result = await sendOTPEmail(TEST_EMAIL, TEST_OTP, TEST_USER_NAME);
    
    if (result.success) {
        console.log('✅ OTP email sent successfully!');
        console.log('📨 Message ID:', result.messageId);
        console.log('\n📱 Check your email inbox for the OTP');
        console.log('📁 Also check spam/junk folder if not in inbox');
        return true;
    } else {
        console.log('❌ Failed to send OTP email');
        console.log('❌ Error:', result.error);
        return false;
    }
};

// Test 3: Verify environment variables
const testEnvironmentVariables = () => {
    console.log('\n3️⃣ Checking Environment Variables...');
    
    const requiredVars = [
        'SMTP_HOST',
        'SMTP_PORT', 
        'SMTP_USER',
        'SMTP_PASS',
        'EMAIL_FROM_NAME',
        'EMAIL_FROM_ADDRESS'
    ];
    
    let allPresent = true;
    
    requiredVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
            console.log(`✅ ${varName}: ${varName.includes('PASS') ? '***hidden***' : value}`);
        } else {
            console.log(`❌ ${varName}: Missing`);
            allPresent = false;
        }
    });
    
    return allPresent;
};

// Main test function
const runEmailTests = async () => {
    try {
        console.log('🚀 Starting Email Tests...\n');
        
        // Test environment variables
        const envValid = testEnvironmentVariables();
        if (!envValid) {
            console.log('\n❌ Environment variables missing. Please check your .env file.');
            return;
        }
        
        // Test email configuration
        const configValid = await testEmailConfiguration();
        if (!configValid) {
            console.log('\n❌ Email configuration invalid. Cannot proceed with sending test.');
            return;
        }
        
        // Send test email
        const emailSent = await testSendOTPEmail();
        
        if (emailSent) {
            console.log('\n🎉 Email test completed successfully!');
            console.log('\n📋 Next steps:');
            console.log('1. Check your email inbox');
            console.log('2. Look for subject: "Email Verification - Your OTP Code"');
            console.log('3. Verify the OTP code matches:', TEST_OTP);
            console.log('4. Check the email formatting looks professional');
        } else {
            console.log('\n❌ Email test failed. Check the error messages above.');
        }
        
    } catch (error) {
        console.error('\n❌ Test error:', error.message);
        console.error('Stack:', error.stack);
    }
};

// Run the tests
runEmailTests();
