const express = require('express');
const { getSupabase } = require('../config/supabase');

const router = express.Router();

// Middleware to verify Supabase JWT token
const verifySupabaseToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const supabase = getSupabase();
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed.'
    });
  }
};

// Get current user profile
router.get('/profile', verifySupabaseToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    
    // Get user profile from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }

    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        ...profile
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', verifySupabaseToken, async (req, res) => {
  try {
    const { full_name, phone, date_of_birth } = req.body;
    const supabase = getSupabase();
    
    // Update profile in profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        phone,
        date_of_birth,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: data
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's bookings
router.get('/bookings', verifySupabaseToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    
    // Get user's bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Bookings fetch error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings'
      });
    }

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create a new booking
router.post('/bookings', verifySupabaseToken, async (req, res) => {
  try {
    const { destination, travel_date, return_date, guests, budget, notes } = req.body;
    const supabase = getSupabase();
    
    // Validate required fields
    if (!destination || !travel_date) {
      return res.status(400).json({
        success: false,
        message: 'Destination and travel date are required'
      });
    }
    
    // Create new booking
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: req.user.id,
        destination,
        travel_date,
        return_date,
        guests: guests || 1,
        budget,
        notes
      })
      .select()
      .single();

    if (error) {
      console.error('Booking creation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create booking'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: data
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update a booking
router.put('/bookings/:id', verifySupabaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const supabase = getSupabase();
    
    // Update booking (RLS will ensure user can only update their own bookings)
    const { data, error } = await supabase
      .from('bookings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.id) // Extra security check
      .select()
      .single();

    if (error) {
      console.error('Booking update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update booking'
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking: data
    });
  } catch (error) {
    console.error('Booking update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete a booking
router.delete('/bookings/:id', verifySupabaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();
    
    // Delete booking (RLS will ensure user can only delete their own bookings)
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id); // Extra security check

    if (error) {
      console.error('Booking deletion error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete booking'
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Booking deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;