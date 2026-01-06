-- Fix Row Level Security (RLS) Issues
-- Run this SQL in your Supabase SQL Editor

-- 1. Enable RLS on agencies table
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on profiles table  
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for agencies table
-- Allow users to read their own agency data
CREATE POLICY "Users can view own agency" ON public.agencies
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own agency data
CREATE POLICY "Users can insert own agency" ON public.agencies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own agency data
CREATE POLICY "Users can update own agency" ON public.agencies
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow admins to view all agencies
CREATE POLICY "Admins can view all agencies" ON public.agencies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- Allow admins to update agency status
CREATE POLICY "Admins can update agency status" ON public.agencies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- 4. Create RLS policies for profiles table
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- 5. Fix function search_path issues
-- Update functions to set search_path explicitly

-- Update handle_agency_updated function
CREATE OR REPLACE FUNCTION public.handle_agency_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update handle_packages_updated function
CREATE OR REPLACE FUNCTION public.handle_packages_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update approve_agency function
CREATE OR REPLACE FUNCTION public.approve_agency(agency_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.agencies 
    SET status = 'approved', 
        approved_at = NOW(),
        admin_id = auth.uid()
    WHERE id = agency_id 
    AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update get_agency_stats function
CREATE OR REPLACE FUNCTION public.get_agency_stats()
RETURNS TABLE(
    total_agencies BIGINT,
    pending_agencies BIGINT,
    approved_agencies BIGINT,
    rejected_agencies BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_agencies,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_agencies,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_agencies,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_agencies
    FROM public.agencies;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update user_exists function
CREATE OR REPLACE FUNCTION public.user_exists(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM auth.users 
        WHERE auth.users.email = user_exists.email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update get_package_stats function
CREATE OR REPLACE FUNCTION public.get_package_stats()
RETURNS TABLE(
    total_packages BIGINT,
    pending_packages BIGINT,
    approved_packages BIGINT,
    rejected_packages BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_packages,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_packages,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_packages,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_packages
    FROM public.packages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update approve_package function
CREATE OR REPLACE FUNCTION public.approve_package(package_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.packages 
    SET status = 'approved', 
        approved_at = NOW(),
        admin_id = auth.uid()
    WHERE id = package_id 
    AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND user_type = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update get_agency_package_stats function
CREATE OR REPLACE FUNCTION public.get_agency_package_stats(agency_user_id UUID)
RETURNS TABLE(
    total_packages BIGINT,
    pending_packages BIGINT,
    approved_packages BIGINT,
    rejected_packages BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_packages,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_packages,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_packages,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_packages
    FROM public.packages p
    JOIN public.agencies a ON p.agency_id = a.id
    WHERE a.user_id = agency_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Enable leaked password protection (this needs to be done in Auth settings)
-- Go to Authentication > Settings > Security and enable "Check for leaked passwords"

-- 7. Reduce OTP expiry time (this needs to be done in Auth settings)  
-- Go to Authentication > Settings > Security and reduce "OTP expiry time"

COMMENT ON TABLE public.agencies IS 'Agencies table with Row Level Security enabled';
COMMENT ON TABLE public.profiles IS 'User profiles table with Row Level Security enabled';































