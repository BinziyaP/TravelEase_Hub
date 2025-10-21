-- Check Packages Status and Route Data
-- Run this to see what packages exist and their route data

-- 1. Check all packages with their status and route data
SELECT 
    id,
    name,
    destination,
    status,
    CASE 
        WHEN route_coordinates IS NULL THEN 'NULL'
        WHEN route_coordinates = '[]'::jsonb THEN 'Empty Array'
        ELSE 'Has Data (' || jsonb_array_length(route_coordinates) || ' items)'
    END as route_status,
    CASE 
        WHEN selected_places IS NULL THEN 'NULL'
        WHEN selected_places = '[]'::jsonb THEN 'Empty Array'
        ELSE 'Has Data (' || jsonb_array_length(selected_places) || ' items)'
    END as selected_places_status,
    created_at
FROM packages
ORDER BY created_at DESC;

-- 2. Count packages by status
SELECT 
    status,
    COUNT(*) as count
FROM packages
GROUP BY status
ORDER BY status;

-- 3. Check approved packages specifically
SELECT 
    'APPROVED PACKAGES CHECK' as info,
    COUNT(*) as total_approved,
    COUNT(CASE WHEN route_coordinates IS NOT NULL AND jsonb_array_length(route_coordinates) > 0 THEN 1 END) as with_routes,
    COUNT(CASE WHEN selected_places IS NOT NULL AND jsonb_array_length(selected_places) > 0 THEN 1 END) as with_places
FROM packages 
WHERE status = 'approved';
