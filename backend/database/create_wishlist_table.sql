-- Create wishlist table for packages
-- This table stores user wishlist items with proper relationships

CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination of user and package
    UNIQUE(user_id, package_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_package_id ON public.wishlist(package_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON public.wishlist(created_at);

-- Add comments for documentation
COMMENT ON TABLE public.wishlist IS 'Stores user wishlist items for travel packages';
COMMENT ON COLUMN public.wishlist.user_id IS 'Reference to the user who added the item to wishlist';
COMMENT ON COLUMN public.wishlist.package_id IS 'Reference to the package being wishlisted';
COMMENT ON COLUMN public.wishlist.created_at IS 'When the item was added to wishlist';
COMMENT ON COLUMN public.wishlist.updated_at IS 'When the item was last updated';

-- Enable Row Level Security (RLS)
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own wishlist items
CREATE POLICY "Users can view own wishlist" ON public.wishlist
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own wishlist items
CREATE POLICY "Users can insert own wishlist" ON public.wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own wishlist items
CREATE POLICY "Users can update own wishlist" ON public.wishlist
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own wishlist items
CREATE POLICY "Users can delete own wishlist" ON public.wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_wishlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER wishlist_updated_at_trigger
    BEFORE UPDATE ON public.wishlist
    FOR EACH ROW
    EXECUTE FUNCTION update_wishlist_updated_at();

-- Create a view for wishlist with package details
CREATE OR REPLACE VIEW public.wishlist_with_packages AS
SELECT 
    w.id as wishlist_id,
    w.user_id,
    w.package_id,
    w.created_at as wishlist_created_at,
    w.updated_at as wishlist_updated_at,
    p.id,
    p.package_name,
    p.destination,
    p.duration,
    p.price,
    p.max_travelers,
    p.description,
    p.image_url,
    p.category,
    p.rating,
    p.status,
    p.agency_id,
    p.price_breakdown,
    p.pricing_factors,
    p.total_costs,
    p.fees_and_margins,
    p.route_info,
    p.route_coordinates,
    p.selected_places,
    p.transportation_prices,
    p.transportation_included,
    p.created_at as package_created_at,
    p.updated_at as package_updated_at,
    a.agency_name,
    a.contact_person,
    a.contact_email,
    a.contact_phone
FROM public.wishlist w
JOIN public.packages p ON w.package_id = p.id
LEFT JOIN public.agencies a ON p.agency_id = a.id
WHERE p.status = 'approved'; -- Only show approved packages

-- Add RLS policy for the view
ALTER VIEW public.wishlist_with_packages SET (security_invoker = true);

-- Create a function to get user's wishlist count
CREATE OR REPLACE FUNCTION get_user_wishlist_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.wishlist w
        JOIN public.packages p ON w.package_id = p.id
        WHERE w.user_id = user_uuid
        AND p.status = 'approved'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if package is in user's wishlist
CREATE OR REPLACE FUNCTION is_package_in_wishlist(user_uuid UUID, package_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.wishlist
        WHERE user_id = user_uuid
        AND package_id = package_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist TO authenticated;
GRANT SELECT ON public.wishlist_with_packages TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_wishlist_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_package_in_wishlist(UUID, UUID) TO authenticated;

-- Insert some sample wishlist data for testing (optional)
-- Uncomment the following lines if you want to add sample data
/*
INSERT INTO public.wishlist (user_id, package_id) 
SELECT 
    auth.uid(),
    p.id
FROM public.packages p
WHERE p.status = 'approved'
LIMIT 2;
*/
