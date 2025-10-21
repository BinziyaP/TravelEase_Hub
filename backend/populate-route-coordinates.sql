-- Populate Route Coordinates for Existing Packages
-- This script adds route coordinates to packages that don't have them

-- Update packages with route coordinates based on selected places
UPDATE packages 
SET route_coordinates = selected_places
WHERE route_coordinates IS NULL 
   OR route_coordinates = '[]'::jsonb
   OR jsonb_array_length(route_coordinates) = 0;

-- Add some sample route coordinates for packages that have selected places
UPDATE packages 
SET route_coordinates = '[
    {"name": "Kochi Airport", "coordinates": {"lat": 9.9312, "lng": 76.2673}},
    {"name": "Munnar Tea Gardens", "coordinates": {"lat": 10.0889, "lng": 77.0595}},
    {"name": "Wayanad Wildlife Sanctuary", "coordinates": {"lat": 11.6000, "lng": 76.0500}},
    {"name": "Alleppey Backwaters", "coordinates": {"lat": 9.4981, "lng": 76.3388}},
    {"name": "Kumarakom Bird Sanctuary", "coordinates": {"lat": 9.6167, "lng": 76.4333}},
    {"name": "Periyar National Park", "coordinates": {"lat": 9.4667, "lng": 77.2667}},
    {"name": "Kovalam Beach", "coordinates": {"lat": 8.4004, "lng": 76.9781}}
]'::jsonb,
total_distance_km = 350.5,
estimated_travel_time_hours = 4.5
WHERE destination ILIKE '%kerala%' 
   AND (route_coordinates IS NULL OR jsonb_array_length(route_coordinates) = 0);

-- Add route coordinates for Goa packages
UPDATE packages 
SET route_coordinates = '[
    {"name": "Goa Airport", "coordinates": {"lat": 15.3808, "lng": 73.8314}},
    {"name": "Calangute Beach", "coordinates": {"lat": 15.5389, "lng": 73.7554}},
    {"name": "Baga Beach", "coordinates": {"lat": 15.5556, "lng": 73.7500}},
    {"name": "Anjuna Beach", "coordinates": {"lat": 15.5833, "lng": 73.7333}},
    {"name": "Dudhsagar Falls", "coordinates": {"lat": 15.3167, "lng": 74.3167}},
    {"name": "Old Goa Churches", "coordinates": {"lat": 15.5000, "lng": 73.9167}}
]'::jsonb,
total_distance_km = 120.3,
estimated_travel_time_hours = 2.8
WHERE destination ILIKE '%goa%' 
   AND (route_coordinates IS NULL OR jsonb_array_length(route_coordinates) = 0);

-- Add route coordinates for Rajasthan packages
UPDATE packages 
SET route_coordinates = '[
    {"name": "Jaipur Airport", "coordinates": {"lat": 26.8242, "lng": 75.8012}},
    {"name": "Amber Fort", "coordinates": {"lat": 26.9855, "lng": 75.8513}},
    {"name": "City Palace Jaipur", "coordinates": {"lat": 26.9260, "lng": 75.8235}},
    {"name": "Mehrangarh Fort", "coordinates": {"lat": 26.2389, "lng": 73.0243}},
    {"name": "Udaipur City Palace", "coordinates": {"lat": 24.5854, "lng": 73.7125}},
    {"name": "Lake Pichola", "coordinates": {"lat": 24.5729, "lng": 73.6830}}
]'::jsonb,
total_distance_km = 280.7,
estimated_travel_time_hours = 3.2
WHERE destination ILIKE '%rajasthan%' 
   AND (route_coordinates IS NULL OR jsonb_array_length(route_coordinates) = 0);

-- Add route coordinates for Wayanad packages
UPDATE packages 
SET route_coordinates = '[
    {"name": "Wayanad Wildlife Sanctuary", "coordinates": {"lat": 11.6000, "lng": 76.0500}},
    {"name": "Chembra Peak", "coordinates": {"lat": 11.5500, "lng": 76.0500}},
    {"name": "Banasura Sagar Dam", "coordinates": {"lat": 11.6500, "lng": 76.1000}},
    {"name": "Edakkal Caves", "coordinates": {"lat": 11.6200, "lng": 76.0800}},
    {"name": "Pookode Lake", "coordinates": {"lat": 11.5800, "lng": 76.0700}}
]'::jsonb,
total_distance_km = 150.2,
estimated_travel_time_hours = 3.0
WHERE destination ILIKE '%wayanad%' 
   AND (route_coordinates IS NULL OR jsonb_array_length(route_coordinates) = 0);

-- Verify the updates
SELECT 
    'ROUTE COORDINATES UPDATED' as status,
    COUNT(*) as total_packages,
    COUNT(CASE WHEN route_coordinates IS NOT NULL AND jsonb_array_length(route_coordinates) > 0 THEN 1 END) as packages_with_routes,
    COUNT(CASE WHEN total_distance_km IS NOT NULL THEN 1 END) as packages_with_distance,
    COUNT(CASE WHEN estimated_travel_time_hours IS NOT NULL THEN 1 END) as packages_with_time
FROM packages;
