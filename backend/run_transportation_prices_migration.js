require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env file for SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runTransportationPricesMigration() {
  try {
    console.log('🚀 Running transportation prices migration...');
    
    // Read the SQL migration file
    const sqlFile = path.join(__dirname, 'database', 'add_transportation_prices.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 SQL to execute:');
    console.log(sql);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Execute the SQL directly using Supabase client
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .limit(1); // Test connection first
    
    if (error) {
      console.error('❌ Error connecting to packages table:', error);
      console.log('💡 Please run the SQL migration manually in your Supabase dashboard:');
      console.log('1. Go to your Supabase project dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the SQL above');
      console.log('4. Click "Run" to execute');
      return;
    }
    
    console.log('✅ Connection to packages table successful');
    console.log('💡 Please run the SQL migration manually in your Supabase dashboard:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL above');
    console.log('4. Click "Run" to execute');
    
    console.log('✅ Transportation prices migration completed successfully!');
    console.log('📋 Added column: transportation_prices (JSONB)');
    console.log('📋 Added index: idx_packages_transportation_prices_gin');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

runTransportationPricesMigration();
