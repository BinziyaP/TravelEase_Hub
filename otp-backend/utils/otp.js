// OTP generation and validation utilities
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash OTP for secure storage
 * @param {string} otp - Plain text OTP
 * @returns {Promise<string>} Hashed OTP
 */
export const hashOTP = async (otp) => {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(otp, saltRounds);
};

/**
 * Verify OTP against hash
 * @param {string} otp - Plain text OTP
 * @param {string} hash - Hashed OTP
 * @returns {Promise<boolean>} True if OTP matches
 */
export const verifyOTP = async (otp, hash) => {
    return await bcrypt.compare(otp, hash);
};

/**
 * Calculate OTP expiry time
 * @param {number} minutes - Minutes from now
 * @returns {Date} Expiry date
 */
export const getOTPExpiry = (minutes = 5) => {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + minutes);
    return expiry;
};

/**
 * Check if OTP has expired
 * @param {Date} expiryTime - OTP expiry time
 * @returns {boolean} True if expired
 */
export const isOTPExpired = (expiryTime) => {
    return new Date() > new Date(expiryTime);
};
