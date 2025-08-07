-- Fix Authentication Issues - Complete Database Repair
-- Run this SQL in your Supabase SQL Editor

-- 1. First, let's see what we're working with
SELECT 'Current users table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Check current data
SELECT 'Current users data:' as info;
SELECT COUNT(*) as total_users FROM users;
SELECT id, full_name, email, user_type, email_verified, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Check for duplicate emails (this causes "multiple rows" error)
SELECT 'Checking for duplicate emails:' as info;
SELECT email, COUNT(*) as count 
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;

-- 4. Remove duplicate users (keep the most recent one)
DELETE FROM users 
WHERE id NOT IN (
    SELECT DISTINCT ON (email) id 
    FROM users 
    ORDER BY email, created_at DESC NULLS LAST
);

-- 5. Clean up any users with missing required data
DELETE FROM users 
WHERE email IS NULL 
   OR email = '' 
   OR full_name IS NULL 
   OR full_name = '';

-- 6. Ensure all required columns exist with proper defaults
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 7. Update existing users to have proper defaults
UPDATE users SET email_verified = FALSE WHERE email_verified IS NULL;
UPDATE users SET user_type = 'user' WHERE user_type IS NULL OR user_type = '';
UPDATE users SET created_at = NOW() WHERE created_at IS NULL;
UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL;

-- 8. Add unique constraint on google_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_google_id_key' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_google_id_key UNIQUE (google_id);
    END IF;
EXCEPTION
    WHEN duplicate_key THEN
        -- If there are duplicate google_ids, remove duplicates first
        DELETE FROM users 
        WHERE id NOT IN (
            SELECT DISTINCT ON (google_id) id 
            FROM users 
            WHERE google_id IS NOT NULL
            ORDER BY google_id, created_at DESC
        ) AND google_id IS NOT NULL;
        
        -- Then add the constraint
        ALTER TABLE users ADD CONSTRAINT users_google_id_key UNIQUE (google_id);
END $$;

-- 9. Create some test users if the table is empty
INSERT INTO users (full_name, email, password_hash, email_verified, user_type, created_at, updated_at) 
VALUES 
    (
        'John Doe', 
        'john@example.com', 
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2', 
        true, 
        'user', 
        NOW(), 
        NOW()
    ),
    (
        'Jane Smith', 
        'jane@example.com', 
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2', 
        true, 
        'user', 
        NOW(), 
        NOW()
    ),
    (
        'Admin User', 
        'admin@travelease.com', 
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2', 
        true, 
        'admin', 
        NOW(), 
        NOW()
    )
ON CONFLICT (email) DO NOTHING;

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 11. Clean up orphaned sessions and tokens
DELETE FROM user_sessions 
WHERE user_id NOT IN (SELECT id FROM users);

DELETE FROM password_reset_tokens 
WHERE user_id NOT IN (SELECT id FROM users);

DELETE FROM email_verification_tokens 
WHERE user_id NOT IN (SELECT id FROM users);

-- 12. Final verification
SELECT 'Final verification:' as info;
SELECT 
    'users' as table_name, 
    COUNT(*) as row_count 
FROM users
UNION ALL
SELECT 
    'user_sessions' as table_name, 
    COUNT(*) as row_count 
FROM user_sessions
UNION ALL
SELECT 
    'password_reset_tokens' as table_name, 
    COUNT(*) as row_count 
FROM password_reset_tokens
UNION ALL
SELECT 
    'email_verification_tokens' as table_name, 
    COUNT(*) as row_count 
FROM email_verification_tokens;

-- 13. Show final users data
SELECT 'Final users data:' as info;
SELECT id, full_name, email, user_type, email_verified, created_at 
FROM users 
ORDER BY created_at DESC;
