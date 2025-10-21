// Run Route Coordinates Population Script
// This script populates route coordinates for existing packages

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lffwizkuulsdcnjolvqr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZndpemt1dWxzZGNuam9sdnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzA1ODksImV4cCI6MjA2OTkwNjU4OX0.t-JLDOBWV_0Q5CiXC3xozddYbZZuElaWIDRsLLu8_Ig';

console.log('🔧 Using Supabase credentials:', supabaseUrl ? 'Found' : 'Using defaults');

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateRouteCoordinates() {
  try {
    console.log('🚀 Starting route coordinates population...');
    
    // Read the SQL script
    const fs = require('fs');
    const path = require('path');
    const sqlScript = fs.readFileSync(path.join(__dirname, 'populate-route-coordinates.sql'), 'utf8');
    
    // Execute the SQL script
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlScript });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      return;
    }
    
    console.log('✅ Route coordinates populated successfully!');
    console.log('📊 Results:', data);
    
    // Verify the results
    const { data: packages, error: verifyError } = await supabase
      .from('packages')
      .select('id, name, destination, route_coordinates, total_distance_km, estimated_travel_time_hours')
      .not('route_coordinates', 'is', null);
    
    if (verifyError) {
      console.error('❌ Error verifying results:', verifyError);
      return;
    }
    
    console.log(`📈 Updated ${packages.length} packages with route coordinates`);
    packages.forEach(pkg => {
      console.log(`  - ${pkg.name} (${pkg.destination}): ${pkg.route_coordinates?.length || 0} coordinates`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the population
populateRouteCoordinates();
