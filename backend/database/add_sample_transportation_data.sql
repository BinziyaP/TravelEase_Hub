-- Add sample transportation pricing data to existing packages
-- This will help test the individual transportation pricing display

-- First, let's see what packages exist and their current transportation data
SELECT 
    id,
    name,
    destination,
    transportation_included,
    transportation_prices,
    CASE 
        WHEN transportation_prices IS NULL THEN 'NULL'
        WHEN transportation_prices = '{}' THEN 'EMPTY OBJECT'
        ELSE 'HAS DATA'
    END as prices_status
FROM public.packages 
ORDER BY created_at DESC
LIMIT 10;

-- Add sample transportation prices to packages that don't have them
-- This will add realistic pricing data for testing
UPDATE public.packages 
SET transportation_prices = CASE 
    -- For packages with train and local_transport
    WHEN transportation_included::text LIKE '%train%' AND transportation_included::text LIKE '%local_transport%' THEN
        '{"train": 765, "local_transport": 10857}'::jsonb
    
    -- For packages with flights and car_rental
    WHEN transportation_included::text LIKE '%flights%' AND transportation_included::text LIKE '%car_rental%' THEN
        '{"flights": 8500, "car_rental": 4500}'::jsonb
    
    -- For packages with bus and airport_transfer
    WHEN transportation_included::text LIKE '%bus%' AND transportation_included::text LIKE '%airport_transfer%' THEN
        '{"bus": 1200, "airport_transfer": 2500}'::jsonb
    
    -- Default case - add common transportation options
    ELSE '{"train": 765, "local_transport": 10857, "car_rental": 4500}'::jsonb
END
WHERE transportation_prices IS NULL 
   OR transportation_prices = '{}'::jsonb
   OR transportation_prices = 'null'::jsonb;

-- Verify the update worked
SELECT 
    id,
    name,
    destination,
    transportation_included,
    transportation_prices,
    CASE 
        WHEN transportation_prices IS NULL THEN 'NULL'
        WHEN transportation_prices = '{}' THEN 'EMPTY OBJECT'
        ELSE 'HAS DATA'
    END as prices_status
FROM public.packages 
ORDER BY created_at DESC
LIMIT 10;

-- Show a sample of the transportation pricing data
SELECT 
    name,
    transportation_included,
    transportation_prices,
    jsonb_object_keys(transportation_prices) as transport_types,
    jsonb_each_text(transportation_prices) as individual_prices
FROM public.packages 
WHERE transportation_prices IS NOT NULL 
  AND transportation_prices != '{}'::jsonb
LIMIT 5;
