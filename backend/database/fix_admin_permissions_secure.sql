-- Secure Admin Permissions Fix
-- Create a proper admin role system without relying on auth.users table

-- Create a simple admin roles table
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin roles
CREATE POLICY "Admins can view admin roles" ON public.admin_roles
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.admin_roles 
        WHERE user_id = auth.uid()
    )
);

-- Only super admins can manage admin roles
CREATE POLICY "Super admins can manage admin roles" ON public.admin_roles
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.admin_roles 
        WHERE user_id = auth.uid() AND role = 'super_admin'
    )
);

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_roles 
        WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing admin policies that reference auth.users
DROP POLICY IF EXISTS "Admins can view all packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can update all packages" ON public.packages;
DROP POLICY IF EXISTS "Authenticated users can view all packages" ON public.packages;
DROP POLICY IF EXISTS "Authenticated users can update all packages" ON public.packages;
DROP POLICY IF EXISTS "Authenticated users can insert packages" ON public.packages;
DROP POLICY IF EXISTS "Authenticated users can delete packages" ON public.packages;

-- Create new admin policies using the is_admin function
CREATE POLICY "Admins can view all packages" ON public.packages
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all packages" ON public.packages
FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can insert packages" ON public.packages
FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete packages" ON public.packages
FOR DELETE USING (public.is_admin());

-- Keep existing agency policies for package ownership
-- These should still work as they don't reference auth.users

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_roles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

-- Add comment explaining the secure approach
COMMENT ON TABLE public.admin_roles IS 'Admin roles table for managing admin permissions without auth.users dependency';
COMMENT ON FUNCTION public.is_admin IS 'Function to check if a user is an admin without accessing auth.users table';

-- Insert current user as admin (you'll need to replace with actual admin user ID)
-- INSERT INTO public.admin_roles (user_id, role) VALUES ('YOUR_ADMIN_USER_ID_HERE', 'super_admin');
