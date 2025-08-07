# 🔑 Forgot Password Implementation Guide

## ✅ **What's Been Added:**

### **Backend Features:**
1. **Password Reset Token System** - Secure tokens with 1-hour expiration
2. **Database Integration** - Uses `password_reset_tokens` table
3. **API Endpoints** - Complete forgot password flow
4. **Security Features** - Tokens are single-use and time-limited

### **🔧 API Endpoints:**

#### 1. **Request Password Reset**
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

#### 2. **Verify Reset Token**
```
GET /api/auth/verify-reset-token/:token
```

**Response:**
```json
{
  "success": true,
  "message": "Reset token is valid",
  "user": {
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### 3. **Reset Password**
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-here",
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

#### 4. **Get Reset Token (Development Only)**
```
POST /api/auth/get-reset-token
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## 🧪 **Testing the Implementation:**

### **1. Test with Existing User:**
```bash
cd backend
node test-forgot-password.js your-email@example.com
```

### **2. Test API Endpoints:**

**Step 1: Request Reset**
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Step 2: Check Server Logs**
Look for the reset token in your server console output.

**Step 3: Verify Token**
```bash
curl http://localhost:5000/api/auth/verify-reset-token/YOUR_TOKEN_HERE
```

**Step 4: Reset Password**
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN_HERE","password":"newpass123","confirmPassword":"newpass123"}'
```

## 📱 **Frontend Integration:**

### **1. Forgot Password Form:**
```jsx
// ForgotPassword.jsx
import { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};
```

### **2. Reset Password Form:**
```jsx
// ResetPassword.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
      verifyToken(resetToken);
    }
  }, [searchParams]);

  const verifyToken = async (resetToken) => {
    try {
      const response = await fetch(`/api/auth/verify-reset-token/${resetToken}`);
      const data = await response.json();
      
      if (data.success) {
        setTokenValid(true);
        setMessage(`Reset password for ${data.user.email}`);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Invalid or expired reset link.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword })
      });

      const data = await response.json();
      setMessage(data.message);
      
      if (data.success) {
        // Redirect to login page after successful reset
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return <div>{message}</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        required
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm new password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};
```

## 🔒 **Security Features:**

1. **Token Expiration** - Tokens expire in 1 hour
2. **Single Use** - Tokens can only be used once
3. **Secure Generation** - Uses crypto.randomBytes(32)
4. **No Email Enumeration** - Always returns success message
5. **Password Validation** - Enforces password requirements

## 🎯 **Next Steps:**

1. **Test the API endpoints** using the provided curl commands
2. **Create frontend components** for forgot/reset password
3. **Add email integration** when ready (optional)
4. **Style the forms** to match your app design

## 📧 **Email Integration (Future):**

When you're ready to add email sending:

1. **Install email service** (nodemailer, SendGrid, etc.)
2. **Create email templates** for password reset
3. **Update forgot-password endpoint** to send emails
4. **Remove development logging** of tokens

The system is designed to work with or without email - tokens are logged to console in development mode for testing.

## ✅ **Compatibility:**

- ✅ **Existing Auth Works** - Login, register, Google OAuth unchanged
- ✅ **Database Safe** - Uses separate tokens table
- ✅ **Secure** - Industry-standard password reset flow
- ✅ **Testable** - Complete test suite included
