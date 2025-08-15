-- Create pending_users table for email verification with OTP
-- This implements the exact requirements from the user

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pending_users table as requested
CREATE TABLE IF NOT EXISTS pending_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    otp_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    otp_attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    locked_until TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pending_users_email ON pending_users(email);
CREATE INDEX IF NOT EXISTS idx_pending_users_expires_at ON pending_users(otp_expires_at);
CREATE INDEX IF NOT EXISTS idx_pending_users_locked_until ON pending_users(locked_until);

-- Ensure users table has verified column (modify existing table)
DO $$ 
BEGIN
    -- Add verified column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'verified'
    ) THEN
        ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Row Level Security (RLS) policies for pending_users
ALTER TABLE pending_users ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all data (for backend operations)
CREATE POLICY "Service role can access all pending_users" ON pending_users
    FOR ALL USING (auth.role() = 'service_role');

-- Function to clean up expired pending users
CREATE OR REPLACE FUNCTION cleanup_expired_pending_users()
RETURNS void AS $$
BEGIN
    DELETE FROM pending_users WHERE otp_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON pending_users TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Display table structure for verification
SELECT 
    'pending_users table created successfully' as status,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pending_users'
ORDER BY ordinal_position;