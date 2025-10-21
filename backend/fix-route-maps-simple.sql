-- Simple Route Maps Fix - Just Route Coordinates
-- Run this directly in Supabase SQL Editor to fix route maps

-- 1. Update approved packages that don't have route coordinates
UPDATE packages 
SET route_coordinates = selected_places
WHERE status = 'approved' 
  AND (route_coordinates IS NULL 
       OR route_coordinates = '[]'::jsonb 
       OR jsonb_array_length(route_coordinates) = 0)
  AND selected_places IS NOT NULL 
  AND jsonb_array_length(selected_places) > 0;

-- 2. If no selected_places, create default route coordinates based on destination
UPDATE packages 
SET route_coordinates = CASE 
  WHEN destination ILIKE '%kerala%' THEN '[
    {"name": "Kochi Airport", "coordinates": {"lat": 9.9312, "lng": 76.2673}},
    {"name": "Munnar Tea Gardens", "coordinates": {"lat": 10.0889, "lng": 77.0595}},
    {"name": "Wayanad Wildlife Sanctuary", "coordinates": {"lat": 11.6000, "lng": 76.0500}},
    {"name": "Alleppey Backwaters", "coordinates": {"lat": 9.4981, "lng": 76.3388}},
    {"name": "Kumarakom Bird Sanctuary", "coordinates": {"lat": 9.6167, "lng": 76.4333}}
  ]'::jsonb
  WHEN destination ILIKE '%goa%' THEN '[
    {"name": "Goa Airport", "coordinates": {"lat": 15.3808, "lng": 73.8314}},
    {"name": "Calangute Beach", "coordinates": {"lat": 15.5389, "lng": 73.7554}},
    {"name": "Baga Beach", "coordinates": {"lat": 15.5556, "lng": 73.7500}},
    {"name": "Anjuna Beach", "coordinates": {"lat": 15.5833, "lng": 73.7333}}
  ]'::jsonb
  WHEN destination ILIKE '%rajasthan%' THEN '[
    {"name": "Jaipur Airport", "coordinates": {"lat": 26.8242, "lng": 75.8012}},
    {"name": "Amber Fort", "coordinates": {"lat": 26.9855, "lng": 75.8513}},
    {"name": "City Palace Jaipur", "coordinates": {"lat": 26.9260, "lng": 75.8235}},
    {"name": "Mehrangarh Fort", "coordinates": {"lat": 26.2389, "lng": 73.0243}}
  ]'::jsonb
  WHEN destination ILIKE '%wayanad%' THEN '[
    {"name": "Wayanad Wildlife Sanctuary", "coordinates": {"lat": 11.6000, "lng": 76.0500}},
    {"name": "Chembra Peak", "coordinates": {"lat": 11.5500, "lng": 76.0500}},
    {"name": "Banasura Sagar Dam", "coordinates": {"lat": 11.6500, "lng": 76.1000}},
    {"name": "Edakkal Caves", "coordinates": {"lat": 11.6200, "lng": 76.0800}}
  ]'::jsonb
  ELSE '[
    {"name": "Main Destination", "coordinates": {"lat": 11.5, "lng": 76.0}}
  ]'::jsonb
END
WHERE status = 'approved' 
  AND (selected_places IS NULL 
       OR selected_places = '[]'::jsonb 
       OR jsonb_array_length(selected_places) = 0)
  AND (route_coordinates IS NULL 
       OR route_coordinates = '[]'::jsonb 
       OR jsonb_array_length(route_coordinates) = 0);

-- 3. Verify the results
SELECT 
  'ROUTE MAPS FIXED FOR USER PAGE' as status,
  COUNT(*) as total_approved_packages,
  COUNT(CASE WHEN route_coordinates IS NOT NULL AND jsonb_array_length(route_coordinates) > 0 THEN 1 END) as packages_with_routes
FROM packages 
WHERE status = 'approved';
