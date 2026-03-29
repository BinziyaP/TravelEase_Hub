const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const { data, error } = await supabase.rpc('exec_sql', { 
    sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';" 
  });
  console.log('Tables:', data || error);
}
checkTables();
