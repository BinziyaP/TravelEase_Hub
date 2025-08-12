# Supabase Authentication Migration Guide

## Overview
This guide will help you migrate from your custom authentication system to Supabase's built-in authentication. This will solve your user creation issues and provide a more robust, scalable authentication system.

## Steps to Complete Migration

### 1. Setup Supabase Database Schema

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `supabase-auth-setup.sql`
3. Run the SQL script
4. This will create:
   - `profiles` table for additional user data
   - `bookings` table for travel bookings
   - Proper RLS policies
   - Triggers for automatic profile creation

### 2. Configure Supabase Auth Settings

1. In your **Supabase Dashboard** → **Authentication** → **Settings**:
   - **Site URL**: `http://localhost:5173`
   - **Redirect URLs**: Add `http://localhost:5173/auth/callback`

2. **Email Templates** (Optional):
   - Go to **Authentication** → **Email Templates**
   - Customize your signup confirmation and password reset emails

3. **OAuth Providers** (Optional):
   - Go to **Authentication** → **Providers** 
   - Configure Google OAuth with your existing credentials:
     - Client ID: (from your .env file)
     - Client Secret: (from your .env file)

### 3. Update Your Backend

**Option A: Use the new Supabase-only backend**
1. Stop your current server
2. Run: `node server-supabase.js` (instead of `server.js`)

**Option B: Keep existing backend and add Supabase routes**
1. Add this line to your existing `server.js`:
   ```javascript
   app.use('/api/supabase', require('./routes/supabase-auth'));
   ```

### 4. Test the Migration

1. **Start your services:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   node server-supabase.js

   # Terminal 2 - Frontend  
   cd vite-project
   npm run dev
   ```

2. **Test user registration:**
   - Go to your app
   - Click "Sign Up"
   - Register with a real email address
   - Check your email for confirmation link
   - Click the link to verify your account
   - Sign in with your credentials

3. **Verify in Supabase:**
   - Go to **Authentication** → **Users** in your dashboard
   - You should see the new user
   - Check the **Table Editor** → **profiles** table for user profile data

### 5. Benefits You'll Get

✅ **No more "Failed to create pending user account" errors**  
✅ **Built-in email verification**  
✅ **Secure password reset**  
✅ **Google OAuth integration**  
✅ **Session management**  
✅ **Row Level Security (RLS)**  
✅ **Automatic user profile creation**  
✅ **Scalable authentication system**  

### 6. Troubleshooting

**Issue: "Invalid supabaseUrl" error**
- Make sure your `.env` file has the correct `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

**Issue: Email not being sent**
- Check your Supabase project email settings
- Verify your domain/redirect URLs are correct

**Issue: Google OAuth not working**
- Make sure Google OAuth is enabled in Supabase dashboard
- Verify your Google Client ID and Secret are configured in Supabase

**Issue: User can't access dashboard**
- Check that the user has clicked the email confirmation link
- Verify the user exists in Supabase Authentication → Users

### 7. Migration Cleanup (After Testing)

Once everything works properly:
1. Remove old authentication files:
   - `routes/auth.js` (the old one)
   - `controllers/otpController.js`
   - `utils/otp.js`
   - `utils/emailService.js`
   - All the old SQL migration files

2. Remove unused dependencies:
   ```bash
   npm remove bcryptjs jsonwebtoken express-validator
   ```

3. Clean up old database tables:
   ```sql
   DROP TABLE IF EXISTS pending_users;
   DROP TABLE IF EXISTS email_verifications;
   DROP TABLE IF EXISTS password_reset_tokens;
   ```

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the terminal logs for backend errors  
3. Verify your Supabase project settings
4. Make sure all environment variables are correctly set

Your authentication system will now be much more reliable and easier to maintain!