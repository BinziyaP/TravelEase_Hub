# TravelEase - Secure Authentication System API Guide

## Overview
This API implements a complete secure user authentication system with the following features:

- **Google OAuth 2.0** - Instant registration and login with Google accounts
- **Manual Registration** - Email verification with 6-digit OTP system 
- **Password Security** - bcrypt hashing, secure password reset with JWT tokens
- **Account Security** - Lockout after 5 failed OTP attempts for 15 minutes
- **Email Notifications** - Registration success, OTP verification, password reset

## Base URL
```
http://localhost:5000/api/auth
```

## Authentication Flows

### 1. Google Sign-Up/Login Flow

#### Step 1: Initiate Google OAuth
```
GET /api/auth/google
```
- Redirects user to Google OAuth consent screen
- User grants permissions for profile and email

#### Step 2: Google OAuth Callback
```
GET /api/auth/google/callback
```
- Handles Google's response after user consent
- Creates new user account or logs in existing user
- Sends "Registration Successful" email for new users
- Redirects to dashboard with JWT token

**Email sent for new users:**
- **Subject:** "Registration Successful"
- **Body:** "Hello [Name], you have successfully registered."

**Success redirect:**
```
http://localhost:5175/auth/callback?token=JWT_TOKEN&user=USER_DATA
```

### 2. Manual Sign-Up Flow

#### Step 1: Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email for the verification code.",
  "email": "john@example.com",
  "expires_in_minutes": 5
}
```

**Email sent:**
- **Subject:** "Verify Your Account"  
- **Body:** "Hello John Doe, your OTP is 123456."

#### Step 2: Verify Email with OTP
```
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully! Redirecting to dashboard...",
  "token": "JWT_TOKEN",
  "redirectTo": "/dashboard",
  "user": {
    "id": "user-uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "verified": true,
    "userType": "user"
  }
}
```

### 3. Login Flow

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "redirectTo": "/dashboard",
  "user": {
    "id": "user-uuid",
    "name": "John Doe", 
    "email": "john@example.com",
    "emailVerified": true,
    "userType": "user"
  }
}
```

### 4. Forgot Password Flow

#### Step 1: Request Password Reset
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response (Always 200 for security):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Email sent (if user exists):**
- **Subject:** "Reset Your TravelEase Password"
- **Body:** Contains secure reset link with JWT token (expires in 1 hour)

#### Step 2: Verify Reset Token
```
POST /api/auth/verify-reset-token
Content-Type: application/json

{
  "token": "reset-token-from-email"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Reset token is valid",
  "user": {
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### Step 3: Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully! You can now log in with your new password.",
  "redirectTo": "/login"
}
```

## Security Features

### OTP Security
- **6-digit numeric OTP** - Generated using crypto.randomInt()
- **5-minute expiry** - Configurable via `OTP_EXPIRY_MINUTES` 
- **bcrypt hashing** - OTPs stored as hashed values in database
- **Rate limiting** - 3 OTP requests per 15 minutes per IP

### Account Lockout Protection
- **5 failed attempts** = Account locked for 15 minutes
- **Lockout applies to** both email verification and password reset
- **Automatic unlock** after lockout period expires
- **Configurable via** `OTP_MAX_ATTEMPTS` and `OTP_LOCKOUT_DURATION_MINUTES`

**Lockout Response (423):**
```json
{
  "success": false,
  "message": "Account is temporarily locked due to too many failed attempts. Please try again in 14 minutes.",
  "locked": true,
  "lockedUntil": "2024-01-20T15:30:00.000Z",
  "minutesRemaining": 14
}
```

### Password Security
- **Minimum 6 characters** - Enforced by validation
- **bcrypt hashing** - Using 12 salt rounds (configurable)
- **JWT tokens** - Signed with `JWT_SECRET`, 7-day expiry
- **Password reset tokens** - Signed JWT, 1-hour expiry, single-use

### Rate Limiting
- **Login attempts:** 100 per 15 minutes per IP
- **OTP requests:** 3 per 15 minutes per IP  
- **Email checks:** 10 per 15 minutes per IP
- **OTP verifications:** 10 per 15 minutes per IP

## Error Responses

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### Authentication Errors (401)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Account Locked (423)
```json
{
  "success": false,
  "message": "Too many failed attempts. Your account has been temporarily locked for 15 minutes for security.",
  "locked": true,
  "lockedUntil": "2024-01-20T15:30:00.000Z",
  "minutesRemaining": 15
}
```

### Rate Limited (429)
```json
{
  "success": false,
  "message": "Too many OTP requests. Please try again later."
}
```

## Database Schema

### Users Table
```sql
users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255), -- NULL for Google OAuth users
    google_id VARCHAR(255) UNIQUE, -- For Google OAuth
    email_verified BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    user_type VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
)
```

### Pending Users Table (OTP Storage)
```sql
pending_users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    otp_expires_at TIMESTAMP NOT NULL,
    otp_attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW()
)
```

### Password Reset Tokens Table
```sql
password_reset_tokens (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
)
```

## Environment Configuration

```env
# Server
PORT=5000
FRONTEND_URL=http://localhost:5175

# JWT & Security
JWT_SECRET="your-jwt-secret-key"
SESSION_SECRET="your-session-secret-key"  
BCRYPT_ROUNDS=12

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Supabase
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=TravelEase

# OTP Security
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_LOCKOUT_DURATION_MINUTES=15
```

## Testing the API

### 1. Test Google OAuth
1. Navigate to: `http://localhost:5000/api/auth/google`
2. Complete Google OAuth flow
3. Should redirect to dashboard with token

### 2. Test Manual Registration
1. POST to `/api/auth/register` with user details
2. Check email for OTP
3. POST to `/api/auth/verify-email` with OTP
4. Should receive JWT token and redirect to dashboard

### 3. Test Security Features
1. Try 6 failed OTP attempts to trigger lockout
2. Verify 15-minute lockout period
3. Test password reset flow
4. Test rate limiting with multiple requests

## Dashboard Integration
After successful authentication, use the JWT token to access protected routes:

```javascript
// Frontend usage
const token = localStorage.getItem('authToken');
const response = await fetch('/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

The authentication system automatically redirects to `/dashboard` after:
- ✅ Google OAuth success
- ✅ Email verification success  
- ✅ Login success
- ✅ Password reset success (redirects to `/login`)

This completes the secure authentication system implementation with all requested features!