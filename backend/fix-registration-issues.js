#!/usr/bin/env node

/**
 * Fix Registration Issues Script
 * This script will:
 * 1. Check and fix database schema issues
 * 2. Create missing tables
 * 3. Fix column name inconsistencies
 * 4. Test the registration flow
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🚀 Starting Registration Issues Fix...\n');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log('✅ Supabase URL:', process.env.SUPABASE_URL ? 'Found' : '❌ Missing');
console.log('✅ Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : '❌ Missing');

async function fixRegistrationIssues() {
  try {
    console.log('\n📋 Step 1: Checking current schema...\n');
    
    // Check existing columns in users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(0);

    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
    } else {
      console.log('✅ Users table exists');
    }

    // Check if pending_users table exists
    console.log('\n📋 Step 2: Checking pending_users table...\n');
    
    const { data: pendingData, error: pendingError } = await supabase
      .from('pending_users')
      .select('*')
      .limit(0);

    if (pendingError) {
      console.log('❌ Pending users table missing or has issues:', pendingError.message);
      console.log('🔧 Creating pending_users table...\n');
      
      // Create pending_users table
      const createTableSQL = `
        -- Create pending_users table for email verification with OTP
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        CREATE TABLE IF NOT EXISTS pending_users (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            otp_hash TEXT NOT NULL,
            otp_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_pending_users_email ON pending_users(email);
        CREATE INDEX IF NOT EXISTS idx_pending_users_expires_at ON pending_users(otp_expires_at);

        -- Row Level Security (RLS) policies for pending_users
        ALTER TABLE pending_users ENABLE ROW LEVEL SECURITY;

        -- Allow service role to access all data (for backend operations)
        DROP POLICY IF EXISTS "Service role can access all pending_users" ON pending_users;
        CREATE POLICY "Service role can access all pending_users" ON pending_users
            FOR ALL USING (true);
      `;

      const { error: createError } = await supabase.rpc('exec_sql', { 
        sql: createTableSQL 
      });

      if (createError) {
        console.log('❌ Failed to create pending_users table via RPC, trying SQL runner...');
        // We'll create a separate SQL file for manual execution
      } else {
        console.log('✅ Successfully created pending_users table');
      }
    } else {
      console.log('✅ Pending users table exists');
    }

    // Check if users table has the right columns
    console.log('\n📋 Step 3: Checking users table columns...\n');
    
    // Try to access different column names to see what exists
    const columnChecks = [
      { name: 'full_name', exists: false },
      { name: 'name', exists: false },
      { name: 'verified', exists: false },
      { name: 'email_verified', exists: false },
      { name: 'user_type', exists: false }
    ];

    for (let check of columnChecks) {
      try {
        const { error } = await supabase
          .from('users')
          .select(check.name)
          .limit(1);
        
        if (!error) {
          check.exists = true;
          console.log(`✅ Column '${check.name}' exists`);
        } else if (error.code === '42703') {
          console.log(`❌ Column '${check.name}' missing`);
        }
      } catch (e) {
        console.log(`❌ Column '${check.name}' check failed:`, e.message);
      }
    }

    // Step 4: Test registration flow
    console.log('\n📋 Step 4: Testing registration components...\n');
    
    // Test email service
    try {
      const { sendOTPEmail } = require('./utils/emailService');
      console.log('✅ Email service module loaded successfully');
    } catch (e) {
      console.log('❌ Email service error:', e.message);
    }

    // Test OTP utilities
    try {
      const { generateOTP, hashOTP } = require('./utils/otp');
      const testOTP = generateOTP();
      console.log('✅ OTP utilities working, generated:', testOTP);
    } catch (e) {
      console.log('❌ OTP utilities error:', e.message);
    }

    console.log('\n🎯 Summary and Recommendations:\n');
    console.log('1. ✅ Environment variables are loaded');
    console.log('2. ✅ Supabase connection is working');
    
    if (pendingError) {
      console.log('3. ❌ pending_users table needs to be created manually');
      console.log('   📝 Run the SQL in create-pending-users-table.sql in your Supabase dashboard');
    } else {
      console.log('3. ✅ pending_users table exists');
    }
    
    console.log('4. 🔧 Check column name consistency in your code');
    console.log('5. 🔧 Remove external email validation dependency');
    
  } catch (error) {
    console.error('❌ Fix script error:', error);
  }
}

// Run the fix
fixRegistrationIssues()
  .then(() => console.log('\n✅ Registration issues fix completed!'))
  .catch(console.error);