-- Create packages table to store all package details
-- References agency_approval_history table for agency data

-- ==============================================
-- 1. CREATE PACKAGES TABLE
-- ==============================================

CREATE TABLE public.packages (
    -- Primary key and metadata
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Agency reference (foreign key to agency_approval_history)
    agency_id UUID NOT NULL,
    
    -- Basic package information (from form step 1)
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    max_travelers INTEGER NOT NULL,
    description TEXT,
    
    -- Accommodation details (from form step 2)
    accommodation_type TEXT CHECK (accommodation_type IN ('hotel', 'resort', 'guesthouse', 'hostel', 'apartment')),
    accommodation_name TEXT,
    accommodation_rating INTEGER CHECK (accommodation_rating >= 1 AND accommodation_rating <= 5),
    accommodation_location TEXT,
    accommodation_coordinates_lat DECIMAL(10, 8),
    accommodation_coordinates_lng DECIMAL(11, 8),
    accommodation_price_range TEXT,
    accommodation_coordinates JSONB, -- For selected accommodation object
    
    -- Meals and transportation (from form steps 2 & 3)
    meals_included TEXT[] DEFAULT '{}',
    transportation_included TEXT[] DEFAULT '{}',
    
    -- Attractions and places (from form step 1 - tourist attractions)
    selected_attractions JSONB DEFAULT '[]'::jsonb, -- Detailed attraction info from form
    selected_places JSONB DEFAULT '[]'::jsonb, -- Selected tourist places
    selected_hotels JSONB DEFAULT '[]'::jsonb, -- Selected hotels
    attractions TEXT[] DEFAULT '{}', -- Simple list of attraction names
    attraction_coordinates TEXT[] DEFAULT '{}', -- Simple list of coordinates
    
    -- Itinerary and features (from form step 4)
    itinerary JSONB DEFAULT '[]'::jsonb,
    included_features TEXT[] DEFAULT '{}',
    excluded_features TEXT[] DEFAULT '{}',
    cancellation_policy TEXT,
    special_requirements TEXT,
    package_images TEXT[] DEFAULT '{}',
    
    -- Map details
    map_center_lat DECIMAL(10, 8),
    map_center_lng DECIMAL(11, 8),
    map_zoom INTEGER DEFAULT 10,
    map_center TEXT, -- For backward compatibility
    
    -- Package status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
    
    -- Foreign key constraint to agency_approval_history
    CONSTRAINT fk_packages_agency_id 
        FOREIGN KEY (agency_id) 
        REFERENCES public.agency_approval_history(agency_id) 
        ON DELETE CASCADE
);

-- ==============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ==============================================

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_packages_agency_id ON public.packages(agency_id);
CREATE INDEX IF NOT EXISTS idx_packages_name ON public.packages(name);
CREATE INDEX IF NOT EXISTS idx_packages_destination ON public.packages(destination);
CREATE INDEX IF NOT EXISTS idx_packages_status ON public.packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_accommodation_type ON public.packages(accommodation_type);
CREATE INDEX IF NOT EXISTS idx_packages_created_at ON public.packages(created_at);

-- GIN indexes for JSONB and array columns
CREATE INDEX IF NOT EXISTS idx_packages_selected_attractions ON public.packages USING GIN(selected_attractions);
CREATE INDEX IF NOT EXISTS idx_packages_selected_places ON public.packages USING GIN(selected_places);
CREATE INDEX IF NOT EXISTS idx_packages_selected_hotels ON public.packages USING GIN(selected_hotels);
CREATE INDEX IF NOT EXISTS idx_packages_accommodation_coordinates ON public.packages USING GIN(accommodation_coordinates);
CREATE INDEX IF NOT EXISTS idx_packages_itinerary ON public.packages USING GIN(itinerary);
CREATE INDEX IF NOT EXISTS idx_packages_meals_included ON public.packages USING GIN(meals_included);
CREATE INDEX IF NOT EXISTS idx_packages_transportation_included ON public.packages USING GIN(transportation_included);
CREATE INDEX IF NOT EXISTS idx_packages_attractions ON public.packages USING GIN(attractions);
CREATE INDEX IF NOT EXISTS idx_packages_included_features ON public.packages USING GIN(included_features);
CREATE INDEX IF NOT EXISTS idx_packages_excluded_features ON public.packages USING GIN(excluded_features);
CREATE INDEX IF NOT EXISTS idx_packages_package_images ON public.packages USING GIN(package_images);

-- ==============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 4. CREATE RLS POLICIES
-- ==============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Agencies can view their own packages" ON public.packages;
DROP POLICY IF EXISTS "Agencies can insert their own packages" ON public.packages;
DROP POLICY IF EXISTS "Agencies can update their own packages" ON public.packages;
DROP POLICY IF EXISTS "Agencies can delete their own packages" ON public.packages;

-- Create RLS policies for packages table
-- Agencies can view their own packages
CREATE POLICY "Agencies can view their own packages" ON public.packages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agency_approval_history 
            WHERE agency_approval_history.agency_id = packages.agency_id 
            AND agency_approval_history.agency_id = auth.uid()::text
        )
    );

-- Agencies can insert packages for their agency
CREATE POLICY "Agencies can insert their own packages" ON public.packages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agency_approval_history 
            WHERE agency_approval_history.agency_id = packages.agency_id 
            AND agency_approval_history.agency_id = auth.uid()::text
        )
    );

-- Agencies can update their own packages
CREATE POLICY "Agencies can update their own packages" ON public.packages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.agency_approval_history 
            WHERE agency_approval_history.agency_id = packages.agency_id 
            AND agency_approval_history.agency_id = auth.uid()::text
        )
    );

-- Agencies can delete their own packages
CREATE POLICY "Agencies can delete their own packages" ON public.packages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.agency_approval_history 
            WHERE agency_approval_history.agency_id = packages.agency_id 
            AND agency_approval_history.agency_id = auth.uid()::text
        )
    );

-- ==============================================
-- 5. CREATE UPDATED_AT TRIGGER
-- ==============================================

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS handle_packages_updated_at ON public.packages;
CREATE TRIGGER handle_packages_updated_at
    BEFORE UPDATE ON public.packages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_packages_updated_at();

-- ==============================================
-- 6. GRANT PERMISSIONS
-- ==============================================

-- Grant permissions to authenticated users
GRANT ALL ON public.packages TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ==============================================
-- 7. VERIFICATION QUERIES
-- ==============================================

-- Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'packages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test foreign key relationship
SELECT 
    p.id as package_id,
    p.name as package_name,
    p.agency_id,
    a.action as agency_status,
    a.notes as agency_notes
FROM public.packages p
LEFT JOIN public.agency_approval_history a ON p.agency_id = a.agency_id
LIMIT 5;

-- ==============================================
-- 8. SUCCESS MESSAGE
-- ==============================================

SELECT 'Packages table created successfully with all required fields!' AS status;