// Setup Auto Route Coordinates Trigger
// This script sets up automatic route coordinate generation
// Run this ONCE to enable automatic route coordinates for all packages

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lffwizkuulsdcnjolvqr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZndpemt1dWxzZGNuam9sdnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzA1ODksImV4cCI6MjA2OTkwNjU4OX0.t-JLDOBWV_0Q5CiXC3xozddYbZZuElaWIDRsLLu8_Ig';

console.log('🔧 Using Supabase credentials:', supabaseUrl ? 'Found' : 'Using defaults');

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAutoRouteCoordinates() {
  try {
    console.log('🚀 Setting up automatic route coordinates...');
    
    // Read the trigger SQL script
    const sqlScript = fs.readFileSync(path.join(__dirname, 'auto-route-coordinates-trigger.sql'), 'utf8');
    
    // Execute the SQL script
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlScript });
    
    if (error) {
      console.error('❌ Error setting up trigger:', error);
      return;
    }
    
    console.log('✅ Automatic route coordinates trigger installed successfully!');
    console.log('🎯 From now on, route coordinates will be generated automatically for:');
    console.log('   • New packages created');
    console.log('   • Existing packages without route data');
    console.log('   • Package updates');
    
    // Verify the setup
    const { data: packages, error: verifyError } = await supabase
      .from('packages')
      .select('id, name, destination, route_coordinates, total_distance_km, estimated_travel_time_hours')
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Error verifying setup:', verifyError);
      return;
    }
    
    console.log('\n📊 Sample packages with route coordinates:');
    packages.forEach(pkg => {
      console.log(`  - ${pkg.name} (${pkg.destination}): ${pkg.route_coordinates?.length || 0} coordinates, ${pkg.total_distance_km || 'N/A'} km`);
    });
    
    console.log('\n🎉 Setup complete! No more manual script running needed.');
    console.log('💡 Route coordinates will now be generated automatically for all packages.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the setup
setupAutoRouteCoordinates();
