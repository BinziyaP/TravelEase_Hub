const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define 4 packages per theme
const himalayanPackages = [
  {
    name: 'Everest Base Camp Trek',
    destination: 'Himalayas, Nepal',
    duration_days: 14,
    price: 85000,
    max_travelers: 10,
    status: 'approved',
    available_slots: 10,
    accommodation_type: 'guesthouse',
    accommodation_name: 'Tea Houses',
    attractions: ['Namche Bazaar', 'Tengboche Monastery', 'Everest Base Camp', 'Kala Patthar'],
    route_coordinates: [{lat: 27.6915, lng: 86.7324}, {lat: 28.0026, lng: 86.8526}],
    total_distance_km: 130,
    estimated_travel_time_hours: 90,
    description: 'The ultimate trekking experience to the base of the highest mountain in the world.',
    itinerary: [
      { day: 1, title: 'Arrival in Kathmandu', description: 'Arrive in Kathmandu and prepare for the trek.' },
      { day: 2, title: 'Flight to Lukla', description: 'Scenic flight to Lukla, begin trek to Phakding.' },
      { day: 8, title: 'Base Camp', description: 'Reach Everest Base Camp at 5,364m.' },
      { day: 14, title: 'Return', description: 'Return flight to Kathmandu.' }
    ]
  },
  {
    name: 'Valley of Flowers Trek',
    destination: 'Uttarakhand, India',
    duration_days: 6,
    price: 15000,
    max_travelers: 15,
    status: 'approved',
    available_slots: 15,
    accommodation_type: 'hotel',
    accommodation_name: 'Ghangaria Camp',
    attractions: ['Valley of Flowers', 'Hemkund Sahib', 'Joshimath'],
    route_coordinates: [{lat: 30.5520, lng: 79.5645}, {lat: 30.7280, lng: 79.5841}],
    total_distance_km: 40,
    estimated_travel_time_hours: 24,
    description: 'A mesmerizing trek through a vibrant high-altitude Himalayan valley blooming with alpine flowers.',
    itinerary: [
      { day: 1, title: 'Haridwar to Joshimath', description: 'Drive to Joshimath, rest and acclimatize.' },
      { day: 3, title: 'Valley of Flowers', description: 'Trek into the stunning floral valley.' }
    ]
  },
  {
    name: 'Leh Ladakh Road Trip',
    destination: 'Ladakh, India',
    duration_days: 8,
    price: 35000,
    max_travelers: 12,
    status: 'approved',
    available_slots: 12,
    accommodation_type: 'resort',
    accommodation_name: 'Pangong Camps',
    attractions: ['Pangong Tso', 'Nubra Valley', 'Khardung La', 'Magnetic Hill'],
    route_coordinates: [{lat: 34.1526, lng: 77.5771}, {lat: 33.7595, lng: 78.6674}],
    total_distance_km: 700,
    estimated_travel_time_hours: 40,
    description: 'A thrilling road trip across high mountain passes, cold deserts, and pristine blue lakes.',
    itinerary: [
      { day: 1, title: 'Arrive in Leh', description: 'Rest and acclimatize to the altitude.' },
      { day: 4, title: 'Pangong Lake', description: 'Overnight stay at the majestic Pangong Tso.' }
    ]
  },
  {
    name: 'Spiti Valley Expedition',
    destination: 'Spiti, Himachal Pradesh',
    duration_days: 7,
    price: 28000,
    max_travelers: 8,
    status: 'approved',
    available_slots: 8,
    accommodation_type: 'guesthouse',
    accommodation_name: 'Kaza Homestay',
    attractions: ['Key Monastery', 'Chandratal Lake', 'Kunzum Pass', 'Kibber'],
    route_coordinates: [{lat: 32.2217, lng: 78.0310}, {lat: 32.4824, lng: 77.6322}],
    total_distance_km: 400,
    estimated_travel_time_hours: 30,
    description: 'Explore the rugged and remote cold desert mountains of Spiti Valley in this thrilling expedition.',
    itinerary: [
      { day: 1, title: 'Manali to Kaza', description: 'Drive via Rohtang and Kunzum Pass.' },
      { day: 3, title: 'Key Monastery', description: 'Visit the iconic Key Monastery and Kibber village.' }
    ]
  }
];

const coastalPackages = [
  {
    name: 'Maldives Overwater Bliss',
    destination: 'Maldives',
    duration_days: 5,
    price: 95000,
    max_travelers: 2,
    status: 'approved',
    available_slots: 2,
    accommodation_type: 'resort',
    accommodation_name: 'Ozen Reserve',
    attractions: ['Male City', 'Snorkeling', 'Private Beach', 'Sunset Cruise'],
    route_coordinates: [{lat: 4.1755, lng: 73.5093}, {lat: 4.0000, lng: 73.0000}],
    total_distance_km: 50,
    estimated_travel_time_hours: 2,
    description: 'An ultra-luxurious 5-day escape in a private overwater villa surrounded by turquoise waters.',
    itinerary: [
      { day: 1, title: 'Arrival', description: 'Speedboat transfer to your water villa.' },
      { day: 3, title: 'Snorkeling', description: 'Guided snorkeling session at the house reef.' }
    ]
  },
  {
    name: 'Andaman Island Explorer',
    destination: 'Andaman Islands, India',
    duration_days: 6,
    price: 32000,
    max_travelers: 20,
    status: 'approved',
    available_slots: 20,
    accommodation_type: 'hotel',
    accommodation_name: 'Sea Shell Hotel',
    attractions: ['Radhanagar Beach', 'Cellular Jail', 'Ross Island', 'Elephant Beach'],
    route_coordinates: [{lat: 11.6234, lng: 92.7265}, {lat: 11.9866, lng: 92.9845}],
    total_distance_km: 150,
    estimated_travel_time_hours: 6,
    description: 'Discover pristine beaches, rich colonial history, and vibrant coral reefs in the Andamans.',
    itinerary: [
      { day: 1, title: 'Port Blair', description: 'Visit Cellular Jail and witness the Light & Sound show.' },
      { day: 3, title: 'Havelock Island', description: 'Relax at Radhanagar Beach, known as Asia\'s best beach.' }
    ]
  },
  {
    name: 'Bali Tropical Getaway',
    destination: 'Bali, Indonesia',
    duration_days: 7,
    price: 45000,
    max_travelers: 15,
    status: 'approved',
    available_slots: 15,
    accommodation_type: 'resort',
    accommodation_name: 'Ubud Village Resort',
    attractions: ['Uluwatu Temple', 'Ubud Monkey Forest', 'Seminyak Beach', 'Nusa Penida'],
    route_coordinates: [{lat: -8.4095, lng: 115.1889}, {lat: -8.7392, lng: 115.4808}],
    total_distance_km: 200,
    estimated_travel_time_hours: 15,
    description: 'Experience the perfect blend of exotic culture, lush rice terraces, and beautiful beaches in Bali.',
    itinerary: [
      { day: 1, title: 'Welcome to Bali', description: 'Check-in at Ubud and relax.' },
      { day: 4, title: 'Nusa Penida Excursion', description: 'Full day trip to Kelingking beach & Angel\'s Billabong.' }
    ]
  },
  {
    name: 'Goa Coastal Carnival',
    destination: 'Goa, India',
    duration_days: 4,
    price: 16000,
    max_travelers: 25,
    status: 'approved',
    available_slots: 25,
    accommodation_type: 'hotel',
    accommodation_name: 'Taj Aguada',
    attractions: ['Baga Beach', 'Aguada Fort', 'Basilica of Bom Jesus', 'Dudhsagar Falls'],
    route_coordinates: [{lat: 15.2993, lng: 74.1240}, {lat: 15.5494, lng: 73.7538}],
    total_distance_km: 80,
    estimated_travel_time_hours: 3,
    description: 'A vibrant 4-day tour combining Goan beach parties, historical sites, and exquisite seafood.',
    itinerary: [
      { day: 1, title: 'North Goa', description: 'Explore Baga and Calangute beaches.' },
      { day: 3, title: 'South Goa heritage', description: 'Visit Old Goa churches and temples.' }
    ]
  }
];

const desertPackages = [
  {
    name: 'Dubai Desert Safari & City',
    destination: 'Dubai, UAE',
    duration_days: 5,
    price: 55000,
    max_travelers: 15,
    status: 'approved',
    available_slots: 15,
    accommodation_type: 'hotel',
    accommodation_name: 'Atlantis The Palm',
    attractions: ['Burj Khalifa', 'Dubai Mall', 'Desert Safari', 'Palm Jumeirah'],
    route_coordinates: [{lat: 25.2048, lng: 55.2708}, {lat: 24.9602, lng: 55.4410}],
    total_distance_km: 300,
    estimated_travel_time_hours: 10,
    description: 'Experience the ultra-modern luxury of Dubai combined with a traditional Arabian desert safari.',
    itinerary: [
      { day: 1, title: 'City Tour', description: 'Visit Burj Khalifa Top and Dubai Aquarium.' },
      { day: 3, title: 'Desert Safari', description: 'Dune bashing, camel ride, and BBQ dinner in the desert.' }
    ]
  },
  {
    name: 'Royal Rajasthan Tour',
    destination: 'Rajasthan, India',
    duration_days: 7,
    price: 32000,
    max_travelers: 20,
    status: 'approved',
    available_slots: 20,
    accommodation_type: 'hotel',
    accommodation_name: 'Suryagarh Jaisalmer',
    attractions: ['Amber Fort', 'City Palace Udaipur', 'Thar Desert', 'Mehrangarh Fort'],
    route_coordinates: [{lat: 26.9124, lng: 75.7873}, {lat: 26.2389, lng: 73.0243}],
    total_distance_km: 900,
    estimated_travel_time_hours: 20,
    description: 'Journey through the royal palaces, vibrant forts, and majestic sand dunes of Rajasthan.',
    itinerary: [
      { day: 1, title: 'Jaipur', description: 'Visit Hawa Mahal and Amber Fort.' },
      { day: 4, title: 'Jaisalmer Desert', description: 'Overnight desert camp in the Sam Sand Dunes.' }
    ]
  },
  {
    name: 'Morocco Sahara Adventure',
    destination: 'Marrakech & Sahara, Morocco',
    duration_days: 8,
    price: 78000,
    max_travelers: 12,
    status: 'approved',
    available_slots: 12,
    accommodation_type: 'guesthouse',
    accommodation_name: 'Luxury Sahara Camp',
    attractions: ['Marrakech Medina', 'Atlas Mountains', 'Ait Benhaddou', 'Erg Chebbi Dunes'],
    route_coordinates: [{lat: 31.6295, lng: -7.9811}, {lat: 31.5142, lng: -4.0531}],
    total_distance_km: 600,
    estimated_travel_time_hours: 18,
    description: 'A magical journey from the bustling souks of Marrakech to the endless sands of the Sahara.',
    itinerary: [
      { day: 1, title: 'Marrakech', description: 'Explore the vibrant Medina and Jemaa el-Fnaa.' },
      { day: 5, title: 'Sahara Glamping', description: 'Camel trek at sunset and night under the stars in Erg Chebbi.' }
    ]
  },
  {
    name: 'Egypt Pyramids & Desert',
    destination: 'Egypt',
    duration_days: 6,
    price: 65000,
    max_travelers: 15,
    status: 'approved',
    available_slots: 15,
    accommodation_type: 'hotel',
    accommodation_name: 'Mena House',
    attractions: ['Giza Pyramids', 'Sphinx', 'White Desert', 'Egyptian Museum'],
    route_coordinates: [{lat: 30.0444, lng: 31.2357}, {lat: 27.3592, lng: 27.9698}],
    total_distance_km: 500,
    estimated_travel_time_hours: 14,
    description: 'Witness the iconic Pyramids of Giza and camp in the surreal landscape of the White Desert.',
    itinerary: [
      { day: 1, title: 'Cairo', description: 'Full day tour of the Pyramids and Sphinx.' },
      { day: 3, title: 'White Desert Camp', description: '4x4 safari and overnight camping in the White Desert.' }
    ]
  }
];

const wanderlustPackages = [
  {
    name: 'European Backpacker Trail',
    destination: 'Europe (France, Italy, Swiss)',
    duration_days: 12,
    price: 145000,
    max_travelers: 10,
    status: 'approved',
    available_slots: 10,
    accommodation_type: 'hostel',
    accommodation_name: 'Generator Hostels',
    attractions: ['Eiffel Tower', 'Swiss Alps', 'Colosseum', 'Venice Canals'],
    route_coordinates: [{lat: 48.8566, lng: 2.3522}, {lat: 41.9028, lng: 12.4964}],
    total_distance_km: 2500,
    estimated_travel_time_hours: 60,
    description: 'An immersive multi-country European journey designed for the adventurous backpacker.',
    itinerary: [
      { day: 1, title: 'Paris', description: 'Explore the romantic streets of Paris.' },
      { day: 6, title: 'Lucerne', description: 'Train ride through the majestic Swiss Alps.' },
      { day: 10, title: 'Rome', description: 'Visit the ancient historical sites of Rome.' }
    ]
  },
  {
    name: 'Japan Cherry Blossom Tour',
    destination: 'Tokyo & Kyoto, Japan',
    duration_days: 8,
    price: 115000,
    max_travelers: 15,
    status: 'approved',
    available_slots: 15,
    accommodation_type: 'hotel',
    accommodation_name: 'Shinjuku Prince Hotel',
    attractions: ['Mount Fuji', 'Kyoto Temples', 'Shibuya Crossing', 'Osaka Castle'],
    route_coordinates: [{lat: 35.6762, lng: 139.6503}, {lat: 35.0116, lng: 135.7681}],
    total_distance_km: 500,
    estimated_travel_time_hours: 8,
    description: 'Witness the breathtaking beauty of Japan during the spring cherry blossom season.',
    itinerary: [
      { day: 1, title: 'Tokyo', description: 'Experience the electric energy of Tokyo.' },
      { day: 4, title: 'Kyoto', description: 'Ride the bullet train to Kyoto and visit ancient temples.' }
    ]
  },
  {
    name: 'Kerala God\'s Own Country',
    destination: 'Kerala, India',
    duration_days: 6,
    price: 24000,
    max_travelers: 18,
    status: 'approved',
    available_slots: 18,
    accommodation_type: 'resort',
    accommodation_name: 'Kumarakom Lake Resort',
    attractions: ['Alleppey Houseboats', 'Munnar Tea Gardens', 'Kochi Fort', 'Thekkady'],
    route_coordinates: [{lat: 9.9312, lng: 76.2673}, {lat: 9.4981, lng: 76.3388}],
    total_distance_km: 300,
    estimated_travel_time_hours: 10,
    description: 'A serene trip through the lush backwaters, spice plantations, and historic forts of Kerala.',
    itinerary: [
      { day: 1, title: 'Kochi', description: 'Tour Fort Kochi and Chinese Fishing Nets.' },
      { day: 4, title: 'Alleppey', description: 'Overnight stay in a traditional Kerala Houseboat.' }
    ]
  },
  {
    name: 'Thailand Cultural Odyssey',
    destination: 'Bangkok & Chiang Mai, Thailand',
    duration_days: 7,
    price: 36000,
    max_travelers: 20,
    status: 'approved',
    available_slots: 20,
    accommodation_type: 'hotel',
    accommodation_name: 'Amari Watergate',
    attractions: ['Grand Palace', 'Ayutthaya', 'Doi Suthep', 'Elephant Sanctuary'],
    route_coordinates: [{lat: 13.7563, lng: 100.5018}, {lat: 18.7883, lng: 98.9853}],
    total_distance_km: 700,
    estimated_travel_time_hours: 14,
    description: 'Experience the rich Buddhist culture, vibrant street food, and nature of Thailand.',
    itinerary: [
      { day: 1, title: 'Bangkok', description: 'Visit the glowing temples and night markets.' },
      { day: 5, title: 'Chiang Mai', description: 'Spend a day bathing elephants at a sanctuary.' }
    ]
  }
];

// Helper to assign specific themed packages to specific agencies
function getPackagesForAgency(agencyName) {
  const name = agencyName.toLowerCase();
  if (name.includes('himalayan')) return himalayanPackages;
  if (name.includes('coastal') || name.includes('beach')) return coastalPackages;
  if (name.includes('desert') || name.includes('safari')) return desertPackages;
  return wanderlustPackages; 
}

async function seed() {
  let log = '';
  // 1. Delete all existing packages globally
  await supabase.from('packages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  log += 'Cleared existing packages.\n';

  // 2. Fetch all approved agencies
  const { data: agencies } = await supabase.from('agencies').select('id, agency_name').eq('status', 'approved');
  
  // 3. Ensure they exist in approval history (since foreign key requires it)
  const { data: history } = await supabase.from('agency_approval_history').select('agency_id');
  const validHistory = history.map(h => h.agency_id);

  let totalAdded = 0;
  for (const agency of agencies) {
    if (!validHistory.includes(agency.id)) {
      log += `Skipping ${agency.agency_name} - no history.\n`;
      continue;
    }

    const themedPackages = getPackagesForAgency(agency.agency_name);
    
    // Map with agency_id
    const toInsert = themedPackages.map(pkg => ({
      ...pkg,
      agency_id: agency.id,
      created_at: new Date().toISOString()
    }));

    // Insert
    const { data: insData, error } = await supabase.from('packages').insert(toInsert).select();
    
    if (error) {
      log += `ERROR INSERT FOR ${agency.agency_name}: ${error.message}\n`;
    } else {
      totalAdded += insData.length;
      log += `SUCCESS INSERT: ${insData.length} packages for ${agency.agency_name}\n`;
    }
  }

  log += `\nFinal Count: Added ${totalAdded} packages.\n`;
  fs.writeFileSync('full_seed_log.txt', log, 'utf8');
}

seed();
