const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getSupabase } = require('../config/supabase');

const router = express.Router();

// Create payment intent
router.post('/create-intent', async (req, res) => {
  try {
    const { amount, currency = 'inr', customer_email, customer_name } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({
        success: false,
        message: 'Minimum amount is ₹50'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in smallest currency unit (paise for INR)
      currency: currency,
      metadata: {
        customer_email,
        customer_name
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Stripe payment intent creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
});

// Confirm payment
router.post('/confirm-payment', async (req, res) => {
  try {
    const { payment_intent_id, booking_id } = req.body;

    if (!payment_intent_id || !booking_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Update booking in database
    const supabase = getSupabase();
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'completed',
        booking_status: 'confirmed',
        payment_id: payment_intent.id,
        payment_method: 'stripe',
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

    // Store payment transaction
    await supabase
      .from('payment_transactions')
      .insert({
        booking_id: booking_id,
        stripe_payment_intent_id: payment_intent.id,
        amount: paymentIntent.amount / 100, // Convert from paise to rupees
        currency: paymentIntent.currency,
        status: 'completed',
        paid_at: new Date().toISOString()
      });

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
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
    console.error('❌ Stripe payment confirmation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
});

// Get payment status
router.get('/payment-status/:payment_intent_id', async (req, res) => {
  try {
    const { payment_intent_id } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    res.json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created: paymentIntent.created
    });

  } catch (error) {
    console.error('❌ Failed to get payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
});

// Refund payment
router.post('/refund', async (req, res) => {
  try {
    const { payment_intent_id, amount, reason = 'requested_by_customer' } = req.body;

    if (!payment_intent_id) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }

    const refund = await stripe.refunds.create({
      payment_intent: payment_intent_id,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to paise if amount specified
      reason: reason
    });

    res.json({
      success: true,
      refund_id: refund.id,
      status: refund.status,
      amount: refund.amount / 100 // Convert back to rupees
    });

  } catch (error) {
    console.error('❌ Stripe refund failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
});

module.exports = router;
