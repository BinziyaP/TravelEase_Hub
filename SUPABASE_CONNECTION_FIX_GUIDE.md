# 🔧 Supabase Connection Fix Guide

## 🚨 Current Issue
Your application is showing `net::ERR_NAME_NOT_RESOLVED` errors when trying to edit packages. This indicates that the Supabase project URL `https://lffwizkuulsdcnjolvqr.supabase.co` is not accessible.

## 🔍 Root Cause
The Supabase project is returning a 404 error, which means:
- The project has been deleted or paused
- The project URL is incorrect
- The project needs to be reactivated

## ✅ Solution Options

### Option 1: Reactivate Your Existing Project (Recommended)

1. **Go to Supabase Dashboard**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sign in with your account

2. **Check Project Status**
   - Look for your project with ID `lffwizkuulsdcnjolvqr`
   - If it's paused, click "Resume" or "Reactivate"
   - If it's deleted, you'll need to create a new project

3. **Get Updated Credentials**
   - Go to **Settings** → **API**
   - Copy the **Project URL** and **anon public key**
   - Update your configuration (see below)

### Option 2: Create a New Supabase Project

1. **Create New Project**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Choose your organization
   - Enter project details:
     - Name: `TravelEase`
     - Database Password: (choose a strong password)
     - Region: (choose closest to your location)

2. **Set Up Database Schema**
   - Go to **SQL Editor** in your Supabase dashboard
   - Click **"New Query"**
   - Copy and paste the contents from your existing database schema files
   - Click **"Run"** to execute

3. **Get API Keys**
   - Go to **Settings** → **API**
   - Copy the **Project URL** and **anon public key**

## 🔧 Update Configuration

### Method 1: Environment Variables (Recommended)

1. **Create `.env` file** in your `vite-project` directory:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-new-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-new-anon-key

# Development settings
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

2. **Replace the values** with your actual Supabase project details

### Method 2: Direct Code Update

1. **Update `vite-project/src/lib/supabase.js`**
   - Replace the hardcoded URL and key with your new values
   - The configuration will automatically use environment variables if available

## 🧪 Test the Fix

1. **Start your application**:
```bash
cd vite-project
npm run dev
```

2. **Test package editing**:
   - Try to edit a package
   - Check browser console for any errors
   - Verify that the connection is working

## 🔍 Troubleshooting

### If you still get connection errors:

1. **Check Internet Connection**
   - Ensure you have a stable internet connection
   - Try accessing [https://supabase.com](https://supabase.com) in your browser

2. **Check Firewall/Proxy**
   - Ensure your firewall isn't blocking Supabase connections
   - If using a corporate network, check proxy settings

3. **Clear Browser Cache**
   - Clear your browser cache and cookies
   - Try opening the app in an incognito/private window

4. **Verify Project Status**
   - Go to your Supabase dashboard
   - Ensure the project is active and not paused
   - Check if there are any billing issues

### If you get permission errors:

1. **Check RLS Policies**
   - Go to **Authentication** → **Policies** in your Supabase dashboard
   - Ensure proper Row Level Security policies are set up

2. **Verify API Keys**
   - Make sure you're using the correct anon key
   - Check if the key has expired

## 📞 Need Help?

If you continue to experience issues:

1. **Check Supabase Status**: [https://status.supabase.com](https://status.supabase.com)
2. **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
3. **Community Support**: [https://github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)

## 🎯 Quick Fix Summary

The fastest way to resolve this issue:

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Check if your project is paused and reactivate it
3. If deleted, create a new project and update the configuration
4. Update your `.env` file with the new credentials
5. Restart your application

This should resolve the `net::ERR_NAME_NOT_RESOLVED` error and allow you to edit packages successfully.







