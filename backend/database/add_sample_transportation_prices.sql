-- Quick test to add sample transportation prices to existing packages
-- Run this in your Supabase SQL Editor to test the display

-- First, check if the column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'packages' 
AND column_name = 'transportation_prices';

-- If the column doesn't exist, add it
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
        
        COMMENT ON COLUMN public.packages.transportation_prices IS 'JSONB object storing prices for each transportation option';
        
        RAISE NOTICE 'Successfully added transportation_prices column to packages table';
    ELSE
        RAISE NOTICE 'transportation_prices column already exists in packages table';
    END IF;
END $$;

-- Add sample transportation prices to the first few packages for testing
UPDATE public.packages 
SET transportation_prices = '{"train": 765, "local_transport": 10857, "car_rental": 4500}'
WHERE id IN (
    SELECT id FROM public.packages 
    WHERE transportation_prices IS NULL OR transportation_prices = '{}'
    LIMIT 3
);

-- Verify the update worked
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
ORDER BY created_at DESC
LIMIT 5;
