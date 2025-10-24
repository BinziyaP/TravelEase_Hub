-- Comprehensive RLS Policy Fix for TravelEase Admin Access
-- Run this SQL in your Supabase SQL Editor

-- Drop all existing agency policies
DROP POLICY IF EXISTS "agencies_self_insert" ON public.agencies;
DROP POLICY IF EXISTS "agencies_self_select" ON public.agencies;
DROP POLICY IF EXISTS "agencies_self_update" ON public.agencies;
DROP POLICY IF EXISTS "agencies_admin_select" ON public.agencies;
DROP POLICY IF EXISTS "agencies_admin_update" ON public.agencies;
DROP POLICY IF EXISTS "admin_agencies_access" ON public.agencies;

-- Create comprehensive RLS policies for agencies table

-- 1. Allow agencies to insert their own profile
CREATE POLICY "agencies_self_insert" ON public.agencies
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 2. Allow agencies to view their own profile
CREATE POLICY "agencies_self_select" ON public.agencies
    FOR SELECT USING (user_id = auth.uid());

-- 3. Allow agencies to update their own profile
CREATE POLICY "agencies_self_update" ON public.agencies
    FOR UPDATE USING (user_id = auth.uid());

-- 4. Allow admins to view all agencies (check both metadata locations)
CREATE POLICY "agencies_admin_select" ON public.agencies
    FOR SELECT USING (
        ((auth.jwt() -> 'app_metadata'::text) ->> 'user_type'::text) = 'admin'::text OR
        ((auth.jwt() -> 'user_metadata'::text) ->> 'user_type'::text) = 'admin'::text
    );

-- 5. Allow admins to update all agencies (check both metadata locations)
CREATE POLICY "agencies_admin_update" ON public.agencies
    FOR UPDATE USING (
        ((auth.jwt() -> 'app_metadata'::text) ->> 'user_type'::text) = 'admin'::text OR
        ((auth.jwt() -> 'user_metadata'::text) ->> 'user_type'::text) = 'admin'::text
    );

-- 6. Allow admins full access to agencies (check both metadata locations)
CREATE POLICY "admin_agencies_access" ON public.agencies
    FOR ALL USING (
        ((auth.jwt() -> 'app_metadata'::text) ->> 'user_type'::text) = 'admin'::text OR
        ((auth.jwt() -> 'user_metadata'::text) ->> 'user_type'::text) = 'admin'::text
    );

-- Create a helper function to check admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    ((auth.jwt() -> 'app_metadata'::text) ->> 'user_type'::text) = 'admin'::text OR
    ((auth.jwt() -> 'user_metadata'::text) ->> 'user_type'::text) = 'admin'::text
  );
END;
$$;

-- Test the policies
SELECT 'RLS policies updated successfully!' as message;
