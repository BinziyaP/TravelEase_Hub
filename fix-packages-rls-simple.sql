-- Fix Row Level Security Policy for Packages Table (Simplified Version)
-- Run this SQL in your Supabase SQL Editor

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Allow agencies to insert their own packages" ON packages;
DROP POLICY IF EXISTS "Allow agencies to view their own packages" ON packages;
DROP POLICY IF EXISTS "Allow agencies to update their own packages" ON packages;
DROP POLICY IF EXISTS "Allow agencies to delete their own packages" ON packages;

-- 2. Create simplified RLS policies that allow authenticated users to manage packages

-- Policy 1: Allow authenticated users to insert packages
CREATE POLICY "Allow authenticated users to insert packages"
ON packages FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 2: Allow authenticated users to view packages
CREATE POLICY "Allow authenticated users to view packages"
ON packages FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Allow authenticated users to update packages
CREATE POLICY "Allow authenticated users to update packages"
ON packages FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete packages
CREATE POLICY "Allow authenticated users to delete packages"
ON packages FOR DELETE
TO authenticated
USING (true);

-- 3. Ensure RLS is enabled
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- 4. Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'packages'
ORDER BY policyname;







