-- 1. Enhance 'bookings' table with JSONB fields
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS customer_details JSONB DEFAULT '{}'::jsonb;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS trip_details JSONB DEFAULT '{}'::jsonb;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS pricing_details JSONB DEFAULT '{}'::jsonb;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS addons JSONB DEFAULT '[]'::jsonb;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Update status constraint safely
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_booking_status_check;

ALTER TABLE bookings
ADD CONSTRAINT bookings_booking_status_check 
CHECK (booking_status IN ('draft', 'pending', 'confirmed', 'cancelled', 'completed', 'refunded'));

-- 3. Enhance 'booking_travelers' table
ALTER TABLE booking_travelers
ADD COLUMN IF NOT EXISTS traveler_info JSONB DEFAULT '{}'::jsonb;
