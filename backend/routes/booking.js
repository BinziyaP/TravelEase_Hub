const express = require('express');
const { getSupabase } = require('../config/supabase');
const { createOrder, verifyPayment, getPaymentDetails, refundPayment } = require('../config/razorpay');
const { sendBookingConfirmationEmail, sendPaymentConfirmationEmail } = require('../utils/emailService');

const router = express.Router();

// Test endpoint to check if booking routes are working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Booking routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Check capacity availability for a package on a specific date
router.get('/check-capacity', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { package_id, travel_date } = req.query;

    if (!package_id || !travel_date) {
      return res.status(400).json({
        success: false,
        message: 'Package ID and travel date are required'
      });
    }

    // Get total number of travelers already booked for this package on this date
    const { data: existingBookings, error } = await supabase
      .from('bookings')
      .select('number_of_travelers')
      .eq('package_id', package_id)
      .eq('travel_date', travel_date)
      .in('booking_status', ['confirmed', 'pending']);

    if (error) {
      console.error('Error checking capacity:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking capacity availability'
      });
    }

    const currentBookings = existingBookings.reduce((total, booking) => total + booking.number_of_travelers, 0);
    const maxCapacity = 15; // Maximum 15 people per date
    const available = currentBookings < maxCapacity;

    res.json({
      success: true,
      available,
      currentBookings,
      maxCapacity,
      remainingSpots: maxCapacity - currentBookings
    });

  } catch (error) {
    console.error('Error in check-capacity:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to calculate pricing
const calculateBookingPrice = async (packageData, number_of_travelers, travel_date, selected_transport = [], addons = []) => {
  const base_price = parseFloat(packageData.price);

  // 1. Calculate Base Cost
  const total_base_price = base_price * number_of_travelers;

  // 2. Calculate Transport Cost
  let transport_cost = 0;
  const transport_details = [];

  if (selected_transport && selected_transport.length > 0) {
    // Check if package has transportation_prices mapping
    // Assuming packageData.transportation_prices is a JSON object like { "flight": 5000, "cab": 2000 }
    const prices = packageData.transportation_prices || {};

    selected_transport.forEach(mode => {
      const cost_per_person = parseFloat(prices[mode] || 0);
      const total_mode_cost = cost_per_person * number_of_travelers;
      transport_cost += total_mode_cost;

      transport_details.push({
        mode,
        cost_per_person,
        total_cost: total_mode_cost
      });
    });
  }

  // 3. Calculate Add-ons (Activities, Insurance etc.)
  // Future scope: currently just basic structure
  let addons_cost = 0;

  // 4. Calculate Seasonal Discounts
  const travelDate = new Date(travel_date);
  const month = travelDate.getMonth() + 1; // 1-12
  let discount_percentage = 0;
  let season = 'Regular';

  if (month >= 6 && month <= 8) {
    discount_percentage = 10; // 10% off for monsoon season
    season = 'Monsoon Special';
  } else if (month === 12 || month <= 2) {
    discount_percentage = 5; // 5% off for winter season
    season = 'Winter Special';
  }

  const subtotal = total_base_price + transport_cost + addons_cost;
  const discount_amount = (subtotal * discount_percentage) / 100;

  // 5. Taxes (GST @ 5% for tours)
  const taxable_amount = subtotal - discount_amount;
  const tax_percentage = 5;
  const tax_amount = (taxable_amount * tax_percentage) / 100;

  const final_amount = Math.round(taxable_amount + tax_amount);

  return {
    base_price,
    number_of_travelers,
    total_base_price,
    transport_cost,
    transport_details,
    addons_cost,
    subtotal,
    season,
    discount_percentage,
    discount_amount,
    tax_percentage,
    tax_amount,
    final_amount,
    currency: 'INR'
  };
};

// Calculate price endpoint (Single Source of Truth)
router.post('/calculate-price', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { package_id, number_of_travelers, travel_date, selected_transport, addons } = req.body;

    if (!package_id || !number_of_travelers || !travel_date) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const { data: packageData, error } = await supabase
      .from('packages')
      .select('price, transportation_prices')
      .eq('id', package_id)
      .single();

    if (error || !packageData) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const pricing = await calculateBookingPrice(
      packageData,
      parseInt(number_of_travelers),
      travel_date,
      selected_transport,
      addons
    );

    res.json({ success: true, pricing });

  } catch (error) {
    console.error('Price calculation error:', error);
    res.status(500).json({ success: false, message: 'Calculation failed' });
  }
});

// Create a new booking
router.post('/create', async (req, res) => {
  try {
    console.log('📝 Creating booking with data:', JSON.stringify(req.body, null, 2));
    const supabase = getSupabase();
    const {
      package_id,
      customer_name,
      customer_email,
      customer_phone,
      travel_date,
      return_date,
      number_of_travelers,
      number_of_adults,
      number_of_children,
      special_requirements,
      travelers = [],
      selected_transport = [],
      addons = [],
      departure_city // New field
    } = req.body;

    // Validate required fields
    if (!package_id || !customer_name || !customer_email || !customer_phone || !travel_date || !number_of_travelers) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Get package details
    console.log('📦 Looking up package:', package_id);
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*, agencies(*)')
      .eq('id', package_id)
      .eq('status', 'approved')
      .single();

    if (packageError || !packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found or not available'
      });
    }

    // --- PRICING LOGIC ---
    // Recalculate everything on backend to ensure security
    const pricing = await calculateBookingPrice(
      packageData,
      parseInt(number_of_travelers),
      travel_date,
      selected_transport,
      addons
    );

    // Prepare JSON data structures for new schema
    const customer_details = {
      name: customer_name,
      email: customer_email,
      phone: customer_phone,
      special_requirements
    };

    const trip_details = {
      departure_city, // Store departure city
      travel_date,
      return_date,
      duration_days: packageData.duration_days,
      package_name: packageData.package_name,
      package_destination: packageData.destination
    };

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        package_id,
        user_id: req.user?.id || null, // Optional if guest checkout
        customer_name,   // Keep legacy columns for backward compat if needed, or migration ensures they exist
        customer_email,
        customer_phone,
        travel_date,
        return_date,
        number_of_travelers,
        status: 'pending_payment', // Use new status flow
        booking_status: 'pending', // Legacy support

        // New JSONB Fields
        customer_details,
        trip_details,
        pricing_details: pricing,
        addons: selected_transport, // storing selected transport in addons column for now

        // Financials
        total_amount: pricing.final_amount, // Important for queries
        agency_id: packageData.agency_id
      })
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Booking creation failed:', bookingError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: process.env.NODE_ENV === 'development' ? bookingError.message : undefined
      });
    }

    // Add travelers
    if (travelers && travelers.length > 0) {
      const travelersData = travelers.map(traveler => ({
        booking_id: booking.id,
        // Legacy columns
        traveler_name: traveler.name,
        traveler_age: traveler.age,
        traveler_gender: traveler.gender,
        traveler_phone: traveler.phone,
        traveler_email: traveler.email || null, // handle missing email

        // New JSONB column
        traveler_info: traveler
      }));

      const { error: travelersError } = await supabase
        .from('booking_travelers')
        .insert(travelersData);

      if (travelersError) {
        console.error('❌ Failed to add travelers:', travelersError);
      }
    }

    // Create Razorpay order
    console.log('💳 Creating Razorpay order for amount:', pricing.final_amount);

    // Mock order for testing (as per original code)
    const orderResult = {
      success: true,
      order: {
        id: `mock_order_${Date.now()}`,
        amount: Math.round(pricing.final_amount * 100),
        currency: 'INR',
        receipt: `booking_${booking.id}`
      }
    };

    // Store payment transaction
    await supabase
      .from('payment_transactions')
      .insert({
        booking_id: booking.id,
        razorpay_order_id: orderResult.order.id,
        amount: pricing.final_amount,
        currency: 'INR',
        status: 'pending'
      });

    res.json({
      success: true,
      booking: {
        id: booking.id,
        booking_reference: booking.booking_reference, // database trigger usually handles this
        customer_details,
        trip_details,
        pricing
      },
      payment: {
        order_id: orderResult.order.id,
        amount: orderResult.order.amount,
        currency: orderResult.order.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    console.error('❌ Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Verify payment and confirm booking
router.post('/verify-payment', async (req, res) => {
  try {
    const supabase = getSupabase();
    const {
      booking_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Verify payment signature
    const verification = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Get payment details from Razorpay
    const paymentDetails = await getPaymentDetails(razorpay_payment_id);

    if (!paymentDetails.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payment details'
      });
    }

    // Update booking status
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'completed',
        booking_status: 'confirmed',
        payment_id: razorpay_payment_id,
        payment_method: paymentDetails.payment.method,
        confirmed_at: new Date().toISOString()
      })
      .eq('id', booking_id)
      .select(`
        *,
        packages(*),
        agencies(*)
      `)
      .single();

    if (bookingError) {
      console.error('❌ Failed to update booking:', bookingError);
      return res.status(500).json({
        success: false,
        message: 'Failed to confirm booking'
      });
    }

    // Update payment transaction
    await supabase
      .from('payment_transactions')
      .update({
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        status: 'completed',
        paid_at: new Date().toISOString()
      })
      .eq('booking_id', booking_id);

    // Send confirmation emails
    try {
      await sendBookingConfirmationEmail(booking);
      await sendPaymentConfirmationEmail(booking);
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError);
    }

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      booking: {
        id: booking.id,
        booking_reference: booking.booking_reference,
        status: booking.booking_status,
        payment_status: booking.payment_status,
        package: booking.packages,
        agency: booking.agencies
      }
    });

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get booking details by reference
router.get('/status/:reference', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { reference } = req.params;

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        packages(*),
        agencies(*),
        booking_travelers(*)
      `)
      .eq('booking_reference', reference)
      .single();

    if (error || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking: {
        id: booking.id,
        booking_reference: booking.booking_reference,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        travel_date: booking.travel_date,
        number_of_travelers: booking.number_of_travelers,
        total_price: booking.total_price,
        final_amount: booking.final_amount,
        booking_status: booking.booking_status,
        payment_status: booking.payment_status,
        package: booking.packages,
        agency: booking.agencies,
        travelers: booking.booking_travelers
      }
    });

  } catch (error) {
    console.error('❌ Booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cancel booking
router.post('/cancel/:booking_id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { booking_id } = req.params;
    const { reason } = req.body;

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled
    if (booking.booking_status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.booking_status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        booking_status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', booking_id);

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel booking'
      });
    }

    // Process refund if payment was completed
    if (booking.payment_status === 'completed' && booking.payment_id) {
      try {
        const refundResult = await refundPayment(booking.payment_id);

        if (refundResult.success) {
          // Update payment status
          await supabase
            .from('payment_transactions')
            .update({
              status: 'refunded',
              refunded_at: new Date().toISOString(),
              refund_amount: booking.final_amount
            })
            .eq('booking_id', booking_id);

          await supabase
            .from('bookings')
            .update({
              payment_status: 'refunded'
            })
            .eq('id', booking_id);
        }
      } catch (refundError) {
        console.error('❌ Refund failed:', refundError);
      }
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Booking cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
