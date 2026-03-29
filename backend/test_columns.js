const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
      .from('packages')
      .select('id, name, destination, status, route_coordinates, total_distance_km, estimated_travel_time_hours')
      .limit(1);

  if (error) {
    console.log('Error selecting from packages:', error);
  } else {
    console.log('Select success, data:', data);
  }
}
check();
