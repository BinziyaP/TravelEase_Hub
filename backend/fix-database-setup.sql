-- Fixed Database Setup Script
-- This handles existing policies and columns properly

-- 1. Add missing columns (only if they don't exist)
DO $$ 
BEGIN
    -- Add columns only if they don't exist
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
    
    RAISE NOTICE 'Columns added successfully';
END $$;

-- 2. Create or replace functions
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

-- 3. Enable RLS (only if not already enabled)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'packages' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled for packages table';
    ELSE
        RAISE NOTICE 'RLS already enabled for packages table';
    END IF;
END $$;

-- 4. Create policies only if they don't exist
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Agencies can manage their own packages" ON packages;
    DROP POLICY IF EXISTS "Admins can view all packages" ON packages;
    DROP POLICY IF EXISTS "Public can view approved packages" ON packages;
    
    -- Create new policies
    CREATE POLICY "Agencies can manage their own packages" ON packages
        FOR ALL USING (auth.uid() = agency_id);
    
    CREATE POLICY "Admins can view all packages" ON packages
        FOR SELECT USING (true);
    
    CREATE POLICY "Public can view approved packages" ON packages
        FOR SELECT USING (status = 'approved');
    
    RAISE NOTICE 'Policies created successfully';
END $$;

-- 5. Test the setup
SELECT 'Database setup completed successfully!' as status;

-- 6. Verify columns exist
SELECT 
    'COLUMN VERIFICATION' as check_type,
    column_name,
    data_type,
    'EXISTS' as status
FROM information_schema.columns 
WHERE table_name = 'packages' 
  AND column_name IN (
    'selected_places', 'selected_hotels', 'selected_restaurants', 
    'route_coordinates', 'itinerary', 'admin_notes', 'approved_at', 'rejected_at'
  )
ORDER BY column_name;

-- 7. Test the function
SELECT 
    'FUNCTION TEST' as check_type,
    'get_package_stats()' as function_name,
    get_package_stats() as result;

-- 8. Check current package data
SELECT 
    'PACKAGE DATA CHECK' as check_type,
    name,
    destination,
    price,
    status,
    CASE WHEN selected_places IS NOT NULL THEN jsonb_array_length(selected_places) ELSE 0 END as places_count,
    CASE WHEN selected_hotels IS NOT NULL THEN jsonb_array_length(selected_hotels) ELSE 0 END as hotels_count,
    CASE WHEN route_coordinates IS NOT NULL THEN jsonb_array_length(route_coordinates) ELSE 0 END as route_count
FROM packages
ORDER BY created_at DESC;
