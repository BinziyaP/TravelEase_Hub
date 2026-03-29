const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addCols() {
  const sql = `
    ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS available_slots INTEGER DEFAULT 0;
    ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
  `;
  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.log('Error adding columns:', error);
  } else {
    console.log('Columns added successfully');
  }
}
addCols();
