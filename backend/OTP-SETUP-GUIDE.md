# 🚀 TravelEase OTP Email Verification Setup Guide

## 📋 What's Been Added

I've integrated a complete OTP email verification system into your existing TravelEase backend:

### ✅ **New Features Added:**
- 📧 **Email OTP verification** for user registration
- 🔐 **Secure OTP hashing** with bcrypt
- ⏰ **Automatic OTP expiry** (5 minutes)
- 🛡️ **Rate limiting** to prevent abuse
- 📊 **Supabase integration** with service role
- 🎨 **Professional email templates**
- ✅ **Complete validation** with Joi

### ✅ **New Files Created:**
- `utils/otp.js` - OTP generation and validation
- `utils/validation.js` - Input validation schemas
- `controllers/otpController.js` - OTP API controllers
- `database/add-otp-tables.sql` - Database schema updates
- `test-complete-otp-system.js` - Complete system test

### ✅ **Updated Files:**
- `package.json` - Added joi and nodemailer dependencies
- `config/supabase.js` - Added service role support
- `utils/emailService.js` - Added OTP email templates
- `routes/auth.js` - Added OTP endpoints with rate limiting
- `.env` - Added OTP configuration variables

## 🗄️ **Step 1: Update Supabase Database**

### 1.1 Run Database Migration
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your TravelEase project
3. Go to **SQL Editor**
4. Click **"New Query"**
5. Copy and paste the entire content from `database/add-otp-tables.sql`
6. Click **"Run"** to execute

### 1.2 Verify Tables Created
Go to **Table Editor** and verify you have:
- ✅ `users` table (existing)
- ✅ `email_verifications` table (new)

## 🔑 **Step 2: Get Supabase Service Role Key**

### 2.1 Get Service Role Key
1. In Supabase dashboard, go to **Settings** > **API**
2. Copy the **service_role** key (starts with `eyJ...`)
3. **Important**: This is different from your anon key!

### 2.2 Update .env File
Replace this line in your `.env` file:
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

With your actual service role key:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZndpemt1dWxzZGNuam9sdnFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzMDU4OSwiZXhwIjoyMDY5OTA2NTg5fQ.YOUR_ACTUAL_SERVICE_ROLE_KEY
```

## 📧 **Step 3: Verify Email Configuration**

Your email configuration should already be working. Verify these are in your `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=binziyap03@gmail.com
EMAIL_PASS=cqytolupfcsytokm
EMAIL_FROM_NAME=TravelEase
EMAIL_FROM_ADDRESS=binziyap03@gmail.com
```

## 🧪 **Step 4: Test the System**

### 4.1 Start Your Server
```bash
npm start
# or
node server.js
```

### 4.2 Run Complete Test
```bash
node test-complete-otp-system.js
```

This will test:
- ✅ Server health
- ✅ Supabase connection
- ✅ Email availability check
- ✅ OTP email sending
- ✅ OTP verification
- ✅ User creation

## 🎯 **Step 5: API Endpoints Available**

### **POST /api/auth/check-email**
Check if email is available for registration
```json
{
  "email": "user@example.com"
}
```

### **POST /api/auth/send-otp**
Send OTP to email for verification
```json
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "date_of_birth": "1990-01-01"
}
```

### **POST /api/auth/verify-otp**
Verify OTP and create user account
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "date_of_birth": "1990-01-01"
}
```

## 🔧 **Troubleshooting**

### **Issue: Supabase Connection Failed**
- ✅ Check `SUPABASE_SERVICE_ROLE_KEY` is correct
- ✅ Verify you're using service role key, not anon key
- ✅ Ensure database tables were created

### **Issue: Email Not Sending**
- ✅ Check Gmail app password is correct
- ✅ Verify 2FA is enabled on Gmail
- ✅ Check spam/junk folder

### **Issue: OTP Verification Failed**
- ✅ Check OTP hasn't expired (5 minutes)
- ✅ Verify OTP is exactly 6 digits
- ✅ Check database has email_verifications table

## 🚀 **Integration with Frontend**

Your frontend can now use these endpoints for registration:

```javascript
// 1. Check email availability
const checkEmail = await fetch('/api/auth/check-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: userEmail })
});

// 2. Send OTP
const sendOTP = await fetch('/api/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: userEmail, 
    full_name: userName 
  })
});

// 3. Verify OTP and create account
const verifyOTP = await fetch('/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: userEmail, 
    otp: userOTP,
    full_name: userName 
  })
});
```

## 🎉 **Success!**

Once setup is complete, you'll have:
- ✅ **Professional OTP emails** with TravelEase branding
- ✅ **Secure user registration** with email verification
- ✅ **Rate-limited endpoints** to prevent abuse
- ✅ **Automatic cleanup** of expired OTPs
- ✅ **Complete integration** with your existing system

**Your TravelEase backend now has enterprise-grade email verification!** 🚀
