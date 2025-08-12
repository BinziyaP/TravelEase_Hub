-- Simple fix for users table to support OTP registration
-- Run this in your Supabase SQL Editor

-- 1. Make password_hash nullable (for users who register via OTP but haven't set password yet)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 2. Verify the change
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'password_hash';
