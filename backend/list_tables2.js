const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const tables = ['profiles', 'agencies', 'packages', 'travel_packages', 'agency_approval_history', 'bookings'];
  let out = '';
  for (const t of tables) {
    const { error: e } = await supabase.from(t).select('count').limit(1);
    if (e) {
      out += `Table ${t} ERROR: ${e.message}\n`;
    } else {
      out += `Table ${t} EXISTS\n`;
    }
  }
  fs.writeFileSync('tables_result.txt', out, 'utf8');
}
check();
