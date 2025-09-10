-- Fix License Verification Schema for TravelEase
-- Run this SQL in your Supabase SQL Editor

-- First, ensure the agencies table exists with basic structure
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

-- Add license verification fields to agencies table
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS license_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS license_verification_status TEXT DEFAULT 'pending' CHECK (license_verification_status IN ('pending', 'verified', 'failed', 'error')),
ADD COLUMN IF NOT EXISTS license_verification_details JSONB,
ADD COLUMN IF NOT EXISTS license_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS license_verification_error TEXT;

-- Create agency_approval_history table if it doesn't exist
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
CREATE INDEX IF NOT EXISTS idx_agencies_license_verified ON public.agencies(license_verified);
CREATE INDEX IF NOT EXISTS idx_agencies_license_verification_status ON public.agencies(license_verification_status);

CREATE INDEX IF NOT EXISTS idx_approval_history_agency_id ON public.agency_approval_history(agency_id);

-- Enable RLS
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_approval_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for agencies table
DROP POLICY IF EXISTS "Agencies can view own profile" ON public.agencies;
CREATE POLICY "Agencies can view own profile" ON public.agencies
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Agencies can insert own profile" ON public.agencies;
CREATE POLICY "Agencies can insert own profile" ON public.agencies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Agencies can update own profile" ON public.agencies;
CREATE POLICY "Agencies can update own profile" ON public.agencies
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all agencies" ON public.agencies;
CREATE POLICY "Admins can view all agencies" ON public.agencies
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update all agencies" ON public.agencies;
CREATE POLICY "Admins can update all agencies" ON public.agencies
    FOR UPDATE USING (true);

-- Create RLS policies for agency_approval_history table
DROP POLICY IF EXISTS "Agencies can view own approval history" ON public.agency_approval_history;
CREATE POLICY "Agencies can view own approval history" ON public.agency_approval_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agencies a
            WHERE a.id = agency_id AND a.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can view all approval history" ON public.agency_approval_history;
CREATE POLICY "Admins can view all approval history" ON public.agency_approval_history
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert approval history" ON public.agency_approval_history;
CREATE POLICY "Admins can insert approval history" ON public.agency_approval_history
    FOR INSERT WITH CHECK (true);

-- Add comments for documentation
COMMENT ON COLUMN public.agencies.license_verified IS 'Whether the business license has been verified through external API';
COMMENT ON COLUMN public.agencies.license_verification_status IS 'Status of license verification: pending, verified, failed, error';
COMMENT ON COLUMN public.agencies.license_verification_details IS 'JSON object containing verification details from API response';
COMMENT ON COLUMN public.agencies.license_verified_at IS 'Timestamp when license was verified';
COMMENT ON COLUMN public.agencies.license_verification_error IS 'Error message if verification failed';

-- Success message
SELECT 'License verification schema setup completed successfully!' as message;
