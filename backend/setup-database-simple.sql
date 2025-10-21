-- Simple Database Setup - Run this if the complete script has issues
-- Run each section separately in Supabase SQL Editor

-- 1. Add essential columns only
ALTER TABLE packages ADD COLUMN IF NOT EXISTS selected_places JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS selected_hotels JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS selected_restaurants JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS route_coordinates JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS attractions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS meals_included JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS transportation_included JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;

-- 2. Update existing packages with empty arrays
UPDATE packages SET selected_places = '[]'::jsonb WHERE selected_places IS NULL;
UPDATE packages SET selected_hotels = '[]'::jsonb WHERE selected_hotels IS NULL;
UPDATE packages SET selected_restaurants = '[]'::jsonb WHERE selected_restaurants IS NULL;
UPDATE packages SET route_coordinates = '[]'::jsonb WHERE route_coordinates IS NULL;
UPDATE packages SET attractions = '[]'::jsonb WHERE attractions IS NULL;
UPDATE packages SET meals_included = '[]'::jsonb WHERE meals_included IS NULL;
UPDATE packages SET transportation_included = '[]'::jsonb WHERE transportation_included IS NULL;
UPDATE packages SET itinerary = '[]'::jsonb WHERE itinerary IS NULL;

-- 3. Create basic functions
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

-- 4. Enable RLS and create basic policies
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Agencies can manage their own packages" ON packages;
DROP POLICY IF EXISTS "Admins can view all packages" ON packages;

-- Create basic policies
CREATE POLICY "Agencies can manage their own packages" ON packages
    FOR ALL USING (auth.uid() = agency_id);

CREATE POLICY "Admins can view all packages" ON packages
    FOR SELECT USING (true); -- Simplified for testing

-- 5. Test the setup
SELECT 'Database setup completed!' as status;
SELECT COUNT(*) as total_packages FROM packages;
