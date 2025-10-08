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
                    <li>This link will expire in <strong>30 minutes</strong></li>
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

// Send registration success email (for Google OAuth users)
const sendRegistrationSuccessEmail = async (userEmail, userName) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 Email not configured - Registration success email not sent');
      return { success: false, error: 'Email service not configured' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'TravelEase',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: userEmail,
      subject: 'Registration Successful',
      html: createRegistrationSuccessEmailTemplate(userName, userEmail)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Registration success email sent:', info.messageId);

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error sending registration success email:', error.message);
    return { success: false, error: error.message };
  }
};

// Create HTML email template for registration success
const createRegistrationSuccessEmailTemplate = (userName, userEmail) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Successful - TravelEase</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d4edda; border: 2px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .button:hover { background: #0056b3; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎉 Welcome to TravelEase!</h1>
            <p style="font-size: 18px; margin: 0;">Registration Successful</p>
        </div>

        <div class="content">
            <div class="success-box">
                <h2>✅ Account Created Successfully!</h2>
                <p><strong>Hello ${userName || 'Traveler'}!</strong></p>
                <p>You have successfully registered with TravelEase using your Google account.</p>
            </div>

            <p>Your account is now active and ready to use. You can start exploring our travel packages and book amazing destinations right away!</p>

            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">
                    Go to Dashboard 🚀
                </a>
            </div>

            <h3>🌟 What's Next?</h3>
            <ul>
                <li>🔍 Browse our curated travel packages</li>
                <li>📅 Book your dream destination</li>
                <li>👤 Complete your profile for personalized recommendations</li>
                <li>💬 Connect with our travel experts</li>
            </ul>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 30px 0;">
                <h4>🔐 Your Account Security:</h4>
                <p>Since you signed up with Google, your account is protected by Google's security. If you need any help, our support team is always ready to assist you.</p>
            </div>
        </div>

        <div class="footer">
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
      subject: 'Verify Your Account',
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
            
            <p>Your OTP is <strong>${otp}</strong>.</p>

            <div class="warning">
                <strong>⏰ Important:</strong> This OTP will expire in 5 minutes. Please use it as soon as possible.
            </div>

            <p><strong>Security Note:</strong> If you didn't request this verification, please ignore this email. Never share your OTP with anyone.</p>

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

// Send agency approval notification email
const sendAgencyApprovalEmail = async (agencyEmail, agencyName, contactPerson) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 Email not configured - Agency approval email not sent');
      return { success: false, error: 'Email service not configured' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'TravelEase',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: agencyEmail,
      subject: '🎉 Your Agency Application Has Been Approved!',
      html: createAgencyApprovalEmailTemplate(agencyName, contactPerson)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Agency approval email sent:', info.messageId);

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error sending agency approval email:', error.message);
    return { success: false, error: error.message };
  }
};

// Send agency rejection notification email
const sendAgencyRejectionEmail = async (agencyEmail, agencyName, contactPerson, rejectionReason = '') => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 Email not configured - Agency rejection email not sent');
      return { success: false, error: 'Email service not configured' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'TravelEase',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: agencyEmail,
      subject: 'Agency Application Update - TravelEase',
      html: createAgencyRejectionEmailTemplate(agencyName, contactPerson, rejectionReason)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Agency rejection email sent:', info.messageId);

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error sending agency rejection email:', error.message);
    return { success: false, error: error.message };
  }
};
// Send package status update email to agency
const sendPackageStatusEmail = async (toEmail, agencyName, pkg, action, notes = '') => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 Email not configured - Package status email not sent');
      return { success: false, error: 'Email service not configured' };
    }

    const transporter = createTransporter();
    const prettyAction = action.charAt(0).toUpperCase() + action.slice(1);
    const subject = `Package ${prettyAction}: ${pkg.name}`;
    const html = `
      <h2>Package ${prettyAction}</h2>
      <p>Hello ${agencyName || 'Agency'},</p>
      <p>Your package <strong>${pkg.name}</strong> has been <strong>${action}</strong>.</p>
      <ul>
        <li>Destination: ${pkg.destination}</li>
        <li>Duration: ${pkg.duration_days} days</li>
        <li>Price: $${pkg.price}</li>
        <li>Status: ${pkg.status}</li>
      </ul>
      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      <p>Regards,<br/>TravelEase Admin</p>
    `;

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'TravelEase',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
      },
      to: toEmail,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Package status email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending package status email:', error.message);
    return { success: false, error: error.message };
  }
};

// Create HTML email template for agency approval
const createAgencyApprovalEmailTemplate = (agencyName, contactPerson) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Agency Application Approved - TravelEase</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d4edda; border: 2px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { display: flex; align-items: center; margin: 15px 0; }
            .feature-icon { font-size: 24px; margin-right: 15px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .button:hover { background: #0056b3; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p style="font-size: 18px; margin: 0;">Your Agency Application Has Been Approved</p>
        </div>

        <div class="content">
            <div class="success-box">
                <h2>✅ Welcome to TravelEase Partner Network!</h2>
                <p><strong>Hello ${contactPerson || 'Agency Representative'}!</strong></p>
                <p>We're excited to inform you that <strong>${agencyName}</strong> has been approved to join the TravelEase platform as a verified travel agency partner.</p>
            </div>

            <h3>🚀 What you can do now:</h3>
            <div class="feature-list">
                <div class="feature-item">
                    <span class="feature-icon">🏢</span>
                    <div>
                        <strong>Access Your Agency Dashboard</strong><br>
                        Manage your agency profile, packages, and bookings
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">📦</span>
                    <div>
                        <strong>Create Travel Packages</strong><br>
                        Add your amazing travel packages to our platform
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">👥</span>
                    <div>
                        <strong>Manage Bookings</strong><br>
                        Handle customer bookings and provide excellent service
                    </div>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">📊</span>
                    <div>
                        <strong>Track Performance</strong><br>
                        Monitor your sales, reviews, and customer satisfaction
                    </div>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">
                    Access Your Dashboard 🚀
                </a>
            </div>

            <div style="background: #e8f5e8; border: 1px solid #28a745; padding: 20px; border-radius: 5px; margin: 30px 0;">
                <h4>🎯 Next Steps:</h4>
                <ol>
                    <li>Complete your agency profile setup</li>
                    <li>Upload your travel packages</li>
                    <li>Set up your payment preferences</li>
                    <li>Start receiving bookings from travelers!</li>
                </ol>
            </div>

            <h3>📞 Need Help Getting Started?</h3>
            <p>Our partner support team is here to help you succeed:</p>
            <ul>
                <li>📧 Email: partners@travelease.com</li>
                <li>💬 Live Chat: Available on your dashboard</li>
                <li>📱 Phone: +1 (555) 123-PARTNER</li>
            </ul>
        </div>

        <div class="footer">
            <p>Welcome to the TravelEase family!</p>
            <p><small>© 2024 TravelEase. All rights reserved.</small></p>
        </div>
    </body>
    </html>
  `;
};

// Create HTML email template for agency rejection
const createAgencyRejectionEmailTemplate = (agencyName, contactPerson, rejectionReason) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Agency Application Update - TravelEase</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px; }
            .info-box { background: #d1ecf1; border: 2px solid #17a2b8; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .reason-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .button:hover { background: #0056b3; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Agency Application Update</h1>
            <p style="font-size: 18px; margin: 0;">TravelEase Partner Program</p>
        </div>

        <div class="content">
            <div class="info-box">
                <h2>📋 Application Status Update</h2>
                <p><strong>Hello ${contactPerson || 'Agency Representative'}!</strong></p>
                <p>Thank you for your interest in joining the TravelEase partner network. After careful review of your application for <strong>${agencyName}</strong>, we regret to inform you that we cannot approve your agency at this time.</p>
            </div>

            ${rejectionReason ? `
            <div class="reason-box">
                <h4>📝 Reason for Decision:</h4>
                <p>${rejectionReason}</p>
            </div>
            ` : ''}

            <h3>🔄 What's Next?</h3>
            <p>We encourage you to:</p>
            <ul>
                <li>Review and address any issues mentioned above</li>
                <li>Ensure all required documentation is complete and valid</li>
                <li>Consider reapplying in the future when requirements are met</li>
                <li>Contact our support team for specific guidance</li>
            </ul>

            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/agency-registration" class="button">
                    Learn More About Requirements 📋
                </a>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 30px 0;">
                <h4>💡 Tips for Future Applications:</h4>
                <ul>
                    <li>Ensure all business licenses are current and valid</li>
                    <li>Provide complete and accurate contact information</li>
                    <li>Include detailed descriptions of your travel services</li>
                    <li>Verify all documentation before submission</li>
                </ul>
            </div>

            <h3>📞 Questions or Need Support?</h3>
            <p>Our team is here to help you understand our requirements:</p>
            <ul>
                <li>📧 Email: partners@travelease.com</li>
                <li>💬 Live Chat: Available on our website</li>
                <li>📱 Phone: +1 (555) 123-PARTNER</li>
            </ul>

            <p>We appreciate your interest in TravelEase and look forward to potentially working with you in the future.</p>
        </div>

        <div class="footer">
            <p>Thank you for your interest in TravelEase!</p>
            <p><small>© 2024 TravelEase. All rights reserved.</small></p>
        </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOTPEmail,
  sendRegistrationSuccessEmail,
  sendAgencyApprovalEmail,
  sendAgencyRejectionEmail,
  sendPackageStatusEmail,
  testEmailConfiguration,
  sendTestEmail
};
