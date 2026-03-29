const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Use service role key for admin privileges
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    console.log('🚀 Starting migration check...');

    // 1. First, try to ensure we have the exec_sql function
    // We can't easily create it if it doesn't exist without direct SQL access, 
    // but let's try to assume it might exist or we can run this SQL via a raw query if supported.
    // Actually, without pg, we are limited. 

    // NOTE: If this fails, we will instruct the user to run the SQL manually in their Dashboard.

    const migrationPath = path.join(__dirname, 'enhance_bookings_schema.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    try {
        console.log('Processing migration file...');
        const statements = migrationSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        // Attempt to run via RPC 'exec_sql'
        for (const statement of statements) {
            const { error } = await supabase.rpc('exec_sql', { sql: statement });
            if (error) {
                console.error('❌ Error executing SQL via RPC:', error.message);
                console.log('💡 TIP: You might need to create the "exec_sql" function in your Supabase dashboard first.');
                console.log('--- SQL TO RUN IN DASHBOARD ---');
                console.log(fs.readFileSync(path.join(__dirname, 'create_exec_sql.sql'), 'utf8'));
                process.exit(1);
            }
        }
        console.log('✅ Migration applied successfully!');

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

runMigration();
