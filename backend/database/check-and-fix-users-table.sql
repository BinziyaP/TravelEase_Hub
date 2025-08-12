-- Step 1: Check current users table structure
-- Run this first to see what columns you have
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Step 2: Make password_hash nullable (for Google OAuth users)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Step 3: Add user_type column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'user';

-- Step 4: Add email_verified column if it doesn't exist  
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Step 5: Check if full_name column exists
-- If you see 'full_name' in the results above, skip this step
-- If you don't see 'full_name', run this:
-- ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Step 6: Update existing users to have user_type if NULL
UPDATE users SET user_type = 'user' WHERE user_type IS NULL;

-- Step 7: Verify the updated structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
