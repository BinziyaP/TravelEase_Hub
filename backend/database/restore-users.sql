-- Restore Users Table - Fix for Accidentally Deleted Rows
-- Run this SQL in your Supabase SQL editor to fix the users table

-- 1. First, let's check what's currently in the users table
SELECT COUNT(*) as total_users FROM users;
SELECT * FROM users LIMIT 10;

-- 2. Check for duplicate emails (this might cause the "multiple rows" error)
SELECT email, COUNT(*) as count 
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;

-- 3. If there are duplicates, remove them (keeping the most recent one)
DELETE FROM users 
WHERE id NOT IN (
    SELECT DISTINCT ON (email) id 
    FROM users 
    ORDER BY email, created_at DESC
);

-- 4. Create some sample users if the table is empty
-- Note: These are sample users with hashed passwords for testing
-- Password for all sample users is: "password123"
-- Hash generated with bcrypt rounds=12

INSERT INTO users (name, email, password_hash, email_verified, user_type, created_at, updated_at) 
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
    ),
    (
        'Travel Agent', 
        'agent@travelease.com', 
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2', 
        true, 
        'agent', 
        NOW(), 
        NOW()
    )
ON CONFLICT (email) DO NOTHING;

-- 5. Verify the users were created
SELECT id, name, email, user_type, email_verified, created_at 
FROM users 
ORDER BY created_at DESC;

-- 6. Clean up any orphaned sessions
DELETE FROM user_sessions 
WHERE user_id NOT IN (SELECT id FROM users);

-- 7. Clean up any orphaned tokens
DELETE FROM password_reset_tokens 
WHERE user_id NOT IN (SELECT id FROM users);

DELETE FROM email_verification_tokens 
WHERE user_id NOT IN (SELECT id FROM users);

-- 8. Final verification
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

-- 9. Check table structure to ensure all columns exist
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
