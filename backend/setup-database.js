const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env file for SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database tables...');
    
    // Read the SQL setup file
    const fs = require('fs');
    const path = require('path');
    const sqlFile = path.join(__dirname, 'supabase-auth-setup.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ Error setting up database:', error);
      return;
    }
    
    console.log('✅ Database setup completed successfully!');
    console.log('📋 Tables created:');
    console.log('   - profiles');
    console.log('   - bookings');
    console.log('   - agencies (if not exists)');
    console.log('   - packages (if not exists)');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupDatabase();

