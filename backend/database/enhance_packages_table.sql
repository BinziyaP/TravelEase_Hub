-- Enhance packages table with OpenStreetMap integration fields
-- Run this SQL in your Supabase SQL Editor

-- Add new columns to existing packages table
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS accommodation_type TEXT CHECK (accommodation_type IN ('hotel', 'resort', 'guesthouse', 'hostel', 'apartment')),
ADD COLUMN IF NOT EXISTS accommodation_rating INTEGER CHECK (accommodation_rating >= 1 AND accommodation_rating <= 5),
ADD COLUMN IF NOT EXISTS accommodation_location TEXT,
ADD COLUMN IF NOT EXISTS accommodation_coordinates POINT,
ADD COLUMN IF NOT EXISTS meals_included TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS transportation_included TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS attractions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS attraction_coordinates POINT[],
ADD COLUMN IF NOT EXISTS itinerary JSONB,
ADD COLUMN IF NOT EXISTS included_features TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS excluded_features TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cancellation_policy TEXT,
ADD COLUMN IF NOT EXISTS special_requirements TEXT,
ADD COLUMN IF NOT EXISTS package_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS map_center POINT,
ADD COLUMN IF NOT EXISTS map_zoom INTEGER DEFAULT 10;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_packages_accommodation_type ON public.packages(accommodation_type);
CREATE INDEX IF NOT EXISTS idx_packages_accommodation_rating ON public.packages(accommodation_rating);
CREATE INDEX IF NOT EXISTS idx_packages_meals_included ON public.packages USING GIN(meals_included);
CREATE INDEX IF NOT EXISTS idx_packages_transportation_included ON public.packages USING GIN(transportation_included);
CREATE INDEX IF NOT EXISTS idx_packages_attractions ON public.packages USING GIN(attractions);
CREATE INDEX IF NOT EXISTS idx_packages_included_features ON public.packages USING GIN(included_features);

-- Update the updated_at trigger to include new columns
CREATE OR REPLACE FUNCTION public.handle_package_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS handle_packages_updated_at ON public.packages;

-- Create new trigger
CREATE TRIGGER handle_packages_updated_at
    BEFORE UPDATE ON public.packages
    FOR EACH ROW EXECUTE FUNCTION public.handle_package_updated_at();

-- Display success message
SELECT 'Packages table enhanced successfully with OpenStreetMap integration fields!' AS status;
