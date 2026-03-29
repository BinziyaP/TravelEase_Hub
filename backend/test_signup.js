const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testSignup() {
  console.log('Attempting signup...');
  const email = 'test_user_' + Date.now() + '@example.com';
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: 'Password123!',
      options: {
        data: {
          full_name: 'Test User',
          user_type: 'user'
        }
      }
    });

    console.log('Signup Response:');
    if (error) {
      console.error('ERROR:', error.message);
    } else {
      console.log('SUCCESS. User ID:', data?.user?.id);
    }
  } catch (err) {
    console.error('Exception during signup:', err);
  }
}

testSignup();
