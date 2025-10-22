const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRouteMapData() {
  try {
    console.log('🧪 Testing route map data in database...');
    
    // Test 1: Check if route_coordinates field exists
    console.log('\n1️⃣ Checking if route_coordinates field exists...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'packages')
      .in('column_name', ['route_coordinates', 'selected_places', 'attractions', 'selected_hotels', 'selected_restaurants']);
    
    if (columnsError) {
      console.log('❌ Error checking columns:', columnsError);
    } else {
      console.log('✅ Available columns:', columns);
    }
    
    // Test 2: Check sample package data
    console.log('\n2️⃣ Checking sample package data...');
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('id, name, route_coordinates, selected_places, attractions, selected_hotels, selected_restaurants')
      .limit(3);
    
    if (packagesError) {
      console.log('❌ Error fetching packages:', packagesError);
    } else {
      console.log('✅ Sample packages:');
      packages.forEach((pkg, index) => {
        console.log(`\nPackage ${index + 1}: ${pkg.name}`);
        console.log(`- route_coordinates: ${pkg.route_coordinates?.length || 0} items`);
        console.log(`- selected_places: ${pkg.selected_places?.length || 0} items`);
        console.log(`- attractions: ${pkg.attractions?.length || 0} items`);
        console.log(`- selected_hotels: ${pkg.selected_hotels?.length || 0} items`);
        console.log(`- selected_restaurants: ${pkg.selected_restaurants?.length || 0} items`);
        
        // Show sample data
        if (pkg.route_coordinates && pkg.route_coordinates.length > 0) {
          console.log(`  Sample route_coordinates:`, pkg.route_coordinates[0]);
        }
        if (pkg.selected_places && pkg.selected_places.length > 0) {
          console.log(`  Sample selected_places:`, pkg.selected_places[0]);
        }
        if (pkg.attractions && pkg.attractions.length > 0) {
          console.log(`  Sample attractions:`, pkg.attractions[0]);
        }
      });
    }
    
    // Test 3: Check if we need to run the database fix
    console.log('\n3️⃣ Checking if database fix is needed...');
    const { data: routeCheck, error: routeError } = await supabase
      .from('packages')
      .select('id, name, route_coordinates')
      .not('route_coordinates', 'is', null)
      .limit(1);
    
    if (routeError) {
      console.log('❌ Error checking route_coordinates:', routeError);
    } else if (routeCheck && routeCheck.length > 0) {
      console.log('✅ route_coordinates field exists and has data');
    } else {
      console.log('⚠️  route_coordinates field may be missing or empty');
      console.log('📋 You may need to run the database fix SQL');
    }
    
    console.log('\n✅ Route map data test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n📋 Manual steps to fix:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Run the SQL from fix_route_coordinates_final.sql');
  }
}

// Run the test
testRouteMapData();



