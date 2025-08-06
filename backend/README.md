# TravelEase Backend API

A Node.js/Express backend API for the TravelEase travel booking application with Supabase integration and Google OAuth authentication.

## Features

- 🔐 **Authentication & Authorization**
  - Email/Password registration and login
  - Google OAuth integration
  - JWT token-based authentication
  - Password reset functionality
  - Email verification

- 🛡️ **Security**
  - Helmet.js for security headers
  - Rate limiting
  - Input validation with express-validator
  - Bcrypt password hashing
  - CORS configuration

- 🗄️ **Database**
  - Supabase PostgreSQL integration
  - Row Level Security (RLS)
  - Automated token cleanup
  - User session management

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-key-here

# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL script from `database/schema.sql`
4. Update your `.env` file with the Supabase URL and anon key

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
6. Update your `.env` file with the client ID and secret

### 5. Start the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/verify` | Verify JWT token |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health status |
| GET | `/` | API information |

## Request/Response Examples

### Register User

**POST** `/api/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false
  }
}
```

### Login User

**POST** `/api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false
  }
}
```

## Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Optional validation errors
}
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All inputs are validated and sanitized
- **Password Security**: Bcrypt with 12 salt rounds
- **JWT Security**: 7-day expiration with secure secret
- **CORS**: Configured for frontend domain only
- **Helmet**: Security headers for production

## Development

### Project Structure

```
backend/
├── config/
│   ├── passport.js      # Passport.js configuration
│   └── supabase.js      # Supabase client setup
├── database/
│   └── schema.sql       # Database schema
├── routes/
│   └── auth.js          # Authentication routes
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
├── server.js            # Main server file
└── README.md           # This file
```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (not implemented yet)

## Deployment

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

- `NODE_ENV=production`
- `PORT=5000` (or your preferred port)
- `FRONTEND_URL=https://yourdomain.com`
- `JWT_SECRET=your-production-jwt-secret`
- `SESSION_SECRET=your-production-session-secret`
- `SUPABASE_URL=your-supabase-url`
- `SUPABASE_ANON_KEY=your-supabase-anon-key`
- `GOOGLE_CLIENT_ID=your-google-client-id`
- `GOOGLE_CLIENT_SECRET=your-google-client-secret`

### Deployment Platforms

This backend can be deployed to:
- Heroku
- Vercel
- Railway
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
