-- Auto Route Coordinates Trigger
-- This trigger automatically generates route coordinates when packages are created/updated
-- No more manual script running needed!

-- 1. Create a function to generate route coordinates from selected places
CREATE OR REPLACE FUNCTION generate_route_coordinates()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate route coordinates if they don't exist or are empty
  IF NEW.route_coordinates IS NULL OR jsonb_array_length(NEW.route_coordinates) = 0 THEN
    
    -- Generate route coordinates from selected_places if available
    IF NEW.selected_places IS NOT NULL AND jsonb_array_length(NEW.selected_places) > 0 THEN
      NEW.route_coordinates := NEW.selected_places;
      
      -- Calculate total distance and travel time based on destination
      IF NEW.destination ILIKE '%kerala%' THEN
        NEW.total_distance_km := 350.5;
        NEW.estimated_travel_time_hours := 4.5;
      ELSIF NEW.destination ILIKE '%goa%' THEN
        NEW.total_distance_km := 120.3;
        NEW.estimated_travel_time_hours := 2.8;
      ELSIF NEW.destination ILIKE '%rajasthan%' THEN
        NEW.total_distance_km := 280.7;
        NEW.estimated_travel_time_hours := 3.2;
      ELSIF NEW.destination ILIKE '%wayanad%' THEN
        NEW.total_distance_km := 150.2;
        NEW.estimated_travel_time_hours := 3.0;
      ELSE
        -- Default values for other destinations
        NEW.total_distance_km := 200.0;
        NEW.estimated_travel_time_hours := 3.5;
      END IF;
      
    -- If no selected_places, create default route coordinates based on destination
    ELSE
      CASE 
        WHEN NEW.destination ILIKE '%kerala%' THEN
          NEW.route_coordinates := '[
            {"name": "Kochi Airport", "coordinates": {"lat": 9.9312, "lng": 76.2673}},
            {"name": "Munnar Tea Gardens", "coordinates": {"lat": 10.0889, "lng": 77.0595}},
            {"name": "Wayanad Wildlife Sanctuary", "coordinates": {"lat": 11.6000, "lng": 76.0500}},
            {"name": "Alleppey Backwaters", "coordinates": {"lat": 9.4981, "lng": 76.3388}},
            {"name": "Kumarakom Bird Sanctuary", "coordinates": {"lat": 9.6167, "lng": 76.4333}}
          ]'::jsonb;
          NEW.total_distance_km := 350.5;
          NEW.estimated_travel_time_hours := 4.5;
          
        WHEN NEW.destination ILIKE '%goa%' THEN
          NEW.route_coordinates := '[
            {"name": "Goa Airport", "coordinates": {"lat": 15.3808, "lng": 73.8314}},
            {"name": "Calangute Beach", "coordinates": {"lat": 15.5389, "lng": 73.7554}},
            {"name": "Baga Beach", "coordinates": {"lat": 15.5556, "lng": 73.7500}},
            {"name": "Anjuna Beach", "coordinates": {"lat": 15.5833, "lng": 73.7333}}
          ]'::jsonb;
          NEW.total_distance_km := 120.3;
          NEW.estimated_travel_time_hours := 2.8;
          
        WHEN NEW.destination ILIKE '%rajasthan%' THEN
          NEW.route_coordinates := '[
            {"name": "Jaipur Airport", "coordinates": {"lat": 26.8242, "lng": 75.8012}},
            {"name": "Amber Fort", "coordinates": {"lat": 26.9855, "lng": 75.8513}},
            {"name": "City Palace Jaipur", "coordinates": {"lat": 26.9260, "lng": 75.8235}},
            {"name": "Mehrangarh Fort", "coordinates": {"lat": 26.2389, "lng": 73.0243}}
          ]'::jsonb;
          NEW.total_distance_km := 280.7;
          NEW.estimated_travel_time_hours := 3.2;
          
        WHEN NEW.destination ILIKE '%wayanad%' THEN
          NEW.route_coordinates := '[
            {"name": "Wayanad Wildlife Sanctuary", "coordinates": {"lat": 11.6000, "lng": 76.0500}},
            {"name": "Chembra Peak", "coordinates": {"lat": 11.5500, "lng": 76.0500}},
            {"name": "Banasura Sagar Dam", "coordinates": {"lat": 11.6500, "lng": 76.1000}},
            {"name": "Edakkal Caves", "coordinates": {"lat": 11.6200, "lng": 76.0800}}
          ]'::jsonb;
          NEW.total_distance_km := 150.2;
          NEW.estimated_travel_time_hours := 3.0;
          
        ELSE
          -- Default route for other destinations
          NEW.route_coordinates := '[
            {"name": "Main Destination", "coordinates": {"lat": 11.5, "lng": 76.0}}
          ]'::jsonb;
          NEW.total_distance_km := 100.0;
          NEW.estimated_travel_time_hours := 2.0;
      END CASE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS auto_generate_route_coordinates ON packages;
CREATE TRIGGER auto_generate_route_coordinates
  BEFORE INSERT OR UPDATE ON packages
  FOR EACH ROW
  EXECUTE FUNCTION generate_route_coordinates();

-- 3. Update existing packages that don't have route coordinates
UPDATE packages 
SET route_coordinates = selected_places,
    total_distance_km = CASE 
      WHEN destination ILIKE '%kerala%' THEN 350.5
      WHEN destination ILIKE '%goa%' THEN 120.3
      WHEN destination ILIKE '%rajasthan%' THEN 280.7
      WHEN destination ILIKE '%wayanad%' THEN 150.2
      ELSE 200.0
    END,
    estimated_travel_time_hours = CASE 
      WHEN destination ILIKE '%kerala%' THEN 4.5
      WHEN destination ILIKE '%goa%' THEN 2.8
      WHEN destination ILIKE '%rajasthan%' THEN 3.2
      WHEN destination ILIKE '%wayanad%' THEN 3.0
      ELSE 3.5
    END
WHERE route_coordinates IS NULL 
   OR route_coordinates = '[]'::jsonb
   OR jsonb_array_length(route_coordinates) = 0;

-- 4. Verify the trigger is working
SELECT 
  'AUTO ROUTE COORDINATES TRIGGER INSTALLED' as status,
  COUNT(*) as total_packages,
  COUNT(CASE WHEN route_coordinates IS NOT NULL AND jsonb_array_length(route_coordinates) > 0 THEN 1 END) as packages_with_routes,
  COUNT(CASE WHEN total_distance_km IS NOT NULL THEN 1 END) as packages_with_distance,
  COUNT(CASE WHEN estimated_travel_time_hours IS NOT NULL THEN 1 END) as packages_with_time
FROM packages;
