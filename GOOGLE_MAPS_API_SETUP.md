# 🗺️ Google Maps API Setup Guide

## 🚨 **Current Issue: API Key Not Configured**

Your Google Maps is showing errors because the API key is not properly configured. Here's how to fix it:

## 🔧 **Step-by-Step Setup:**

### **1. Create Environment File**
Create a `.env` file in your `vite-project` directory:

```bash
# In your terminal, navigate to vite-project directory
cd vite-project

# Create .env file
touch .env
```

### **2. Add API Key to .env File**
Add this line to your `.env` file:

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### **3. Get Google Maps API Key**

#### **Option A: Quick Demo Key (Limited)**
For testing purposes, you can use a demo key temporarily:
```env
VITE_GOOGLE_MAPS_API_KEY=DEMO_KEY
```
⚠️ **Note:** This has usage limits and won't work in production.

#### **Option B: Get Real API Key (Recommended)**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select Project**
   - Create a new project or select existing one

3. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Search and enable:
     - ✅ **Maps JavaScript API**
     - ✅ **Directions API** 
     - ✅ **Places API**

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated key

5. **Secure Your API Key (Important!)**
   - Click on your API key to edit it
   - Under "Application restrictions":
     - Select "HTTP referrers (web sites)"
     - Add your domains:
       - `http://localhost:5173/*` (for development)
       - `https://yourdomain.com/*` (for production)
   - Under "API restrictions":
     - Select "Restrict key"
     - Choose only the APIs you need:
       - Maps JavaScript API
       - Directions API
       - Places API

6. **Add Key to .env**
   ```env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyC-your-actual-key-here
   ```

### **4. Restart Development Server**
After adding the API key, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🎯 **Expected Results:**

### **Before Fix:**
- ❌ `key=undefined` errors
- ❌ "Route map unavailable" message
- ❌ Multiple API loading errors
- ❌ Invalid key warnings

### **After Fix:**
- ✅ **Map displays correctly**
- ✅ **Route visualization works**
- ✅ **No console errors**
- ✅ **Proper async loading**

## 🔍 **Verification:**

1. **Check Console**
   - Open browser developer tools (F12)
   - Look for any Google Maps errors
   - Should see no `key=undefined` errors

2. **Test Route Map**
   - Generate an itinerary with multiple locations
   - Route map should display with markers and lines
   - Distance calculations should work

## 🛠️ **Troubleshooting:**

### **Still Getting Errors?**
1. **Check .env file location** - Must be in `vite-project` directory
2. **Verify API key** - Make sure it's copied correctly
3. **Check API restrictions** - Ensure localhost is allowed
4. **Restart server** - Changes to .env require restart
5. **Clear browser cache** - Sometimes needed for API changes

### **Common Issues:**
- **"Invalid Key"** → API key is wrong or restricted
- **"Quota Exceeded"** → API usage limits reached
- **"Referer Not Allowed"** → Domain restrictions too strict

## 💡 **Pro Tips:**

1. **Use separate keys** for development and production
2. **Monitor usage** in Google Cloud Console
3. **Set up billing alerts** to avoid unexpected charges
4. **Test thoroughly** before deploying to production

## 📞 **Need Help?**

If you're still having issues:
1. Check the browser console for specific error messages
2. Verify your API key in Google Cloud Console
3. Make sure all required APIs are enabled
4. Ensure your domain restrictions are correct

**Once configured, your route maps will display beautifully with proper markers, routes, and distance calculations!** 🗺️✨
