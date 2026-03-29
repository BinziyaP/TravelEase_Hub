const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: histories } = await supabase.from('agency_approval_history').select('agency_id').limit(1);
  const pkg = {
    name: 'Minimal Test 3',
    destination: 'Munnar',
    duration_days: 4,
    price: 12500,
    max_travelers: 15,
    status: 'approved',
    agency_id: histories[0].agency_id,
    description: 'Test',
    accommodation_type: 'hotel',
    included_features: ['Guided Tours']
  };

  const { error } = await supabase.from('packages').insert([pkg]).select();
  if (error) {
    fs.writeFileSync('insert_error.json', JSON.stringify(error, null, 2), 'utf8');
  } else {
    fs.writeFileSync('insert_error.json', 'SUCCESS', 'utf8');
  }
}
check();
