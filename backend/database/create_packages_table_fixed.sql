-- Fixed Packages Table Creation for TravelEase
-- Using simple agency_id without foreign key constraints

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if it exists to avoid conflicts
DROP TABLE IF EXISTS public.packages CASCADE;

CREATE TABLE public.packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID, -- Simple agency ID, no foreign key constraint
    
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    max_travelers INTEGER NOT NULL CHECK (max_travelers > 0),
    description TEXT NOT NULL,
    
    accommodation_type TEXT CHECK (accommodation_type IN ('hotel','resort','guesthouse','hostel','apartment')),
    accommodation_name TEXT,
    accommodation_rating INTEGER CHECK (accommodation_rating >=1 AND accommodation_rating <=5),
    accommodation_location TEXT,
    accommodation_price_range TEXT,
    accommodation_coordinates_lat DECIMAL(10,8),
    accommodation_coordinates_lng DECIMAL(11,8),
    accommodation_coordinates JSONB,
    
    meals_included TEXT[] DEFAULT '{}' CHECK (
        array_length(meals_included,1) IS NULL OR 
        meals_included <@ ARRAY['breakfast','lunch','dinner','snacks']
    ),
    transportation_included TEXT[] DEFAULT '{}' CHECK (
        array_length(transportation_included,1) IS NULL OR
        transportation_included <@ ARRAY['flights','airport_transfer','local_transport','car_rental','bus','train']
    ),
    
    selected_attractions JSONB DEFAULT '[]',
    selected_places JSONB DEFAULT '[]',
    selected_hotels JSONB DEFAULT '[]',
    attractions TEXT[] DEFAULT '{}',
    attraction_coordinates TEXT[] DEFAULT '{}',
    
    itinerary JSONB DEFAULT '[]',
    
    included_features TEXT[] DEFAULT '{}',
    excluded_features TEXT[] DEFAULT '{}',
    cancellation_policy TEXT,
    special_requirements TEXT,
    
    package_images TEXT[] DEFAULT '{}',
    map_center TEXT,
    map_zoom INTEGER DEFAULT 12 CHECK (map_zoom >=1 AND map_zoom <=20),
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','draft')),
    admin_notes TEXT,
    admin_id UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_packages_agency_id ON public.packages(agency_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON public.packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_destination ON public.packages(destination);
CREATE INDEX IF NOT EXISTS idx_packages_price ON public.packages(price);
CREATE INDEX IF NOT EXISTS idx_packages_duration ON public.packages(duration_days);
CREATE INDEX IF NOT EXISTS idx_packages_created_at ON public.packages(created_at);
CREATE INDEX IF NOT EXISTS idx_packages_updated_at ON public.packages(updated_at);

-- GIN indexes
CREATE INDEX IF NOT EXISTS idx_packages_selected_attractions_gin ON public.packages USING GIN(selected_attractions);
CREATE INDEX IF NOT EXISTS idx_packages_selected_places_gin ON public.packages USING GIN(selected_places);
CREATE INDEX IF NOT EXISTS idx_packages_itinerary_gin ON public.packages USING GIN(itinerary);
CREATE INDEX IF NOT EXISTS idx_packages_meals_included_gin ON public.packages USING GIN(meals_included);
CREATE INDEX IF NOT EXISTS idx_packages_transportation_included_gin ON public.packages USING GIN(transportation_included);
CREATE INDEX IF NOT EXISTS idx_packages_attractions_gin ON public.packages USING GIN(attractions);
CREATE INDEX IF NOT EXISTS idx_packages_included_features_gin ON public.packages USING GIN(included_features);
CREATE INDEX IF NOT EXISTS idx_packages_excluded_features_gin ON public.packages USING GIN(excluded_features);

-- Enable RLS
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies (using agency_id directly)
CREATE POLICY "Agencies can select their own packages" ON public.packages
FOR SELECT USING (agency_id = auth.uid());

CREATE POLICY "Agencies can insert their own packages" ON public.packages
FOR INSERT WITH CHECK (agency_id = auth.uid());

CREATE POLICY "Agencies can update their own packages" ON public.packages
FOR UPDATE USING (agency_id = auth.uid());

CREATE POLICY "Agencies can delete draft packages" ON public.packages
FOR DELETE USING (agency_id = auth.uid() AND status IN ('draft','pending'));

-- Admin policies
CREATE POLICY "Admins can view all packages" ON public.packages
FOR SELECT USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'user_type'='admin')
);

CREATE POLICY "Admins can update all packages" ON public.packages
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'user_type'='admin')
);

-- Public can view approved packages
CREATE POLICY "Public can view approved packages" ON public.packages
FOR SELECT USING (status='approved');

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_packages_updated_at
BEFORE UPDATE ON public.packages
FOR EACH ROW
EXECUTE FUNCTION public.update_packages_updated_at();

-- Approval function
CREATE OR REPLACE FUNCTION public.approve_package(
    package_uuid UUID,
    admin_uuid UUID,
    approval_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE package_record RECORD;
BEGIN
    SELECT * INTO package_record FROM public.packages WHERE id=package_uuid;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Package not found');
    END IF;

    UPDATE public.packages
    SET status='approved',
        admin_notes=COALESCE(approval_notes, admin_notes),
        admin_id=admin_uuid,
        approved_at=NOW(),
        updated_at=NOW()
    WHERE id=package_uuid;

    BEGIN
        INSERT INTO public.package_approval_history (package_id, action, notes, reviewed_by)
        VALUES (package_uuid,'approved',approval_notes,admin_uuid);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;

    RETURN json_build_object('success', true, 'message', 'Package approved successfully', 'package_id', package_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rejection function
CREATE OR REPLACE FUNCTION public.reject_package(
    package_uuid UUID,
    admin_uuid UUID,
    rejection_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE package_record RECORD;
BEGIN
    SELECT * INTO package_record FROM public.packages WHERE id=package_uuid;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Package not found');
    END IF;

    UPDATE public.packages
    SET status='rejected',
        admin_notes=COALESCE(rejection_notes, admin_notes),
        admin_id=admin_uuid,
        rejected_at=NOW(),
        updated_at=NOW()
    WHERE id=package_uuid;

    BEGIN
        INSERT INTO public.package_approval_history (package_id, action, notes, reviewed_by)
        VALUES (package_uuid,'rejected',rejection_notes,admin_uuid);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;

    RETURN json_build_object('success', true, 'message', 'Package rejected successfully', 'package_id', package_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE public.packages IS 'Stores comprehensive travel package information created by agencies';
COMMENT ON COLUMN public.packages.agency_id IS 'Simple agency ID reference (no foreign key constraint)';

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
