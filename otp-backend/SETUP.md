# 🚀 Complete Setup Guide

## 📋 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Supabase Account** - [Sign up here](https://supabase.com/)
- **Gmail Account** - For SMTP email sending

## 🗄️ Supabase Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and enter project details
4. Wait for project to be created

### 2. Run Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New Query"**
3. Copy and paste the entire content from `database/schema.sql`
4. Click **"Run"** to execute the schema
5. Verify tables were created in **Table Editor**

### 3. Get API Keys

1. Go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
   - **service_role secret key** (starts with `eyJ...`)

## 📧 Gmail SMTP Setup

### 1. Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled

### 2. Generate App Password

1. Go to **Security** > **2-Step Verification**
2. Scroll down to **App passwords**
3. Click **"Select app"** > **"Mail"**
4. Click **"Select device"** > **"Other"**
5. Enter name: "OTP Backend"
6. Click **"Generate"**
7. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

## 💻 Backend Setup

### 1. Install Dependencies

```bash
cd otp-backend
npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit with your credentials
nano .env
```

### 3. Fill in Environment Variables

```env
# Supabase (from step 3 above)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# Server
PORT=3000
NODE_ENV=development

# Gmail SMTP (from step 2 above)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
EMAIL_FROM_NAME=Your App Name
EMAIL_FROM_ADDRESS=your-email@gmail.com

# OTP Settings
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=3
BCRYPT_ROUNDS=12
```

### 4. Start the Server

```bash
# Development mode (auto-reload)
npm run dev

# Or production mode
npm start
```

### 5. Verify Setup

You should see:
```
✅ Supabase connected successfully
✅ Email configuration is valid
✅ Server running on port 3000
```

## 🧪 Testing

### 1. Health Check

```bash
curl http://localhost:3000/health
```

### 2. Run Test Script

```bash
node test-api.js
```

### 3. Manual Testing

Use Postman or curl to test the endpoints:

**Check Email:**
```bash
curl -X POST http://localhost:3000/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Send OTP:**
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "full_name":"Test User",
    "phone":"+1234567890"
  }'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "otp":"123456"
  }'
```

## 🔧 Troubleshooting

### Common Issues

**1. Supabase Connection Failed**
- Check your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Ensure you're using the service role key, not the anon key
- Verify your project is active in Supabase dashboard

**2. Email Not Sending**
- Check Gmail app password is correct (16 characters, no spaces)
- Ensure 2FA is enabled on your Gmail account
- Try generating a new app password
- Check spam folder for test emails

**3. Database Errors**
- Ensure you ran the complete schema from `database/schema.sql`
- Check table names match exactly: `profiles` and `email_verifications`
- Verify RLS policies are set correctly

**4. Rate Limiting**
- Wait 15 minutes if you hit rate limits during testing
- Adjust rate limits in `routes/auth.js` for development

### Debug Mode

Add this to your `.env` for more detailed logging:
```env
NODE_ENV=development
DEBUG=*
```

## 🚀 Production Deployment

### 1. Environment Setup
```env
NODE_ENV=production
PORT=3000
# Use production Supabase project
# Use production email credentials
```

### 2. Process Manager (PM2)
```bash
npm install -g pm2
pm2 start server.js --name "otp-backend"
pm2 startup
pm2 save
```

### 3. Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📞 Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test Supabase connection in the dashboard
4. Ensure Gmail app password is working
5. Check rate limits aren't being exceeded

The system is designed to provide clear error messages to help with debugging!
