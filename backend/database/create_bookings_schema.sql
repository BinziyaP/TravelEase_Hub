-- Complete Booking System Database Schema
-- This creates all necessary tables for a full booking flow

-- 1. Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Package reference
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    
    -- User information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    
    -- Booking details
    travel_date DATE NOT NULL,
    return_date DATE,
    number_of_travelers INTEGER NOT NULL CHECK (number_of_travelers > 0),
    special_requirements TEXT,
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment information
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    payment_id TEXT, -- Razorpay payment ID
    payment_receipt TEXT, -- Payment receipt URL
    
    -- Booking status
    booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    booking_reference TEXT UNIQUE, -- Human-readable booking reference
    
    -- Agency information
    agency_id UUID REFERENCES public.agencies(id),
    agency_commission DECIMAL(10,2) DEFAULT 0,
    
    -- Timestamps
    confirmed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Create payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- References
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    
    -- Payment details
    razorpay_payment_id TEXT UNIQUE,
    razorpay_order_id TEXT,
    razorpay_signature TEXT,
    
    -- Amount details
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    failure_reason TEXT,
    
    -- Timestamps
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_amount DECIMAL(10,2) DEFAULT 0
);

-- 3. Create booking travelers table (for multiple travelers)
CREATE TABLE IF NOT EXISTS public.booking_travelers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    
    traveler_name TEXT NOT NULL,
    traveler_age INTEGER,
    traveler_gender TEXT,
    traveler_phone TEXT,
    traveler_email TEXT,
    traveler_documents JSONB, -- Store passport, ID details
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create booking notifications table
CREATE TABLE IF NOT EXISTS public.booking_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    
    notification_type TEXT NOT NULL CHECK (notification_type IN ('booking_confirmed', 'payment_received', 'booking_cancelled', 'reminder')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    sent_to_email TEXT,
    sent_to_phone TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_package_id ON public.bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking_id ON public.payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_id ON public.payment_transactions(razorpay_payment_id);

-- 6. Create RLS policies
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create bookings
CREATE POLICY "Users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- Agencies can view bookings for their packages
CREATE POLICY "Agencies can view package bookings" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.packages p 
            WHERE p.id = bookings.package_id 
            AND p.agency_id IN (
                SELECT id FROM public.agencies 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Public can view booking reference (for status checks)
CREATE POLICY "Public can view booking by reference" ON public.bookings
    FOR SELECT USING (true);

-- 7. Create function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
    reference TEXT;
    counter INTEGER;
BEGIN
    -- Generate format: BK-YYYYMMDD-XXXX
    SELECT COALESCE(MAX(CAST(SUBSTRING(booking_reference FROM 13) AS INTEGER)), 0) + 1
    INTO counter
    FROM public.bookings
    WHERE booking_reference LIKE 'BK-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-%';
    
    reference := 'BK-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
    RETURN reference;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to auto-generate booking reference
CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_reference IS NULL THEN
        NEW.booking_reference := generate_booking_reference();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_booking_reference
    BEFORE INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION set_booking_reference();

-- 9. Create function to calculate total price
CREATE OR REPLACE FUNCTION calculate_booking_total(
    p_package_id UUID,
    p_travelers INTEGER,
    p_travel_date DATE
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    base_price DECIMAL(10,2);
    total_price DECIMAL(10,2);
    discount_percentage DECIMAL(5,2) DEFAULT 0;
BEGIN
    -- Get base price from package
    SELECT price INTO base_price
    FROM public.packages
    WHERE id = p_package_id;
    
    -- Calculate total price
    total_price := base_price * p_travelers;
    
    -- Apply seasonal discounts (example logic)
    IF EXTRACT(MONTH FROM p_travel_date) IN (6, 7, 8) THEN
        discount_percentage := 10; -- 10% off for monsoon season
    ELSIF EXTRACT(MONTH FROM p_travel_date) IN (12, 1, 2) THEN
        discount_percentage := 5; -- 5% off for winter season
    END IF;
    
    -- Apply discount
    total_price := total_price * (1 - discount_percentage / 100);
    
    RETURN total_price;
END;
$$ LANGUAGE plpgsql;
