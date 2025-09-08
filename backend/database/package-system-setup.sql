-- Package Management System Setup for TravelEase
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create packages table for agency package management
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    max_travelers INTEGER NOT NULL CHECK (max_travelers > 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    admin_id UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create package_approval_history table for tracking approval/rejection history
CREATE TABLE IF NOT EXISTS public.package_approval_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'pending')),
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_packages_agency_id ON public.packages(agency_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON public.packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_destination ON public.packages(destination);
CREATE INDEX IF NOT EXISTS idx_packages_price ON public.packages(price);
CREATE INDEX IF NOT EXISTS idx_packages_created_at ON public.packages(created_at);

CREATE INDEX IF NOT EXISTS idx_package_approval_history_package_id ON public.package_approval_history(package_id);
CREATE INDEX IF NOT EXISTS idx_package_approval_history_admin_id ON public.package_approval_history(admin_id);
CREATE INDEX IF NOT EXISTS idx_package_approval_history_created_at ON public.package_approval_history(created_at);

-- Set up Row Level Security (RLS)
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_approval_history ENABLE ROW LEVEL SECURITY;

-- Package policies - agencies can view and manage their own packages
CREATE POLICY "Agencies can view own packages" ON public.packages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE id = agency_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Agencies can insert own packages" ON public.packages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE id = agency_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Agencies can update own packages" ON public.packages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE id = agency_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Agencies can delete own packages" ON public.packages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE id = agency_id AND user_id = auth.uid()
        )
    );

-- Admin policies - admins can view and manage all packages
CREATE POLICY "Admins can view all packages" ON public.packages
    FOR SELECT USING (true); -- Temporarily allow all authenticated users to view

CREATE POLICY "Admins can update all packages" ON public.packages
    FOR UPDATE USING (true); -- Temporarily allow all authenticated users to update

-- Package approval history policies
CREATE POLICY "Agencies can view own package approval history" ON public.package_approval_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.packages p
            JOIN public.agencies a ON p.agency_id = a.id
            WHERE p.id = package_id AND a.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all package approval history" ON public.package_approval_history
    FOR SELECT USING (true); -- Temporarily allow all authenticated users to view

CREATE POLICY "Admins can insert package approval history" ON public.package_approval_history
    FOR INSERT WITH CHECK (true); -- Temporarily allow all authenticated users to insert

-- Function to handle package approval
CREATE OR REPLACE FUNCTION public.approve_package(
    package_uuid UUID,
    admin_uuid UUID,
    approval_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    package_record RECORD;
    result JSON;
BEGIN
    -- Get package details
    SELECT * INTO package_record FROM public.packages WHERE id = package_uuid;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Package not found');
    END IF;
    
    -- Update package status
    UPDATE public.packages 
    SET 
        status = 'approved',
        admin_notes = COALESCE(approval_notes, admin_notes),
        admin_id = admin_uuid,
        approved_at = NOW(),
        updated_at = NOW()
    WHERE id = package_uuid;
    
    -- Insert approval history
    INSERT INTO public.package_approval_history (package_id, action, admin_id, notes)
    VALUES (package_uuid, 'approved', admin_uuid, approval_notes);
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Package approved successfully',
        'package_id', package_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle package rejection
CREATE OR REPLACE FUNCTION public.reject_package(
    package_uuid UUID,
    admin_uuid UUID,
    rejection_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    package_record RECORD;
    result JSON;
BEGIN
    -- Get package details
    SELECT * INTO package_record FROM public.packages WHERE id = package_uuid;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Package not found');
    END IF;
    
    -- Update package status
    UPDATE public.packages 
    SET 
        status = 'rejected',
        admin_notes = COALESCE(rejection_notes, admin_notes),
        admin_id = admin_uuid,
        rejected_at = NOW(),
        updated_at = NOW()
    WHERE id = package_uuid;
    
    -- Insert approval history
    INSERT INTO public.package_approval_history (package_id, action, admin_id, notes)
    VALUES (package_uuid, 'rejected', admin_uuid, rejection_notes);
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Package rejected successfully',
        'package_id', package_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get package statistics for admin dashboard
CREATE OR REPLACE FUNCTION public.get_package_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'approved', COUNT(*) FILTER (WHERE status = 'approved'),
        'rejected', COUNT(*) FILTER (WHERE status = 'rejected')
    ) INTO result
    FROM public.packages;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get agency's package statistics
CREATE OR REPLACE FUNCTION public.get_agency_package_stats(agency_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'approved', COUNT(*) FILTER (WHERE status = 'approved'),
        'rejected', COUNT(*) FILTER (WHERE status = 'rejected')
    ) INTO result
    FROM public.packages
    WHERE agency_id = agency_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_package_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_packages_updated_at
    BEFORE UPDATE ON public.packages
    FOR EACH ROW EXECUTE FUNCTION public.handle_package_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.packages TO anon, authenticated;
GRANT ALL ON public.package_approval_history TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_package(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_package(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_package_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_agency_package_stats(UUID) TO authenticated;

-- Display success message
SELECT 'Package management system setup completed successfully!' AS status;