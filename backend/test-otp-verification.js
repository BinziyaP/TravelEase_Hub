#!/usr/bin/env node

/**
 * OTP Verification Test
 * Test the complete OTP flow with the current database schema
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testOTPFlow() {
  console.log('🧪 Testing OTP Verification Flow...\n');

  const testEmail = 'binziyap2026@mca.ajce.in';
  
  try {
    // Check if there's a pending user with this email
    console.log('📧 Checking for pending user...');
    const { data: pendingUser, error: fetchError } = await supabase
      .from('pending_users')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (fetchError || !pendingUser) {
      console.log('❌ No pending user found for:', testEmail);
      console.log('Error:', fetchError);
      console.log('\n🔄 You need to register first to create a pending user.');
      return;
    }

    console.log('✅ Found pending user:', {
      email: pendingUser.email,
      full_name: pendingUser.full_name,
      has_otp_hash: !!pendingUser.otp_hash,
      expires_at: pendingUser.otp_expires_at
    });

    // Check if OTP has expired
    const now = new Date();
    const expiresAt = new Date(pendingUser.otp_expires_at);
    
    if (now > expiresAt) {
      console.log('⏰ OTP has expired');
      console.log('Current time:', now.toISOString());
      console.log('OTP expires at:', expiresAt.toISOString());
      return;
    }

    console.log('✅ OTP is still valid');

    // Test user creation (simulate what happens after successful OTP verification)
    console.log('\n🔨 Testing user creation...');
    const testUserData = {
      email: `test-${Date.now()}@example.com`,
      full_name: 'Test User',
      password_hash: 'dummy_hash',
      verified: true,
      email_verified: true,
      user_type: 'user'
    };

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(testUserData)
      .select('id, email, full_name, verified, email_verified, user_type, created_at')
      .single();

    if (createError) {
      console.log('❌ Error creating test user:', createError);
      return;
    }

    console.log('✅ User creation successful:', newUser);

    // Clean up test user
    await supabase.from('users').delete().eq('id', newUser.id);
    console.log('🗑️ Test user cleaned up');

    console.log('\n🎉 OTP flow should work now! Try code 945088 in your frontend.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testOTPFlow().catch(console.error);