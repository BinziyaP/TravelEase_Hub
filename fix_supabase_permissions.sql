-- Fix Supabase Permissions and RLS Policies for TravelEase
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Temporarily disable RLS to fix the issues
ALTER TABLE public.agencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_approval_history DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Agencies can view own profile" ON public.agencies;
DROP POLICY IF EXISTS "Agencies can insert own profile" ON public.agencies;
DROP POLICY IF EXISTS "Agencies can update own profile" ON public.agencies;
DROP POLICY IF EXISTS "Admins can view all agencies" ON public.agencies;
DROP POLICY IF EXISTS "Admins can update all agencies" ON public.agencies;
DROP POLICY IF EXISTS "Agencies can view own approval history" ON public.agency_approval_history;
DROP POLICY IF EXISTS "Admins can view all approval history" ON public.agency_approval_history;
DROP POLICY IF EXISTS "Admins can insert approval history" ON public.agency_approval_history;

-- Step 3: Ensure agencies table exists with all required columns
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

-- Step 4: Add license verification columns
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS license_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS license_verification_status TEXT DEFAULT 'pending' CHECK (license_verification_status IN ('pending', 'verified', 'failed', 'error')),
ADD COLUMN IF NOT EXISTS license_verification_details JSONB,
ADD COLUMN IF NOT EXISTS license_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS license_verification_error TEXT;

-- Step 5: Create agency_approval_history table
CREATE TABLE IF NOT EXISTS public.agency_approval_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'pending')),
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_agencies_status ON public.agencies(status);
CREATE INDEX IF NOT EXISTS idx_agencies_user_id ON public.agencies(user_id);
CREATE INDEX IF NOT EXISTS idx_agencies_created_at ON public.agencies(created_at);
CREATE INDEX IF NOT EXISTS idx_agencies_business_license ON public.agencies(business_license_number);
CREATE INDEX IF NOT EXISTS idx_agencies_city_state ON public.agencies(city, state);
CREATE INDEX IF NOT EXISTS idx_agencies_license_verified ON public.agencies(license_verified);
CREATE INDEX IF NOT EXISTS idx_agencies_license_verification_status ON public.agencies(license_verification_status);
CREATE INDEX IF NOT EXISTS idx_approval_history_agency_id ON public.agency_approval_history(agency_id);

-- Step 7: Enable RLS with proper policies
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_approval_history ENABLE ROW LEVEL SECURITY;

-- Step 8: Create permissive RLS policies for agencies table
CREATE POLICY "Allow all operations on agencies for authenticated users" ON public.agencies
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Step 9: Create permissive RLS policies for agency_approval_history table
CREATE POLICY "Allow all operations on approval history for authenticated users" ON public.agency_approval_history
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Step 10: Grant necessary permissions
GRANT ALL ON public.agencies TO authenticated;
GRANT ALL ON public.agency_approval_history TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 11: Create a function to handle agency approval (optional)
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

-- Step 12: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.approve_agency TO authenticated;

-- Step 13: Add helpful comments
COMMENT ON TABLE public.agencies IS 'Travel agencies registered on the platform';
COMMENT ON TABLE public.agency_approval_history IS 'History of agency approval/rejection actions';
COMMENT ON COLUMN public.agencies.license_verified IS 'Whether the business license has been verified through external API';
COMMENT ON COLUMN public.agencies.license_verification_status IS 'Status of license verification: pending, verified, failed, error';
COMMENT ON COLUMN public.agencies.license_verification_details IS 'JSON object containing verification details from API response';
COMMENT ON COLUMN public.agencies.license_verified_at IS 'Timestamp when license was verified';
COMMENT ON COLUMN public.agencies.license_verification_error IS 'Error message if verification failed';

-- Success message
SELECT 'Supabase permissions and RLS policies fixed successfully!' as message;
