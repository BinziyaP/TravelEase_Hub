const express = require('express');
const { getSupabase } = require('../config/supabase');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get all bookings for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        packages (
          id,
          name,
          destination,
          duration_days,
          price
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch bookings',
        error: error.message 
      });
    }

    res.json({ 
      success: true, 
      bookings: bookings || [],
      count: bookings ? bookings.length : 0
    });
  } catch (error) {
    console.error('Error in bookings route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Get a specific booking by ID
router.get('/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const supabase = getSupabase();
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        packages (
          id,
          name,
          destination,
          duration_days,
          price,
          features
        )
      `)
      .eq('id', bookingId)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false, 
          message: 'Booking not found' 
        });
      }
      console.error('Error fetching booking:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch booking',
        error: error.message 
      });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Error in booking detail route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Create a new booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      package_id, 
      travel_date, 
      number_of_travelers, 
      special_requests,
      contact_phone,
      emergency_contact 
    } = req.body;

    // Validate required fields
    if (!package_id || !travel_date || !number_of_travelers) {
      return res.status(400).json({
        success: false,
        message: 'Package ID, travel date, and number of travelers are required'
      });
    }

    const supabase = getSupabase();

    // Check if package exists and has available slots
    const { data: package, error: packageError } = await supabase
      .from('packages')
      .select('id, name, price, available_slots, max_travelers, status')
      .eq('id', package_id)
      .single();

    if (packageError || !package) {
      return res.status(404).json({
        success: false,
        message: 'Travel package not found'
      });
    }

    if (package.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This travel package is not available for booking'
      });
    }

    if (package.available_slots < number_of_travelers) {
      return res.status(400).json({
        success: false,
        message: `Only ${package.available_slots} slots available for this package`
      });
    }

    // Calculate total price
    const total_price = package.price * number_of_travelers;

    // Create booking
    const { data: newBooking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: req.user.id,
        package_id: package_id,
        travel_date: travel_date,
        number_of_travelers: parseInt(number_of_travelers),
        total_price: total_price,
        special_requests: special_requests || '',
        contact_phone: contact_phone || '',
        emergency_contact: emergency_contact || '',
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: bookingError.message
      });
    }

    // Update available slots
    const { error: updateError } = await supabase
      .from('packages')
      .update({ 
        available_slots: package.available_slots - number_of_travelers 
      })
      .eq('id', package_id);

    if (updateError) {
      console.error('Error updating package slots:', updateError);
      // Note: In a production app, you'd want to rollback the booking here
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: newBooking
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update booking status (cancel booking)
router.put('/:bookingId/cancel', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const supabase = getSupabase();

    // Get booking details first
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, packages(available_slots)')
      .eq('id', bookingId)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error cancelling booking:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel booking'
      });
    }

    // Restore available slots
    const { error: slotError } = await supabase
      .from('packages')
      .update({ 
        available_slots: booking.packages.available_slots + booking.number_of_travelers 
      })
      .eq('id', booking.package_id);

    if (slotError) {
      console.error('Error restoring package slots:', slotError);
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
