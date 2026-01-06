# User Registration Code Files - TravelEase Hub

## File Locations

The user registration code is implemented in the following files:

### 1. Frontend Registration Component
- **File:** `vite-project/src/components/AuthModal.jsx`
- **Full Path:** `C:\Users\binziya\Desktop\S9Proj\vite-project\src\components\AuthModal.jsx`
- **Description:** React component that handles user registration form UI, validation, and submission
- **Key Functions:**
  - `handleSubmit()` - Form submission handler
  - `validateField()` - Field validation
  - Registration form JSX

### 2. Backend Registration API
- **File:** `backend/routes/auth.js`
- **Full Path:** `C:\Users\binziya\Desktop\S9Proj\backend\routes\auth.js`
- **Description:** Express.js route handler for user registration and email verification
- **Key Endpoints:**
  - `POST /register` - User registration endpoint
  - `POST /verify-email` - Email verification endpoint
  - `POST /resend-otp` - Resend OTP endpoint

### 3. Authentication Context
- **File:** `vite-project/src/contexts/AuthContext.jsx`
- **Full Path:** `C:\Users\binziya\Desktop\S9Proj\vite-project\src\contexts\AuthContext.jsx`
- **Description:** React context that provides authentication functions including signUp
- **Key Functions:**
  - `signUp()` - Supabase authentication signup function
  - `signIn()` - User login function
  - Authentication state management

---

## Quick Reference

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Frontend UI | `vite-project/src/components/AuthModal.jsx` | Registration form and validation |
| Backend API | `backend/routes/auth.js` | Registration endpoint and OTP verification |
| Auth Context | `vite-project/src/contexts/AuthContext.jsx` | Supabase authentication integration |

---

## Code Flow

1. **User fills registration form** → `AuthModal.jsx`
2. **Form submission** → `AuthModal.jsx` calls `signUp()` from `AuthContext.jsx`
3. **Backend API call** → `backend/routes/auth.js` handles registration
4. **OTP generation** → Backend generates and sends OTP via email
5. **Email verification** → User enters OTP, backend verifies and creates account

---

## Related Files

- **OTP Controller:** `backend/controllers/otpController.js` - OTP generation and verification logic
- **Email Service:** `backend/utils/emailService.js` - Email sending functionality
- **OTP Utils:** `backend/utils/otp.js` - OTP hashing and verification utilities
- **Database Schema:** `TABLE_DESIGN_SECTION.md` - Database table structure



