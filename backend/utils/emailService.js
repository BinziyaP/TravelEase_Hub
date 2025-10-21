const nodemailer = require('nodemailer');

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (booking) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: booking.customer_email,
      subject: `Booking Confirmed - ${booking.booking_reference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .highlight { color: #e74c3c; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .button { 
              display: inline-block; 
              background: #3498db; 
              color: white; 
              padding: 10px 20px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
              <p>Your travel booking has been successfully confirmed</p>
            </div>
            
            <div class="content">
              <h2>Booking Details</h2>
              <div class="booking-details">
                <p><strong>Booking Reference:</strong> <span class="highlight">${booking.booking_reference}</span></p>
                <p><strong>Package:</strong> ${booking.packages.name}</p>
                <p><strong>Destination:</strong> ${booking.packages.destination}</p>
                <p><strong>Duration:</strong> ${booking.packages.duration_days} days</p>
                <p><strong>Travel Date:</strong> ${new Date(booking.travel_date).toLocaleDateString()}</p>
                <p><strong>Travelers:</strong> ${booking.number_of_travelers}</p>
                <p><strong>Total Amount:</strong> ₹${booking.final_amount}</p>
              </div>
              
              <h2>Agency Contact</h2>
              <div class="booking-details">
                <p><strong>Agency:</strong> ${booking.agencies.name}</p>
                <p><strong>Contact Person:</strong> ${booking.agencies.contact_person}</p>
                <p><strong>Email:</strong> ${booking.agencies.email}</p>
                <p><strong>Phone:</strong> ${booking.agencies.phone}</p>
              </div>
              
              <h2>Next Steps</h2>
              <ul>
                <li>Save this confirmation email for your records</li>
                <li>Contact the agency for any special requirements</li>
                <li>Prepare necessary travel documents</li>
                <li>Check travel advisories for your destination</li>
              </ul>
              
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/booking-status/${booking.booking_reference}" class="button">
                  View Booking Status
                </a>
              </p>
            </div>
            
            <div class="footer">
              <p>Thank you for choosing TravelEase!</p>
              <p>For support, contact us at support@travelease.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent to:', booking.customer_email);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send booking confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send payment confirmation email
const sendPaymentConfirmationEmail = async (booking) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: booking.customer_email,
      subject: `Payment Confirmed - ${booking.booking_reference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #27ae60; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .payment-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .highlight { color: #27ae60; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💳 Payment Confirmed!</h1>
              <p>Your payment has been successfully processed</p>
            </div>
            
            <div class="content">
              <h2>Payment Details</h2>
              <div class="payment-details">
                <p><strong>Booking Reference:</strong> <span class="highlight">${booking.booking_reference}</span></p>
                <p><strong>Amount Paid:</strong> ₹${booking.final_amount}</p>
                <p><strong>Payment Method:</strong> ${booking.payment_method || 'Online Payment'}</p>
                <p><strong>Payment ID:</strong> ${booking.payment_id}</p>
                <p><strong>Payment Date:</strong> ${new Date(booking.confirmed_at).toLocaleString()}</p>
              </div>
              
              <h2>Receipt</h2>
              <p>This email serves as your payment receipt. Please keep it for your records.</p>
              
              <p style="text-align: center; margin-top: 30px;">
                <strong>Thank you for your payment!</strong><br>
                Your booking is now confirmed and you will receive further details from the travel agency.
              </p>
            </div>
            
            <div class="footer">
              <p>TravelEase - Your trusted travel partner</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Payment confirmation email sent to:', booking.customer_email);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send payment confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send booking cancellation email
const sendBookingCancellationEmail = async (booking, reason) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: booking.customer_email,
      subject: `Booking Cancelled - ${booking.booking_reference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Cancellation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #e74c3c; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .cancellation-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .highlight { color: #e74c3c; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Booking Cancelled</h1>
              <p>Your booking has been cancelled</p>
            </div>
            
            <div class="content">
              <h2>Cancellation Details</h2>
              <div class="cancellation-details">
                <p><strong>Booking Reference:</strong> <span class="highlight">${booking.booking_reference}</span></p>
                <p><strong>Package:</strong> ${booking.packages.name}</p>
                <p><strong>Travel Date:</strong> ${new Date(booking.travel_date).toLocaleDateString()}</p>
                <p><strong>Cancellation Date:</strong> ${new Date().toLocaleString()}</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              </div>
              
              <h2>Refund Information</h2>
              <p>If you paid for this booking, your refund will be processed within 5-7 business days.</p>
              
              <p style="text-align: center; margin-top: 30px;">
                <strong>We're sorry to see you go!</strong><br>
                Feel free to browse our other travel packages.
              </p>
            </div>
            
            <div class="footer">
              <p>TravelEase - Your trusted travel partner</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Booking cancellation email sent to:', booking.customer_email);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send cancellation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendBookingConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendBookingCancellationEmail
};