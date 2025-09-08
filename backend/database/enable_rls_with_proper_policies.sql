-- RE-ENABLE RLS WITH PROPER POLICIES
-- This script re-enables RLS with working policies
-- Run this after testing with RLS disabled

-- 1. Re-enable RLS on all tables
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_approval_history ENABLE ROW LEVEL SECURITY;

-- If bookings table exists, enable RLS on it too
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
        ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on bookings table';
    END IF;
END $$;

-- 2. Drop all existing policies to start fresh
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on packages table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'packages') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON packages';
    END LOOP;
    
    -- Drop all policies on agencies table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'agencies') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON agencies';
    END LOOP;
    
    -- Drop all policies on package_approval_history table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'package_approval_history') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON package_approval_history';
    END LOOP;
    
    -- Drop all policies on bookings table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
        FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'bookings') LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON bookings';
        END LOOP;
    END IF;
END $$;

-- 3. Create simple, working policies

-- PACKAGES TABLE POLICIES
-- Allow authenticated users to view approved packages
CREATE POLICY "authenticated_can_view_approved_packages" ON packages
  FOR SELECT USING (
    auth.role() = 'authenticated' AND status = 'approved'
  );

-- Allow agencies to manage their own packages
CREATE POLICY "agencies_manage_own_packages" ON packages
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM agencies WHERE id = agency_id
    )
  );

-- Allow admins to manage all packages
CREATE POLICY "admins_manage_all_packages" ON packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  );

-- AGENCIES TABLE POLICIES
-- Allow agencies to manage their own profile
CREATE POLICY "agencies_manage_own_profile" ON agencies
  FOR ALL USING (user_id = auth.uid());

-- Allow admins to manage all agencies
CREATE POLICY "admins_manage_all_agencies" ON agencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  );

-- PACKAGE_APPROVAL_HISTORY TABLE POLICIES
-- Allow admins to manage all approval history
CREATE POLICY "admins_manage_approval_history" ON package_approval_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  );

-- Allow agencies to view their package approval history
CREATE POLICY "agencies_view_own_approval_history" ON package_approval_history
  FOR SELECT USING (
    package_id IN (
      SELECT p.id FROM packages p
      JOIN agencies a ON p.agency_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- BOOKINGS TABLE POLICIES (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
        -- Users can manage their own bookings
        EXECUTE 'CREATE POLICY "users_manage_own_bookings" ON bookings
          FOR ALL USING (user_id = auth.uid())';
        
        -- Admins can view all bookings
        EXECUTE 'CREATE POLICY "admins_view_all_bookings" ON bookings
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM auth.users 
              WHERE id = auth.uid() 
              AND raw_user_meta_data->>'user_type' = ''admin''
            )
          )';
        
        -- Agencies can view bookings for their packages
        EXECUTE 'CREATE POLICY "agencies_view_package_bookings" ON bookings
          FOR SELECT USING (
            package_id IN (
              SELECT p.id FROM packages p
              JOIN agencies a ON p.agency_id = a.id
              WHERE a.user_id = auth.uid()
            )
          )';
        
        RAISE NOTICE 'Bookings table policies created';
    END IF;
END $$;

-- 4. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 5. Show final status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('packages', 'agencies', 'package_approval_history', 'bookings')
ORDER BY tablename;

RAISE NOTICE 'RLS has been re-enabled with simplified policies';
RAISE NOTICE 'Your app should now work with proper security!';