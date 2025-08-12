-- Add missing full_name column to pending_users table
-- This fixes the OTP verification issue

-- Add full_name column to pending_users table
DO $$ 
BEGIN
    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pending_users' 
        AND column_name = 'full_name'
    ) THEN
        ALTER TABLE pending_users ADD COLUMN full_name TEXT NOT NULL DEFAULT 'User';
        
        -- Remove the default after adding the column
        ALTER TABLE pending_users ALTER COLUMN full_name DROP DEFAULT;
    END IF;
END $$;

-- Verify the column was added
SELECT 
    'pending_users table updated successfully' as status,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pending_users'
ORDER BY ordinal_position;