-- SQL Script to Display Packages with Complete Details
-- Run this in Supabase SQL Editor to see all package information

-- 1. Display all packages with basic information
SELECT 
    id,
    name,
    destination,
    duration_days,
    price,
    max_travelers,
    status,
    created_at,
    updated_at,
    agency_id
FROM packages
ORDER BY created_at DESC;

-- 2. Display packages with detailed information (if columns exist)
SELECT 
    p.id,
    p.name,
    p.destination,
    p.duration_days,
    p.price,
    p.max_travelers,
    p.status,
    p.description,
    p.accommodation_type,
    p.accommodation_name,
    p.accommodation_rating,
    p.accommodation_location,
    p.meals_included,
    p.transportation_included,
    p.attractions,
    p.selected_places,
    p.selected_hotels,
    p.selected_restaurants,
    p.itinerary,
    p.route_coordinates,
    p.total_distance_km,
    p.estimated_travel_time_hours,
    p.included_features,
    p.excluded_features,
    p.cancellation_policy,
    p.special_requirements,
    p.admin_notes,
    p.approved_at,
    p.rejected_at,
    p.created_at,
    p.updated_at
FROM packages p
ORDER BY p.created_at DESC;

-- 3. Display packages with price breakdown (if pricing columns exist)
SELECT 
    p.id,
    p.name,
    p.destination,
    p.price,
    p.max_travelers,
    ROUND(p.price / NULLIF(p.max_travelers, 0), 2) as price_per_person,
    p.pricing_breakdown,
    p.base_costs,
    p.fees_and_margins,
    p.pricing_factors,
    p.group_discount_applied,
    p.group_discount_percentage,
    p.status
FROM packages p
WHERE p.price IS NOT NULL
ORDER BY p.price DESC;

-- 4. Display packages with route information
SELECT 
    p.id,
    p.name,
    p.destination,
    p.route_coordinates,
    p.total_distance_km,
    p.estimated_travel_time_hours,
    p.map_center,
    p.map_zoom,
    p.selected_places,
    p.selected_hotels,
    p.selected_restaurants
FROM packages p
WHERE p.route_coordinates IS NOT NULL
ORDER BY p.total_distance_km DESC;

-- 5. Display packages by status
SELECT 
    status,
    COUNT(*) as count,
    AVG(price) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM packages
GROUP BY status
ORDER BY status;

-- 6. Display packages with admin information
SELECT 
    p.id,
    p.name,
    p.status,
    p.admin_notes,
    p.approved_at,
    p.rejected_at,
    p.approved_by,
    p.rejected_by,
    p.created_at,
    p.updated_at
FROM packages p
WHERE p.admin_notes IS NOT NULL 
   OR p.approved_at IS NOT NULL 
   OR p.rejected_at IS NOT NULL
ORDER BY p.updated_at DESC;

-- 7. Display packages with complete JSON data
SELECT 
    p.id,
    p.name,
    p.destination,
    p.price,
    p.status,
    jsonb_pretty(p.selected_places) as selected_places_formatted,
    jsonb_pretty(p.selected_hotels) as selected_hotels_formatted,
    jsonb_pretty(p.selected_restaurants) as selected_restaurants_formatted,
    jsonb_pretty(p.route_coordinates) as route_coordinates_formatted,
    jsonb_pretty(p.itinerary) as itinerary_formatted,
    jsonb_pretty(p.attractions) as attractions_formatted
FROM packages p
WHERE p.selected_places IS NOT NULL 
   OR p.selected_hotels IS NOT NULL 
   OR p.selected_restaurants IS NOT NULL
   OR p.route_coordinates IS NOT NULL
ORDER BY p.created_at DESC;

-- 8. Display packages with accommodation details
SELECT 
    p.id,
    p.name,
    p.destination,
    p.accommodation_type,
    p.accommodation_name,
    p.accommodation_rating,
    p.accommodation_location,
    p.accommodation_coordinates,
    p.selected_hotels,
    p.price,
    p.status
FROM packages p
WHERE p.accommodation_name IS NOT NULL 
   OR p.selected_hotels IS NOT NULL
ORDER BY p.accommodation_rating DESC NULLS LAST;

-- 9. Display packages with attraction information
SELECT 
    p.id,
    p.name,
    p.destination,
    p.attractions,
    p.selected_places,
    p.attraction_coordinates,
    p.route_coordinates,
    p.total_distance_km,
    p.estimated_travel_time_hours
FROM packages p
WHERE p.attractions IS NOT NULL 
   OR p.selected_places IS NOT NULL
ORDER BY p.total_distance_km DESC NULLS LAST;

-- 10. Display packages with meal and transportation details
SELECT 
    p.id,
    p.name,
    p.destination,
    p.meals_included,
    p.transportation_included,
    p.included_features,
    p.excluded_features,
    p.cancellation_policy,
    p.special_requirements,
    p.price,
    p.status
FROM packages p
WHERE p.meals_included IS NOT NULL 
   OR p.transportation_included IS NOT NULL
   OR p.included_features IS NOT NULL
ORDER BY p.price DESC;

-- 11. Display package statistics
SELECT 
    'Total Packages' as metric,
    COUNT(*) as value
FROM packages
UNION ALL
SELECT 
    'Pending Packages',
    COUNT(*)
FROM packages WHERE status = 'pending'
UNION ALL
SELECT 
    'Approved Packages',
    COUNT(*)
FROM packages WHERE status = 'approved'
UNION ALL
SELECT 
    'Rejected Packages',
    COUNT(*)
FROM packages WHERE status = 'rejected'
UNION ALL
SELECT 
    'Average Price',
    ROUND(AVG(price), 2)
FROM packages WHERE price IS NOT NULL
UNION ALL
SELECT 
    'Total Revenue',
    ROUND(SUM(price), 2)
FROM packages WHERE price IS NOT NULL AND status = 'approved';

-- 12. Display packages with complete details (comprehensive view)
SELECT 
    p.id,
    p.name,
    p.destination,
    p.duration_days,
    p.price,
    p.max_travelers,
    ROUND(p.price / NULLIF(p.max_travelers, 0), 2) as price_per_person,
    p.status,
    p.description,
    p.accommodation_type,
    p.accommodation_name,
    p.accommodation_rating,
    p.accommodation_location,
    p.meals_included,
    p.transportation_included,
    p.attractions,
    p.selected_places,
    p.selected_hotels,
    p.selected_restaurants,
    p.itinerary,
    p.route_coordinates,
    p.total_distance_km,
    p.estimated_travel_time_hours,
    p.included_features,
    p.excluded_features,
    p.cancellation_policy,
    p.special_requirements,
    p.admin_notes,
    p.approved_at,
    p.rejected_at,
    p.created_at,
    p.updated_at
FROM packages p
ORDER BY p.created_at DESC
LIMIT 10;
