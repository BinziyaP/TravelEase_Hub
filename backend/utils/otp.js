// OTP generation and validation utilities
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash OTP for secure storage
 * @param {string} otp - Plain text OTP
 * @returns {Promise<string>} Hashed OTP
 */
const hashOTP = async (otp) => {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(otp, saltRounds);
};

/**
 * Verify OTP against hash
 * @param {string} otp - Plain text OTP
 * @param {string} hash - Hashed OTP
 * @returns {Promise<boolean>} True if OTP matches
 */
const verifyOTP = async (otp, hash) => {
    return await bcrypt.compare(otp, hash);
};

/**
 * Calculate OTP expiry time
 * @param {number} minutes - Minutes from now
 * @returns {Date} Expiry date
 */
const getOTPExpiry = (minutes = 5) => {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + minutes);
    return expiry;
};

/**
 * Check if OTP has expired
 * @param {Date} expiryTime - OTP expiry time
 * @returns {boolean} True if expired
 */
const isOTPExpired = (expiryTime) => {
    return new Date() > new Date(expiryTime);
};

module.exports = {
    generateOTP,
    hashOTP,
    verifyOTP,
    getOTPExpiry,
    isOTPExpired
};
