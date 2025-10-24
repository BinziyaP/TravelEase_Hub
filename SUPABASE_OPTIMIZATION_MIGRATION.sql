-- SUPABASE OPTIMIZATION MIGRATION
-- This migration ensures optimal performance and data consistency for dashboard fixes

-- 1. Ensure all required JSONB fields exist with proper structure
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS total_costs JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS fees_and_margins JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS route_coordinates JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS selected_places JSONB DEFAULT '[]';

-- 2. Add comments to explain the structure (for documentation)
COMMENT ON COLUMN public.packages.total_costs IS 'JSONB object storing total costs for each component. Structure: {"accommodation": 21000, "attractions": 4500, "transport": 16100, "guide": 8400, "restaurants": 1000, "insurance": 1750}';
COMMENT ON COLUMN public.packages.fees_and_margins IS 'JSONB object storing fees and margins. Structure: {"agency_margin": 4747.5, "service_fee": 949.5, "taxes": 2373.75}';
COMMENT ON COLUMN public.packages.route_coordinates IS 'JSONB array storing route coordinates for map display. Structure: [{"name": "Place 1", "coordinates": {"lat": 11.6, "lng": 76.0}}, ...]';
COMMENT ON COLUMN public.packages.selected_places IS 'JSONB array storing selected places for package. Structure: [{"name": "Place 1", "coordinates": {"lat": 11.6, "lng": 76.0}}, ...]';

-- 3. Create indexes for better query performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_packages_total_costs_gin ON public.packages USING GIN(total_costs);
CREATE INDEX IF NOT EXISTS idx_packages_fees_and_margins_gin ON public.packages USING GIN(fees_and_margins);
CREATE INDEX IF NOT EXISTS idx_packages_route_coordinates_gin ON public.packages USING GIN(route_coordinates);
CREATE INDEX IF NOT EXISTS idx_packages_selected_places_gin ON public.packages USING GIN(selected_places);

-- 4. Ensure proper data types and constraints
ALTER TABLE public.packages 
ALTER COLUMN price TYPE DECIMAL(10,2),
ALTER COLUMN max_travelers TYPE INTEGER,
ALTER COLUMN duration_days TYPE INTEGER;

-- 5. Add check constraints for data validation
ALTER TABLE public.packages 
ADD CONSTRAINT IF NOT EXISTS check_price_positive CHECK (price > 0),
ADD CONSTRAINT IF NOT EXISTS check_max_travelers_positive CHECK (max_travelers > 0),
ADD CONSTRAINT IF NOT EXISTS check_duration_positive CHECK (duration_days > 0);

-- 6. Create a function to validate JSONB structure for route_coordinates
CREATE OR REPLACE FUNCTION validate_route_coordinates(coords JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if it's an array
    IF jsonb_typeof(coords) != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Check if each element has required structure
    FOR i IN 0..jsonb_array_length(coords)-1 LOOP
        DECLARE
            item JSONB := coords->i;
        BEGIN
            -- Check if item has name and coordinates
            IF NOT (item ? 'name' AND item ? 'coordinates') THEN
                RETURN FALSE;
            END IF;
            
            -- Check if coordinates has lat and lng
            IF NOT (item->'coordinates' ? 'lat' AND item->'coordinates' ? 'lng') THEN
                RETURN FALSE;
            END IF;
        END;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. Add trigger to validate route_coordinates data
CREATE OR REPLACE FUNCTION validate_package_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate route_coordinates structure
    IF NEW.route_coordinates IS NOT NULL AND NOT validate_route_coordinates(NEW.route_coordinates) THEN
        RAISE EXCEPTION 'Invalid route_coordinates structure. Expected: [{"name": "string", "coordinates": {"lat": number, "lng": number}}]';
    END IF;
    
    -- Validate selected_places structure (same as route_coordinates)
    IF NEW.selected_places IS NOT NULL AND NOT validate_route_coordinates(NEW.selected_places) THEN
        RAISE EXCEPTION 'Invalid selected_places structure. Expected: [{"name": "string", "coordinates": {"lat": number, "lng": number}}]';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS validate_package_data_trigger ON public.packages;
CREATE TRIGGER validate_package_data_trigger
    BEFORE INSERT OR UPDATE ON public.packages
    FOR EACH ROW
    EXECUTE FUNCTION validate_package_data();

-- 8. Create a view for consistent package data retrieval
CREATE OR REPLACE VIEW public.packages_with_consistent_data AS
SELECT 
    id,
    name,
    destination,
    duration_days,
    price,
    max_travelers,
    description,
    status,
    created_at,
    updated_at,
    approved_at,
    rejected_at,
    admin_notes,
    
    -- Route and location data (prioritized)
    COALESCE(route_coordinates, selected_places, '[]'::jsonb) as route_coordinates,
    COALESCE(selected_places, '[]'::jsonb) as selected_places,
    COALESCE(attractions, '{}'::text[]) as attractions,
    
    -- Pricing data
    COALESCE(total_costs, '{}'::jsonb) as total_costs,
    COALESCE(fees_and_margins, '{}'::jsonb) as fees_and_margins,
    
    -- Other fields
    accommodation_type,
    accommodation_name,
    accommodation_rating,
    accommodation_location,
    selected_hotels,
    selected_restaurants,
    transportation_included,
    transportation_details,
    itinerary,
    daily_itinerary,
    features,
    total_distance_km,
    estimated_travel_time_hours,
    agency_id
FROM public.packages;

-- 9. Grant permissions for the view
GRANT SELECT ON public.packages_with_consistent_data TO authenticated;
GRANT SELECT ON public.packages_with_consistent_data TO anon;

-- 10. Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_packages_status ON public.packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_agency_id ON public.packages(agency_id);
CREATE INDEX IF NOT EXISTS idx_packages_created_at ON public.packages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_packages_approved_at ON public.packages(approved_at DESC);

-- 11. Add helpful comments
COMMENT ON VIEW public.packages_with_consistent_data IS 'View that provides consistent package data with proper fallbacks for route_coordinates and selected_places';

-- 12. Create a function to update package pricing data
CREATE OR REPLACE FUNCTION update_package_pricing(
    p_package_id UUID,
    p_total_costs JSONB DEFAULT NULL,
    p_fees_and_margins JSONB DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE public.packages 
    SET 
        total_costs = COALESCE(p_total_costs, total_costs),
        fees_and_margins = COALESCE(p_fees_and_margins, fees_and_margins),
        updated_at = NOW()
    WHERE id = p_package_id;
    
    IF FOUND THEN
        result := json_build_object(
            'success', true,
            'message', 'Package pricing updated successfully',
            'package_id', p_package_id
        );
    ELSE
        result := json_build_object(
            'success', false,
            'message', 'Package not found'
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_package_pricing(UUID, JSONB, JSONB) TO authenticated;

-- Migration completed successfully
SELECT 'SUPABASE OPTIMIZATION MIGRATION COMPLETED SUCCESSFULLY' as status;







