const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRpc() {
    console.log('Testing exec_sql RPC...');
    // Try a simple select
    const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT now();' });

    if (error) {
        console.error('❌ RPC Test Failed:', error);
        if (error.code === 'PGRST202') {
            console.error('Reason: Function not found (404). The function "exec_sql" does not exist in the "public" schema.');
        }
    } else {
        console.log('✅ RPC Test Success! Function exists and works.');
    }
}

testRpc();
