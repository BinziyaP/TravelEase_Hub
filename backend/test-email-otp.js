// Email OTP testing script for existing backend
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

dotenv.config();

// Test data - using your email
const TEST_EMAIL = 'binziyap2003@gmail.com';
const TEST_USER_NAME = 'Binz P';

// Generate test OTP
const generateTestOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Create professional OTP email template
const createOTPEmailTemplate = (otp, userName) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Email Verification - TravelEase</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px solid #667eea; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 2.5em; font-weight: bold; color: #667eea; letter-spacing: 0.3em; margin: 10px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .logo { font-size: 1.5em; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">✈️ TravelEase</div>
            <h1>Email Verification Required</h1>
        </div>
        
        <div class="content">
            <p>Hello ${userName},</p>
            
            <p>Welcome to TravelEase! To complete your registration and start exploring amazing destinations, please verify your email address using the OTP code below:</p>
            
            <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #666;">Enter this code to verify your email</p>
            </div>
            
            <div class="warning">
                <strong>⏰ Important:</strong> This OTP will expire in 5 minutes. Please use it as soon as possible.
            </div>
            
            <p><strong>Security Note:</strong> If you didn't request this verification, please ignore this email. Never share your OTP with anyone.</p>
            
            <p>Once verified, you'll be able to:</p>
            <ul>
                <li>✈️ Book amazing travel destinations</li>
                <li>🏨 Access exclusive hotel deals</li>
                <li>🎫 Manage your bookings</li>
                <li>💰 Get personalized travel recommendations</li>
            </ul>
            
            <p>Best regards,<br>The TravelEase Team</p>
        </div>
        
        <div class="footer">
            <p>This email was sent automatically. Please do not reply to this email.</p>
            <p>© 2024 TravelEase. All rights reserved.</p>
        </div>
    </body>
    </html>
    `;
};

// Test email configuration
const testEmailConfig = async () => {
    console.log('🔍 Testing Email Configuration...');
    console.log('📧 SMTP Host:', process.env.EMAIL_HOST);
    console.log('📧 SMTP Port:', process.env.EMAIL_PORT);
    console.log('📧 SMTP User:', process.env.EMAIL_USER);
    console.log('📧 From Name:', process.env.EMAIL_FROM_NAME);
    
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email configuration is valid');
        return true;
    } catch (error) {
        console.error('❌ Email configuration error:', error.message);
        
        if (error.code === 'EAUTH') {
            console.error('🔧 Authentication failed. Check:');
            console.error('   - Gmail app password is correct');
            console.error('   - 2FA is enabled on your Gmail account');
        }
        
        return false;
    }
};

// Send test OTP email
const sendTestOTPEmail = async (email, otp, userName) => {
    try {
        console.log('📧 Sending OTP email...');
        console.log('📧 To:', email);
        console.log('👤 User:', userName);
        console.log('🔢 OTP:', otp);
        
        const transporter = createTransporter();
        
        const mailOptions = {
            from: {
                name: process.env.EMAIL_FROM_NAME || 'TravelEase',
                address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
            },
            to: email,
            subject: 'Email Verification - Your OTP Code | TravelEase',
            html: createOTPEmailTemplate(otp, userName)
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ OTP email sent successfully!');
        console.log('📨 Message ID:', info.messageId);
        console.log('📱 Check your email inbox');
        console.log('📁 Also check spam/junk folder if not in inbox');
        
        return {
            success: true,
            messageId: info.messageId,
            otp: otp
        };

    } catch (error) {
        console.error('❌ Error sending OTP email:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

// Main test function
const runEmailTest = async () => {
    console.log('🧪 TravelEase Email OTP Test');
    console.log('='.repeat(50));
    console.log('📧 Test Email:', TEST_EMAIL);
    console.log('👤 Test User:', TEST_USER_NAME);
    console.log('='.repeat(50));
    
    try {
        // Test 1: Check environment variables
        console.log('\n1️⃣ Checking Environment Variables...');
        const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM_NAME'];
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
        
        if (!allPresent) {
            console.log('\n❌ Missing environment variables. Please check your .env file.');
            return;
        }
        
        // Test 2: Test email configuration
        console.log('\n2️⃣ Testing Email Configuration...');
        const configValid = await testEmailConfig();
        if (!configValid) {
            console.log('\n❌ Email configuration invalid. Cannot proceed.');
            return;
        }
        
        // Test 3: Generate and send OTP
        console.log('\n3️⃣ Generating and Sending OTP...');
        const testOTP = generateTestOTP();
        const result = await sendTestOTPEmail(TEST_EMAIL, testOTP, TEST_USER_NAME);
        
        if (result.success) {
            console.log('\n🎉 Email test completed successfully!');
            console.log('\n📋 What to check in your email:');
            console.log('1. Subject: "Email Verification - Your OTP Code | TravelEase"');
            console.log('2. Professional TravelEase branding');
            console.log('3. OTP code:', result.otp);
            console.log('4. 5-minute expiry warning');
            console.log('5. Security instructions');
            console.log('6. TravelEase features list');
            
            console.log('\n✅ Email sending functionality is working!');
            console.log('✅ Ready for user registration with email verification');
        } else {
            console.log('\n❌ Email test failed:', result.error);
        }
        
    } catch (error) {
        console.error('\n❌ Test error:', error.message);
    }
};

// Run the test
console.log('🚀 Starting TravelEase Email OTP Test...\n');
runEmailTest();
