# Email Verification with OTP - Complete Setup Guide

## Overview
This guide implements email verification with OTP (One-Time Password) for the TravelEase Hub application.

## 🗄️ Database Setup

### Step 1: Execute SQL in Supabase
Go to your Supabase Dashboard → SQL Editor and execute the following SQL:

```sql
-- Create pending_users table for email verification with OTP
-- This implements the exact requirements from the user

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pending_users table as requested
CREATE TABLE IF NOT EXISTS pending_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    otp_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pending_users_email ON pending_users(email);
CREATE INDEX IF NOT EXISTS idx_pending_users_expires_at ON pending_users(otp_expires_at);

-- Ensure users table has verified column (modify existing table)
DO $$ 
BEGIN
    -- Add verified column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'verified'
    ) THEN
        ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Row Level Security (RLS) policies for pending_users
ALTER TABLE pending_users ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all data (for backend operations)
CREATE POLICY "Service role can access all pending_users" ON pending_users
    FOR ALL USING (auth.role() = 'service_role');

-- Function to clean up expired pending users
CREATE OR REPLACE FUNCTION cleanup_expired_pending_users()
RETURNS void AS $$
BEGIN
    DELETE FROM pending_users WHERE otp_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON pending_users TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Display table structure for verification
SELECT 
    'pending_users table created successfully' as status,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pending_users'
ORDER BY ordinal_position;
```

### Step 2: Update .env file (if needed)
Ensure your `.env` file has the OTP configuration:

```env
# OTP Configuration
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=3
BCRYPT_ROUNDS=12
```

## 🔧 Backend Changes Made

### 1. Routes Updated (`/backend/routes/auth.js`)
- **POST /register** or **POST /signup**: Now sends OTP email instead of creating user directly
- **POST /verify-email**: New endpoint to verify OTP and create user
- **POST /resend-otp**: New endpoint to resend OTP (rate-limited to 3/hour)
- **POST /login**: Now checks email verification before allowing login

### 2. Database Functions Used
- `generateOTP()`: Creates 6-digit OTP
- `hashOTP()`: Hashes OTP with bcrypt
- `verifyOTP()`: Verifies OTP against hash
- `sendOTPEmail()`: Sends OTP via email

## 🎨 Frontend Changes Made

### 1. AuthModal Component Updated
- Shows OTP input form after registration
- Implements resend OTP functionality
- Handles verification success/failure
- Redirects to login after successful verification

### 2. New User Flow
1. User fills registration form
2. Backend sends OTP to email
3. User enters 6-digit OTP
4. Backend verifies OTP and creates user account
5. User can now login normally

## 🧪 Testing

### Manual Testing Steps
1. **Start the backend**: `cd backend && npm start`
2. **Start the frontend**: `cd vite-project && npm run dev`
3. **Register a new user**: Fill the signup form
4. **Check email**: Look for 6-digit OTP
5. **Enter OTP**: Complete verification
6. **Login**: Use same credentials to login

### Automated Testing
Run the test script:
```bash
cd backend
node test-otp-flow.js
```

## 📧 Email Configuration

The system uses the existing email configuration from your `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=travelease029@gmail.com
EMAIL_PASS=lughjwieitczokme
EMAIL_FROM_NAME=TravelEase
EMAIL_FROM_ADDRESS=travelease029@gmail.com
```

## 🔒 Security Features

### Implemented Security Measures
- ✅ OTP expires in 5 minutes
- ✅ OTP is hashed with bcrypt before storage
- ✅ Rate limiting on resend (3 attempts per hour)
- ✅ Email verification required before login
- ✅ Input validation on all endpoints
- ✅ Cleanup of expired OTP records

### Security Best Practices
- ✅ Uses secure bcrypt hashing
- ✅ Validates email format
- ✅ Sanitizes all inputs
- ✅ Implements proper error handling
- ✅ Uses environment variables for secrets

## 🚀 API Endpoints

### Registration Flow
```bash
# Step 1: Register (sends OTP)
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "Password123!",
  "confirmPassword": "Password123!"
}

# Step 2: Verify OTP
POST /api/auth/verify-email
{
  "email": "john@example.com",
  "otp": "123456"
}

# Step 3: Login (now allowed)
POST /api/auth/login  
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

### Additional Endpoints
```bash
# Resend OTP
POST /api/auth/resend-otp
{
  "email": "john@example.com"
}
```

## 🐛 Troubleshooting

### Common Issues
1. **"No pending verification found"**
   - User needs to register first
   - OTP may have expired (5 minutes)

2. **"Please verify your email before logging in"**
   - Complete OTP verification first
   - Check `verified` column in users table

3. **"Failed to send verification email"**
   - Check email configuration in `.env`
   - Verify Gmail app password is correct

### Database Verification
Check if tables were created correctly:
```sql
-- Check pending_users table
SELECT * FROM information_schema.tables WHERE table_name = 'pending_users';

-- Check users table has verified column
SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'verified';
```

## ✅ Implementation Complete

The email verification with OTP system is now fully implemented and integrated into your existing TravelEase Hub application. Users must verify their email with a 6-digit OTP before they can log in to the system.