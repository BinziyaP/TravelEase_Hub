-- Simple SQL Script to Display Packages
-- Quick and easy package viewing

-- 1. Basic package list
SELECT 
    id,
    name,
    destination,
    duration_days,
    price,
    max_travelers,
    status,
    created_at
FROM packages
ORDER BY created_at DESC;

-- 2. Package details with pricing
SELECT 
    id,
    name,
    destination,
    price,
    max_travelers,
    ROUND(price / NULLIF(max_travelers, 0), 2) as price_per_person,
    status
FROM packages
WHERE price IS NOT NULL
ORDER BY price DESC;

-- 3. Package status summary
SELECT 
    status,
    COUNT(*) as count,
    AVG(price) as avg_price
FROM packages
GROUP BY status;

-- 4. Recent packages
SELECT 
    name,
    destination,
    price,
    status,
    created_at
FROM packages
ORDER BY created_at DESC
LIMIT 5;

-- 5. Packages with route data
SELECT 
    name,
    destination,
    route_coordinates,
    total_distance_km,
    selected_places,
    selected_hotels
FROM packages
WHERE route_coordinates IS NOT NULL
ORDER BY total_distance_km DESC;
