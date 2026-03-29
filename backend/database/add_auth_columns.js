const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const sql = `
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
`;

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', data);
  }
}

run();
