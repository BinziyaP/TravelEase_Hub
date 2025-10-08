-- Fix foreign key constraint issues for packages table
-- Run this SQL in your Supabase SQL Editor

-- ==============================================
-- 1. DIAGNOSE THE CURRENT SITUATION
-- ==============================================

-- Check if agencies table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'agencies' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if agency_approval_history table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'agency_approval_history' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check foreign key constraints on packages table
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'packages'
AND tc.table_schema = 'public';

-- ==============================================
-- 2. CREATE OR FIX AGENCIES TABLE
-- ==============================================

-- Create agencies table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    license_number TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for agencies table
CREATE INDEX IF NOT EXISTS idx_agencies_user_id ON public.agencies(user_id);
CREATE INDEX IF NOT EXISTS idx_agencies_status ON public.agencies(status);

-- ==============================================
-- 3. MIGRATE DATA FROM AGENCY_APPROVAL_HISTORY TO AGENCIES
-- ==============================================

-- Insert data from agency_approval_history into agencies table
-- This assumes agency_approval_history has the agency data
INSERT INTO public.agencies (user_id, agency_name, contact_person, email, phone, address, license_number, status, created_at, updated_at)
SELECT DISTINCT
    user_id,
    COALESCE(agency_name, 'Unknown Agency') as agency_name,
    contact_person,
    email,
    phone,
    address,
    license_number,
    COALESCE(status, 'approved') as status,
    COALESCE(created_at, NOW()) as created_at,
    COALESCE(updated_at, NOW()) as updated_at
FROM public.agency_approval_history
WHERE user_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.agencies 
    WHERE agencies.user_id = agency_approval_history.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- ==============================================
-- 4. FIX FOREIGN KEY CONSTRAINT ON PACKAGES TABLE
-- ==============================================

-- First, let's check if the foreign key constraint exists
DO $$
BEGIN
    -- Check if the foreign key constraint exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'packages_agency_id_fkey'
        AND table_name = 'packages'
        AND table_schema = 'public'
    ) THEN
        -- Drop the existing foreign key constraint
        ALTER TABLE public.packages DROP CONSTRAINT packages_agency_id_fkey;
        RAISE NOTICE 'Dropped existing packages_agency_id_fkey constraint';
    END IF;
END $$;

-- Add the foreign key constraint back with proper reference
ALTER TABLE public.packages 
ADD CONSTRAINT packages_agency_id_fkey 
FOREIGN KEY (agency_id) REFERENCES public.agencies(id) ON DELETE CASCADE;

-- ==============================================
-- 5. SET UP RLS POLICIES FOR AGENCIES TABLE
-- ==============================================

-- Enable RLS on agencies table
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own agency" ON public.agencies;
DROP POLICY IF EXISTS "Users can insert their own agency" ON public.agencies;
DROP POLICY IF EXISTS "Users can update their own agency" ON public.agencies;

-- Create RLS policies for agencies table
CREATE POLICY "Users can view their own agency" ON public.agencies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agency" ON public.agencies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agency" ON public.agencies
    FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================
-- 6. GRANT PERMISSIONS
-- ==============================================

-- Grant permissions to authenticated users
GRANT ALL ON public.agencies TO authenticated;

-- ==============================================
-- 7. CREATE TRIGGER FOR AGENCIES TABLE
-- ==============================================

-- Create trigger for agencies table
CREATE OR REPLACE FUNCTION public.handle_agency_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for agencies table
CREATE TRIGGER handle_agencies_updated_at
    BEFORE UPDATE ON public.agencies
    FOR EACH ROW EXECUTE FUNCTION public.handle_agency_updated_at();

-- ==============================================
-- 8. VERIFICATION QUERIES
-- ==============================================

-- Verify that agencies table has data
SELECT COUNT(*) as agency_count FROM public.agencies;

-- Verify that packages can reference agencies
SELECT 
    p.id as package_id,
    p.agency_id,
    a.agency_name,
    a.status as agency_status
FROM public.packages p
LEFT JOIN public.agencies a ON p.agency_id = a.id
LIMIT 5;

-- ==============================================
-- 9. SUCCESS MESSAGE
-- ==============================================

SELECT 'Foreign key constraint issues fixed successfully!' AS status;
