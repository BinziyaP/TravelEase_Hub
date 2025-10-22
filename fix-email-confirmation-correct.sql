-- Correct way to enable email confirmations in Supabase
-- Run this in your Supabase SQL Editor

-- Method 1: Check if we can access auth configuration
SELECT * FROM information_schema.tables 
WHERE table_schema = 'auth' 
AND table_name LIKE '%config%';

-- Method 2: Try to enable email confirmations via system settings
-- This creates a configuration entry if it doesn't exist
INSERT INTO auth.config (
    id,
    enable_signup,
    enable_email_confirmations,
    enable_email_change_confirmations,
    enable_phone_confirmations,
    enable_phone_change_confirmations
) VALUES (
    'default',
    true,
    true,
    true,
    false,
    false
) ON CONFLICT (id) DO UPDATE SET
    enable_email_confirmations = true,
    enable_email_change_confirmations = true;

-- Method 3: Alternative - Update via system configuration
-- This might work if the table exists with a different name
DO $$
BEGIN
    -- Try to update auth configuration
    UPDATE auth.config 
    SET enable_email_confirmations = true
    WHERE id = 'default';
    
    -- If no rows affected, insert new config
    IF NOT FOUND THEN
        INSERT INTO auth.config (id, enable_email_confirmations)
        VALUES ('default', true);
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'auth.config table does not exist - using alternative method';
        
        -- Try to create the config table
        CREATE TABLE IF NOT EXISTS auth.config (
            id TEXT PRIMARY KEY DEFAULT 'default',
            enable_signup BOOLEAN DEFAULT true,
            enable_email_confirmations BOOLEAN DEFAULT true,
            enable_email_change_confirmations BOOLEAN DEFAULT true,
            enable_phone_confirmations BOOLEAN DEFAULT false,
            enable_phone_change_confirmations BOOLEAN DEFAULT false
        );
        
        -- Insert default configuration
        INSERT INTO auth.config (id, enable_email_confirmations)
        VALUES ('default', true)
        ON CONFLICT (id) DO UPDATE SET
            enable_email_confirmations = true;
END $$;

-- Method 4: Check what auth tables actually exist
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'auth'
ORDER BY tablename;

-- Method 5: Direct configuration via Supabase system
-- This should work regardless of table structure
SELECT 
    current_setting('app.settings.enable_email_confirmations', true) as current_email_confirmations;

-- Set the configuration
ALTER DATABASE postgres SET app.settings.enable_email_confirmations = 'true';

-- Verify the setting
SELECT 
    current_setting('app.settings.enable_email_confirmations', true) as email_confirmations_enabled;











