-- Test script to check if transportation_prices column exists in packages table
-- Run this in your Supabase SQL Editor

-- Check if the column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'packages' 
AND column_name = 'transportation_prices';

-- If the above returns no results, the column doesn't exist
-- Run this to add it:
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'packages' 
        AND column_name = 'transportation_prices'
    ) THEN
        ALTER TABLE public.packages 
        ADD COLUMN transportation_prices JSONB DEFAULT '{}';
        
        COMMENT ON COLUMN public.packages.transportation_prices IS 'JSONB object storing prices for each transportation option. Structure: {"flights": 500, "train": 200, "car_rental": 150}';
        
        CREATE INDEX idx_packages_transportation_prices_gin ON public.packages USING GIN(transportation_prices);
        
        RAISE NOTICE 'Successfully added transportation_prices column to packages table';
    ELSE
        RAISE NOTICE 'transportation_prices column already exists in packages table';
    END IF;
END $$;

-- Check sample data in packages table
SELECT 
    id,
    name,
    transportation_included,
    transportation_prices,
    CASE 
        WHEN transportation_prices IS NULL THEN 'NULL'
        WHEN transportation_prices = '{}' THEN 'EMPTY OBJECT'
        ELSE 'HAS DATA'
    END as prices_status
FROM public.packages 
LIMIT 5;

-- Update a test package with sample transportation prices (if you want to test)
-- Replace 'your-package-id' with an actual package ID from your database
/*
UPDATE public.packages 
SET transportation_prices = '{"train": 765, "local_transport": 10857, "car_rental": 4500}'
WHERE id = 'your-package-id';
*/
