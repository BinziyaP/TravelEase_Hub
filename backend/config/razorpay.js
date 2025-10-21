const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
const createOrder = async (amount, currency = 'INR', receipt = null) => {
  try {
    console.log('🔑 Razorpay configuration check:');
    console.log('  - Key ID:', process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing');
    console.log('  - Key Secret:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing');
    console.log('  - Amount:', amount, 'Currency:', currency);
    
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        source: 'TravelEase Booking System'
      }
    };

    console.log('📝 Creating Razorpay order with options:', JSON.stringify(options, null, 2));
    const order = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created successfully:', order.id);
    
    return {
      success: true,
      order: order
    };
  } catch (error) {
    console.error('❌ Razorpay order creation failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      response: error.response
    });
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};

// Verify Razorpay payment signature
const verifyPayment = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;
    
    return {
      success: isAuthentic,
      message: isAuthentic ? 'Payment verified successfully' : 'Payment verification failed'
    };
  } catch (error) {
    console.error('❌ Payment verification failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get Razorpay payment details
const getPaymentDetails = async (payment_id) => {
  try {
    const payment = await razorpay.payments.fetch(payment_id);
    return {
      success: true,
      payment: payment
    };
  } catch (error) {
    console.error('❌ Failed to fetch payment details:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Refund payment
const refundPayment = async (payment_id, amount = null) => {
  try {
    const refundOptions = {
      payment_id: payment_id,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to paise if amount specified
      notes: {
        reason: 'TravelEase Booking Cancellation'
      }
    };

    const refund = await razorpay.payments.refund(payment_id, refundOptions);
    return {
      success: true,
      refund: refund
    };
  } catch (error) {
    console.error('❌ Refund failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  razorpay,
  createOrder,
  verifyPayment,
  getPaymentDetails,
  refundPayment
};
