const { createClient } = require('@supabase/supabase-js');

let supabase = null;

const initializeSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase configuration missing. Please check your .env file.');
    console.error('Required variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)');
    process.exit(1);
  }

  try {
    // Use service role key for backend operations to bypass RLS
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Supabase client initialized successfully');
    console.log('🔑 Using', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service role' : 'anon key');
    return supabase;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error.message);
    process.exit(1);
  }
};

const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase not initialized. Call initializeSupabase() first.');
  }
  return supabase;
};

// Test Supabase connection
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
    return false;
  }
};

module.exports = {
  initializeSupabase,
  getSupabase,
  testSupabaseConnection
};
