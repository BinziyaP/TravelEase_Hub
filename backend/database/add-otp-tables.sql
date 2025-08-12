-- Add OTP Email Verification Tables to Existing TravelEase Schema
-- Run this in your Supabase SQL Editor

-- Email verifications table (for OTP storage)
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL, -- Hashed OTP for security
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0, -- Track verification attempts
    max_attempts INTEGER DEFAULT 3, -- Maximum allowed attempts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

-- Update users table to ensure proper structure for OTP system
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'user';

-- Check if full_name column exists, if not add it
DO $$
BEGIN
    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

        -- Try to populate from existing name-like columns
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
            UPDATE users SET full_name = name WHERE full_name IS NULL;
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
            UPDATE users SET full_name = username WHERE full_name IS NULL;
        ELSE
            -- Set a default value for existing users
            UPDATE users SET full_name = 'User' WHERE full_name IS NULL;
        END IF;
    END IF;
END $$;

-- Function to automatically delete expired OTPs
CREATE OR REPLACE FUNCTION delete_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verifications 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies for email_verifications
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all data (for backend operations)
CREATE POLICY "Service role can access all email_verifications" ON email_verifications
    FOR ALL USING (auth.role() = 'service_role');

-- Verify the new table structure
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('users', 'email_verifications')
ORDER BY table_name, ordinal_position;
