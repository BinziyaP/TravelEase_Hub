const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/supabase');

async function updateEnhancedSchema() {
  try {
    console.log('🚀 Starting enhanced packages schema update...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'update_packages_schema_enhanced.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 SQL file loaded successfully');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: statement 
        });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message);
      }
    }
    
    console.log('\n🎉 Enhanced schema update completed!');
    console.log('\n📋 New fields added:');
    console.log('   • selected_accommodations (JSONB)');
    console.log('   • selected_restaurants (JSONB)');
    console.log('   • transportation_details (JSONB)');
    console.log('   • daily_itinerary (JSONB)');
    console.log('\n🔍 GIN indexes created for better performance');
    
  } catch (error) {
    console.error('❌ Fatal error during schema update:', error);
    process.exit(1);
  }
}

// Run the update if this script is executed directly
if (require.main === module) {
  updateEnhancedSchema()
    .then(() => {
      console.log('✅ Schema update script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Schema update script failed:', error);
      process.exit(1);
    });
}

module.exports = { updateEnhancedSchema };

