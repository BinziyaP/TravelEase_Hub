const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  let log = '';
  const { data: agencies } = await supabase.from('agencies').select('id, agency_name, user_id').eq('status', 'approved');
  log += 'Agencies: ' + JSON.stringify(agencies) + '\n';
  
  const { data: histories } = await supabase.from('agency_approval_history').select('*');
  log += 'Histories: ' + JSON.stringify(histories) + '\n';
  
  fs.writeFileSync('log.txt', log, 'utf8');
}
check();
