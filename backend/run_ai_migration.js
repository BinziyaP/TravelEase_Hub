const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  const sql = fs.readFileSync('./database/create_ai_group_travel_system.sql', 'utf8');
  
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error('ERROR scaling AI Group Travel DB Schema:', error);
  } else {
    console.log('SUCCESS: AI Group Travel tables created perfectly!', data);
  }
}
runMigration();
