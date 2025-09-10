const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createProfilesTable() {
  try {
    console.log('🚀 Creating profiles table...');
    
    // Create profiles table
    const { error: createError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          avatar_url TEXT,
          phone TEXT,
          date_of_birth DATE,
          user_type TEXT DEFAULT 'user' CHECK (user_type IN ('user', 'agency', 'admin')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createError && !createError.message.includes('already exists')) {
      console.error('❌ Error creating profiles table:', createError.message);
    } else {
      console.log('✅ Profiles table created successfully!');
    }
    
    // Create indexes
    await supabase.rpc('exec', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);'
    });
    
    await supabase.rpc('exec', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);'
    });
    
    // Enable RLS
    await supabase.rpc('exec', {
      sql: 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;'
    });
    
    // Create policies
    await supabase.rpc('exec', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON public.profiles
          FOR SELECT USING (auth.uid() = id);
      `
    });
    
    await supabase.rpc('exec', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON public.profiles
          FOR UPDATE USING (auth.uid() = id);
      `
    });
    
    await supabase.rpc('exec', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON public.profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
      `
    });
    
    await supabase.rpc('exec', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Admins can view all profiles" ON public.profiles
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE id = auth.uid() AND user_type = 'admin'
            )
          );
      `
    });
    
    console.log('✅ Database setup completed successfully!');
    console.log('📋 You can now restart your backend server and test the functionality.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

createProfilesTable();

