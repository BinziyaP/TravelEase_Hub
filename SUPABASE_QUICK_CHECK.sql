-- Quick check to verify Supabase setup for dashboard consistency fixes

-- 1. Check if required columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'packages' 
AND table_schema = 'public'
AND column_name IN ('total_costs', 'fees_and_margins', 'route_coordinates', 'selected_places', 'attractions')
ORDER BY column_name;

-- 2. Check if indexes exist
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'packages' 
AND schemaname = 'public'
AND indexname LIKE '%gin%'
ORDER BY indexname;

-- 3. Check sample data structure
SELECT 
    id,
    name,
    price,
    max_travelers,
    duration_days,
    status,
    CASE 
        WHEN total_costs IS NOT NULL THEN 'Has detailed costs'
        ELSE 'No detailed costs'
    END as cost_breakdown_status,
    CASE 
        WHEN route_coordinates IS NOT NULL AND jsonb_array_length(route_coordinates) > 0 THEN 'Has route coordinates'
        ELSE 'No route coordinates'
    END as route_status
FROM public.packages 
LIMIT 5;

-- 4. Check if packages table exists and has data
SELECT 
    COUNT(*) as total_packages,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_packages,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_packages,
    COUNT(CASE WHEN total_costs IS NOT NULL THEN 1 END) as packages_with_detailed_costs,
    COUNT(CASE WHEN route_coordinates IS NOT NULL AND jsonb_array_length(route_coordinates) > 0 THEN 1 END) as packages_with_route_data
FROM public.packages;







