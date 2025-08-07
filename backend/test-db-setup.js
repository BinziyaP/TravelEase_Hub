// Test database setup for password reset
require('dotenv').config();
const { getSupabase } = require('./config/supabase');

async function testDatabaseSetup() {
  try {
    console.log('🔍 Testing database setup...');
    const supabase = getSupabase();

    // Test 1: Check if users table exists and has data
    console.log('\n1️⃣ Testing users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'binziyap03@gmail.com');

    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
    } else {
      console.log('✅ Users table accessible');
      console.log('📧 Found user:', users.length > 0 ? users[0].email : 'No user found');
    }

    // Test 2: Try to create password reset tokens table
    console.log('\n2️⃣ Testing password reset tokens table...');
    try {
      const { data: tokens, error: tokensError } = await supabase
        .from('password_reset_tokens')
        .select('id')
        .limit(1);

      if (tokensError) {
        console.log('❌ Password reset tokens table error:', tokensError.message);
        
        // Try to create the table
        console.log('🔧 Attempting to create password_reset_tokens table...');
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID REFERENCES users(id) ON DELETE CASCADE,
              token VARCHAR(255) NOT NULL,
              expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
              used BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            ALTER TABLE password_reset_tokens DISABLE ROW LEVEL SECURITY;
          `
        });

        if (createError) {
          console.log('❌ Failed to create table:', createError.message);
        } else {
          console.log('✅ Table created successfully');
        }
      } else {
        console.log('✅ Password reset tokens table accessible');
      }
    } catch (error) {
      console.log('❌ Password reset tokens table test failed:', error.message);
    }

    // Test 3: Test password reset token creation manually
    console.log('\n3️⃣ Testing password reset token creation...');
    if (users && users.length > 0) {
      const userId = users[0].id;
      const token = 'test-token-' + Date.now();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      const { data: newToken, error: insertError } = await supabase
        .from('password_reset_tokens')
        .insert({
          user_id: userId,
          token: token,
          expires_at: expiresAt.toISOString(),
          used: false,
          created_at: new Date().toISOString()
        })
        .select();

      if (insertError) {
        console.log('❌ Failed to create reset token:', insertError.message);
      } else {
        console.log('✅ Reset token created successfully');
        
        // Clean up test token
        await supabase
          .from('password_reset_tokens')
          .delete()
          .eq('token', token);
      }
    }

    console.log('\n🎉 Database setup test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDatabaseSetup();
