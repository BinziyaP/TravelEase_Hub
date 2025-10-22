-- Fix Row Level Security Policy for Packages Table
-- Run this SQL in your Supabase SQL Editor

-- 1. Check current RLS policies on packages table
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
WHERE tablename = 'packages';

-- 2. Check if RLS is enabled on packages table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'packages';

-- 3. Drop existing policies (if any) to start fresh
DROP POLICY IF EXISTS "Allow agencies to insert their own packages" ON packages;
DROP POLICY IF EXISTS "Allow agencies to view their own packages" ON packages;
DROP POLICY IF EXISTS "Allow agencies to update their own packages" ON packages;
DROP POLICY IF EXISTS "Allow agencies to delete their own packages" ON packages;

-- 4. Create proper RLS policies for packages table

-- Policy 1: Allow agencies to insert packages they own
CREATE POLICY "Allow agencies to insert their own packages"
ON packages FOR INSERT
TO authenticated
WITH CHECK (
    agency_id IN (
        SELECT id 
        FROM agencies 
        WHERE user_id = auth.uid()
    )
);

-- Policy 2: Allow agencies to view their own packages
CREATE POLICY "Allow agencies to view their own packages"
ON packages FOR SELECT
TO authenticated
USING (
    agency_id IN (
        SELECT id 
        FROM agencies 
        WHERE user_id = auth.uid()
    )
);

-- Policy 3: Allow agencies to update their own packages
CREATE POLICY "Allow agencies to update their own packages"
ON packages FOR UPDATE
TO authenticated
USING (
    agency_id IN (
        SELECT id 
        FROM agencies 
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    agency_id IN (
        SELECT id 
        FROM agencies 
        WHERE user_id = auth.uid()
    )
);

-- Policy 4: Allow agencies to delete their own packages
CREATE POLICY "Allow agencies to delete their own packages"
ON packages FOR DELETE
TO authenticated
USING (
    agency_id IN (
        SELECT id 
        FROM agencies 
        WHERE user_id = auth.uid()
    )
);

-- 5. Enable RLS on packages table (if not already enabled)
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- 6. Verify the policies were created
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

-- 7. Test the policy with your specific agency
-- Replace '66138508-cf73-4c1a-9d27-db071b1b4688' with your actual agency ID
SELECT 
    a.id as agency_id,
    a.agency_name,
    a.user_id,
    auth.uid() as current_user_id,
    (a.user_id = auth.uid()) as can_access
FROM agencies a
WHERE a.id = '66138508-cf73-4c1a-9d27-db071b1b4688';











