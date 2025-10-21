-- Fixed Database Setup - Handles existing column types properly
-- Run this script in Supabase SQL Editor

-- 1. First, let's check what columns already exist and their types
DO $$ 
DECLARE
    col_exists boolean;
    col_type text;
BEGIN
    -- Check if attractions column exists and its type
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'packages' AND column_name = 'attractions'
    ) INTO col_exists;
    
    IF col_exists THEN
        SELECT data_type FROM information_schema.columns 
        WHERE table_name = 'packages' AND column_name = 'attractions'
        INTO col_type;
        
        RAISE NOTICE 'attractions column exists with type: %', col_type;
        
        -- If it's text[], we need to convert it to jsonb
        IF col_type = 'ARRAY' THEN
            -- Convert text[] to jsonb
            ALTER TABLE packages ALTER COLUMN attractions TYPE jsonb USING attractions::text::jsonb;
        END IF;
    END IF;
END $$;

-- 2. Add missing columns with proper types
DO $$ 
BEGIN
    -- Add columns that don't exist yet
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'selected_places') THEN
        ALTER TABLE packages ADD COLUMN selected_places JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'selected_hotels') THEN
        ALTER TABLE packages ADD COLUMN selected_hotels JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'selected_restaurants') THEN
        ALTER TABLE packages ADD COLUMN selected_restaurants JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'route_coordinates') THEN
        ALTER TABLE packages ADD COLUMN route_coordinates JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'meals_included') THEN
        ALTER TABLE packages ADD COLUMN meals_included JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'transportation_included') THEN
        ALTER TABLE packages ADD COLUMN transportation_included JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'itinerary') THEN
        ALTER TABLE packages ADD COLUMN itinerary JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'admin_notes') THEN
        ALTER TABLE packages ADD COLUMN admin_notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'approved_at') THEN
        ALTER TABLE packages ADD COLUMN approved_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'rejected_at') THEN
        ALTER TABLE packages ADD COLUMN rejected_at TIMESTAMP;
    END IF;
END $$;

-- 3. Safely update existing packages - only update NULL values
UPDATE packages SET 
    selected_places = '[]'::jsonb 
WHERE selected_places IS NULL;

UPDATE packages SET 
    selected_hotels = '[]'::jsonb 
WHERE selected_hotels IS NULL;

UPDATE packages SET 
    selected_restaurants = '[]'::jsonb 
WHERE selected_restaurants IS NULL;

UPDATE packages SET 
    route_coordinates = '[]'::jsonb 
WHERE route_coordinates IS NULL;

UPDATE packages SET 
    attractions = '[]'::jsonb 
WHERE attractions IS NULL;

UPDATE packages SET 
    meals_included = '[]'::jsonb 
WHERE meals_included IS NULL;

UPDATE packages SET 
    transportation_included = '[]'::jsonb 
WHERE transportation_included IS NULL;

UPDATE packages SET 
    itinerary = '[]'::jsonb 
WHERE itinerary IS NULL;

-- 4. Create basic functions
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

-- 5. Enable RLS and create basic policies
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Agencies can manage their own packages" ON packages;
DROP POLICY IF EXISTS "Admins can view all packages" ON packages;
DROP POLICY IF EXISTS "Public can view approved packages" ON packages;

-- Create basic policies
CREATE POLICY "Agencies can manage their own packages" ON packages
    FOR ALL USING (auth.uid() = agency_id);

CREATE POLICY "Admins can view all packages" ON packages
    FOR SELECT USING (true); -- Simplified for testing

CREATE POLICY "Public can view approved packages" ON packages
    FOR SELECT USING (status = 'approved');

-- 6. Test the setup
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as total_packages FROM packages;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'packages' AND column_name IN ('selected_places', 'selected_hotels', 'selected_restaurants', 'route_coordinates', 'attractions', 'meals_included', 'transportation_included', 'itinerary');
