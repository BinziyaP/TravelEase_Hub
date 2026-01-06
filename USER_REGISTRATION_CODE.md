# User Registration Code - TravelEase Hub

This document contains the user registration code implementation for TravelEase Hub platform.

## File Locations

The user registration code is located in the following files:

1. **Frontend Registration Component**: `vite-project/src/components/AuthModal.jsx`
2. **Backend Registration API**: `backend/routes/auth.js`
3. **Authentication Context**: `vite-project/src/contexts/AuthContext.jsx`

---

## 1. Frontend Registration Component (React)

**File Path:** `vite-project/src/components/AuthModal.jsx`

**Full Path:** `C:\Users\binziya\Desktop\S9Proj\vite-project\src\components\AuthModal.jsx`

### Registration Form Submission Handler

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setErrors({});
  setSuccessMessage('');

  // Validate form
  const newErrors = {};
  if (!formData.email) newErrors.email = 'Email is required';
  if (!formData.password && !isForgotPassword) newErrors.password = 'Password is required';
  
  // Name validation
  if (!isLogin && !isForgotPassword) {
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (!/^[A-Za-z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain alphabetic characters';
    } else {
      const nameParts = formData.name.trim().split(/\s+/);
      if (nameParts.length < 1) {
        newErrors.name = 'Please enter at least one name';
      } else if (!nameParts.every(part => part.length > 0 && part[0] === part[0].toUpperCase())) {
        newErrors.name = 'Each name should start with a capital letter';
      }
    }
  }
  
  if (!isLogin && !isForgotPassword && formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match';
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    setIsLoading(false);
    return;
  }

  try {
    if (!isLogin && !isForgotPassword) {
      // Handle user registration
      const { data, error } = await signUp(
        formData.email, 
        formData.password,
        {
          data: {
            full_name: formData.name,
            name: formData.name
          }
        }
      );
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setErrors({ submit: 'An account with this email already exists. Please sign in instead.' });
        } else {
          setErrors({ submit: error.message });
        }
      } else {
        // Show registration success screen
        setVerificationEmail(formData.email);
        setShowRegistrationSuccess(true);
      }
    }
  } catch (error) {
    setErrors({ submit: 'An unexpected error occurred. Please try again.' });
  } finally {
    setIsLoading(false);
  }
};
```

### Registration Form JSX

```jsx
<form className={styles.authForm} onSubmit={handleSubmit}>
  {/* Name field for signup */}
  {!isLogin && !isForgotPassword && registerType === 'user' && (
    <div className={styles.inputGroup}>
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleInputChange}
        onBlur={(e) => validateField(e.target.name, e.target.value)}
        className={`${styles.input} ${errors.name ? styles.error : ''}`}
        required
      />
      {errors.name && <span className={styles.errorText}>{errors.name}</span>}
    </div>
  )}

  {/* Email field */}
  <div className={styles.inputGroup}>
    <input
      type="email"
      name="email"
      placeholder="Email Address"
      value={formData.email}
      onChange={handleInputChange}
      onBlur={(e) => validateField(e.target.name, e.target.value)}
      className={`${styles.input} ${errors.email ? styles.error : ''}`}
      required
    />
    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
  </div>

  {/* Password field */}
  {!isForgotPassword && (
    <div className={styles.inputGroup}>
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleInputChange}
        onBlur={(e) => validateField(e.target.name, e.target.value)}
        className={`${styles.input} ${errors.password ? styles.error : ''}`}
        required
      />
      {errors.password && <span className={styles.errorText}>{errors.password}</span>}
    </div>
  )}

  {/* Confirm Password field */}
  {!isLogin && !isForgotPassword && (
    <div className={styles.inputGroup}>
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        onBlur={(e) => validateField(e.target.name, e.target.value)}
        className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
        required
      />
      {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
    </div>
  )}

  {/* Submit button */}
  <button type="submit" className={styles.submitButton} disabled={isLoading}>
    {isLoading ? 'Processing...' : 'Register'}
  </button>
</form>
```

---

## 2. Backend Registration API (Express.js)

**File Path:** `backend/routes/auth.js`

**Full Path:** `C:\Users\binziya\Desktop\S9Proj\backend\routes\auth.js`

### User Registration Endpoint with OTP Verification

```javascript
// Register endpoint with OTP verification
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

    const { name, email, password } = req.body;
    const supabase = getSupabase();

    // Check if user already exists
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

    // Generate 6-digit OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Set OTP expiry (5 minutes)
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
});
```

### Email Verification Endpoint

```javascript
// Verify email endpoint
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
      const maxAttempts = pendingUser.max_attempts || 5;
      
      if (newAttempts >= maxAttempts) {
        // Lock account for 15 minutes
        const lockoutDuration = 15;
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
          message: `Too many failed attempts. Your account has been temporarily locked for ${lockoutDuration} minutes.`,
          locked: true
        });
      }

      await supabase
        .from('pending_users')
        .update({ otp_attempts: newAttempts })
        .eq('email', email.toLowerCase());

      return res.status(400).json({
        success: false,
        message: `Invalid verification code. You have ${maxAttempts - newAttempts} attempts remaining.`
      });
    }

    // Create user in users table
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

    // Generate JWT token
    const token = generateToken(newUser);

    res.json({
      success: true,
      message: 'Email verified successfully!',
      token,
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
```

---

## 3. Authentication Context (Supabase Integration)

**File Path:** `vite-project/src/contexts/AuthContext.jsx`

**Full Path:** `C:\Users\binziya\Desktop\S9Proj\vite-project\src\contexts\AuthContext.jsx`

### Sign Up Function

```javascript
// Sign up with email and password
const signUp = async (email, password, options = {}) => {
  setLoading(true)
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        ...options,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  } finally {
    setLoading(false)
  }
}
```

---

## Summary

The user registration system in TravelEase Hub implements a two-step verification process:

1. **Frontend (React)**: Captures user input (name, email, password) and validates form data
2. **Backend (Express.js)**: 
   - Validates registration data
   - Generates OTP (One-Time Password)
   - Stores user in `pending_users` table
   - Sends OTP via email
3. **Email Verification**: 
   - User enters OTP received via email
   - Backend verifies OTP
   - Creates user account in `users` table
   - Generates JWT token for authentication

This approach ensures secure user registration with email verification before account activation.

