const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('packages').select('id, name, available_slots, features').limit(1);
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Success:', data);
  }
}
check();
