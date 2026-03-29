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
      .from('profiles')
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
        otp_expires_at: expiresAt.toISOString(),
        otp_attempts: 0,
        max_attempts: parseInt(process.env.OTP_MAX_ATTEMPTS) || 5,
        locked_until: null
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
      .from('profiles')
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
      redirectTo: '/dashboard',
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

    // Check if account is currently locked
    if (pendingUser.locked_until) {
      const lockTime = new Date(pendingUser.locked_until);
      const now = new Date();

      if (now < lockTime) {
        const minutesLeft = Math.ceil((lockTime - now) / (1000 * 60));
        return res.status(423).json({
          success: false,
          message: `Account is temporarily locked due to too many failed attempts. Please try again in ${minutesLeft} minutes.`,
          locked: true,
          lockedUntil: lockTime.toISOString(),
          minutesRemaining: minutesLeft
        });
      } else {
        // Lock has expired, reset attempts
        await supabase
          .from('pending_users')
          .update({
            otp_attempts: 0,
            locked_until: null
          })
          .eq('email', email.toLowerCase());

        // Refresh user data
        const { data: refreshedUser } = await supabase
          .from('pending_users')
          .select('*')
          .eq('email', email.toLowerCase())
          .single();

        if (refreshedUser) {
          pendingUser.otp_attempts = refreshedUser.otp_attempts;
          pendingUser.locked_until = refreshedUser.locked_until;
        }
      }
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
      const newAttempts = (pendingUser.otp_attempts || 0) + 1;
      const maxAttempts = pendingUser.max_attempts || parseInt(process.env.OTP_MAX_ATTEMPTS) || 5;

      // Check if max attempts reached
      if (newAttempts >= maxAttempts) {
        // Lock account for 15 minutes
        const lockoutDuration = parseInt(process.env.OTP_LOCKOUT_DURATION_MINUTES) || 15;
        const lockedUntil = new Date();
        lockedUntil.setMinutes(lockedUntil.getMinutes() + lockoutDuration);

        await supabase
          .from('pending_users')
          .update({
            otp_attempts: newAttempts,
            locked_until: lockedUntil.toISOString()
          })
          .eq('email', email.toLowerCase());

        return res.status(423).json({
          success: false,
          message: `Too many failed attempts. Your account has been temporarily locked for ${lockoutDuration} minutes for security.`,
          locked: true,
          lockedUntil: lockedUntil.toISOString(),
          minutesRemaining: lockoutDuration
        });
      } else {
        // Increment attempts
        await supabase
          .from('pending_users')
          .update({ otp_attempts: newAttempts })
          .eq('email', email.toLowerCase());

        const remainingAttempts = maxAttempts - newAttempts;
        return res.status(400).json({
          success: false,
          message: `Invalid verification code. You have ${remainingAttempts} attempts remaining.`,
          remainingAttempts,
          attemptsUsed: newAttempts,
          maxAttempts
        });
      }
    }

    // Create user in users table with verified=true
    const { data: newUser, error: createError } = await supabase
      .from('profiles')
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

    // Generate JWT token for immediate login
    const token = generateToken(newUser);

    res.json({
      success: true,
      message: 'Email verified successfully! Redirecting to dashboard...',
      token,
      redirectTo: '/dashboard',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.full_name,
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
      .from('profiles')
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
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email.toLowerCase())
      .single();

    // Always return success for security (don't reveal if email exists)
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

    // Only send email if user exists
    if (user && !error) {
      try {
        const { createPasswordResetToken } = require('../utils/passwordReset');
        const { sendPasswordResetEmail } = require('../utils/emailService');

        // Create password reset token
        const resetToken = await createPasswordResetToken(user.id);

        if (resetToken) {
          // Send password reset email
          await sendPasswordResetEmail(user.email, user.full_name, resetToken);
          console.log(`✅ Password reset email sent to: ${email}`);
        } else {
          console.error('❌ Failed to create reset token for:', email);
        }
      } catch (emailError) {
        console.error('❌ Error sending password reset email:', emailError.message);
      }
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify password reset token (POST)
router.post('/verify-reset-token', [
  body('token')
    .isLength({ min: 1 })
    .withMessage('Reset token is required')
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

    const { token } = req.body;
    const { verifyResetToken } = require('../utils/passwordReset');

    const result = await verifyResetToken(token);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Reset token is valid',
      user: {
        email: result.user.email,
        name: result.user.full_name
      }
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify password reset token (GET for convenience)
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const token = req.params.token;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Reset token is required' });
    }

    const { verifyResetToken } = require('../utils/passwordReset');
    const result = await verifyResetToken(token);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.json({
      success: true,
      message: 'Reset token is valid',
      user: {
        email: result.user.email,
        name: result.user.full_name
      }
    });
  } catch (error) {
    console.error('Verify reset token (GET) error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Reset password with token
router.post('/reset-password', [
  body('token')
    .isLength({ min: 1 })
    .withMessage('Reset token is required'),
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

    const { token, password } = req.body;
    const { verifyResetToken, markTokenAsUsed } = require('../utils/passwordReset');

    // Verify token
    const result = await verifyResetToken(token);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const supabase = getSupabase();

    // Update password
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ password_hash: hashedPassword })
      .eq('id', result.userId);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    // Mark token as used
    await markTokenAsUsed(result.tokenId);

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
      redirectTo: '/login'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Development-only: Get latest valid reset token for a user by email
if (process.env.NODE_ENV !== 'production') {
  router.post('/get-reset-token', [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }

      const { email } = req.body;
      const supabase = getSupabase();

      // Find user id
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (userError || !user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const nowIso = new Date().toISOString();

      // Get latest valid, unused token
      const { data: tokens, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('token, expires_at, used, created_at')
        .eq('user_id', user.id)
        .eq('used', false)
        .gte('expires_at', nowIso)
        .order('created_at', { ascending: false })
        .limit(1);

      if (tokenError || !tokens || tokens.length === 0) {
        return res.status(404).json({ success: false, message: 'No valid reset token found' });
      }

      res.json({ success: true, token: tokens[0].token, expires_at: tokens[0].expires_at });
    } catch (error) {
      console.error('Get reset token error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
}

// ============================================================================
// GOOGLE OAUTH ROUTES
// ============================================================================

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
    session: false
  }),
  async (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = generateToken(req.user);

      // Send registration success email for new users (if not already sent)
      if (req.user.created_at) {
        const createdTime = new Date(req.user.created_at);
        const now = new Date();
        const timeDiff = now - createdTime;

        // If user was created in the last 5 minutes, they're likely new
        if (timeDiff < 5 * 60 * 1000) {
          try {
            const { sendRegistrationSuccessEmail } = require('../utils/emailService');
            sendRegistrationSuccessEmail(req.user.email, req.user.full_name);
          } catch (emailError) {
            console.log('⚠️ Could not send registration success email:', emailError.message);
          }
        }
      }

      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: req.user.id,
        name: req.user.full_name,
        email: req.user.email,
        emailVerified: true,
        userType: req.user.user_type
      }))}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_processing_failed`);
    }
  }
);

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
