-- Add price breakdown fields to packages table
-- This migration adds fields to store detailed pricing breakdown

-- Add price breakdown fields to store detailed pricing information
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS price_breakdown JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pricing_factors JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS total_costs JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS fees_and_margins JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS route_info JSONB DEFAULT '{}';

-- Add comments to explain the structure
COMMENT ON COLUMN public.packages.price_breakdown IS 'JSONB object storing complete pricing breakdown. Structure: {"totals": {...}, "pricing_factors": {...}, "total_costs": {...}, "fees_and_margins": {...}}';
COMMENT ON COLUMN public.packages.pricing_factors IS 'JSONB object storing pricing calculation factors. Structure: {"days": 5, "max_travelers": 6, "attractions_count": 4, "transport_options": ["car"], "group_discount_applied": true}';
COMMENT ON COLUMN public.packages.total_costs IS 'JSONB object storing total costs for each component. Structure: {"accommodation": 18000, "attractions": 2400, "restaurants": 6000, "transport": 9000, "guide": 6000, "insurance": 1500, "group_discount": 0}';
COMMENT ON COLUMN public.packages.fees_and_margins IS 'JSONB object storing fees and margins. Structure: {"agency_margin": 4500, "service_fee": 900, "taxes": 2250}';
COMMENT ON COLUMN public.packages.route_info IS 'JSONB object storing route information. Structure: {"total_distance_km": 150, "estimated_travel_time_hours": 3.5, "transport_type_multiplier": 1.5}';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_packages_price_breakdown_gin ON public.packages USING GIN(price_breakdown);
CREATE INDEX IF NOT EXISTS idx_packages_pricing_factors_gin ON public.packages USING GIN(pricing_factors);
CREATE INDEX IF NOT EXISTS idx_packages_total_costs_gin ON public.packages USING GIN(total_costs);
CREATE INDEX IF NOT EXISTS idx_packages_fees_and_margins_gin ON public.packages USING GIN(fees_and_margins);
CREATE INDEX IF NOT EXISTS idx_packages_route_info_gin ON public.packages USING GIN(route_info);

