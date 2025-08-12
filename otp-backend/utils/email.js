// Email service using Nodemailer
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

/**
 * Send OTP email
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} userName - User's name (optional)
 * @returns {Promise<Object>} Email result
 */
export const sendOTPEmail = async (email, otp, userName = 'User') => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: {
                name: process.env.EMAIL_FROM_NAME || 'Your App',
                address: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER
            },
            to: email,
            subject: 'Email Verification - Your OTP Code',
            html: createOTPEmailTemplate(otp, userName)
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ OTP email sent successfully:', info.messageId);
        return {
            success: true,
            messageId: info.messageId,
            message: 'OTP email sent successfully'
        };

    } catch (error) {
        console.error('❌ Error sending OTP email:', error.message);
        return {
            success: false,
            error: error.message,
            message: 'Failed to send OTP email'
        };
    }
};

/**
 * Create HTML email template for OTP
 * @param {string} otp - OTP code
 * @param {string} userName - User's name
 * @returns {string} HTML email template
 */
const createOTPEmailTemplate = (otp, userName) => {
    const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 5;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Email Verification</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px solid #667eea; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 2.5em; font-weight: bold; color: #667eea; letter-spacing: 0.3em; margin: 10px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔐 Email Verification</h1>
        </div>
        
        <div class="content">
            <p>Hello ${userName},</p>
            
            <p>Thank you for registering! To complete your registration, please verify your email address using the OTP code below:</p>
            
            <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #666;">Enter this code to verify your email</p>
            </div>
            
            <div class="warning">
                <strong>⏰ Important:</strong> This OTP will expire in ${expiryMinutes} minutes. Please use it as soon as possible.
            </div>
            
            <p><strong>Security Note:</strong> If you didn't request this verification, please ignore this email. Never share your OTP with anyone.</p>
            
            <p>Best regards,<br>Your App Team</p>
        </div>
        
        <div class="footer">
            <p>This email was sent automatically. Please do not reply to this email.</p>
            <p>© 2024 Your App. All rights reserved.</p>
        </div>
    </body>
    </html>
    `;
};

/**
 * Test email configuration
 * @returns {Promise<boolean>} True if email config is valid
 */
export const testEmailConfig = async () => {
    try {
        console.log('🔍 Testing SMTP connection...');
        const transporter = createTransporter();

        // Test the connection
        await transporter.verify();
        console.log('✅ SMTP connection successful');

        // Test authentication
        console.log('🔐 Testing authentication...');
        const testResult = await transporter.sendMail({
            from: process.env.EMAIL_FROM_ADDRESS,
            to: process.env.SMTP_USER, // Send to self for testing
            subject: 'SMTP Test - Please Ignore',
            text: 'This is a test email to verify SMTP configuration. You can ignore this message.'
        });

        console.log('✅ Test email sent successfully');
        console.log('📨 Message ID:', testResult.messageId);
        return true;

    } catch (error) {
        console.error('❌ Email configuration error:', error.message);

        // Provide specific error guidance
        if (error.code === 'EAUTH') {
            console.error('🔧 Authentication failed. Check:');
            console.error('   - Gmail app password is correct (16 characters)');
            console.error('   - 2FA is enabled on your Gmail account');
            console.error('   - Username is your full Gmail address');
        } else if (error.code === 'ECONNECTION') {
            console.error('🔧 Connection failed. Check:');
            console.error('   - Internet connection');
            console.error('   - SMTP host and port settings');
        } else if (error.code === 'ESOCKET') {
            console.error('🔧 Socket error. Check:');
            console.error('   - Firewall settings');
            console.error('   - Network connectivity');
        }

        return false;
    }
};
