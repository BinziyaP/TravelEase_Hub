# 🏢 Travel Agency Authentication Module Setup Guide

Complete guide to set up and run the Travel Agency authentication system with MERN stack.

---

## 📋 Overview

This module provides:
- **Travel Agency Registration** with admin approval workflow
- **Secure JWT Authentication** with bcrypt password hashing
- **Admin Management Panel** for agency verification
- **React Registration Form** with multi-step validation
- **MongoDB Integration** with comprehensive schema
- **Professional API** with proper error handling

---

## 🚀 Quick Setup (5 Steps)

### **Step 1: Navigate to Backend Folder**
```bash
cd backend-agency
```

### **Step 2: Install Dependencies**
```bash
npm install
```

### **Step 3: Configure Environment**
The `.env` file is already configured with your MongoDB connection. Verify it contains:

```env
MONGODB_URI=mongodb+srv://travelease:Binziya123@travelease.bfpsdiz.mongodb.net/?retryWrites=true&w=majority&appName=travelease
DATABASE_NAME=travelease_agencies
JWT_SECRET=your_super_secret_jwt_key_for_travel_agencies_2024
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### **Step 4: Start Backend Server**
```bash
# Development mode with auto-reload
npm run dev
```

**✅ Server should start on `http://localhost:5001`**

### **Step 5: Test the API**
Open browser to `http://localhost:5001` - you should see the API welcome page.

---

## 🧪 Testing Your Setup

### **1. Test Agency Registration**

Using curl or Postman:

```bash
curl -X POST http://localhost:5001/api/agency/signup \
  -H "Content-Type: application/json" \
  -d '{
    "agencyName": "Paradise Travel Agency",
    "email": "paradise@travel.com",
    "password": "Paradise123",
    "contactPerson": "John Smith",
    "phone": "+1234567890",
    "address": "123 Paradise Street, Travel City, TC 12345",
    "businessLicenseNumber": "BL789123456",
    "description": "Premium travel services for paradise destinations"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Signup successful. Awaiting admin approval.",
  "data": {
    "agencyId": "...",
    "agencyName": "Paradise Travel Agency",
    "email": "paradise@travel.com",
    "status": "Pending"
  }
}
```

### **2. Test Login (Should Fail - Pending Approval)**

```bash
curl -X POST http://localhost:5001/api/agency/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "paradise@travel.com",
    "password": "Paradise123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Your account is pending admin approval",
  "status": "Pending"
}
```

### **3. Admin Verification (Get Agency List)**

```bash
curl -X GET http://localhost:5001/api/admin/agencies
```

**Expected Response:**
```json
{
  "success": true,
  "agencies": [
    {
      "agencyName": "Paradise Travel Agency",
      "email": "paradise@travel.com",
      "status": "Pending",
      ...
    }
  ],
  "counts": {
    "pending": 1,
    "verified": 0,
    "rejected": 0,
    "total": 1
  }
}
```

### **4. Verify Agency (Replace {AGENCY_ID} with actual ID)**

```bash
curl -X PUT http://localhost:5001/api/admin/agencies/{AGENCY_ID}/verify \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "All documents verified successfully",
    "adminId": "test_admin"
  }'
```

### **5. Test Login Again (Should Succeed)**

```bash
curl -X POST http://localhost:5001/api/agency/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "paradise@travel.com",
    "password": "Paradise123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "agency": {
    "agencyName": "Paradise Travel Agency",
    "email": "paradise@travel.com",
    "status": "Verified",
    ...
  }
}
```

---

## 🎨 Frontend Integration

### **Add Agency Registration Card to Your App**

The `AgencyRegistrationCard` component is ready to use:

```jsx
// In your main app or auth modal
import AgencyRegistrationCard from './components/AgencyRegistrationCard';

function YourComponent() {
  const [showAgencyReg, setShowAgencyReg] = useState(false);

  return (
    <div>
      {/* Add this button in your sign-up form */}
      <button 
        className="agency-register-btn"
        onClick={() => setShowAgencyReg(true)}
      >
        🏢 Register as Travel Agency
      </button>

      {/* Agency registration modal */}
      {showAgencyReg && (
        <AgencyRegistrationCard
          onClose={() => setShowAgencyReg(false)}
          onSuccess={(data) => {
            console.log('Agency registered:', data);
            // Handle success (show message, redirect, etc.)
          }}
        />
      )}
    </div>
  );
}
```

### **Add Button to Existing AuthModal**

If you have an existing AuthModal, add this button:

```jsx
// In AuthModal.jsx, add this in the signup section
<div className={styles.registrationOptions}>
  <p>Choose your account type:</p>
  
  <button 
    type="button"
    className={styles.userTypeButton}
    onClick={handleUserRegistration}
  >
    👤 Register as User
  </button>
  
  <button 
    type="button"
    className={styles.agencyTypeButton}
    onClick={() => setShowAgencyRegistration(true)}
  >
    🏢 Register as Travel Agency
  </button>
</div>
```

---

## 🗄️ Database Structure

The system creates these collections in your MongoDB:

### **agencies** Collection
```javascript
{
  _id: ObjectId,
  agencyName: "Paradise Travel Agency",
  email: "paradise@travel.com",
  password: "$2a$12$...", // Hashed
  contactPerson: "John Smith",
  phone: "+1234567890",
  address: "123 Paradise Street...",
  businessLicenseNumber: "BL789123456",
  licenseDocument: null, // URL when uploaded
  description: "Premium travel services...",
  logo: null, // URL when uploaded
  status: "Verified", // Pending, Verified, Rejected
  verificationNotes: "All documents verified",
  verifiedAt: ISODate,
  verifiedBy: "admin_id",
  lastLoginAt: ISODate,
  loginAttempts: 0,
  lockedUntil: null,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

## 🔧 Admin Workflow

### **Manual Verification Process:**

1. **Agency Registers** → Status: "Pending"
2. **Admin Reviews** → GET `/api/admin/agencies`
3. **Admin Decides:**
   - **Approve** → PUT `/api/admin/agencies/:id/verify`
   - **Reject** → PUT `/api/admin/agencies/:id/reject`
4. **Agency Notified** → Status: "Verified" or "Rejected"
5. **Verified Agencies** → Can login and access platform

### **Admin Panel Endpoints:**

```bash
# List all agencies with filtering
GET /api/admin/agencies?status=Pending&search=paradise

# Get single agency details
GET /api/admin/agencies/{id}

# Verify agency
PUT /api/admin/agencies/{id}/verify

# Reject agency
PUT /api/admin/agencies/{id}/reject

# Get dashboard statistics
GET /api/admin/stats
```

---

## 🛡️ Security Features

### **Built-in Security:**
- ✅ **Password Hashing** with bcrypt (12 rounds)
- ✅ **JWT Authentication** with expiration
- ✅ **Account Lockout** after failed attempts
- ✅ **Rate Limiting** on all endpoints
- ✅ **Input Validation** with sanitization
- ✅ **CORS Protection** for frontend
- ✅ **Helmet Security Headers**

### **Validation Rules:**
- **Email**: Valid format, unique
- **Password**: Min 6 chars, uppercase, lowercase, number
- **Phone**: International format validation
- **Business License**: Alphanumeric with hyphens
- **Agency Name**: 2-100 characters, business-appropriate

---

## 📊 API Reference

### **Quick Reference:**

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/` | API info | No |
| GET | `/health` | Health check | No |
| POST | `/api/agency/signup` | Register agency | No |
| POST | `/api/agency/login` | Login agency | No |
| GET | `/api/agency/profile` | Get profile | Yes |
| PUT | `/api/agency/profile` | Update profile | Yes |
| PUT | `/api/agency/password` | Change password | Yes |
| GET | `/api/agency/status` | Check status | Yes |
| GET | `/api/admin/agencies` | List agencies | Admin |
| PUT | `/api/admin/agencies/:id/verify` | Verify agency | Admin |
| PUT | `/api/admin/agencies/:id/reject` | Reject agency | Admin |
| GET | `/api/admin/stats` | Dashboard stats | Admin |

---

## 🚨 Troubleshooting

### **Common Issues:**

#### **Server Won't Start**
```bash
# Check if port 5001 is in use
netstat -an | grep 5001

# Kill process using port (Windows)
netstat -ano | findstr :5001
taskkill /PID {PID} /F

# Try different port
PORT=5002 npm run dev
```

#### **MongoDB Connection Error**
- Verify your IP is whitelisted in MongoDB Atlas
- Check the connection string in `.env`
- Test connection: `ping cluster0.mongodb.net`

#### **JWT Token Invalid**
- Check `JWT_SECRET` is set in `.env`
- Verify token format: `Bearer {token}`
- Token expires after 7 days by default

#### **Agency Can't Login**
- Verify agency status is "Verified"
- Check if account is locked (wait 30 minutes)
- Verify password meets complexity requirements

### **Debug Mode:**

Add this to see detailed logs:
```bash
NODE_ENV=development npm run dev
```

Console shows:
- 🍃 MongoDB connection status
- 🔐 Authentication attempts
- 👑 Admin actions
- 📝 Validation errors

---

## 📈 Monitoring & Logs

### **Server Logs Show:**
```
🚀 =====================================
🏢 TravelEase Agency Backend Started
🚀 =====================================
📡 Server running on port 5001
🌐 Environment: development
🗄️  Database: travelease_agencies
🍃 MongoDB Connected: cluster0-shard-00-02.bfpsdiz.mongodb.net
🏢 New agency registered: Paradise Travel Agency
✅ Agency verified: Paradise Travel Agency by admin: test_admin
🔓 Agency logged in: Paradise Travel Agency
```

### **Request Logging:**
```
2024-01-20T14:30:25.123Z - POST /api/agency/signup
2024-01-20T14:31:10.456Z - GET /api/admin/agencies
2024-01-20T14:32:45.789Z - PUT /api/admin/agencies/60f7.../verify
2024-01-20T14:33:20.012Z - POST /api/agency/login
```

---

## ✅ Success Checklist

- [ ] Backend server starts on port 5001
- [ ] MongoDB connection successful
- [ ] Can register new agency (status: Pending)
- [ ] Pending agency cannot login
- [ ] Admin can list agencies
- [ ] Admin can verify agency
- [ ] Verified agency can login successfully
- [ ] JWT token returned on successful login
- [ ] Protected routes require valid token
- [ ] Frontend registration card displays correctly

---

## 🎉 You're Ready!

Your **Travel Agency Authentication Module** is now fully set up and ready to use!

### **What You Have:**
- ✅ **Complete backend API** with authentication
- ✅ **MongoDB database** with proper schema
- ✅ **Admin verification workflow**
- ✅ **React registration component**
- ✅ **Security best practices**
- ✅ **Comprehensive documentation**

### **Next Steps:**
1. **Integrate with your frontend** using the provided component
2. **Set up admin interface** for agency management
3. **Add email notifications** for status changes
4. **Implement file uploads** for business documents
5. **Add booking system** integration

**Happy Coding!** 🚀🏢✈️

---

*Need help? Check the logs, test the API endpoints, and refer to the comprehensive README.md in the backend-agency folder.*