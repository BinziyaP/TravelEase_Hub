// OTP Authentication controllers
const { getSupabase } = require('../config/supabase');
const { generateOTP, hashOTP, verifyOTP, getOTPExpiry, isOTPExpired } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/emailService');
const { validateInput, emailSchema, sendOTPSchema, verifyOTPSchema } = require('../utils/validation');

/**
 * Check if email is valid and doesn't already exist
 * POST /api/auth/check-email
 */
const checkEmail = async (req, res) => {
    try {
        // Validate input
        const validation = validateInput(req.body, emailSchema);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { email } = validation.data;
        const supabase = getSupabase();

        // Check if email already exists in users table
        const { data: existingUser, error: checkError } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', email.toLowerCase())
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            // PGRST116 is "not found" error, which is expected for new emails
            console.error('Database error checking email:', checkError);
            return res.status(500).json({
                success: false,
                message: 'Database error occurred'
            });
        }

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered',
                exists: true
            });
        }

        // Email is valid and available
        res.json({
            success: true,
            message: 'Email is available for registration',
            exists: false
        });

    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Send OTP to email for verification
 * POST /api/auth/send-otp
 */
const sendOTP = async (req, res) => {
    try {
        // Validate input
        const validation = validateInput(req.body, sendOTPSchema);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { email, full_name } = validation.data;
        const normalizedEmail = email.toLowerCase();
        const supabase = getSupabase();

        // Check if email already exists
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', normalizedEmail)
            .single();

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Clean up any existing OTP for this email
        await supabase
            .from('email_verifications')
            .delete()
            .eq('email', normalizedEmail);

        // Generate and hash OTP
        const otp = generateOTP();
        const otpHash = await hashOTP(otp);
        const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
        const expiresAt = getOTPExpiry(expiryMinutes);

        // Store OTP in database
        const { error: insertError } = await supabase
            .from('email_verifications')
            .insert({
                email: normalizedEmail,
                otp_hash: otpHash,
                expires_at: expiresAt.toISOString(),
                attempts: 0,
                max_attempts: parseInt(process.env.OTP_MAX_ATTEMPTS) || 3
            });

        if (insertError) {
            console.error('Error storing OTP:', insertError);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate OTP'
            });
        }

        // Send OTP email
        const emailResult = await sendOTPEmail(normalizedEmail, otp, full_name);

        if (!emailResult.success) {
            // Clean up OTP if email failed
            await supabase
                .from('email_verifications')
                .delete()
                .eq('email', normalizedEmail);

            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email'
            });
        }

        res.json({
            success: true,
            message: 'OTP sent successfully to your email',
            expires_in_minutes: expiryMinutes
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Verify OTP and create user profile
 * POST /api/auth/verify-otp
 */
const verifyOTPAndCreateUser = async (req, res) => {
    try {
        // Validate input
        const validation = validateInput(req.body, verifyOTPSchema);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { email, otp, full_name, phone, date_of_birth } = validation.data;
        const normalizedEmail = email.toLowerCase();
        const supabase = getSupabase();

        // Get OTP record from database
        const { data: otpRecord, error: fetchError } = await supabase
            .from('email_verifications')
            .select('*')
            .eq('email', normalizedEmail)
            .single();

        if (fetchError || !otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'No OTP found for this email. Please request a new OTP.'
            });
        }

        // Check if OTP has expired
        if (isOTPExpired(otpRecord.expires_at)) {
            // Clean up expired OTP
            await supabase
                .from('email_verifications')
                .delete()
                .eq('email', normalizedEmail);

            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new OTP.'
            });
        }

        // Check if max attempts exceeded
        if (otpRecord.attempts >= otpRecord.max_attempts) {
            // Clean up OTP after max attempts
            await supabase
                .from('email_verifications')
                .delete()
                .eq('email', normalizedEmail);

            return res.status(400).json({
                success: false,
                message: 'Maximum verification attempts exceeded. Please request a new OTP.'
            });
        }

        // Verify OTP
        const isValidOTP = await verifyOTP(otp, otpRecord.otp_hash);

        if (!isValidOTP) {
            // Increment attempts
            await supabase
                .from('email_verifications')
                .update({ attempts: otpRecord.attempts + 1 })
                .eq('email', normalizedEmail);

            const remainingAttempts = otpRecord.max_attempts - (otpRecord.attempts + 1);

            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
                remaining_attempts: remainingAttempts
            });
        }

        // OTP is valid, create user profile
        const { data: newUser, error: createError } = await supabase
            .from('profiles')
            .insert({
                email: normalizedEmail,
                name: full_name, // Using 'name' column as per your schema
                phone: phone || null,
                date_of_birth: date_of_birth || null,
                email_verified: true,
                password_hash: null // Will be set when user sets password
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating user profile:', createError);
            return res.status(500).json({
                success: false,
                message: 'Failed to create user profile'
            });
        }

        // Clean up OTP after successful verification
        await supabase
            .from('email_verifications')
            .delete()
            .eq('email', normalizedEmail);

        res.status(201).json({
            success: true,
            message: 'Email verified and account created successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                email_verified: newUser.email_verified,
                created_at: newUser.created_at
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    checkEmail,
    sendOTP,
    verifyOTPAndCreateUser
};
