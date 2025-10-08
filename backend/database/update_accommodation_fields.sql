-- Update packages table with enhanced accommodation fields
-- Run this SQL in your Supabase SQL Editor

-- First, let's check if there are any existing POINT columns that might cause issues
-- and drop them if they exist to avoid comparison function errors

-- Drop existing POINT columns if they exist (they cause comparison function errors)
-- Only drop if they exist and are causing issues
DO $$ 
BEGIN
    -- Check if accommodation_coordinates exists and is POINT type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'packages' 
        AND column_name = 'accommodation_coordinates' 
        AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE public.packages DROP COLUMN accommodation_coordinates;
        RAISE NOTICE 'Dropped accommodation_coordinates POINT column';
    END IF;
    
    -- Check if attraction_coordinates exists and is POINT type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'packages' 
        AND column_name = 'attraction_coordinates' 
        AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE public.packages DROP COLUMN attraction_coordinates;
        RAISE NOTICE 'Dropped attraction_coordinates POINT column';
    END IF;
    
    -- Check if map_center exists and is POINT type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'packages' 
        AND column_name = 'map_center' 
        AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE public.packages DROP COLUMN map_center;
        RAISE NOTICE 'Dropped map_center POINT column';
    END IF;
END $$;

-- Add new accommodation-related columns with compatible data types
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS accommodation_name TEXT,
ADD COLUMN IF NOT EXISTS accommodation_price_range TEXT,
ADD COLUMN IF NOT EXISTS accommodation_coordinates_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS accommodation_coordinates_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS selected_attractions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS attraction_details JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS attractions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS attraction_coordinates TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS selected_places JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS selected_hotels JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS accommodation_coordinates JSONB,
ADD COLUMN IF NOT EXISTS meals_included TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS transportation_included TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS itinerary JSONB,
ADD COLUMN IF NOT EXISTS included_features TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS excluded_features TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cancellation_policy TEXT,
ADD COLUMN IF NOT EXISTS special_requirements TEXT,
ADD COLUMN IF NOT EXISTS package_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS map_center TEXT,
ADD COLUMN IF NOT EXISTS map_zoom INTEGER DEFAULT 12;

-- Update existing columns if needed
ALTER TABLE public.packages 
ALTER COLUMN accommodation_rating DROP NOT NULL,
ALTER COLUMN accommodation_location DROP NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_packages_accommodation_name ON public.packages(accommodation_name);
CREATE INDEX IF NOT EXISTS idx_packages_accommodation_price_range ON public.packages(accommodation_price_range);
CREATE INDEX IF NOT EXISTS idx_packages_selected_attractions ON public.packages USING GIN(selected_attractions);
CREATE INDEX IF NOT EXISTS idx_packages_attraction_details ON public.packages USING GIN(attraction_details);
CREATE INDEX IF NOT EXISTS idx_packages_attractions ON public.packages USING GIN(attractions);
CREATE INDEX IF NOT EXISTS idx_packages_attraction_coordinates ON public.packages USING GIN(attraction_coordinates);
CREATE INDEX IF NOT EXISTS idx_packages_selected_places ON public.packages USING GIN(selected_places);
CREATE INDEX IF NOT EXISTS idx_packages_selected_hotels ON public.packages USING GIN(selected_hotels);
CREATE INDEX IF NOT EXISTS idx_packages_meals_included ON public.packages USING GIN(meals_included);
CREATE INDEX IF NOT EXISTS idx_packages_transportation_included ON public.packages USING GIN(transportation_included);
CREATE INDEX IF NOT EXISTS idx_packages_itinerary ON public.packages USING GIN(itinerary);
CREATE INDEX IF NOT EXISTS idx_packages_included_features ON public.packages USING GIN(included_features);
CREATE INDEX IF NOT EXISTS idx_packages_excluded_features ON public.packages USING GIN(excluded_features);
CREATE INDEX IF NOT EXISTS idx_packages_package_images ON public.packages USING GIN(package_images);

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
SELECT 'Packages table updated successfully with enhanced accommodation fields!' AS status;
