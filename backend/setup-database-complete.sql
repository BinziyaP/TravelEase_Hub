-- Complete Database Setup for Enhanced Package Management
-- Run this script in your Supabase SQL editor to fix all database issues

-- 1. Add missing columns to packages table
DO $$ 
BEGIN
    -- Enhanced package information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'accommodation_type') THEN
        ALTER TABLE packages ADD COLUMN accommodation_type VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'accommodation_name') THEN
        ALTER TABLE packages ADD COLUMN accommodation_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'accommodation_rating') THEN
        ALTER TABLE packages ADD COLUMN accommodation_rating INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'accommodation_location') THEN
        ALTER TABLE packages ADD COLUMN accommodation_location TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'accommodation_coordinates') THEN
        ALTER TABLE packages ADD COLUMN accommodation_coordinates JSONB;
    END IF;
    
    -- Enhanced package features
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'meals_included') THEN
        ALTER TABLE packages ADD COLUMN meals_included JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'transportation_included') THEN
        ALTER TABLE packages ADD COLUMN transportation_included JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'attractions') THEN
        ALTER TABLE packages ADD COLUMN attractions JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'attraction_coordinates') THEN
        ALTER TABLE packages ADD COLUMN attraction_coordinates JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'selected_places') THEN
        ALTER TABLE packages ADD COLUMN selected_places JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'selected_hotels') THEN
        ALTER TABLE packages ADD COLUMN selected_hotels JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'selected_restaurants') THEN
        ALTER TABLE packages ADD COLUMN selected_restaurants JSONB DEFAULT '[]';
    END IF;
    
    -- Itinerary and route information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'itinerary') THEN
        ALTER TABLE packages ADD COLUMN itinerary JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'route_coordinates') THEN
        ALTER TABLE packages ADD COLUMN route_coordinates JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'total_distance_km') THEN
        ALTER TABLE packages ADD COLUMN total_distance_km DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'estimated_travel_time_hours') THEN
        ALTER TABLE packages ADD COLUMN estimated_travel_time_hours DECIMAL(5,2);
    END IF;
    
    -- Package policies and requirements
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'included_features') THEN
        ALTER TABLE packages ADD COLUMN included_features JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'excluded_features') THEN
        ALTER TABLE packages ADD COLUMN excluded_features JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'cancellation_policy') THEN
        ALTER TABLE packages ADD COLUMN cancellation_policy TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'special_requirements') THEN
        ALTER TABLE packages ADD COLUMN special_requirements TEXT;
    END IF;
    
    -- Package images and media
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'package_images') THEN
        ALTER TABLE packages ADD COLUMN package_images JSONB DEFAULT '[]';
    END IF;
    
    -- Map and location data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'map_center') THEN
        ALTER TABLE packages ADD COLUMN map_center JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'map_zoom') THEN
        ALTER TABLE packages ADD COLUMN map_zoom INTEGER DEFAULT 12;
    END IF;
    
    -- Admin management
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'admin_notes') THEN
        ALTER TABLE packages ADD COLUMN admin_notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'approved_at') THEN
        ALTER TABLE packages ADD COLUMN approved_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'rejected_at') THEN
        ALTER TABLE packages ADD COLUMN rejected_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'approved_by') THEN
        ALTER TABLE packages ADD COLUMN approved_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'rejected_by') THEN
        ALTER TABLE packages ADD COLUMN rejected_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- Pricing information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'pricing_breakdown') THEN
        ALTER TABLE packages ADD COLUMN pricing_breakdown JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'base_costs') THEN
        ALTER TABLE packages ADD COLUMN base_costs JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'fees_and_margins') THEN
        ALTER TABLE packages ADD COLUMN fees_and_margins JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'pricing_factors') THEN
        ALTER TABLE packages ADD COLUMN pricing_factors JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'group_discount_applied') THEN
        ALTER TABLE packages ADD COLUMN group_discount_applied BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'group_discount_percentage') THEN
        ALTER TABLE packages ADD COLUMN group_discount_percentage DECIMAL(5,2) DEFAULT 0;
    END IF;
END $$;

-- 2. Update existing packages with default values for new columns
UPDATE packages SET 
    meals_included = '[]'::jsonb WHERE meals_included IS NULL;
UPDATE packages SET 
    transportation_included = '[]'::jsonb WHERE transportation_included IS NULL;
UPDATE packages SET 
    attractions = '[]'::jsonb WHERE attractions IS NULL;
UPDATE packages SET 
    attraction_coordinates = '[]'::jsonb WHERE attraction_coordinates IS NULL;
UPDATE packages SET 
    selected_places = '[]'::jsonb WHERE selected_places IS NULL;
UPDATE packages SET 
    selected_hotels = '[]'::jsonb WHERE selected_hotels IS NULL;
UPDATE packages SET 
    selected_restaurants = '[]'::jsonb WHERE selected_restaurants IS NULL;
UPDATE packages SET 
    itinerary = '[]'::jsonb WHERE itinerary IS NULL;
UPDATE packages SET 
    route_coordinates = '[]'::jsonb WHERE route_coordinates IS NULL;
UPDATE packages SET 
    included_features = '[]'::jsonb WHERE included_features IS NULL;
UPDATE packages SET 
    excluded_features = '[]'::jsonb WHERE excluded_features IS NULL;
UPDATE packages SET 
    package_images = '[]'::jsonb WHERE package_images IS NULL;

-- 3. Create database functions
CREATE OR REPLACE FUNCTION approve_package(
    package_uuid UUID,
    admin_uuid UUID,
    approval_notes TEXT DEFAULT 'Approved by admin'
) RETURNS JSON AS $$
BEGIN
    UPDATE packages 
    SET 
        status = 'approved',
        approved_at = NOW(),
        approved_by = admin_uuid,
        admin_notes = approval_notes,
        updated_at = NOW()
    WHERE id = package_uuid;
    
    RETURN json_build_object('success', true, 'message', 'Package approved successfully');
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reject_package(
    package_uuid UUID,
    admin_uuid UUID,
    rejection_notes TEXT DEFAULT 'Rejected by admin'
) RETURNS JSON AS $$
BEGIN
    UPDATE packages 
    SET 
        status = 'rejected',
        rejected_at = NOW(),
        rejected_by = admin_uuid,
        admin_notes = rejection_notes,
        updated_at = NOW()
    WHERE id = package_uuid;
    
    RETURN json_build_object('success', true, 'message', 'Package rejected successfully');
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql;

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

-- 4. Enable Row Level Security
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Agencies can manage their own packages" ON packages;
DROP POLICY IF EXISTS "Admins can view all packages" ON packages;
DROP POLICY IF EXISTS "Admins can update package status" ON packages;
DROP POLICY IF EXISTS "Public can view approved packages" ON packages;

-- Create new policies
CREATE POLICY "Agencies can manage their own packages" ON packages
    FOR ALL USING (auth.uid() = agency_id);

CREATE POLICY "Admins can view all packages" ON packages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Admins can update package status" ON packages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Public can view approved packages" ON packages
    FOR SELECT USING (status = 'approved');

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_packages_agency_id ON packages(agency_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_created_at ON packages(created_at);
CREATE INDEX IF NOT EXISTS idx_packages_destination ON packages(destination);
CREATE INDEX IF NOT EXISTS idx_packages_price ON packages(price);

-- JSONB indexes for flexible queries
CREATE INDEX IF NOT EXISTS idx_packages_attractions_gin ON packages USING GIN(attractions);
CREATE INDEX IF NOT EXISTS idx_packages_selected_places_gin ON packages USING GIN(selected_places);
CREATE INDEX IF NOT EXISTS idx_packages_route_coordinates_gin ON packages USING GIN(route_coordinates);
CREATE INDEX IF NOT EXISTS idx_packages_selected_hotels_gin ON packages USING GIN(selected_hotels);
CREATE INDEX IF NOT EXISTS idx_packages_selected_restaurants_gin ON packages USING GIN(selected_restaurants);

-- 7. Grant necessary permissions
GRANT ALL ON packages TO authenticated;
GRANT ALL ON packages TO anon;

-- 8. Create a sample package with complete data for testing
INSERT INTO packages (
    id,
    agency_id,
    name,
    duration_days,
    destination,
    price,
    max_travelers,
    description,
    accommodation_type,
    accommodation_name,
    accommodation_rating,
    accommodation_location,
    accommodation_coordinates,
    meals_included,
    transportation_included,
    attractions,
    attraction_coordinates,
    selected_places,
    selected_hotels,
    selected_restaurants,
    itinerary,
    route_coordinates,
    total_distance_km,
    estimated_travel_time_hours,
    included_features,
    excluded_features,
    cancellation_policy,
    special_requirements,
    package_images,
    map_center,
    map_zoom,
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1), -- Use first user as agency
    'Sample Complete Package',
    7,
    'Wayanad, Kerala, India',
    50000,
    4,
    'Complete 7-day Wayanad adventure package with all amenities',
    'hotel',
    'The Woods Resorts',
    5,
    'Wayanad, Kerala, India',
    '{"lat": 11.587088, "lng": 76.037890}',
    '["breakfast", "lunch", "dinner"]'::jsonb,
    '["car", "local_transport"]'::jsonb,
    '["Edakkal Caves", "Wayanad Wildlife Sanctuary", "Chembra Peak", "Neelimala", "Lakkidi Viewpoint", "Banasura Sagar Dam", "Kuruva Island"]'::jsonb,
    '[]'::jsonb,
    '[
        {"name": "Edakkal Caves", "coordinates": {"lat": 11.587088, "lng": 76.037890}},
        {"name": "Wayanad Wildlife Sanctuary", "coordinates": {"lat": 11.600000, "lng": 76.050000}},
        {"name": "Chembra Peak", "coordinates": {"lat": 11.610000, "lng": 76.060000}},
        {"name": "Neelimala", "coordinates": {"lat": 11.620000, "lng": 76.070000}},
        {"name": "Lakkidi Viewpoint", "coordinates": {"lat": 11.630000, "lng": 76.080000}},
        {"name": "Banasura Sagar Dam", "coordinates": {"lat": 11.640000, "lng": 76.090000}},
        {"name": "Kuruva Island", "coordinates": {"lat": 11.650000, "lng": 76.100000}}
    ]'::jsonb,
    '[
        {"name": "The Woods Resorts", "coordinates": {"lat": 11.580000, "lng": 76.040000}, "rating": 4.8},
        {"name": "Hotel Arafa", "coordinates": {"lat": 11.590000, "lng": 76.045000}, "rating": 4.5}
    ]'::jsonb,
    '[
        {"name": "Restaurant 1", "coordinates": {"lat": 11.585000, "lng": 76.042000}},
        {"name": "Restaurant 2", "coordinates": {"lat": 11.595000, "lng": 76.047000}}
    ]'::jsonb,
    '[
        {"day": 1, "morning": "Edakkal Caves", "afternoon": "free_time", "evening": "Restaurant 1"},
        {"day": 2, "morning": "Wayanad Wildlife Sanctuary", "afternoon": "free_time", "evening": "Restaurant 2"},
        {"day": 3, "morning": "Chembra Peak", "afternoon": "free_time", "evening": "Restaurant 1"},
        {"day": 4, "morning": "Neelimala", "afternoon": "free_time", "evening": "Restaurant 2"},
        {"day": 5, "morning": "Lakkidi Viewpoint", "afternoon": "free_time", "evening": "Restaurant 1"},
        {"day": 6, "morning": "Banasura Sagar Dam", "afternoon": "free_time", "evening": "Restaurant 2"},
        {"day": 7, "morning": "Kuruva Island", "afternoon": "free_time", "evening": "Restaurant 1"}
    ]'::jsonb,
    '[
        {"name": "Edakkal Caves", "coordinates": {"lat": 11.587088, "lng": 76.037890}},
        {"name": "Wayanad Wildlife Sanctuary", "coordinates": {"lat": 11.600000, "lng": 76.050000}},
        {"name": "Chembra Peak", "coordinates": {"lat": 11.610000, "lng": 76.060000}},
        {"name": "Neelimala", "coordinates": {"lat": 11.620000, "lng": 76.070000}},
        {"name": "Lakkidi Viewpoint", "coordinates": {"lat": 11.630000, "lng": 76.080000}},
        {"name": "Banasura Sagar Dam", "coordinates": {"lat": 11.640000, "lng": 76.090000}},
        {"name": "Kuruva Island", "coordinates": {"lat": 11.650000, "lng": 76.100000}},
        {"name": "The Woods Resorts", "coordinates": {"lat": 11.580000, "lng": 76.040000}},
        {"name": "Hotel Arafa", "coordinates": {"lat": 11.590000, "lng": 76.045000}},
        {"name": "Restaurant 1", "coordinates": {"lat": 11.585000, "lng": 76.042000}},
        {"name": "Restaurant 2", "coordinates": {"lat": 11.595000, "lng": 76.047000}}
    ]'::jsonb,
    150.5,
    3.2,
    '["Guided tours", "Transportation", "Accommodation", "Meals", "Entry fees"]'::jsonb,
    '["Personal expenses", "Tips", "Optional activities"]'::jsonb,
    'Standard cancellation policy applies. 50% refund if cancelled 7 days before travel.',
    'None specified',
    '[]'::jsonb,
    '{"lat": 11.587088, "lng": 76.037890}',
    12,
    'pending',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 9. Verify the setup
SELECT 
    'Database setup completed successfully!' as status,
    COUNT(*) as total_packages,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_packages,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_packages
FROM packages;
