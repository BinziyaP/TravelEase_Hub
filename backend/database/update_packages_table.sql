-- Safely update packages table structure without losing data

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Check and add admin_notes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'admin_notes') THEN
        ALTER TABLE packages ADD COLUMN admin_notes TEXT;
    END IF;
    
    -- Check and add approved_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'approved_at') THEN
        ALTER TABLE packages ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Check and add approved_by column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'approved_by') THEN
        ALTER TABLE packages ADD COLUMN approved_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- Check and add rejected_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'rejected_at') THEN
        ALTER TABLE packages ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Check and add rejected_by column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'rejected_by') THEN
        ALTER TABLE packages ADD COLUMN rejected_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- Check and add updated_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'updated_at') THEN
        ALTER TABLE packages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_packages_agency_id ON packages(agency_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_created_at ON packages(created_at);

-- Enable RLS if not already enabled
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate trigger to ensure it works
DROP TRIGGER IF EXISTS update_packages_updated_at ON packages;
CREATE TRIGGER update_packages_updated_at 
  BEFORE UPDATE ON packages 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();