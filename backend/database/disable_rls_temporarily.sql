-- TEMPORARY RLS DISABLE SCRIPT
-- This script temporarily disables RLS to allow the app to work
-- while we fix the permission issues

-- WARNING: This is for development/testing only
-- DO NOT use this in production

-- Disable RLS on all tables temporarily
ALTER TABLE packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE agencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE package_approval_history DISABLE ROW LEVEL SECURITY;

-- If bookings table exists, disable RLS on it too
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
        ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on bookings table';
    END IF;
END $$;

-- Grant full access to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Show current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('packages', 'agencies', 'package_approval_history', 'bookings')
ORDER BY tablename;

RAISE NOTICE 'RLS has been temporarily disabled on all tables';
RAISE NOTICE 'Your app should now work without permission errors';
RAISE NOTICE 'Remember to re-enable RLS later for security!';