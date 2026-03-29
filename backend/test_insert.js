const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Fetching single package from travel_packages...');
  const { data, error } = await supabase.from('travel_packages').select('*').limit(1);
  if (error) {
    console.log('Error fetching:', error);
  } else {
    if (data.length > 0) {
      console.log('travel_packages keys:', Object.keys(data[0]));
    } else {
      console.log('No travel_packages exist to infer schema.');
    }
  }

  // Also catch the exact insert error from the first agency
  const { data: agencies } = await supabase.from('agencies').select('*').eq('status', 'approved').limit(1);
  if (agencies && agencies.length > 0) {
    const pkg = {
      name: 'Test Error Catch',
      destination: 'Munnar, Kerala',
      duration_days: 4,
      price: 12500,
      max_travelers: 15,
      status: 'approved',
      available_slots: 15,
      transportation_included: ['Bus'],
      meals_included: ['Breakfast'],
      accommodation_type: 'Hotel',
      accommodation_name: 'Resort',
      attractions: ['Park'],
      features: ['Guide'],
      route_coordinates: [{lat: 10.0, lng: 77.0}],
      total_distance_km: 45,
      estimated_travel_time_hours: 2,
      description: 'Test',
      category: 'Nature',
      agency_id: agencies[0].user_id,
      created_at: new Date().toISOString()
    };
    
    // Check which keys aren't allowed by trying to insert and looking at the error
    const { error: insErr } = await supabase.from('travel_packages').insert([pkg]);
    if (insErr) {
      console.error('Insert error into travel_packages:');
      console.error(JSON.stringify(insErr, null, 2));
    } else {
      console.log('Insert into travel_packages SUCCESS');
    }
  }
}
check();
