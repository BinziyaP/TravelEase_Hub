-- Enhanced Packages Schema Update
-- Add new fields for the enhanced step-by-step form

-- Add new columns to packages table
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS selected_accommodations JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS selected_restaurants JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS transportation_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS daily_itinerary JSONB DEFAULT '[]';

-- Add comments for documentation
COMMENT ON COLUMN public.packages.selected_accommodations IS 'Array of selected accommodation objects with name, rating, address, type';
COMMENT ON COLUMN public.packages.selected_restaurants IS 'Array of selected restaurant objects with name, rating, address, cuisine';
COMMENT ON COLUMN public.packages.transportation_details IS 'Object containing transportation options and notes';
COMMENT ON COLUMN public.packages.daily_itinerary IS 'Array of daily itinerary objects with morning, afternoon, evening activities';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_packages_selected_accommodations_gin ON public.packages USING GIN(selected_accommodations);
CREATE INDEX IF NOT EXISTS idx_packages_selected_restaurants_gin ON public.packages USING GIN(selected_restaurants);
CREATE INDEX IF NOT EXISTS idx_packages_transportation_details_gin ON public.packages USING GIN(transportation_details);
CREATE INDEX IF NOT EXISTS idx_packages_daily_itinerary_gin ON public.packages USING GIN(daily_itinerary);

-- Update existing packages with default values if needed
UPDATE public.packages 
SET 
  selected_accommodations = '[]'::jsonb,
  selected_restaurants = '[]'::jsonb,
  transportation_details = '{}'::jsonb,
  daily_itinerary = '[]'::jsonb
WHERE 
  selected_accommodations IS NULL 
  OR selected_restaurants IS NULL 
  OR transportation_details IS NULL 
  OR daily_itinerary IS NULL;

-- Verify the schema update
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'packages' 
  AND table_schema = 'public'
  AND column_name IN (
    'selected_accommodations', 
    'selected_restaurants', 
    'transportation_details', 
    'daily_itinerary'
  )
ORDER BY column_name;

