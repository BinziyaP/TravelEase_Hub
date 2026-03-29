const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedPoolers() {
  console.log('Seeding fake poolers for testing...');
  
  // Get 5 users from the system
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  
  let added = 0;
  for (const u of users.users) {
    if (added >= 5) break;
    
    // Check if they are already in the pool
    const { data: existing } = await supabase.from('group_members').select('id').eq('user_id', u.id).single();
    if (!existing) {
      await supabase.from('group_members').insert({
        user_id: u.id,
        budget_limit: 25000,
        preferences: { adventure: 8, luxury: 4, culture: 7 },
        status: 'pending' // They are waiting in the pool natively!
      });
      added++;
      console.log(`Added test user ${u.email} to the waiting pool.`);
    }
  }
  
  console.log(`Success! Added ${added} users to the AI travel pool to match against.`);
}

seedPoolers();
