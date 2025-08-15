---
description: Repository Information Overview
alwaysApply: true
---

# TravelEase Hub Information

## Summary
TravelEase is a travel booking application with a React frontend and Node.js/Express backend. It features Supabase integration for authentication, database storage, and includes an OTP email verification system. The project consists of a Vite-based React frontend and two separate backend services.

## Structure
- **vite-project/**: React frontend built with Vite
- **backend/**: Main Node.js/Express backend with Supabase integration
- **otp-backend/**: Specialized backend for OTP email verification
- **S9Docs/**: Project documentation including requirements and design documents

## Projects

### Frontend (vite-project)

#### Language & Runtime
**Language**: JavaScript/React
**Version**: React 19.1.1
**Build System**: Vite 7.0.4
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- react: ^19.1.1
- react-dom: ^19.1.1
- @supabase/supabase-js: ^2.54.0

**Development Dependencies**:
- @vitejs/plugin-react: ^4.7.0
- sass: ^1.89.2
- vite: ^7.0.4

#### Build & Installation
```bash
cd vite-project
npm install
npm run dev    # Development server
npm run build  # Production build
npm run preview  # Preview production build
```

### Main Backend

#### Language & Runtime
**Language**: JavaScript (Node.js)
**Version**: Node.js >=16.0.0
**Framework**: Express 4.18.2
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- express: ^4.18.2
- @supabase/supabase-js: ^2.38.4
- bcryptjs: ^2.4.3
- jsonwebtoken: ^9.0.2
- passport: ^0.6.0
- nodemailer: ^6.10.1
- express-validator: ^7.0.1
- helmet: ^7.1.0

**Development Dependencies**:
- nodemon: ^3.0.2

#### Build & Installation
```bash
cd backend
npm install
npm run dev    # Development server with auto-reload
npm start      # Production server
```

#### Form Validation Rules
**Full Name Validation**:
- Only alphabetic characters and spaces allowed
- No numbers or special characters permitted
- Must be at least 2 characters long
- Multiple name parts allowed (any number of names separated by spaces)
- Each name part must start with a capital letter

**Implementation**:
```javascript
// Using express-validator in backend
const { body } = require('express-validator');

// Full name validation rule
body('full_name')
  .notEmpty().withMessage('Full name is required')
  .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters long')
  .matches(/^[A-Za-z\s]+$/).withMessage('Full name can only contain alphabetic characters and spaces')
  .matches(/^[A-Za-z]+\s+[A-Za-z]+/).withMessage('Please provide both first and last name')
  .custom(value => {
    // Check if each name part is capitalized
    const nameParts = value.split(' ');
    return nameParts.every(part => part[0] === part[0].toUpperCase());
  }).withMessage('Each name should start with a capital letter')
```

**Frontend Validation (React)**:
```javascript
// In AuthModal.jsx - validateField function
const validateField = (name, value) => {
  // ...
  case 'name':
    // Check for minimum length
    if (value.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } 
    // Check for alphabetic characters only (letters and spaces)
    else if (!/^[A-Za-z\s]+$/.test(value)) {
      newErrors.name = 'Name can only contain alphabetic characters (no numbers or symbols)';
    }
    // Check if each name part starts with a capital letter
    else {
      const nameParts = value.trim().split(/\s+/);
      if (nameParts.length < 1) {
        newErrors.name = 'Please enter at least one name';
      }
      else if (!nameParts.every(part => part.length > 0 && part[0] === part[0].toUpperCase())) {
        newErrors.name = 'Each name should start with a capital letter';
      }
      else {
        delete newErrors.name;
      }
    }
    break;
  // ...
}

// In AuthModal.jsx - handleSubmit function
// Form submission validation
if (!isLogin && !isForgotPassword) {
  if (!formData.name) {
    newErrors.name = 'Name is required';
  } else if (formData.name.trim().length < 2) {
    newErrors.name = 'Name must be at least 2 characters';
  } else if (!/^[A-Za-z\s]+$/.test(formData.name)) {
    newErrors.name = 'Name can only contain alphabetic characters (no numbers or symbols)';
  } else {
    // Check if each name part starts with a capital letter
    const nameParts = formData.name.trim().split(/\s+/);
    if (nameParts.length < 1) {
      newErrors.name = 'Please enter at least one name';
    } else if (!nameParts.every(part => part.length > 0 && part[0] === part[0].toUpperCase())) {
      newErrors.name = 'Each name should start with a capital letter';
    }
  }
}
```

### OTP Backend

#### Language & Runtime
**Language**: JavaScript (Node.js)
**Version**: Node.js >=18.0.0
**Framework**: Express 4.18.2
**Package Manager**: npm
**Module Type**: ES Modules

#### Dependencies
**Main Dependencies**:
- express: ^4.18.2
- @supabase/supabase-js: ^2.39.0
- bcryptjs: ^2.4.3
- nodemailer: ^6.9.7
- joi: ^17.11.0
- helmet: ^7.1.0

**Development Dependencies**:
- nodemon: ^3.0.2

#### Build & Installation
```bash
cd otp-backend
npm install
npm run dev    # Development server with auto-reload
npm start      # Production server
```

#### Validation with Joi
**Full Name Validation**:
```javascript
// Using Joi for validation
import Joi from 'joi';

const userSchema = Joi.object({
  full_name: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .pattern(/^[A-Za-z]+\s+[A-Za-z]+/)
    .min(2)
    .required()
    .messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 2 characters long',
      'string.pattern.base': 'Full name can only contain alphabetic characters and must include first and last name',
      'any.required': 'Full name is required'
    }),
  // Other fields...
});
```

## Database
**Type**: PostgreSQL (via Supabase)
**Schema Files**:
- backend/database/schema.sql
- otp-backend/database/schema.sql
- Various migration and fix scripts in backend/database/

## Security Features
- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Helmet.js for security headers
- Input validation
- CORS protection
- OTP verification for email