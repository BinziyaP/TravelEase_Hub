const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRouteCoordinates() {
  try {
    console.log('🔧 Starting route coordinates fix...');
    
    // Read the SQL file
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, 'fix_route_coordinates_final.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL content loaded, length:', sqlContent.length);
    console.log('📝 First 200 characters:', sqlContent.substring(0, 200));
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      console.log('📋 Please run this SQL manually in your Supabase dashboard:');
      console.log('=====================================');
      console.log(sqlContent);
      console.log('=====================================');
      return;
    }
    
    console.log('✅ Route coordinates fix completed successfully!');
    console.log('📊 Result:', data);
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('📋 Please run this SQL manually in your Supabase dashboard:');
    console.log('=====================================');
    
    // Read and display the SQL file
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, 'fix_route_coordinates_final.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log(sqlContent);
    console.log('=====================================');
  }
}

// Run the fix
fixRouteCoordinates();























