-- Diagnose Users Table Issues
-- Run this SQL in your Supabase SQL editor to identify the problem

-- 1. Check if users table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
) as users_table_exists;

-- 2. Check total number of users
SELECT COUNT(*) as total_users FROM users;

-- 3. Check for duplicate emails (common cause of "multiple rows" error)
SELECT 
    email, 
    COUNT(*) as duplicate_count,
    array_agg(id) as user_ids
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;

-- 4. Check for users with missing required fields
SELECT 
    id,
    name,
    email,
    CASE WHEN password_hash IS NULL THEN 'Missing password_hash' ELSE 'Has password_hash' END as password_status,
    CASE WHEN google_id IS NULL THEN 'No Google ID' ELSE 'Has Google ID' END as google_status,
    user_type,
    email_verified,
    created_at
FROM users
ORDER BY created_at DESC;

-- 5. Check for any users with NULL or empty emails
SELECT COUNT(*) as users_with_null_email 
FROM users 
WHERE email IS NULL OR email = '';

-- 6. Check for any users with NULL names
SELECT COUNT(*) as users_with_null_name 
FROM users 
WHERE name IS NULL OR name = '';

-- 7. Check recent authentication attempts (if sessions table exists)
SELECT 
    s.id as session_id,
    u.email,
    u.name,
    s.created_at as session_created,
    s.last_used_at,
    s.expires_at
FROM user_sessions s
JOIN users u ON s.user_id = u.id
ORDER BY s.created_at DESC
LIMIT 10;

-- 8. Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 9. Check for any constraints or indexes that might be causing issues
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users'
ORDER BY tc.constraint_type, tc.constraint_name;
