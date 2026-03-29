const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const sql = `
    SELECT pg_get_constraintdef(c.oid) AS constraint_def
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'packages' AND c.contype = 'c';
  `;
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Constraints:', data);
  }
}
check();
