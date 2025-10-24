-- Apply Transportation Prices Migration
-- This script adds the transportation_prices column to the packages table

-- Check if the column already exists
DO $$
BEGIN
    -- Add the transportation_prices column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'packages' 
        AND column_name = 'transportation_prices'
    ) THEN
        -- Add the transportation_prices column
        ALTER TABLE public.packages 
        ADD COLUMN transportation_prices JSONB DEFAULT '{}';
        
        -- Add a comment to explain the structure
        COMMENT ON COLUMN public.packages.transportation_prices IS 'JSONB object storing prices for each transportation option. Structure: {"flights": 500, "train": 200, "car_rental": 150}';
        
        -- Create an index for better query performance
        CREATE INDEX idx_packages_transportation_prices_gin ON public.packages USING GIN(transportation_prices);
        
        RAISE NOTICE 'Successfully added transportation_prices column to packages table';
    ELSE
        RAISE NOTICE 'transportation_prices column already exists in packages table';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'packages' 
AND column_name = 'transportation_prices';
