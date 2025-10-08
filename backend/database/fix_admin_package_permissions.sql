-- Comprehensive fix for admin package permissions
-- Run this in Supabase SQL Editor

-- 1. First, let's see what policies exist
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'packages';

-- 2. Drop all existing policies on packages table
DROP POLICY IF EXISTS "Users can view their own packages" ON packages;
DROP POLICY IF EXISTS "Users can insert their own packages" ON packages;
DROP POLICY IF EXISTS "Users can update their own packages" ON packages;
DROP POLICY IF EXISTS "Users can delete their own packages" ON packages;
DROP POLICY IF EXISTS "Admin can view all packages" ON packages;
DROP POLICY IF EXISTS "Admin can manage all packages" ON packages;

-- 3. Create new policies that work for both agencies and admins
-- Policy for viewing packages (agencies see their own, admins see all)
CREATE POLICY "View packages policy" ON packages
    FOR SELECT
    TO authenticated
    USING (
        -- Agencies can see their own packages
        agency_id = auth.uid() 
        OR 
        -- Admins can see all packages (check if user is admin)
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                auth.users.raw_user_meta_data->>'userType' = 'admin'
                OR auth.users.raw_user_meta_data->>'full_name' ILIKE '%admin%'
                OR auth.users.email ILIKE '%admin%'
            )
        )
    );

-- Policy for inserting packages (agencies can insert their own)
CREATE POLICY "Insert packages policy" ON packages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        agency_id = auth.uid()
    );

-- Policy for updating packages (agencies can update their own, admins can update all)
CREATE POLICY "Update packages policy" ON packages
    FOR UPDATE
    TO authenticated
    USING (
        agency_id = auth.uid() 
        OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                auth.users.raw_user_meta_data->>'userType' = 'admin'
                OR auth.users.raw_user_meta_data->>'full_name' ILIKE '%admin%'
                OR auth.users.email ILIKE '%admin%'
            )
        )
    )
    WITH CHECK (
        agency_id = auth.uid() 
        OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                auth.users.raw_user_meta_data->>'userType' = 'admin'
                OR auth.users.raw_user_meta_data->>'full_name' ILIKE '%admin%'
                OR auth.users.email ILIKE '%admin%'
            )
        )
    );

-- Policy for deleting packages (agencies can delete their own, admins can delete all)
CREATE POLICY "Delete packages policy" ON packages
    FOR DELETE
    TO authenticated
    USING (
        agency_id = auth.uid() 
        OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                auth.users.raw_user_meta_data->>'userType' = 'admin'
                OR auth.users.raw_user_meta_data->>'full_name' ILIKE '%admin%'
                OR auth.users.email ILIKE '%admin%'
            )
        )
    );

-- 4. Verify the policies were created
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'packages';

-- 5. Test the fix
SELECT 'Test: Package count' as test, count(*) as count FROM packages;






