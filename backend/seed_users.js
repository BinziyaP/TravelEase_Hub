const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const usersInfo = [];

async function seedUser(email, password, fullName, userType, extraData = {}) {
    console.log(`Creating ${userType}: ${email}...`);
    // 1. Sign up
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                name: fullName,
                user_type: userType
            }
        }
    });

    if (error) {
        console.error(`Error creating ${email}:`, error.message);
        return;
    }

    const userId = data.user?.id;
    if (!userId) {
        console.error(`No user ID returned for ${email}`);
        return;
    }

    // 2. If agency, insert into agencies table
    if (userType === 'agency') {
        const { error: agencyError } = await supabase
            .from('agencies')
            .insert({
                user_id: userId,
                agency_name: extraData.agencyName,
                contact_person: fullName,
                city: extraData.city,
                state: extraData.state,
                business_license_number: extraData.license,
                phone: extraData.phone,
                status: 'pending' // pending so admin can approve them
            });
            
        if (agencyError) {
             console.error(`Error inserting agency relation for ${email}:`, agencyError.message);
             // fallback to legacy schema if needed
             await supabase.from('agencies').insert({
                user_id: userId,
                name: extraData.agencyName,
                address: `${extraData.city}, ${extraData.state}`,
                license_number: extraData.license,
                phone: extraData.phone,
                status: 'pending'
             });
        }
    }
    
    usersInfo.push({ Type: userType, Name: userType === 'agency' ? extraData.agencyName : fullName, Email: email, Password: password });
}

async function run() {
    // 5 Customers
    await seedUser('sarah@traveler.com', 'SecurePass!1', 'Sarah Miller', 'user');
    await seedUser('david@explorer.com', 'SecurePass!1', 'David Chen', 'user');
    await seedUser('emma@wanderlust.com', 'SecurePass!1', 'Emma Wilson', 'user');
    await seedUser('james@globetrotter.com', 'SecurePass!1', 'James Rodriguez', 'user');
    await seedUser('olivia@journey.com', 'SecurePass!1', 'Olivia Taylor', 'user');

    // 5 Agencies
    await seedUser('hello@wanderlusttours.com', 'AgencyPass!1', 'Marcus Johnson', 'agency', {
        agencyName: 'Wanderlust Tours', city: 'Delhi', state: 'Delhi', license: 'CA123456', phone: '9876543210'
    });
    await seedUser('info@alpineadventures.com', 'AgencyPass!1', 'Jessica Smith', 'agency', {
        agencyName: 'Alpine Adventures', city: 'Shimla', state: 'Himachal Pradesh', license: 'BL12345678', phone: '9876543211'
    });
    await seedUser('contact@desertsafari.com', 'AgencyPass!1', 'Ahmed Khan', 'agency', {
        agencyName: 'Desert Safari Experts', city: 'Jaipur', state: 'Rajasthan', license: 'LIC1234567', phone: '9876543212'
    });
    await seedUser('support@coastalgetaways.com', 'AgencyPass!1', 'Priya Patel', 'agency', {
        agencyName: 'Coastal Getaways', city: 'Goa', state: 'Goa', license: '9876543210', phone: '9876543213'
    });
    await seedUser('bookings@himalayantreks.com', 'AgencyPass!1', 'Tenzing Norgay', 'agency', {
        agencyName: 'Himalayan Treks', city: 'Manali', state: 'Himachal Pradesh', license: 'KL24/2024-25/123', phone: '9876543214'
    });
    
    console.log("\n✅ ALL DONE! Here are the generated accounts:\n");
    console.table(usersInfo);
}

run();
