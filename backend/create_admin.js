const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function setupAdmin() {
  const email = 'admin@gmail.com';
  const password = 'Admin@123';
  
  // 1. Check if user already exists in auth.users somehow, or create one
  console.log('Creating or finding user in auth.users...');
  
  // First try to create the user
  let { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  let userId;

  if (authError) {
    console.error('Auth User creation failed/exists:', authError.message);
    // If it exists, let's fetch users to find it
    if (authError.message.includes('already exists') || authError.status === 422 || authError.code === 'user_already_exists') {
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
      if (!listError) {
        const existingUser = usersData.users.find(u => u.email === email);
        if (existingUser) {
          userId = existingUser.id;
        }
      }
    }
  } else {
    userId = authData.user.id;
  }

  if (!userId) {
    console.error('Could not obtain a user ID for the admin user.');
    return;
  }

  console.log('Admin user ID is:', userId);

  // 2. Hash password for local check (if app still manually checks bcrypt)
  const hashedPassword = await bcrypt.hash(password, 12);

  // 3. Upsert into profiles
  console.log('Upserting into profiles...');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: 'Super Admin',
      email: email,
      password_hash: hashedPassword,
      verified: true,
      email_verified: true,
      user_type: 'admin'
    }, { onConflict: 'id' });
    
  if (profileError) {
    console.error('Profile upsert error:', profileError);
  } else {
    console.log('Profile created successfully.');
  }

  // 4. Ensure admin_roles has this user
  console.log('Ensuring admin_roles exists...');
  const { data: roleData, error: roleError } = await supabase
    .from('admin_roles')
    .upsert({
      user_id: userId,
      role: 'super_admin'
    }, { onConflict: 'user_id' }); // Assuming onConflict column, might not be necessary

  if (roleError) {
    if (roleError.code === '23505') {
       // duplicate key, all good
    } else {
       console.error('Role upsert error:', roleError);
    }
  } else {
    console.log('Admin role setup successfully.');
  }
}

setupAdmin();
