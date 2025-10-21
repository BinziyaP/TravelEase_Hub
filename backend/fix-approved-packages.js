// Fix Approved Packages Route Coordinates
// This script ensures all approved packages have proper route coordinates

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lffwizkuulsdcnjolvqr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZndpemt1dWxzZGNuam9sdnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzA1ODksImV4cCI6MjA2OTkwNjU4OX0.t-JLDOBWV_0Q5CiXC3xozddYbZZuElaWIDRsLLu8_Ig';

console.log('🔧 Using Supabase credentials:', supabaseUrl ? 'Found' : 'Using defaults');

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixApprovedPackages() {
  try {
    console.log('🔧 Fixing route coordinates for approved packages...');
    
    // Read the SQL script
    const sqlScript = fs.readFileSync(path.join(__dirname, 'fix-approved-packages-routes.sql'), 'utf8');
    
    // Execute the SQL script
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlScript });
    
    if (error) {
      console.error('❌ Error fixing approved packages:', error);
      return;
    }
    
    console.log('✅ Approved packages route coordinates fixed!');
    
    // Verify the results
    const { data: packages, error: verifyError } = await supabase
      .from('packages')
      .select('id, name, destination, status, route_coordinates, total_distance_km, estimated_travel_time_hours')
      .eq('status', 'approved');
    
    if (verifyError) {
      console.error('❌ Error verifying results:', verifyError);
      return;
    }
    
    console.log(`📊 Fixed ${packages.length} approved packages:`);
    packages.forEach(pkg => {
      console.log(`  - ${pkg.name} (${pkg.destination}): ${pkg.route_coordinates?.length || 0} coordinates, ${pkg.total_distance_km || 'N/A'} km`);
    });
    
    console.log('\n🎉 User page route maps should now work properly!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the fix
fixApprovedPackages();
