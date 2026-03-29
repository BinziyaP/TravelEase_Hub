const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lffwizkuulsdcnjolvqr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZndpemt1dWxzZGNuam9sdnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzA1ODksImV4cCI6MjA2OTkwNjU4OX0.t-JLDOBWV_0Q5CiXC3xozddYbZZuElaWIDRsLLu8_Ig';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectAgencies() {
  const { data: agencies, error } = await supabase.from('agencies').select('*');
  console.log(agencies);

  const { data: pkgs } = await supabase.from('packages').select('id, name, agency_id');
  console.log(pkgs);
}
inspectAgencies();
