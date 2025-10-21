# 🔧 Backend Setup Guide - Fix API Errors

## ❌ **Current Issues:**
- **404 Error**: `/api/booking/check-capacity` not found
- **500 Error**: `/api/booking/create` internal server error

## ✅ **Solution Steps:**

### **1. Create Environment File**

Create `backend/.env` file with these variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Razorpay Configuration (Get from Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### **2. Get Your Razorpay Keys**

1. **Go to Razorpay Dashboard** (test mode)
2. **Go to Settings → API Keys**
3. **Copy your keys:**
   - **Key ID**: `rzp_test_...`
   - **Key Secret**: `...`

### **3. Get Your Supabase Keys**

1. **Go to Supabase Dashboard**
2. **Go to Settings → API**
3. **Copy your keys:**
   - **URL**: `https://your-project.supabase.co`
   - **Anon Key**: `eyJ...`
   - **Service Role Key**: `eyJ...`

### **4. Start the Backend Server**

```bash
cd backend
npm install
npm run dev
```

### **5. Test the API Endpoints**

**Test if server is running:**
```bash
curl http://localhost:5000/api/booking/test
```

**Expected response:**
```json
{
  "success": true,
  "message": "Booking routes are working!",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🚀 **Quick Fix Commands:**

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file (copy the content above)
# 4. Add your actual keys to .env file
# 5. Start server
npm run dev
```

## 🔍 **Debug Steps:**

### **Check if server is running:**
- Open browser: `http://localhost:5000/api/booking/test`
- Should show: `{"success": true, "message": "Booking routes are working!"}`

### **Check environment variables:**
- Look at server console output
- Should show: `✅ Loaded` for all environment variables

### **Check Razorpay configuration:**
- Look for Razorpay errors in server console
- Should not show: `❌ Razorpay order creation failed`

## 🎯 **Expected Results:**

After setup, these should work:
- ✅ `GET /api/booking/test` - Test endpoint
- ✅ `GET /api/booking/check-capacity` - Capacity checking
- ✅ `POST /api/booking/create` - Booking creation
- ✅ Razorpay payment integration

## 📞 **If Still Having Issues:**

1. **Check server console** for error messages
2. **Verify environment variables** are loaded
3. **Test Razorpay keys** are correct
4. **Check Supabase connection** is working

**Your booking system will work perfectly after this setup!** 🚀
