const nodemailer = require('nodemailer');
require('dotenv').config();

// Create email transporter
const createTransporter = () => {
  // For development, use a simple configuration
  if (process.env.NODE_ENV === 'development') {
    // Use Gmail SMTP for development
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // For production, use full SMTP configuration
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 Email not configured - Reset token:', resetToken);
      console.log('🔗 Reset URL:', `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);
      return { success: false, error: 'Email service not configured' };
    }

    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'TravelEase',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: userEmail,
      subject: 'Reset Your TravelEase Password',
      html: createPasswordResetEmailTemplate(userName, resetUrl, resetToken)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    
    // Log the reset token for development if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log('🔑 Development fallback - Reset token:', resetToken);
      console.log('🔗 Reset URL:', `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);
    }
    
    return { success: false, error: error.message };
  }
};

// Create HTML email template for password reset
const createPasswordResetEmailTemplate = (userName, resetUrl, resetToken) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - TravelEase</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background: #0056b3; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .token-info { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; font-family: monospace; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🌍 TravelEase</h1>
            <h2>Password Reset Request</h2>
        </div>
        
        <div class="content">
            <p>Hello ${userName || 'Traveler'},</p>
            
            <p>We received a request to reset your password for your TravelEase account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                    <li>This link will expire in <strong>1 hour</strong></li>
                    <li>This link can only be used <strong>once</strong></li>
                    <li>If you didn't request this reset, please ignore this email</li>
                </ul>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <div class="token-info">
                ${resetUrl}
            </div>
            
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>For security reasons, we recommend:</p>
            <ul>
                <li>Using a strong, unique password</li>
                <li>Not sharing your password with anyone</li>
                <li>Logging out of shared devices</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>This email was sent by TravelEase</p>
            <p>If you have any questions, please contact our support team.</p>
            <p><small>Reset Token: ${resetToken.substring(0, 8)}...</small></p>
        </div>
    </body>
    </html>
  `;
};

// Test email configuration
const testEmailConfiguration = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return { success: false, error: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    await transporter.verify();
    
    console.log('✅ Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };

  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send test email
const sendTestEmail = async (toEmail) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'TravelEase',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: toEmail,
      subject: 'TravelEase Email Test',
      html: `
        <h2>🧪 Email Test Successful!</h2>
        <p>This is a test email from your TravelEase application.</p>
        <p>If you received this email, your email configuration is working correctly.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error sending test email:', error.message);
    return { success: false, error: error.message };
  }
};

// Send welcome email for new user registration
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 Email not configured - Welcome email not sent');
      return { success: false, error: 'Email service not configured' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'TravelEase',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: userEmail,
      subject: 'Welcome to TravelEase - Your Journey Begins Now! 🌍',
      html: createWelcomeEmailTemplate(userName, userEmail)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    return { success: false, error: error.message };
  }
};

// Create HTML email template for welcome email
const createWelcomeEmailTemplate = (userName, userEmail) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to TravelEase</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px; }
            .welcome-box { background: #e8f5e8; border: 2px solid #4caf50; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { display: flex; align-items: center; margin: 15px 0; }
            .feature-icon { font-size: 24px; margin-right: 15px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .button:hover { background: #0056b3; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .social-links { margin: 20px 0; }
            .social-links a { margin: 0 10px; text-decoration: none; color: #007bff; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🌍 Welcome to TravelEase!</h1>
            <p style="font-size: 18px; margin: 0;">Your adventure starts here</p>
        </div>

        <div class="content">
            <div class="welcome-box">
                <h2>🎉 Account Created Successfully!</h2>
                <p><strong>Hello ${userName || 'Traveler'}!</strong></p>
                <p>Welcome to the TravelEase family. We're excited to help you discover amazing destinations and create unforgettable memories.</p>
            </div>

            <h3>🚀 What you can do now:</h3>
            <div class="feature-list">
                <div class="feature-item">
                    <span class="feature-icon">🔍</span>
                    <div>
                        <strong>Explore Destinations</strong><br>
                        Browse our curated travel packages and find your perfect getaway
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">📅</span>
                    <div>
                        <strong>Book Your Trip</strong><br>
                        Easy booking process with secure payment and instant confirmation
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">👤</span>
                    <div>
                        <strong>Manage Your Profile</strong><br>
                        Update your preferences and track your booking history
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">🎯</span>
                    <div>
                        <strong>Personalized Recommendations</strong><br>
                        Get travel suggestions based on your interests and past trips
                    </div>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">
                    Start Exploring Now 🌟
                </a>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 30px 0;">
                <h4>🔐 Account Security Tips:</h4>
                <ul>
                    <li>Keep your password secure and don't share it with anyone</li>
                    <li>Use our "Forgot Password" feature if you ever need to reset it</li>
                    <li>Log out from shared devices after use</li>
                    <li>Contact support if you notice any suspicious activity</li>
                </ul>
            </div>

            <h3>📞 Need Help?</h3>
            <p>Our support team is here to help you 24/7:</p>
            <ul>
                <li>📧 Email: support@travelease.com</li>
                <li>💬 Live Chat: Available on our website</li>
                <li>📱 Phone: +1 (555) 123-TRAVEL</li>
            </ul>
        </div>

        <div class="footer">
            <div class="social-links">
                <a href="#">📘 Facebook</a>
                <a href="#">📸 Instagram</a>
                <a href="#">🐦 Twitter</a>
                <a href="#">💼 LinkedIn</a>
            </div>
            <p>Thank you for choosing TravelEase!</p>
            <p>This email was sent to: ${userEmail}</p>
            <p><small>© 2024 TravelEase. All rights reserved.</small></p>
        </div>
    </body>
    </html>
  `;
};

// Send OTP email for registration verification
const sendOTPEmail = async (email, otp, userName = 'User') => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 Email not configured - OTP:', otp);
      return { success: false, error: 'Email service not configured' };
    }

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

// Create OTP email template
const createOTPEmailTemplate = (otp, userName) => {
  const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 5;

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
                <strong>⏰ Important:</strong> This OTP will expire in ${expiryMinutes} minutes. Please use it as soon as possible.
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

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOTPEmail,
  testEmailConfiguration,
  sendTestEmail
};
