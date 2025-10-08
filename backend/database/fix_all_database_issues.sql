-- Comprehensive fix for all database issues
-- Run this SQL in your Supabase SQL Editor

-- ==============================================
-- 1. FIX MISSING COLUMNS IN PACKAGES TABLE
-- ==============================================

-- Drop existing POINT columns if they exist (they cause comparison function errors)
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

-- Add all missing columns with compatible data types
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
ADD COLUMN IF NOT EXISTS map_zoom INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS accommodation_location TEXT;

-- Update existing columns if needed
ALTER TABLE public.packages 
ALTER COLUMN accommodation_rating DROP NOT NULL,
ALTER COLUMN accommodation_location DROP NOT NULL;

-- ==============================================
-- 2. CREATE PACKAGE APPROVAL HISTORY TABLE
-- ==============================================

-- Create package_approval_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.package_approval_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'pending_review')),
    notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for package_approval_history
CREATE INDEX IF NOT EXISTS idx_package_approval_history_package_id ON public.package_approval_history(package_id);
CREATE INDEX IF NOT EXISTS idx_package_approval_history_action ON public.package_approval_history(action);
CREATE INDEX IF NOT EXISTS idx_package_approval_history_created_at ON public.package_approval_history(created_at);

-- ==============================================
-- 3. CREATE INDEXES FOR BETTER PERFORMANCE
-- ==============================================

-- Create indexes for packages table
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
CREATE INDEX IF NOT EXISTS idx_packages_accommodation_location ON public.packages(accommodation_location);

-- ==============================================
-- 4. SET UP ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on packages table
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Enable RLS on package_approval_history table
ALTER TABLE public.package_approval_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Agencies can view their own packages" ON public.packages;
DROP POLICY IF EXISTS "Agencies can insert their own packages" ON public.packages;
DROP POLICY IF EXISTS "Agencies can update their own packages" ON public.packages;
DROP POLICY IF EXISTS "Agencies can delete their own packages" ON public.packages;

DROP POLICY IF EXISTS "Agencies can view their package approval history" ON public.package_approval_history;
DROP POLICY IF EXISTS "Agencies can insert package approval history" ON public.package_approval_history;

-- Create RLS policies for packages table
CREATE POLICY "Agencies can view their own packages" ON public.packages
    FOR SELECT USING (auth.uid()::text = agency_id::text);

CREATE POLICY "Agencies can insert their own packages" ON public.packages
    FOR INSERT WITH CHECK (auth.uid()::text = agency_id::text);

CREATE POLICY "Agencies can update their own packages" ON public.packages
    FOR UPDATE USING (auth.uid()::text = agency_id::text);

CREATE POLICY "Agencies can delete their own packages" ON public.packages
    FOR DELETE USING (auth.uid()::text = agency_id::text);

-- Create RLS policies for package_approval_history table
CREATE POLICY "Agencies can view their package approval history" ON public.package_approval_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.packages 
            WHERE packages.id = package_approval_history.package_id 
            AND packages.agency_id = auth.uid()::text
        )
    );

CREATE POLICY "Agencies can insert package approval history" ON public.package_approval_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.packages 
            WHERE packages.id = package_approval_history.package_id 
            AND packages.agency_id = auth.uid()::text
        )
    );

-- ==============================================
-- 5. CREATE TRIGGERS
-- ==============================================

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

-- Create trigger for package_approval_history
CREATE OR REPLACE FUNCTION public.handle_package_approval_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for package_approval_history
CREATE TRIGGER handle_package_approval_history_updated_at
    BEFORE UPDATE ON public.package_approval_history
    FOR EACH ROW EXECUTE FUNCTION public.handle_package_approval_history_updated_at();

-- ==============================================
-- 6. GRANT PERMISSIONS
-- ==============================================

-- Grant permissions to authenticated users
GRANT ALL ON public.packages TO authenticated;
GRANT ALL ON public.package_approval_history TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ==============================================
-- 7. SUCCESS MESSAGE
-- ==============================================

SELECT 'All database issues fixed successfully!' AS status;
