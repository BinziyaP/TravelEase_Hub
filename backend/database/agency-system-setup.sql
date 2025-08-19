-- Agency Registration and Approval System Setup for TravelEase
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create agencies table for agency registration and management
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    agency_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    address TEXT,
    business_license_number TEXT NOT NULL UNIQUE,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    admin_id UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agency_approval_history table for tracking approval/rejection history
CREATE TABLE IF NOT EXISTS public.agency_approval_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'pending')),
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agencies_status ON public.agencies(status);
CREATE INDEX IF NOT EXISTS idx_agencies_user_id ON public.agencies(user_id);
CREATE INDEX IF NOT EXISTS idx_agencies_created_at ON public.agencies(created_at);
CREATE INDEX IF NOT EXISTS idx_agencies_business_license ON public.agencies(business_license_number);
CREATE INDEX IF NOT EXISTS idx_agencies_city_state ON public.agencies(city, state);

CREATE INDEX IF NOT EXISTS idx_approval_history_agency_id ON public.agency_approval_history(agency_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_admin_id ON public.agency_approval_history(admin_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_created_at ON public.agency_approval_history(created_at);

-- Set up Row Level Security (RLS)
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_approval_history ENABLE ROW LEVEL SECURITY;

-- Agency policies - agencies can view and update their own profile
CREATE POLICY "Agencies can view own profile" ON public.agencies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Agencies can update own profile" ON public.agencies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Agencies can insert own profile" ON public.agencies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies - admins can view and manage all agencies
-- Note: This assumes you have admin users. You can modify this policy based on your admin identification method
CREATE POLICY "Admins can view all agencies" ON public.agencies
    FOR SELECT USING (true); -- Temporarily allow all authenticated users to view

CREATE POLICY "Admins can update all agencies" ON public.agencies
    FOR UPDATE USING (true); -- Temporarily allow all authenticated users to update

-- Approval history policies
CREATE POLICY "Agencies can view own approval history" ON public.agency_approval_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE id = agency_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all approval history" ON public.agency_approval_history
    FOR SELECT USING (true); -- Temporarily allow all authenticated users to view

CREATE POLICY "Admins can insert approval history" ON public.agency_approval_history
    FOR INSERT WITH CHECK (true); -- Temporarily allow all authenticated users to insert

-- Function to handle agency approval
CREATE OR REPLACE FUNCTION public.approve_agency(
    agency_uuid UUID,
    admin_uuid UUID,
    approval_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    agency_record RECORD;
    result JSON;
BEGIN
    -- Get agency details
    SELECT * INTO agency_record FROM public.agencies WHERE id = agency_uuid;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Agency not found');
    END IF;
    
    -- Update agency status
    UPDATE public.agencies 
    SET 
        status = 'approved',
        admin_notes = COALESCE(approval_notes, admin_notes),
        admin_id = admin_uuid,
        approved_at = NOW(),
        updated_at = NOW()
    WHERE id = agency_uuid;
    
    -- Insert approval history
    INSERT INTO public.agency_approval_history (agency_id, action, admin_id, notes)
    VALUES (agency_uuid, 'approved', admin_uuid, approval_notes);
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Agency approved successfully',
        'agency_id', agency_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle agency rejection
CREATE OR REPLACE FUNCTION public.reject_agency(
    agency_uuid UUID,
    admin_uuid UUID,
    rejection_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    agency_record RECORD;
    result JSON;
BEGIN
    -- Get agency details
    SELECT * INTO agency_record FROM public.agencies WHERE id = agency_uuid;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Agency not found');
    END IF;
    
    -- Update agency status
    UPDATE public.agencies 
    SET 
        status = 'rejected',
        admin_notes = COALESCE(rejection_notes, admin_notes),
        admin_id = admin_uuid,
        rejected_at = NOW(),
        updated_at = NOW()
    WHERE id = agency_uuid;
    
    -- Insert approval history
    INSERT INTO public.agency_approval_history (agency_id, action, admin_id, notes)
    VALUES (agency_uuid, 'rejected', admin_uuid, rejection_notes);
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Agency rejected successfully',
        'agency_id', agency_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get agency statistics for admin dashboard
CREATE OR REPLACE FUNCTION public.get_agency_stats()
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
    FROM public.agencies;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_agency_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_agencies_updated_at
    BEFORE UPDATE ON public.agencies
    FOR EACH ROW EXECUTE FUNCTION public.handle_agency_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.agencies TO anon, authenticated;
GRANT ALL ON public.agency_approval_history TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_agency(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_agency(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_agency_stats() TO authenticated;

-- Display success message
SELECT 'Agency system setup completed successfully!' AS status;
