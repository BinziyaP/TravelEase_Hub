const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const samplePackages = [
  {
    name: 'Mystical Munnar Escape',
    destination: 'Munnar, Kerala',
    duration_days: 4,
    price: 12500,
    max_travelers: 15,
    status: 'approved',
    available_slots: 15,
    transportation_included: ['Bus', 'Local Cab'],
    meals_included: ['Breakfast', 'Dinner'],
    accommodation_type: 'hotel',
    accommodation_name: 'Tea Valley Resort',
    attractions: ['Eravikulam National Park', 'Mattupetty Dam', 'Tea Museum'],
    included_features: ['Guided Tours', 'Welcome Drinks', 'Campfire'],
    route_coordinates: [{lat: 10.0889, lng: 77.0595}, {lat: 10.1416, lng: 77.0622}],
    total_distance_km: 45,
    estimated_travel_time_hours: 2,
    description: 'Experience the rolling tea gardens and cool breeze of Munnar in this 4-day premium escape.',
    itinerary: [
      { day: 1, title: 'Arrival & Leisure', description: 'Arrive at Kochi, transfer to Munnar. Evening at leisure.' },
      { day: 2, title: 'Sightseeing', description: 'Visit Eravikulam National Park and Tea Museum.' },
      { day: 3, title: 'Lakes & Dams', description: 'Explore Mattupetty Dam and Echo Point.' },
      { day: 4, title: 'Departure', description: 'Drive back to Kochi for departure.' }
    ]
  },
  {
    name: 'Golden Triangle Heritage Tour',
    destination: 'Delhi, Agra, Jaipur',
    duration_days: 6,
    price: 25000,
    max_travelers: 20,
    status: 'approved',
    available_slots: 20,
    transportation_included: ['AC Volvo Bus', 'Train'],
    meals_included: ['Breakfast', 'Lunch'],
    accommodation_type: 'hotel',
    accommodation_name: 'Royal Heritage Haveli',
    attractions: ['Taj Mahal', 'Red Fort', 'Amer Fort', 'Hawa Mahal'],
    included_features: ['Professional Guide', 'Monument Entries', 'Cultural Show'],
    route_coordinates: [{lat: 28.6139, lng: 77.2090}, {lat: 27.1751, lng: 78.0421}, {lat: 26.9124, lng: 75.7873}],
    total_distance_km: 700,
    estimated_travel_time_hours: 12,
    description: 'Discover the rich history and architectural marvels of India\'s Golden Triangle.',
    itinerary: [
      { day: 1, title: 'Welcome to Delhi', description: 'Arrival in Delhi. Check-in and relax.' },
      { day: 2, title: 'Delhi Sightseeing', description: 'Visit Red Fort, India Gate, Qutub Minar.' },
      { day: 3, title: 'Drive to Agra', description: 'Morning drive to Agra. Visit Agra Fort.' },
      { day: 4, title: 'Taj Mahal & Jaipur', description: 'Sunrise at Taj Mahal. Drive to Jaipur via Fatehpur Sikri.' },
      { day: 5, title: 'Jaipur Exploration', description: 'Visit Amer Fort, Hawa Mahal, and City Palace.' },
      { day: 6, title: 'Departure', description: 'Drive back to Delhi for onward journey.' }
    ]
  },
  {
    name: 'Goa Beach Paradise',
    destination: 'Goa',
    duration_days: 5,
    price: 18000,
    max_travelers: 25,
    status: 'approved',
    available_slots: 25,
    transportation_included: ['Flight', 'AC Coach'],
    meals_included: ['Breakfast', 'Dinner'],
    accommodation_type: 'resort',
    accommodation_name: 'Silver Sands Beach Resort',
    attractions: ['Baga Beach', 'Fort Aguada', 'Dudhsagar Falls', 'Old Goa Churches'],
    included_features: ['Water Sports', 'Cruise Dinner', 'Beach Bonfire'],
    route_coordinates: [{lat: 15.2993, lng: 74.1240}, {lat: 15.5494, lng: 73.7538}],
    total_distance_km: 80,
    estimated_travel_time_hours: 3,
    description: 'Relax on the sun-kissed beaches of Goa with unlimited fun and water activities.',
    itinerary: [
      { day: 1, title: 'Arrival in Goa', description: 'Airport pickup, check-in to beach resort. Evening at leisure.' },
      { day: 2, title: 'North Goa beaches', description: 'Visit Baga, Calangute, and Anjuna beaches. Enjoy water sports.' },
      { day: 3, title: 'South Goa & Heritage', description: 'Visit Old Goa churches, Mangueshi Temple, and Colva Beach.' },
      { day: 4, title: 'Dudhsagar Excursion', description: 'Day trip to Dudhsagar Falls and spice plantation tour.' },
      { day: 5, title: 'Farewell', description: 'Check-out and transfer to airport.' }
    ]
  },
  {
    name: 'Himalayan Adventure Retreat',
    destination: 'Manali, Himachal Pradesh',
    duration_days: 6,
    price: 22000,
    max_travelers: 12,
    status: 'approved',
    available_slots: 12,
    transportation_included: ['Volvo Bus', 'SUV'],
    meals_included: ['Breakfast', 'Dinner'],
    accommodation_type: 'guesthouse',
    accommodation_name: 'Snow Peaks Cottage',
    attractions: ['Solang Valley', 'Rohtang Pass', 'Hadimba Temple', 'Vashisht Hot Springs'],
    included_features: ['Paragliding', 'River Rafting', 'Trekking'],
    route_coordinates: [{lat: 32.2396, lng: 77.1887}, {lat: 32.3164, lng: 77.1593}],
    total_distance_km: 150,
    estimated_travel_time_hours: 5,
    description: 'A thrilling adventure trip to the snowy peaks of Manali for adrenaline junkies.',
    itinerary: [
      { day: 1, title: 'Arrival in Manali', description: 'Check-in to cottage. Local sightseeing.' },
      { day: 2, title: 'Solang Valley', description: 'Full day adventure activities at Solang Valley.' },
      { day: 3, title: 'Rohtang Pass Excursion', description: 'Snow point visit at Rohtang Pass (subject to weather).' },
      { day: 4, title: 'Kullu & Naggar', description: 'Visit Kullu for river rafting and Naggar Castle.' },
      { day: 5, title: 'Trek & Camp', description: 'Short trek to a local viewpoint and camping overnight.' },
      { day: 6, title: 'Departure', description: 'Shopping at Mall Road and departure.' }
    ]
  }
];

async function seedPackages() {
  try {
    console.log('Fetching approved agencies...');
    const { data: agencies, error: agencyError } = await supabase
      .from('agencies')
      .select('id, agency_name, user_id')
      .eq('status', 'approved');

    if (agencyError || !agencies || agencies.length === 0) {
      console.log('No approved agencies found.', agencyError);
      return;
    }

    console.log(`Found ${agencies.length} approved agencies.`);

    // Check agency_approval_history to ensure they can have packages
    const { data: histories } = await supabase
      .from('agency_approval_history')
      .select('agency_id');
    const validHistoryIds = histories.map(h => h.agency_id);

    // Delete existing packages to start fresh
    await supabase.from('packages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    let totalAdded = 0;
    
    for (let i = 0; i < agencies.length; i++) {
      const agency = agencies[i];
      
      if (!validHistoryIds.includes(agency.id)) {
        console.log(`Agency ${agency.agency_name} (${agency.id}) NOT in agency_approval_history! Cannot add packages.`);
        continue;
      }
      
      const pkg1 = { ...samplePackages[i % samplePackages.length], agency_id: agency.id };
      const pkg2 = { ...samplePackages[(i + 1) % samplePackages.length], agency_id: agency.id };

      const toInsert = [pkg1, pkg2].map(pkg => ({
        ...pkg,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase.from('packages').insert(toInsert).select();
      
      if (error) {
        console.error(`Error adding packages for agency ${agency.agency_name}:`, error.message);
      } else {
        totalAdded += data.length;
        console.log(`Added ${data.length} packages for agency: ${agency.agency_name}`);
      }
    }

    console.log(`Successfully added a total of ${totalAdded} real-looking packages!`);
  } catch (error) {
    console.error('Script error:', error);
  }
}

seedPackages();
