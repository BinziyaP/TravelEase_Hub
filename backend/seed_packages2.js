const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Just copy samplePackages
const samplePackages = [
  {
    name: 'Mystical Munnar Escape',
    destination: 'Munnar, Kerala',
    duration_days: 4,
    price: 12500,
    max_travelers: 15,
    status: 'approved',
    available_slots: 15,
    meals_included: [],
    accommodation_type: 'hotel',
    accommodation_name: 'Tea Valley Resort',
    attractions: ['Eravikulam National Park', 'Mattupetty Dam', 'Tea Museum'],
    included_features: ['Guided Tours', 'Welcome Drinks', 'Campfire'],
    route_coordinates: [{lat: 10.0889, lng: 77.0595}, {lat: 10.1416, lng: 77.0622}],
    total_distance_km: 45,
    estimated_travel_time_hours: 2,
    description: 'Experience the rolling tea gardens and cool breeze of Munnar in this 4-day premium escape.',
    itinerary: [
      { day: 1, title: 'Arrival & Leisure', description: 'Arrive at Kochi, transfer to Munnar. Evening at leisure.' }
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
    meals_included: [],
    accommodation_type: 'hotel',
    accommodation_name: 'Royal Heritage Haveli',
    attractions: ['Taj Mahal', 'Red Fort', 'Amer Fort', 'Hawa Mahal'],
    included_features: ['Professional Guide', 'Monument Entries', 'Cultural Show'],
    route_coordinates: [{lat: 28.6139, lng: 77.2090}, {lat: 27.1751, lng: 78.0421}, {lat: 26.9124, lng: 75.7873}],
    total_distance_km: 700,
    estimated_travel_time_hours: 12,
    description: 'Discover the rich history and architectural marvels of India\'s Golden Triangle.',
    itinerary: [
      { day: 1, title: 'Welcome to Delhi', description: 'Arrival in Delhi. Check-in and relax.' }
    ]
  }
];

async function seed() {
  let log = '';
  // 1. Get agencies
  const { data: agencies } = await supabase.from('agencies').select('*').eq('status', 'approved');
  log += 'Agencies: ' + agencies.length + '\n';

  // 2. Get history
  const { data: history } = await supabase.from('agency_approval_history').select('agency_id');
  const validHistory = history.map(h => h.agency_id);

  let totalAdded = 0;
  for (let i = 0; i < agencies.length; i++) {
    const agency = agencies[i];
    if (!validHistory.includes(agency.id)) {
      log += 'Agency missing history: ' + agency.id + '\n';
      continue;
    }

    const pkg = { ...samplePackages[i % samplePackages.length], agency_id: agency.id };
    const { data: insData, error } = await supabase.from('packages').insert([pkg]).select();
    
    if (error) {
      log += 'ERR INSERT: ' + JSON.stringify({error, agency: agency.id}) + '\n';
    } else {
      totalAdded += insData.length;
      log += 'SUCCESS INSERT: ' + agency.id + ' -> ' + insData[0].id + '\n';
    }
  }

  log += 'Total added: ' + totalAdded + '\n';
  fs.writeFileSync('seed_log.txt', log, 'utf8');
}
seed();
