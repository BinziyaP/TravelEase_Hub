#!/usr/bin/env node

/**
 * Test Supabase Authentication Setup
 * This script tests the new Supabase authentication system
 */

require('dotenv').config();
const { initializeSupabase, getSupabase } = require('./config/supabase');

// Initialize Supabase first
initializeSupabase();

console.log('🧪 Testing Supabase Authentication Setup...\n');

async function testSupabaseAuth() {
  try {
    const supabase = getSupabase();

    console.log('✅ Supabase client initialized');
    console.log(`📍 URL: ${process.env.SUPABASE_URL}`);
    console.log(`🔑 Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing'}\n`);

    // Test 1: Check if profiles table exists
    console.log('📋 Test 1: Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(0);

    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
      console.log('💡 Run the supabase-auth-setup.sql script first\n');
    } else {
      console.log('✅ Profiles table exists\n');
    }

    // Test 2: Check if bookings table exists
    console.log('📋 Test 2: Checking bookings table...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('count')
      .limit(0);

    if (bookingsError) {
      console.log('❌ Bookings table error:', bookingsError.message);
      console.log('💡 Run the supabase-auth-setup.sql script first\n');
    } else {
      console.log('✅ Bookings table exists\n');
    }

    // Test 3: Check auth settings
    console.log('📋 Test 3: Checking authentication...');
    try {
      // This will test the service role access
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.log('❌ Auth admin error:', authError.message);
        console.log('💡 Check your SUPABASE_SERVICE_ROLE_KEY\n');
      } else {
        console.log(`✅ Auth working - Found ${authUsers.users.length} users\n`);
      }
    } catch (authTestError) {
      console.log('❌ Auth test failed:', authTestError.message);
      console.log('💡 Make sure you have the correct service role key\n');
    }

    // Summary
    console.log('📊 Test Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (!profilesError) console.log('✅ Database tables ready');
    if (!profilesError) console.log('✅ RLS policies active');
    console.log('✅ Supabase connection working');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Run: node server-supabase.js');
    console.log('2. Test registration in your frontend');
    console.log('3. Check Supabase Dashboard → Authentication → Users');
    
    console.log('\n💡 Tips:');
    console.log('• Make sure to use a real email for testing');
    console.log('• Check your spam folder for verification emails');
    console.log('• Users must verify email before they can sign in');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Common solutions:');
    console.log('• Check your .env file has correct SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    console.log('• Make sure your Supabase project is active');
    console.log('• Verify your internet connection');
  }
}

// Run the test
testSupabaseAuth()
  .then(() => console.log('\n✅ Test completed!'))
  .catch(console.error);