-- Quick fix to allow admin access to packages
-- Run this in Supabase SQL Editor

-- Option 1: Temporarily disable RLS on packages table (QUICK FIX)
ALTER TABLE packages DISABLE ROW LEVEL SECURITY;

-- Option 2: Create a simple admin policy (if you prefer to keep RLS enabled)
-- Uncomment the lines below if you want to use this instead of disabling RLS

-- DROP POLICY IF EXISTS "Admin can view all packages" ON packages;
-- CREATE POLICY "Admin can view all packages" ON packages
--     FOR ALL
--     TO authenticated
--     USING (true)
--     WITH CHECK (true);

-- Verify the fix worked
SELECT 'RLS Status' as check_type, rowsecurity as rls_enabled FROM pg_tables WHERE tablename = 'packages';
SELECT 'Package Count' as check_type, count(*) as total_packages FROM packages;






