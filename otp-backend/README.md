# OTP Email Verification System

A complete Node.js + Supabase backend for user registration with email OTP verification.

## 🚀 Features

- ✅ Email format validation and duplicate checking
- ✅ Secure OTP generation and hashing (bcrypt)
- ✅ Email delivery with professional templates
- ✅ Automatic OTP expiry and cleanup
- ✅ Rate limiting and security measures
- ✅ Comprehensive error handling
- ✅ Modern ES modules architecture
- ✅ Production-ready code structure

## 📋 API Endpoints

### 1. Check Email
**POST** `/api/auth/check-email`

Validates email format and checks if email already exists.

```json
// Request
{
  "email": "user@example.com"
}

// Response (Success)
{
  "success": true,
  "message": "Email is available for registration",
  "exists": false
}

// Response (Email exists)
{
  "success": false,
  "message": "Email already registered",
  "exists": true
}
```

### 2. Send OTP
**POST** `/api/auth/send-otp`

Generates OTP, stores it securely, and sends email.

```json
// Request
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "date_of_birth": "1990-01-01"
}

// Response
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "expires_in_minutes": 5
}
```

### 3. Verify OTP
**POST** `/api/auth/verify-otp`

Verifies OTP and creates user profile.

```json
// Request
{
  "email": "user@example.com",
  "otp": "123456"
}

// Response
{
  "success": true,
  "message": "Email verified and account created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "email_verified": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js 18+ 
- Supabase account
- Gmail account (for SMTP)

### 2. Supabase Setup

1. Create a new Supabase project
2. Go to SQL Editor and run the schema from `database/schema.sql`
3. Get your project URL and service role key from Settings > API

### 3. Gmail SMTP Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
3. Use this app password in your `.env` file

### 4. Installation

```bash
# Clone or create the project
mkdir otp-backend && cd otp-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### 5. Environment Configuration

Create `.env` file with your credentials:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server
PORT=3000
NODE_ENV=development

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM_NAME=Your App Name
EMAIL_FROM_ADDRESS=your-email@gmail.com

# OTP Settings
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=3
BCRYPT_ROUNDS=12
```

### 6. Run the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## 🔒 Security Features

- **Rate Limiting**: Prevents spam and abuse
- **OTP Hashing**: OTPs are hashed before storage
- **Input Validation**: Comprehensive validation with Joi
- **CORS Protection**: Configurable CORS policies
- **Helmet Security**: Security headers
- **Automatic Cleanup**: Expired OTPs are removed

## 📊 Database Schema

### Profiles Table
```sql
- id (UUID, Primary Key)
- email (VARCHAR, Unique, NOT NULL)
- full_name (VARCHAR, NOT NULL)
- phone (VARCHAR, Optional)
- date_of_birth (DATE, Optional)
- email_verified (BOOLEAN, Default: TRUE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Email Verifications Table
```sql
- id (UUID, Primary Key)
- email (VARCHAR, NOT NULL)
- otp_hash (VARCHAR, NOT NULL)
- expires_at (TIMESTAMP, NOT NULL)
- attempts (INTEGER, Default: 0)
- max_attempts (INTEGER, Default: 3)
- created_at (TIMESTAMP)
```

## 🧪 Testing

Test the API endpoints using curl or Postman:

```bash
# Health check
curl http://localhost:3000/health

# Check email
curl -X POST http://localhost:3000/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","full_name":"Test User"}'

# Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

## 🚀 Production Deployment

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up proper logging
4. Configure reverse proxy (nginx)
5. Use environment-specific CORS origins
6. Set up monitoring and alerts

## 📝 License

MIT License - feel free to use in your projects!
