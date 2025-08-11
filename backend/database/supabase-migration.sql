-- Migration: Add Google OAuth support to users table
-- Copy and paste this into your Supabase SQL Editor

-- Add google_id column for Google OAuth
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
