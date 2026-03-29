const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.rpc('get_tables');
  if (error) {
    // If rpc fails, try raw query using PostgreSQL view if possible, or just fail
    console.log('Error fetching tables via rpc:', error.message);
    
    // Some supabase instances can query information_schema if exposed, but usually not via API.
    // Let's query profiles, agencies.
    const tables = ['profiles', 'agencies', 'packages', 'travel_packages', 'agency_approval_history', 'bookings'];
    
    for (const t of tables) {
      const { error: e } = await supabase.from(t).select('count').limit(1);
      if (e) {
        console.log(`Table ${t} ERROR: ${e.message}`);
      } else {
        console.log(`Table ${t} EXISTS`);
      }
    }
  } else {
    console.log(data);
  }
}
check();
