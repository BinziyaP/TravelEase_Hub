-- Fix Conflicting RLS Policies on Packages Table
-- Run this SQL in your Supabase SQL Editor

-- 1. Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Admins can delete packages" ON packages;
DROP POLICY IF EXISTS "Admins can insert packages" ON packages;
DROP POLICY IF EXISTS "Admins can update all packages" ON packages;
DROP POLICY IF EXISTS "Admins can view all packages" ON packages;
DROP POLICY IF EXISTS "Agencies can delete draft packages" ON packages;
DROP POLICY IF EXISTS "Agencies can delete their own packages" ON packages;
DROP POLICY IF EXISTS "Agencies can insert their own packages" ON packages;
DROP POLICY IF EXISTS "Agencies can select their own packages" ON packages;
DROP POLICY IF EXISTS "Agencies can update their own packages" ON packages;
DROP POLICY IF EXISTS "Agencies can view their own packages" ON packages;
DROP POLICY IF EXISTS "Allow authenticated users to delete packages" ON packages;
DROP POLICY IF EXISTS "Allow authenticated users to insert packages" ON packages;
DROP POLICY IF EXISTS "Allow authenticated users to update packages" ON packages;
DROP POLICY IF EXISTS "Allow authenticated users to view packages" ON packages;
DROP POLICY IF EXISTS "Public can view approved packages" ON packages;

-- 2. Create clean, non-conflicting policies

-- Policy 1: Allow authenticated users to insert packages (simplified)
CREATE POLICY "Authenticated users can insert packages"
ON packages FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 2: Allow authenticated users to view packages (simplified)
CREATE POLICY "Authenticated users can view packages"
ON packages FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Allow authenticated users to update packages (simplified)
CREATE POLICY "Authenticated users can update packages"
ON packages FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete packages (simplified)
CREATE POLICY "Authenticated users can delete packages"
ON packages FOR DELETE
TO authenticated
USING (true);

-- Policy 5: Allow public to view approved packages
CREATE POLICY "Public can view approved packages"
ON packages FOR SELECT
TO anon
USING (status = 'approved');

-- 3. Verify the policies were created
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'packages'
ORDER BY policyname;








