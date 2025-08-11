-- Fix Google OAuth issues in Supabase
-- Run this in your Supabase SQL Editor

-- 1. Make password_hash nullable (for Google OAuth users)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 2. Add google_id column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- 3. Add user_type column if it doesn't exist  
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'user';

-- 4. Add email_verified column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- 5. Ensure full_name column exists (some tables might have 'name' instead)
DO $$ 
BEGIN
    -- Check if full_name exists, if not and 'name' exists, rename it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
            ALTER TABLE users RENAME COLUMN name TO full_name;
        ELSE
            ALTER TABLE users ADD COLUMN full_name VARCHAR(255) NOT NULL DEFAULT 'User';
        END IF;
    END IF;
END $$;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);

-- 7. Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
