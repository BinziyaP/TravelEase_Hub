-- Comprehensive Supabase Database Analysis
-- Run this to analyze the current state of your database

-- 1. Check if packages table exists and its structure
SELECT 
    'PACKAGES TABLE STRUCTURE' as analysis_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'packages'
ORDER BY ordinal_position;

-- 2. Check package counts and status distribution
SELECT 
    'PACKAGE STATISTICS' as analysis_type,
    status,
    COUNT(*) as count,
    AVG(price) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM packages
GROUP BY status
ORDER BY status;

-- 3. Check for missing data in key columns
SELECT 
    'DATA COMPLETENESS CHECK' as analysis_type,
    'Total Packages' as metric,
    COUNT(*) as value
FROM packages
UNION ALL
SELECT 
    'DATA COMPLETENESS CHECK',
    'Packages with NULL selected_places',
    COUNT(*)
FROM packages WHERE selected_places IS NULL
UNION ALL
SELECT 
    'DATA COMPLETENESS CHECK',
    'Packages with NULL selected_hotels',
    COUNT(*)
FROM packages WHERE selected_hotels IS NULL
UNION ALL
SELECT 
    'DATA COMPLETENESS CHECK',
    'Packages with NULL route_coordinates',
    COUNT(*)
FROM packages WHERE route_coordinates IS NULL
UNION ALL
SELECT 
    'DATA COMPLETENESS CHECK',
    'Packages with NULL itinerary',
    COUNT(*)
FROM packages WHERE itinerary IS NULL
UNION ALL
SELECT 
    'DATA COMPLETENESS CHECK',
    'Packages with NULL attractions',
    COUNT(*)
FROM packages WHERE attractions IS NULL;

-- 4. Check if new columns exist
SELECT 
    'NEW COLUMNS CHECK' as analysis_type,
    column_name,
    data_type,
    CASE 
        WHEN column_name IN ('selected_places', 'selected_hotels', 'selected_restaurants', 'route_coordinates', 'itinerary', 'admin_notes', 'approved_at', 'rejected_at') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as status
FROM information_schema.columns 
WHERE table_name = 'packages' 
  AND column_name IN (
    'selected_places', 'selected_hotels', 'selected_restaurants', 
    'route_coordinates', 'itinerary', 'admin_notes', 'approved_at', 'rejected_at'
  )
ORDER BY column_name;

-- 5. Check if database functions exist
SELECT 
    'FUNCTIONS CHECK' as analysis_type,
    routine_name,
    routine_type,
    'EXISTS' as status
FROM information_schema.routines 
WHERE routine_name IN ('get_package_stats', 'approve_package', 'reject_package')
ORDER BY routine_name;

-- 6. Check RLS policies
SELECT 
    'RLS POLICIES CHECK' as analysis_type,
    policyname,
    permissive,
    roles,
    cmd,
    'EXISTS' as status
FROM pg_policies 
WHERE tablename = 'packages'
ORDER BY policyname;

-- 7. Sample package data analysis
SELECT 
    'SAMPLE PACKAGE DATA' as analysis_type,
    id,
    name,
    destination,
    price,
    status,
    CASE 
        WHEN selected_places IS NOT NULL THEN jsonb_array_length(selected_places)
        ELSE 0 
    END as selected_places_count,
    CASE 
        WHEN selected_hotels IS NOT NULL THEN jsonb_array_length(selected_hotels)
        ELSE 0 
    END as selected_hotels_count,
    CASE 
        WHEN route_coordinates IS NOT NULL THEN jsonb_array_length(route_coordinates)
        ELSE 0 
    END as route_coordinates_count,
    CASE 
        WHEN itinerary IS NOT NULL THEN jsonb_array_length(itinerary)
        ELSE 0 
    END as itinerary_count
FROM packages
ORDER BY created_at DESC
LIMIT 5;

-- 8. Check for data type issues
SELECT 
    'DATA TYPE ANALYSIS' as analysis_type,
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'jsonb' THEN 'CORRECT'
        WHEN data_type = 'ARRAY' THEN 'NEEDS CONVERSION'
        ELSE 'CHECK NEEDED'
    END as type_status
FROM information_schema.columns 
WHERE table_name = 'packages' 
  AND column_name IN ('selected_places', 'selected_hotels', 'selected_restaurants', 'route_coordinates', 'itinerary', 'attractions', 'meals_included', 'transportation_included')
ORDER BY column_name;

-- 9. Check for any errors in package data
SELECT 
    'ERROR CHECK' as analysis_type,
    'Packages with invalid price' as error_type,
    COUNT(*) as count
FROM packages WHERE price IS NULL OR price <= 0
UNION ALL
SELECT 
    'ERROR CHECK',
    'Packages with invalid duration',
    COUNT(*)
FROM packages WHERE duration_days IS NULL OR duration_days <= 0
UNION ALL
SELECT 
    'ERROR CHECK',
    'Packages with invalid max_travelers',
    COUNT(*)
FROM packages WHERE max_travelers IS NULL OR max_travelers <= 0;

-- 10. Test the get_package_stats function
SELECT 
    'FUNCTION TEST' as analysis_type,
    'get_package_stats()' as function_name,
    get_package_stats() as result;

-- 11. Check package creation dates
SELECT 
    'PACKAGE TIMELINE' as analysis_type,
    DATE(created_at) as date,
    COUNT(*) as packages_created
FROM packages
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 10;

-- 12. Check for packages with complete data
SELECT 
    'COMPLETE PACKAGES' as analysis_type,
    COUNT(*) as total_packages,
    COUNT(CASE 
        WHEN selected_places IS NOT NULL 
         AND selected_hotels IS NOT NULL 
         AND route_coordinates IS NOT NULL 
         AND itinerary IS NOT NULL 
        THEN 1 
    END) as complete_packages,
    ROUND(
        COUNT(CASE 
            WHEN selected_places IS NOT NULL 
             AND selected_hotels IS NOT NULL 
             AND route_coordinates IS NOT NULL 
             AND itinerary IS NOT NULL 
            THEN 1 
        END) * 100.0 / COUNT(*), 2
    ) as completeness_percentage
FROM packages;
