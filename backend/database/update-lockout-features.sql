-- Update existing tables to support account lockout features
-- Run this in your Supabase SQL Editor

-- First, update existing pending_users table if it exists
DO $$ 
BEGIN
    -- Add lockout columns to pending_users table if they don't exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pending_users') THEN
        -- Add otp_attempts column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'pending_users' AND column_name = 'otp_attempts'
        ) THEN
            ALTER TABLE pending_users ADD COLUMN otp_attempts INTEGER DEFAULT 0;
        END IF;

        -- Add max_attempts column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'pending_users' AND column_name = 'max_attempts'
        ) THEN
            ALTER TABLE pending_users ADD COLUMN max_attempts INTEGER DEFAULT 5;
        END IF;

        -- Add locked_until column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'pending_users' AND column_name = 'locked_until'
        ) THEN
            ALTER TABLE pending_users ADD COLUMN locked_until TIMESTAMP WITH TIME ZONE NULL;
        END IF;
    END IF;
END $$;

-- Update existing email_verifications table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_verifications') THEN
        -- Update max_attempts to 5 (from 3)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'email_verifications' AND column_name = 'max_attempts'
        ) THEN
            ALTER TABLE email_verifications ALTER COLUMN max_attempts SET DEFAULT 5;
            UPDATE email_verifications SET max_attempts = 5 WHERE max_attempts = 3;
        END IF;

        -- Add locked_until column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'email_verifications' AND column_name = 'locked_until'
        ) THEN
            ALTER TABLE email_verifications ADD COLUMN locked_until TIMESTAMP WITH TIME ZONE NULL;
        END IF;
    END IF;
END $$;

-- Create indexes for the new lockout columns
CREATE INDEX IF NOT EXISTS idx_pending_users_locked_until ON pending_users(locked_until);
CREATE INDEX IF NOT EXISTS idx_email_verifications_locked_until ON email_verifications(locked_until);

-- Function to clean up expired locks and OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_locks_and_otps()
RETURNS void AS $$
BEGIN
    -- Clean up expired locks in pending_users
    UPDATE pending_users 
    SET otp_attempts = 0, locked_until = NULL 
    WHERE locked_until < NOW();

    -- Clean up expired locks in email_verifications
    UPDATE email_verifications 
    SET attempts = 0, locked_until = NULL 
    WHERE locked_until < NOW();

    -- Delete expired OTPs
    DELETE FROM pending_users WHERE otp_expires_at < NOW();
    DELETE FROM email_verifications WHERE expires_at < NOW();
    
    -- Clean up expired password reset tokens
    DELETE FROM password_reset_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Verification query to check the updated structure
SELECT 
    'Table structure updated successfully' as status,
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('pending_users', 'email_verifications') 
  AND column_name IN ('otp_attempts', 'max_attempts', 'locked_until', 'attempts')
ORDER BY table_name, column_name;