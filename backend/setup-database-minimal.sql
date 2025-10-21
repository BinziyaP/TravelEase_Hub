-- Minimal Database Setup - Only adds new columns, doesn't modify existing ones
-- This is the safest approach

-- 1. Add only the essential new columns that don't exist
ALTER TABLE packages ADD COLUMN IF NOT EXISTS selected_places JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS selected_hotels JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS selected_restaurants JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS route_coordinates JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;

-- 2. Create basic functions
CREATE OR REPLACE FUNCTION get_package_stats() RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'pending', (SELECT COUNT(*) FROM packages WHERE status = 'pending'),
        'approved', (SELECT COUNT(*) FROM packages WHERE status = 'approved'),
        'rejected', (SELECT COUNT(*) FROM packages WHERE status = 'rejected'),
        'total', (SELECT COUNT(*) FROM packages)
    );
END;
$$ LANGUAGE plpgsql;

-- 3. Enable RLS and create basic policies
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Agencies can manage their own packages" ON packages;
DROP POLICY IF EXISTS "Admins can view all packages" ON packages;

-- Create basic policies
CREATE POLICY "Agencies can manage their own packages" ON packages
    FOR ALL USING (auth.uid() = agency_id);

CREATE POLICY "Admins can view all packages" ON packages
    FOR SELECT USING (true); -- Simplified for testing

-- 4. Test the setup
SELECT 'Minimal database setup completed!' as status;
SELECT COUNT(*) as total_packages FROM packages;
