const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const passport = require('../config/passport');
const { getSupabase } = require('../config/supabase');
const { checkEmail, sendOTP, verifyOTPAndCreateUser } = require('../controllers/otpController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Rate limiting helper function
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      userType: user.user_type 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Import email service for OTP
const { sendOTPEmail } = require('../utils/emailService');
const { generateOTP, hashOTP, verifyOTP, getOTPExpiry, isOTPExpired } = require('../utils/otp');

// Create signup handler function for reuse
const signupHandler = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;
    const supabase = getSupabase();

    // Check if user already exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if user is already pending verification
    const { data: pendingUser } = await supabase
      .from('pending_users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    // Clean up existing pending user if exists
    if (pendingUser) {
      await supabase
        .from('pending_users')
        .delete()
        .eq('email', email.toLowerCase());
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Set OTP expiry (5 minutes as requested)
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
    const expiresAt = getOTPExpiry(expiryMinutes);

    // Store in pending_users table
    const { error: insertError } = await supabase
      .from('pending_users')
      .insert({
        email: email.toLowerCase(),
        full_name: name.trim(),
        password_hash: hashedPassword,
        otp_hash: otpHash,
        otp_expires_at: expiresAt.toISOString()
      });

    if (insertError) {
      console.error('Database error:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create pending user account'
      });
    }

    // Send OTP email
    const emailResult = await sendOTPEmail(email.toLowerCase(), otp, name.trim());

    if (!emailResult.success) {
      // Clean up pending user if email failed
      await supabase
        .from('pending_users')
        .delete()
        .eq('email', email.toLowerCase());

      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the verification code.',
      email: email.toLowerCase(),
      expires_in_minutes: expiryMinutes
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Register endpoint with OTP verification (also available as /signup)
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
], signupHandler);

// Alias for /signup endpoint (requested by user)
router.post('/signup', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
], signupHandler);

// Login endpoint
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const supabase = getSupabase();

    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, password_hash, email_verified, verified, user_type')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified (as requested by user)
    const isVerified = user.verified !== null ? user.verified : user.email_verified;
    if (!isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for the verification code.',
        requiresVerification: true
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        emailVerified: isVerified,
        userType: user.user_type
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify email endpoint (as requested by user)
router.post('/verify-email', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, otp } = req.body;
    const supabase = getSupabase();

    // Find pending user
    const { data: pendingUser, error: fetchError } = await supabase
      .from('pending_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (fetchError || !pendingUser) {
      return res.status(400).json({
        success: false,
        message: 'No pending verification found for this email. Please register again.'
      });
    }

    // Check if OTP has expired
    if (isOTPExpired(pendingUser.otp_expires_at)) {
      // Clean up expired record
      await supabase
        .from('pending_users')
        .delete()
        .eq('email', email.toLowerCase());

      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please register again.',
        expired: true
      });
    }

    // Verify OTP
    const isValidOTP = await verifyOTP(otp, pendingUser.otp_hash);
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check your email and try again.'
      });
    }

    // Create user in users table with verified=true
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: pendingUser.email,
        full_name: pendingUser.full_name,
        password_hash: pendingUser.password_hash,
        verified: true,
        email_verified: true,
        user_type: 'user'
      })
      .select('id, email, full_name, verified, email_verified, user_type, created_at')
      .single();

    if (createError) {
      console.error('Error creating verified user:', createError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account'
      });
    }

    // Delete from pending_users
    await supabase
      .from('pending_users')
      .delete()
      .eq('email', email.toLowerCase());

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      user: {
        id: newUser.id,
        email: newUser.email,
        verified: newUser.verified,
        userType: newUser.user_type
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Resend OTP endpoint (as requested by user)
const resendOTPLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  3, // 3 requests per hour as requested
  'Too many OTP resend requests. Please try again later.'
);

router.post('/resend-otp', resendOTPLimit, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const supabase = getSupabase();

    // Find pending user
    const { data: pendingUser, error: fetchError } = await supabase
      .from('pending_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (fetchError || !pendingUser) {
      return res.status(404).json({
        success: false,
        message: 'No pending registration found for this email.'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    
    // Set new expiry (5 minutes)
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
    const expiresAt = getOTPExpiry(expiryMinutes);

    // Update pending user with new OTP
    const { error: updateError } = await supabase
      .from('pending_users')
      .update({
        otp_hash: otpHash,
        otp_expires_at: expiresAt.toISOString()
      })
      .eq('email', email.toLowerCase());

    if (updateError) {
      console.error('Error updating OTP:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate new verification code'
      });
    }

    // Send new OTP email
    const emailResult = await sendOTPEmail(email.toLowerCase(), otp, 'User');

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'New verification code sent to your email.',
      expires_in_minutes: expiryMinutes
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token for Google user
    const token = generateToken(req.user);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?token=${token}&auth=success`);
  }
);

// Verify token endpoint
router.get('/verify', verifyToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, email_verified, user_type')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        emailVerified: user.email_verified,
        userType: user.user_type
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Forgot password endpoint (placeholder)
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const supabase = getSupabase();

    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    // Always return success for security (don't reveal if email exists)
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

    // Only send email if user exists
    if (user && !error) {
      // TODO: Implement actual email sending logic here
      console.log(`Password reset requested for: ${email}`);
      // You can integrate with services like SendGrid, Nodemailer, etc.
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ============================================================================
// OTP EMAIL VERIFICATION ROUTES
// ============================================================================

// Rate limits for different endpoints
const checkEmailLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  10, // 10 requests per window
  'Too many email check requests. Please try again later.'
);

const sendOTPLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  3, // 3 OTP requests per window
  'Too many OTP requests. Please try again later.'
);

const verifyOTPLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  10, // 10 verification attempts per window
  'Too many verification attempts. Please try again later.'
);

// OTP Routes
router.post('/check-email', checkEmailLimit, checkEmail);
router.post('/send-otp', sendOTPLimit, sendOTP);
router.post('/verify-otp', verifyOTPLimit, verifyOTPAndCreateUser);

module.exports = router;
