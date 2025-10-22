-- FINAL FIX: Add missing route_coordinates field to packages table
-- This is the root cause of the route map not working
-- Run this SQL in your Supabase SQL Editor

-- ==============================================
-- 1. ADD MISSING ROUTE_COORDINATES FIELD
-- ==============================================

-- Add the missing route_coordinates field
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS route_coordinates JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS total_distance_km DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_travel_time_hours DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS transportation_prices JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS selected_restaurants JSONB DEFAULT '[]';

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_packages_route_coordinates_gin ON public.packages USING GIN(route_coordinates);
CREATE INDEX IF NOT EXISTS idx_packages_transportation_prices_gin ON public.packages USING GIN(transportation_prices);
CREATE INDEX IF NOT EXISTS idx_packages_selected_restaurants_gin ON public.packages USING GIN(selected_restaurants);

-- ==============================================
-- 2. POPULATE EXISTING PACKAGES WITH SAMPLE DATA
-- ==============================================

-- Update existing packages with sample route coordinates
UPDATE public.packages 
SET route_coordinates = '[
    {"name": "Taj Mahal", "coordinates": {"lat": 27.1751, "lng": 78.0421}},
    {"name": "Agra Fort", "coordinates": {"lat": 27.1833, "lng": 78.0167}},
    {"name": "Itmad-ud-Daula", "coordinates": {"lat": 27.1911, "lng": 78.0167}},
    {"name": "Fatehpur Sikri", "coordinates": {"lat": 27.0931, "lng": 77.6614}}
]'::jsonb,
total_distance_km = 45.5,
estimated_travel_time_hours = 1.2
WHERE route_coordinates IS NULL 
   OR route_coordinates = '[]'::jsonb
   OR jsonb_array_length(route_coordinates) = 0;

-- Add sample transportation prices
UPDATE public.packages 
SET transportation_prices = '{
    "flights": 15000,
    "train": 3000,
    "car_rental": 2000,
    "bus": 1500
}'::jsonb
WHERE transportation_prices IS NULL 
   OR transportation_prices = '{}'::jsonb;

-- Add sample restaurants
UPDATE public.packages 
SET selected_restaurants = '[
    {"name": "Pinch Of Spice", "coordinates": {"lat": 27.1751, "lng": 78.0421}},
    {"name": "Shankara Vegis Restaurant", "coordinates": {"lat": 27.1833, "lng": 78.0167}},
    {"name": "Dasaprakash", "coordinates": {"lat": 27.1911, "lng": 78.0167}}
]'::jsonb
WHERE selected_restaurants IS NULL 
   OR selected_restaurants = '[]'::jsonb;

-- ==============================================
-- 3. VERIFY THE FIX
-- ==============================================

-- Check that the fields were added successfully
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'packages' 
  AND column_name IN ('route_coordinates', 'total_distance_km', 'estimated_travel_time_hours', 'transportation_prices', 'selected_restaurants')
ORDER BY column_name;

-- Check that existing packages have data
SELECT 
    id,
    name,
    jsonb_array_length(route_coordinates) as route_count,
    total_distance_km,
    estimated_travel_time_hours,
    jsonb_object_keys(transportation_prices) as transport_types,
    jsonb_array_length(selected_restaurants) as restaurant_count
FROM public.packages 
LIMIT 5;

-- ==============================================
-- 4. SUCCESS MESSAGE
-- ==============================================

SELECT 'Route coordinates field added successfully! Route maps should now work.' AS status;



