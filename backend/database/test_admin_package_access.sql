-- Test script to check admin package access
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if packages table exists and has data
SELECT 'Packages table check' as test_name, count(*) as package_count FROM packages;

-- 2. Check current RLS policies on packages table
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

-- 3. Check if RLS is enabled on packages table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'packages';

-- 4. Test direct package access (this should work for admin)
SELECT id, name, destination, status, agency_id, created_at 
FROM packages 
LIMIT 5;

-- 5. Check current user context
SELECT 
    current_user as current_user,
    session_user as session_user,
    current_setting('role') as current_role;






