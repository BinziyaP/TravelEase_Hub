-- Clean up existing packages table and recreate properly
-- WARNING: This will delete all existing package data!

-- Drop existing policies first
DROP POLICY IF EXISTS "Agencies can view their own packages" ON packages;
DROP POLICY IF EXISTS "Agencies can insert their own packages" ON packages;
DROP POLICY IF EXISTS "Agencies can update their own packages" ON packages;
DROP POLICY IF EXISTS "Agencies can delete their own packages" ON packages;
DROP POLICY IF EXISTS "Admins can view all packages" ON packages;
DROP POLICY IF EXISTS "Admins can update all packages" ON packages;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_packages_updated_at ON packages;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_packages_agency_id;
DROP INDEX IF EXISTS idx_packages_status;
DROP INDEX IF EXISTS idx_packages_created_at;

-- Drop the table (this will delete all data!)
DROP TABLE IF EXISTS packages CASCADE;

-- Now recreate the packages table with correct structure
CREATE TABLE packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) >= 3 AND length(name) <= 100),
  destination TEXT NOT NULL CHECK (length(destination) >= 2 AND length(destination) <= 100),
  duration_days INTEGER NOT NULL CHECK (duration_days >= 1 AND duration_days <= 365),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0.01 AND price <= 999999.99),
  max_travelers INTEGER NOT NULL CHECK (max_travelers >= 1 AND max_travelers <= 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_packages_agency_id ON packages(agency_id);
CREATE INDEX idx_packages_status ON packages(status);
CREATE INDEX idx_packages_created_at ON packages(created_at);

-- Enable Row Level Security
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for packages
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
  );

CREATE POLICY "Agencies can delete their own packages" ON packages
  FOR DELETE USING (
    agency_id IN (
      SELECT id FROM agencies WHERE user_id = auth.uid()
    )
  );

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
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_packages_updated_at 
  BEFORE UPDATE ON packages 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();