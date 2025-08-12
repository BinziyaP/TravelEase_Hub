-- Safe OTP Tables Setup for TravelEase
-- This script only adds new tables and doesn't modify existing users table

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create email_verifications table for OTP storage
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL, -- Hashed OTP for security
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0, -- Track verification attempts
    max_attempts INTEGER DEFAULT 3, -- Maximum allowed attempts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

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

-- Verify the new table was created
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'email_verifications'
ORDER BY ordinal_position;

-- Show current users table structure (for reference)
SELECT 
    'Current users table structure:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
