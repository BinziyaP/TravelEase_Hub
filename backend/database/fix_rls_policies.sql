-- Fix RLS Policies for Admin and Agency Access
-- This script fixes all the 403 errors by updating RLS policies

-- 1. Fix packages table RLS policies
DROP POLICY IF EXISTS "Agencies can view their own packages" ON packages;
DROP POLICY IF EXISTS "Agencies can insert their own packages" ON packages;
DROP POLICY IF EXISTS "Agencies can update their own packages" ON packages;
DROP POLICY IF EXISTS "Agencies can delete their own packages" ON packages;
DROP POLICY IF EXISTS "Admins can view all packages" ON packages;
DROP POLICY IF EXISTS "Admins can update all packages" ON packages;

-- Create new comprehensive policies for packages
CREATE POLICY "Agencies can view their own packages" ON packages
  FOR SELECT USING (
    agency_id IN (
      SELECT id FROM agencies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Agencies can insert their own packages" ON packages
  FOR INSERT WITH CHECK (
    agency_id IN (
      SELECT id FROM agencies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Agencies can update their own packages" ON packages
  FOR UPDATE USING (
    agency_id IN (
      SELECT id FROM agencies WHERE user_id = auth.uid()
    )
  ) WITH CHECK (
    agency_id IN (
      SELECT id FROM agencies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Agencies can delete their own packages" ON packages
  FOR DELETE USING (
    agency_id IN (
      SELECT id FROM agencies WHERE user_id = auth.uid()
    )
  );

-- Admin policies for packages
CREATE POLICY "Admins can view all packages" ON packages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  );

CREATE POLICY "Admins can update all packages" ON packages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  );

CREATE POLICY "Admins can insert packages" ON packages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  );

CREATE POLICY "Admins can delete packages" ON packages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  );

-- Users can view approved packages
CREATE POLICY "Users can view approved packages" ON packages
  FOR SELECT USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (raw_user_meta_data->>'user_type' = 'user' OR raw_user_meta_data->>'user_type' IS NULL)
    )
  );

-- 2. Fix agencies table RLS policies
DROP POLICY IF EXISTS "Agencies can view their own profile" ON agencies;
DROP POLICY IF EXISTS "Agencies can update their own profile" ON agencies;
DROP POLICY IF EXISTS "Admins can view all agencies" ON agencies;
DROP POLICY IF EXISTS "Admins can update all agencies" ON agencies;

-- Create new comprehensive policies for agencies
CREATE POLICY "Agencies can view their own profile" ON agencies
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Agencies can update their own profile" ON agencies
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Agencies can insert their own profile" ON agencies
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin policies for agencies
CREATE POLICY "Admins can view all agencies" ON agencies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  );

CREATE POLICY "Admins can update all agencies" ON agencies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  );

CREATE POLICY "Admins can insert agencies" ON agencies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  );

CREATE POLICY "Admins can delete agencies" ON agencies
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  );

-- 3. Fix package_approval_history table RLS policies
DROP POLICY IF EXISTS "Admins can view all approval history" ON package_approval_history;
DROP POLICY IF EXISTS "Admins can insert approval history" ON package_approval_history;
DROP POLICY IF EXISTS "Agencies can view their package approval history" ON package_approval_history;

-- Create new comprehensive policies for package_approval_history
CREATE POLICY "Admins can view all approval history" ON package_approval_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  );

CREATE POLICY "Admins can insert approval history" ON package_approval_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  );

CREATE POLICY "Admins can update approval history" ON package_approval_history
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  );

CREATE POLICY "Agencies can view their package approval history" ON package_approval_history
  FOR SELECT USING (
    package_id IN (
      SELECT p.id FROM packages p
      JOIN agencies a ON p.agency_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- 4. Create bookings table if it doesn't exist and set up RLS
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  travelers_count INTEGER NOT NULL CHECK (travelers_count >= 1),
  total_price DECIMAL(10,2) NOT NULL,
  booking_date DATE NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Agencies can view bookings for their packages" ON bookings;

CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own bookings" ON bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'user_type' = 'admin'
    )
  );

CREATE POLICY "Agencies can view bookings for their packages" ON bookings
  FOR SELECT USING (
    package_id IN (
      SELECT p.id FROM packages p
      JOIN agencies a ON p.agency_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_package_id ON bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- 6. Create trigger for bookings updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON bookings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 8. Create a function to check if user is admin (for easier policy management)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'user_type' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create a function to get user's agency ID (for easier policy management)
CREATE OR REPLACE FUNCTION get_user_agency_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM agencies 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create a function to check if user is agency owner of a package
CREATE OR REPLACE FUNCTION is_package_owner(package_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM packages p
    JOIN agencies a ON p.agency_id = a.id
    WHERE p.id = package_uuid
    AND a.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;