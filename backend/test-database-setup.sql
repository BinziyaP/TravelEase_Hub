-- Test Database Setup Script
-- Run this to verify the database setup worked correctly

-- 1. Check if new columns exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'packages' 
  AND column_name IN (
    'selected_places', 
    'selected_hotels', 
    'selected_restaurants', 
    'route_coordinates',
    'admin_notes',
    'approved_at',
    'rejected_at'
  )
ORDER BY column_name;

-- 2. Check package count
SELECT 
    COUNT(*) as total_packages,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
FROM packages;

-- 3. Check if functions exist
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('get_package_stats', 'approve_package', 'reject_package')
ORDER BY routine_name;

-- 4. Test the get_package_stats function
SELECT get_package_stats();

-- 5. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'packages'
ORDER BY policyname;

-- 6. Sample package data
SELECT 
    id,
    name,
    destination,
    price,
    status,
    selected_places,
    selected_hotels,
    route_coordinates
FROM packages
LIMIT 3;

-- 7. Check for any errors in package data
SELECT 
    'Packages with NULL selected_places' as issue,
    COUNT(*) as count
FROM packages WHERE selected_places IS NULL
UNION ALL
SELECT 
    'Packages with NULL selected_hotels',
    COUNT(*)
FROM packages WHERE selected_hotels IS NULL
UNION ALL
SELECT 
    'Packages with NULL route_coordinates',
    COUNT(*)
FROM packages WHERE route_coordinates IS NULL;
