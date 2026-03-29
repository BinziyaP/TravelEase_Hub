const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: histories } = await supabase.from('agency_approval_history').select('agency_id').limit(1);
  if (!histories || histories.length === 0) { console.log('no agency history'); return; }

  const pkg = {
    name: 'Minimal Test 2',
    destination: 'Munnar',
    duration_days: 4,
    price: 12500,
    max_travelers: 15,
    status: 'approved',
    agency_id: histories[0].agency_id,
    description: 'Test'
  };

  const { data, error } = await supabase.from('packages').insert([pkg]).select();
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Success minimal 2:', data);
  }
}
check();
