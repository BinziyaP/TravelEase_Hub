-- Safely create package approval history table

-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Admins can view all approval history" ON package_approval_history;
DROP POLICY IF EXISTS "Admins can insert approval history" ON package_approval_history;
DROP POLICY IF EXISTS "Agencies can view their package approval history" ON package_approval_history;

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS package_approval_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'pending')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_package_approval_history_package_id ON package_approval_history(package_id);
CREATE INDEX IF NOT EXISTS idx_package_approval_history_admin_id ON package_approval_history(admin_id);
CREATE INDEX IF NOT EXISTS idx_package_approval_history_created_at ON package_approval_history(created_at);

-- Enable RLS
ALTER TABLE package_approval_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

CREATE POLICY "Agencies can view their package approval history" ON package_approval_history
  FOR SELECT USING (
    package_id IN (
      SELECT p.id FROM packages p
      JOIN agencies a ON p.agency_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );