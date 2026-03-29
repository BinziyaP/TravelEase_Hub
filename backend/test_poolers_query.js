const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuery() {
  const { data: poolers, error } = await supabase
      .from('group_members')
      .select('*, auth_users:user_id(email)')
      .eq('status', 'pending');
      
  console.log('Error:', error);
  console.log('Data:', poolers ? poolers.length : null);
}

checkQuery();
