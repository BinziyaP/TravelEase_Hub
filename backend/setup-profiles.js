const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env file for SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createProfilesTable() {
  try {
    console.log('🚀 Creating profiles table...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create-profiles-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec', { sql: statement.trim() });
          if (error && !error.message.includes('already exists')) {
            console.error('❌ Error executing statement:', error.message);
          }
        } catch (err) {
          // Ignore errors for statements that already exist
          if (!err.message.includes('already exists')) {
            console.error('❌ Error:', err.message);
          }
        }
      }
    }
    
    console.log('✅ Profiles table setup completed!');
    console.log('📋 You can now:');
    console.log('   1. Restart your backend server');
    console.log('   2. Test user profile functionality');
    console.log('   3. Test admin agency approval/rejection');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

createProfilesTable();

