-- Add transportation prices field to packages table
-- This migration adds a JSONB field to store prices for each transportation option

-- Add the transportation_prices column to store prices for each selected transportation option
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS transportation_prices JSONB DEFAULT '{}';

-- Add a comment to explain the structure
COMMENT ON COLUMN public.packages.transportation_prices IS 'JSONB object storing prices for each transportation option. Structure: {"flights": 500, "train": 200, "car_rental": 150}';

-- Create an index for the transportation_prices column for better query performance
CREATE INDEX IF NOT EXISTS idx_packages_transportation_prices_gin ON public.packages USING GIN(transportation_prices);



