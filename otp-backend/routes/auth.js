// Authentication routes
import express from 'express';
import rateLimit from 'express-rate-limit';
import { checkEmail, sendOTP, verifyOTPAndCreateUser } from '../controllers/authController.js';

const router = express.Router();

// Rate limiting middleware
const createRateLimit = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message
        },
        standardHeaders: true,
        legacyHeaders: false
    });
};

// Rate limits for different endpoints
const checkEmailLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    10, // 10 requests per window
    'Too many email check requests. Please try again later.'
);

const sendOTPLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    3, // 3 OTP requests per window
    'Too many OTP requests. Please try again later.'
);

const verifyOTPLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    10, // 10 verification attempts per window
    'Too many verification attempts. Please try again later.'
);

// Routes
router.post('/check-email', checkEmailLimit, checkEmail);
router.post('/send-otp', sendOTPLimit, sendOTP);
router.post('/verify-otp', verifyOTPLimit, verifyOTPAndCreateUser);

export default router;
