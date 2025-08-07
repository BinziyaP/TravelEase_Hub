# 📧 Email Setup Guide for TravelEase Forgot Password

## 🎯 **Quick Setup for Gmail (Recommended)**

### **Step 1: Enable 2-Factor Authentication**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification**
3. Follow the setup process to enable 2FA

### **Step 2: Generate App Password**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** → **App passwords**
3. Select **Mail** and **Other (Custom name)**
4. Enter "TravelEase" as the app name
5. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### **Step 3: Update Your .env File**
```env
# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=binziyap03@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM_NAME=TravelEase
EMAIL_FROM_ADDRESS=binziyap03@gmail.com
```

**Replace:**
- `EMAIL_USER` with your Gmail address: `binziyap03@gmail.com`
- `EMAIL_PASS` with the 16-character app password from Step 2
- `EMAIL_FROM_ADDRESS` with your Gmail address: `binziyap03@gmail.com`

### **Step 4: Test Email Configuration**
```bash
# Start your backend server
cd backend
npm start

# Test email configuration
curl http://localhost:5000/api/auth/test-email-config

# Send test email to yourself
curl -X POST http://localhost:5000/api/auth/send-test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"binziyap03@gmail.com"}'
```

### **Step 5: Test Forgot Password**
```bash
# Request password reset
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"binziyap03@gmail.com"}'
```

**You should receive an email with a reset link!**

## 🔧 **Alternative Email Providers**

### **Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### **Yahoo Mail:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

### **Custom SMTP:**
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-username
EMAIL_PASS=your-password
```

## 🧪 **Testing Commands**

### **1. Test Email Configuration:**
```bash
curl http://localhost:5000/api/auth/test-email-config
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email configuration is valid"
}
```

### **2. Send Test Email:**
```bash
curl -X POST http://localhost:5000/api/auth/send-test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"binziyap03@gmail.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "messageId": "<message-id@gmail.com>"
}
```

### **3. Test Complete Forgot Password Flow:**
```bash
# Step 1: Request reset
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"binziyap03@gmail.com"}'

# Step 2: Check your email for reset link
# Step 3: Click the link or use the token to reset password
```

## 🚨 **Troubleshooting**

### **"Invalid login" Error:**
- ✅ Make sure 2FA is enabled on your Google account
- ✅ Use App Password, not your regular Gmail password
- ✅ Check EMAIL_USER matches your Gmail address exactly

### **"Connection timeout" Error:**
- ✅ Check your internet connection
- ✅ Try EMAIL_PORT=465 with EMAIL_SECURE=true
- ✅ Check if your firewall blocks SMTP

### **"Authentication failed" Error:**
- ✅ Regenerate App Password in Google Account Settings
- ✅ Make sure there are no extra spaces in .env file
- ✅ Try using your full Gmail address

### **No Email Received:**
- ✅ Check spam/junk folder
- ✅ Check server console for error messages
- ✅ Verify email address is correct
- ✅ Test with the test email endpoint first

## 📱 **Frontend Integration**

Your frontend already shows "Password reset link sent to your email" - once you configure the email settings above, users will actually receive the emails!

The reset link will take users to: `http://localhost:5173/reset-password?token=...`

Make sure you have a reset password page at that route in your React app.

## 🔒 **Security Notes**

- ✅ **App passwords are safer** than using your main Gmail password
- ✅ **Tokens expire in 1 hour** for security
- ✅ **Tokens are single-use** and can't be reused
- ✅ **Email content is HTML** with professional styling
- ✅ **No sensitive data** is logged in production

## 🎉 **What Happens After Setup**

1. **User clicks "Forgot Password"** on your frontend
2. **User enters their email** and submits
3. **Backend creates secure reset token** and saves to database
4. **Email is sent** with professional HTML template
5. **User clicks reset link** in email
6. **User enters new password** on reset page
7. **Password is updated** and token is marked as used

**Your forgot password feature will be fully functional with real email delivery!** 📧✨
