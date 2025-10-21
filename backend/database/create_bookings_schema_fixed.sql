-- Complete Booking System Database Schema - FIXED VERSION
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

-- 6. Create function to generate booking reference
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

-- 7. Create trigger to auto-generate booking reference
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

-- 8. Enable RLS on all tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_notifications ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies (AFTER tables are created)
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

-- Public can view booking by reference (for status checks)
CREATE POLICY "Public can view booking by reference" ON public.bookings
    FOR SELECT USING (true);

-- Payment transactions policies
CREATE POLICY "Users can view own payment transactions" ON public.payment_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b 
            WHERE b.id = payment_transactions.booking_id 
            AND b.user_id = auth.uid()
        )
    );

-- Booking travelers policies
CREATE POLICY "Users can view own booking travelers" ON public.booking_travelers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b 
            WHERE b.id = booking_travelers.booking_id 
            AND b.user_id = auth.uid()
        )
    );

-- Booking notifications policies
CREATE POLICY "Users can view own booking notifications" ON public.booking_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b 
            WHERE b.id = booking_notifications.booking_id 
            AND b.user_id = auth.uid()
        )
    );
