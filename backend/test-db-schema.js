#!/usr/bin/env node

/**
 * Database Schema Checker
 * This script checks what columns actually exist in the users table
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log('🔍 Checking Users Table Schema...\n');

  // Test 1: Try to insert with minimal data to see what's required
  console.log('📝 Test 1: Attempting insert with basic fields...');
  const { data: insertData, error: insertError } = await supabase
    .from('users')
    .insert({
      email: 'test-schema-check@example.com',
      password_hash: 'dummy_hash_for_testing'
    })
    .select()
    .single();

  if (insertError) {
    console.log('Insert Error:', insertError);
    console.log('This tells us what fields are required.\n');
  } else {
    console.log('✅ Insert successful with basic fields');
    console.log('Inserted data:', insertData);
    
    // Clean up the test record
    await supabase
      .from('users')
      .delete()
      .eq('email', 'test-schema-check@example.com');
    console.log('🗑️ Test record cleaned up\n');
  }

  // Test 2: Try different column combinations
  console.log('📝 Test 2: Testing column existence...');
  const testColumns = [
    'id',
    'email', 
    'password_hash',
    'full_name',
    'name',
    'email_verified',
    'verified', 
    'user_type',
    'created_at',
    'updated_at'
  ];

  for (const column of testColumns) {
    try {
      const { error } = await supabase
        .from('users')
        .select(column)
        .limit(1);
      
      if (error && error.code === '42703') {
        console.log(`❌ Column '${column}' does not exist`);
      } else if (error) {
        console.log(`⚠️  Column '${column}' - Other error: ${error.message}`);
      } else {
        console.log(`✅ Column '${column}' exists`);
      }
    } catch (e) {
      console.log(`❌ Column '${column}' - Exception: ${e.message}`);
    }
  }
}

checkSchema().catch(console.error);