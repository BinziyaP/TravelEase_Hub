const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPoolers() {
  const { data: poolers, error } = await supabase.from('group_members').select('*');
  fs.writeFileSync('poolers_dump.json', JSON.stringify(poolers, null, 2));
  console.log('Saved to poolers_dump.json');
}

checkPoolers();
