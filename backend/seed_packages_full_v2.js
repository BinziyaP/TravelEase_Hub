const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define 4 packages per theme with COMPLETE consecutive itineraries
const himalayanPackages = [
  {
    name: 'Everest Base Camp Trek', destination: 'Himalayas, Nepal', duration_days: 12, price: 85000, max_travelers: 10, status: 'approved', available_slots: 10,
    accommodation_type: 'guesthouse', accommodation_name: 'Tea Houses', attractions: ['Namche Bazaar', 'Tengboche Monastery', 'Everest Base Camp', 'Kala Patthar'],
    route_coordinates: [{lat: 27.6915, lng: 86.7324}, {lat: 28.0026, lng: 86.8526}], total_distance_km: 130, estimated_travel_time_hours: 90,
    description: 'The ultimate trekking experience to the base of the highest mountain in the world.',
    itinerary: [
      { day: 1, title: 'Arrival in Kathmandu', description: 'Arrive in Kathmandu, hotel check-in and briefing.' },
      { day: 2, title: 'Flight to Lukla', description: 'Scenic flight to Lukla, begin trek to Phakding.' },
      { day: 3, title: 'Trek to Namche Bazaar', description: 'Steep climb through pine forests to the Sherpa capital.' },
      { day: 4, title: 'Acclimatization Day', description: 'Rest day in Namche Bazaar, hike to Everest View Hotel.' },
      { day: 5, title: 'Trek to Tengboche', description: 'Trek to the famous Tengboche Monastery.' },
      { day: 6, title: 'Trek to Dingboche', description: 'Walk through alpine meadows to Dingboche.' },
      { day: 7, title: 'Acclimatization Day', description: 'Rest day in Dingboche, hike to Nagarjun Hill.' },
      { day: 8, title: 'Trek to Lobuche', description: 'Walk beside the Khumbu Glacier moraine.' },
      { day: 9, title: 'Everest Base Camp', description: 'Trek to Gorak Shep, then to Everest Base Camp!' },
      { day: 10, title: 'Kala Patthar Sunrise', description: 'Early hike to Kala Patthar for sunrise views, trek down to Pheriche.' },
      { day: 11, title: 'Return to Namche', description: 'Descend back to Namche Bazaar.' },
      { day: 12, title: 'Return to Lukla & Fly', description: 'Final trek day to Lukla, farewell dinner.' }
    ]
  },
  {
    name: 'Valley of Flowers Trek', destination: 'Uttarakhand, India', duration_days: 6, price: 15000, max_travelers: 15, status: 'approved', available_slots: 15,
    accommodation_type: 'hotel', accommodation_name: 'Ghangaria Camp', attractions: ['Valley of Flowers', 'Hemkund Sahib', 'Joshimath'],
    route_coordinates: [{lat: 30.5520, lng: 79.5645}, {lat: 30.7280, lng: 79.5841}], total_distance_km: 40, estimated_travel_time_hours: 24,
    description: 'A mesmerizing trek through a vibrant high-altitude Himalayan valley blooming with alpine flowers.',
    itinerary: [
      { day: 1, title: 'Haridwar to Joshimath', description: 'Drive to Joshimath along the Alaknanda river.' },
      { day: 2, title: 'Joshimath to Ghangaria', description: 'Drive to Govindghat, trek up to Ghangaria basecamp.' },
      { day: 3, title: 'Valley of Flowers', description: 'Trek into the stunning floral valley and explore its beauty.' },
      { day: 4, title: 'Hemkund Sahib', description: 'Steep trek to the serene Sikh pilgrimage lake, Hemkund Sahib.' },
      { day: 5, title: 'Return to Joshimath', description: 'Trek down to Govindghat and drive back to Joshimath.' },
      { day: 6, title: 'Departure', description: 'Morning departure to Haridwar.' }
    ]
  },
  {
    name: 'Leh Ladakh Road Trip', destination: 'Ladakh, India', duration_days: 8, price: 35000, max_travelers: 12, status: 'approved', available_slots: 12,
    accommodation_type: 'resort', accommodation_name: 'Pangong Camps', attractions: ['Pangong Tso', 'Nubra Valley', 'Khardung La', 'Magnetic Hill'],
    route_coordinates: [{lat: 34.1526, lng: 77.5771}, {lat: 33.7595, lng: 78.6674}], total_distance_km: 700, estimated_travel_time_hours: 40,
    description: 'A thrilling road trip across high mountain passes, cold deserts, and pristine blue lakes.',
    itinerary: [
      { day: 1, title: 'Arrive in Leh', description: 'Rest and acclimatize to the high altitude of Leh.' },
      { day: 2, title: 'Leh Local Sightseeing', description: 'Visit Shanti Stupa, Leh Palace, and local markets.' },
      { day: 3, title: 'Magnetic Hill & Sangam', description: 'Drive to Magnetic Hill and witness the Indus-Zanskar confluence.' },
      { day: 4, title: 'Nubra Valley via Khardung La', description: 'Drive across the world\'s highest motorable pass to Nubra Valley.' },
      { day: 5, title: 'Hunder Sand Dunes', description: 'Enjoy a double-humped camel safari in the high altitude desert.' },
      { day: 6, title: 'Pangong Lake', description: 'Drive to the majestic Pangong Tso lake and check into camps.' },
      { day: 7, title: 'Return to Leh', description: 'Witness sunrise at the lake, drive back to Leh.' },
      { day: 8, title: 'Departure', description: 'Airport drop for onward journey.' }
    ]
  },
  {
    name: 'Spiti Valley Expedition', destination: 'Spiti, Himachal Pradesh', duration_days: 7, price: 28000, max_travelers: 8, status: 'approved', available_slots: 8,
    accommodation_type: 'guesthouse', accommodation_name: 'Kaza Homestay', attractions: ['Key Monastery', 'Chandratal Lake', 'Kunzum Pass', 'Kibber'],
    route_coordinates: [{lat: 32.2217, lng: 78.0310}, {lat: 32.4824, lng: 77.6322}], total_distance_km: 400, estimated_travel_time_hours: 30,
    description: 'Explore the rugged and remote cold desert mountains of Spiti Valley in this thrilling expedition.',
    itinerary: [
      { day: 1, title: 'Manali to Kaza', description: 'Long drive via Rohtang and Kunzum Pass into Spiti Valley.' },
      { day: 2, title: 'Kaza Local', description: 'Rest, acclimatize, and explore Kaza market.' },
      { day: 3, title: 'Key Monastery & Kibber', description: 'Visit the iconic Key Monastery and highest motorable village.' },
      { day: 4, title: 'Langza & Hikkim', description: 'Visit fossil village Langza and highest post office at Hikkim.' },
      { day: 5, title: 'Pin Valley', description: 'Day trip to the scenic Pin Valley National Park.' },
      { day: 6, title: 'Chandratal Lake', description: 'Drive to the breathtaking crescent-shaped moon lake.' },
      { day: 7, title: 'Return to Manali', description: 'Depart Chandratal and drive back to Manali.' }
    ]
  }
];

const coastalPackages = [
  {
    name: 'Maldives Overwater Bliss', destination: 'Maldives', duration_days: 5, price: 95000, max_travelers: 2, status: 'approved', available_slots: 2,
    accommodation_type: 'resort', accommodation_name: 'Ozen Reserve', attractions: ['Male City', 'Snorkeling', 'Private Beach', 'Sunset Cruise'],
    route_coordinates: [{lat: 4.1755, lng: 73.5093}, {lat: 4.0000, lng: 73.0000}], total_distance_km: 50, estimated_travel_time_hours: 2,
    description: 'An ultra-luxurious 5-day escape in a private overwater villa surrounded by turquoise waters.',
    itinerary: [
      { day: 1, title: 'Arrival', description: 'Speedboat transfer to your water villa, welcome drinks.' },
      { day: 2, title: 'Beach Day', description: 'Relax on the private white sand beach and enjoy the clear waters.' },
      { day: 3, title: 'Snorkeling', description: 'Guided snorkeling session at the vibrant house reef.' },
      { day: 4, title: 'Sunset Cruise', description: 'Romantic evening sailing on a traditional dhoni.' },
      { day: 5, title: 'Departure', description: 'Speedboat transfer back to the airport.' }
    ]
  },
  {
    name: 'Andaman Island Explorer', destination: 'Andaman Islands, India', duration_days: 6, price: 32000, max_travelers: 20, status: 'approved', available_slots: 20,
    accommodation_type: 'hotel', accommodation_name: 'Sea Shell Hotel', attractions: ['Radhanagar Beach', 'Cellular Jail', 'Ross Island', 'Elephant Beach'],
    route_coordinates: [{lat: 11.6234, lng: 92.7265}, {lat: 11.9866, lng: 92.9845}], total_distance_km: 150, estimated_travel_time_hours: 6,
    description: 'Discover pristine beaches, rich colonial history, and vibrant coral reefs in the Andamans.',
    itinerary: [
      { day: 1, title: 'Port Blair', description: 'Arrival. Visit Cellular Jail and witness the Light & Sound show.' },
      { day: 2, title: 'Ross Island', description: 'Explore the colonial ruins of Ross & North Bay islands.' },
      { day: 3, title: 'Ferry to Havelock', description: 'Take a cruise to Havelock Island, check-in to resort.' },
      { day: 4, title: 'Radhanagar Beach', description: 'Relax at Radhanagar Beach, known as Asia\'s best beach.' },
      { day: 5, title: 'Elephant Beach Water Sports', description: 'Snorkeling and scuba diving at Elephant Beach.' },
      { day: 6, title: 'Return', description: 'Ferry back to Port Blair and airport drop.' }
    ]
  },
  {
    name: 'Bali Tropical Getaway', destination: 'Bali, Indonesia', duration_days: 7, price: 45000, max_travelers: 15, status: 'approved', available_slots: 15,
    accommodation_type: 'resort', accommodation_name: 'Ubud Village Resort', attractions: ['Uluwatu Temple', 'Ubud Monkey Forest', 'Seminyak Beach', 'Nusa Penida'],
    route_coordinates: [{lat: -8.4095, lng: 115.1889}, {lat: -8.7392, lng: 115.4808}], total_distance_km: 200, estimated_travel_time_hours: 15,
    description: 'Experience the perfect blend of exotic culture, lush rice terraces, and beautiful beaches in Bali.',
    itinerary: [
      { day: 1, title: 'Welcome to Bali', description: 'Airport pickup, check-in at Ubud resort and relax.' },
      { day: 2, title: 'Ubud Tour', description: 'Visit the Monkey Forest, Tegalalang Rice Terraces, and local markets.' },
      { day: 3, title: 'Mount Batur Sunrise', description: 'Early morning hike to Mount Batur for sunrise.' },
      { day: 4, title: 'Nusa Penida Excursion', description: 'Full day boat trip to Kelingking beach & Angel\'s Billabong.' },
      { day: 5, title: 'Uluwatu & Fire Dance', description: 'Visit the cliff-top Uluwatu Temple to watch the Kecak Fire Dance.' },
      { day: 6, title: 'Seminyak Beach Club', description: 'Relax by the ocean at a famous Seminyak beach club.' },
      { day: 7, title: 'Departure', description: 'Last minute shopping and transfer to the airport.' }
    ]
  },
  {
    name: 'Goa Coastal Carnival', destination: 'Goa, India', duration_days: 5, price: 16000, max_travelers: 25, status: 'approved', available_slots: 25,
    accommodation_type: 'hotel', accommodation_name: 'Taj Aguada', attractions: ['Baga Beach', 'Aguada Fort', 'Basilica of Bom Jesus', 'Dudhsagar Falls'],
    route_coordinates: [{lat: 15.2993, lng: 74.1240}, {lat: 15.5494, lng: 73.7538}], total_distance_km: 80, estimated_travel_time_hours: 3,
    description: 'A vibrant tour combining Goan beach parties, historical sites, and exquisite seafood.',
    itinerary: [
      { day: 1, title: 'Arrival', description: 'Check-in to your resort and enjoy the evening at leisure.' },
      { day: 2, title: 'North Goa beaches', description: 'Explore Baga, Calangute, and Anjuna beaches.' },
      { day: 3, title: 'Forts and Churches', description: 'Visit Fort Aguada and the historical Old Goa churches.' },
      { day: 4, title: 'Dudhsagar Excursion', description: 'Day trip to Dudhsagar Falls and a spice plantation tour.' },
      { day: 5, title: 'Departure', description: 'Check-out and transfer to the airport.' }
    ]
  }
];

const desertPackages = [
  {
    name: 'Dubai Desert Safari & City', destination: 'Dubai, UAE', duration_days: 5, price: 55000, max_travelers: 15, status: 'approved', available_slots: 15,
    accommodation_type: 'hotel', accommodation_name: 'Atlantis The Palm', attractions: ['Burj Khalifa', 'Dubai Mall', 'Desert Safari', 'Palm Jumeirah'],
    route_coordinates: [{lat: 25.2048, lng: 55.2708}, {lat: 24.9602, lng: 55.4410}], total_distance_km: 300, estimated_travel_time_hours: 10,
    description: 'Experience the ultra-modern luxury of Dubai combined with a traditional Arabian desert safari.',
    itinerary: [
      { day: 1, title: 'Arrival', description: 'Airport pickup and check-in to your hotel. Evening Dhow Cruise.' },
      { day: 2, title: 'City Tour', description: 'Visit Dubai Frame, Jumeirah Mosque, and the Gold Souk.' },
      { day: 3, title: 'Burj Khalifa & Mall', description: 'Ascend the Burj Khalifa and explore the massive Dubai Mall.' },
      { day: 4, title: 'Desert Safari', description: 'Evening dune bashing, camel ride, belly dancing, and BBQ dinner.' },
      { day: 5, title: 'Departure', description: 'Transfer to the Dubai International Airport.' }
    ]
  },
  {
    name: 'Royal Rajasthan Tour', destination: 'Rajasthan, India', duration_days: 7, price: 32000, max_travelers: 20, status: 'approved', available_slots: 20,
    accommodation_type: 'hotel', accommodation_name: 'Suryagarh Jaisalmer', attractions: ['Amber Fort', 'City Palace Udaipur', 'Thar Desert', 'Mehrangarh Fort'],
    route_coordinates: [{lat: 26.9124, lng: 75.7873}, {lat: 26.2389, lng: 73.0243}], total_distance_km: 900, estimated_travel_time_hours: 20,
    description: 'Journey through the royal palaces, vibrant forts, and majestic sand dunes of Rajasthan.',
    itinerary: [
      { day: 1, title: 'Arrive in Jaipur', description: 'Check-in and evening visit to Chokhi Dhani.' },
      { day: 2, title: 'Jaipur Sightseeing', description: 'Visit Amber Fort, Hawa Mahal, and City Palace.' },
      { day: 3, title: 'Jodhpur', description: 'Drive to Jodhpur, the Blue City. Visit Mehrangarh Fort.' },
      { day: 4, title: 'Drive to Jaisalmer', description: 'Drive to the Golden City, explore Jaisalmer Fort.' },
      { day: 5, title: 'Thar Desert Safari', description: 'Overnight desert camp in the Sam Sand Dunes with folk music.' },
      { day: 6, title: 'Udaipur', description: 'Drive to Udaipur, evening boat ride on Lake Pichola.' },
      { day: 7, title: 'Departure', description: 'Tour Udaipur City Palace and depart.' }
    ]
  },
  {
    name: 'Morocco Sahara Adventure', destination: 'Marrakech & Sahara, Morocco', duration_days: 7, price: 78000, max_travelers: 12, status: 'approved', available_slots: 12,
    accommodation_type: 'guesthouse', accommodation_name: 'Luxury Sahara Camp', attractions: ['Marrakech Medina', 'Atlas Mountains', 'Ait Benhaddou', 'Erg Chebbi Dunes'],
    route_coordinates: [{lat: 31.6295, lng: -7.9811}, {lat: 31.5142, lng: -4.0531}], total_distance_km: 600, estimated_travel_time_hours: 18,
    description: 'A magical journey from the bustling souks of Marrakech to the endless sands of the Sahara.',
    itinerary: [
      { day: 1, title: 'Marrakech', description: 'Arrival. Explore the vibrant Medina and Jemaa el-Fnaa square.' },
      { day: 2, title: 'Atlas Mountains', description: 'Drive through the scenic High Atlas Mountains.' },
      { day: 3, title: 'Ait Benhaddou', description: 'Visit the famous UNESCO World Heritage village.' },
      { day: 4, title: 'Dades Gorge', description: 'Walk through the towering canyon walls.' },
      { day: 5, title: 'Sahara Glamping', description: 'Camel trek at sunset and night under the stars in Erg Chebbi.' },
      { day: 6, title: 'Return to Marrakech', description: 'Long scenic drive back to the city.' },
      { day: 7, title: 'Departure', description: 'Final tagine lunch and airport drop.' }
    ]
  },
  {
    name: 'Egypt Pyramids & Desert', destination: 'Egypt', duration_days: 6, price: 65000, max_travelers: 15, status: 'approved', available_slots: 15,
    accommodation_type: 'hotel', accommodation_name: 'Mena House', attractions: ['Giza Pyramids', 'Sphinx', 'White Desert', 'Egyptian Museum'],
    route_coordinates: [{lat: 30.0444, lng: 31.2357}, {lat: 27.3592, lng: 27.9698}], total_distance_km: 500, estimated_travel_time_hours: 14,
    description: 'Witness the iconic Pyramids of Giza and camp in the surreal landscape of the White Desert.',
    itinerary: [
      { day: 1, title: 'Arrival in Cairo', description: 'Check-in to a hotel overlooking the Pyramids.' },
      { day: 2, title: 'Giza Tour', description: 'Full day tour of the Pyramids, Sphinx, and the Egyptian Museum.' },
      { day: 3, title: 'Drive to Bahariya', description: 'Drive into the desert oasis of Bahariya.' },
      { day: 4, title: 'White Desert Camp', description: '4x4 safari and overnight camping in the chalky White Desert.' },
      { day: 5, title: 'Return to Cairo', description: 'Drive back to Cairo, evening Khan el-Khalili bazaar walk.' },
      { day: 6, title: 'Departure', description: 'Transfer to Cairo airport.' }
    ]
  }
];

const wanderlustPackages = [
  {
    name: 'European Backpacker Trail', destination: 'Europe (France, Italy, Swiss)', duration_days: 10, price: 145000, max_travelers: 10, status: 'approved', available_slots: 10,
    accommodation_type: 'hostel', accommodation_name: 'Generator Hostels', attractions: ['Eiffel Tower', 'Swiss Alps', 'Colosseum', 'Venice Canals'],
    route_coordinates: [{lat: 48.8566, lng: 2.3522}, {lat: 41.9028, lng: 12.4964}], total_distance_km: 2500, estimated_travel_time_hours: 60,
    description: 'An immersive multi-country European journey designed for the adventurous backpacker.',
    itinerary: [
      { day: 1, title: 'Arrive in Paris', description: 'Explore the romantic streets of Paris and the Eiffel Tower.' },
      { day: 2, title: 'Louvre & Seine', description: 'Visit the Louvre museum and take a cruise on the Seine.' },
      { day: 3, title: 'Train to Switzerland', description: 'Scenic train journey to Interlaken.' },
      { day: 4, title: 'Jungfraujoch', description: 'Train ride to the Top of Europe.' },
      { day: 5, title: 'Train to Venice', description: 'Cross into Italy, evening gondola ride in Venice.' },
      { day: 6, title: 'Venice Exploration', description: 'Wander the canals and visit St. Mark\'s Square.' },
      { day: 7, title: 'Train to Rome', description: 'Travel to Rome, taste authentic Italian pizza.' },
      { day: 8, title: 'Colosseum', description: 'Visit the Colosseum and Roman Forum.' },
      { day: 9, title: 'Vatican City', description: 'Tour the Vatican Museums and Sistine Chapel.' },
      { day: 10, title: 'Departure', description: 'Fly home from Rome.' }
    ]
  },
  {
    name: 'Japan Cherry Blossom Tour', destination: 'Tokyo & Kyoto, Japan', duration_days: 8, price: 115000, max_travelers: 15, status: 'approved', available_slots: 15,
    accommodation_type: 'hotel', accommodation_name: 'Shinjuku Prince Hotel', attractions: ['Mount Fuji', 'Kyoto Temples', 'Shibuya Crossing', 'Osaka Castle'],
    route_coordinates: [{lat: 35.6762, lng: 139.6503}, {lat: 35.0116, lng: 135.7681}], total_distance_km: 500, estimated_travel_time_hours: 8,
    description: 'Witness the breathtaking beauty of Japan during the spring cherry blossom season.',
    itinerary: [
      { day: 1, title: 'Tokyo', description: 'Experience the electric energy of Tokyo and Shibuya.' },
      { day: 2, title: 'Asakusa & Ueno', description: 'Visit Senso-ji temple and enjoy cherry blossoms in Ueno Park.' },
      { day: 3, title: 'Mt Fuji', description: 'Day trip to Mount Fuji and Lake Kawaguchiko.' },
      { day: 4, title: 'Bullet Train to Kyoto', description: 'Take the Shinkansen to Kyoto, visit Fushimi Inari.' },
      { day: 5, title: 'Kyoto Temples', description: 'Tour the Golden Pavilion and Arashiyama Bamboo Grove.' },
      { day: 6, title: 'Osaka Castle', description: 'Day trip to Osaka to see the castle and Dotonbori food street.' },
      { day: 7, title: 'Nara Deer Park', description: 'Visit the giant Buddha in Nara and feed the wild deer.' },
      { day: 8, title: 'Departure', description: 'Bullet train back to Tokyo for departure.' }
    ]
  },
  {
    name: 'Kerala God\'s Own Country', destination: 'Kerala, India', duration_days: 6, price: 24000, max_travelers: 18, status: 'approved', available_slots: 18,
    accommodation_type: 'resort', accommodation_name: 'Kumarakom Lake Resort', attractions: ['Alleppey Houseboats', 'Munnar Tea Gardens', 'Kochi Fort', 'Thekkady'],
    route_coordinates: [{lat: 9.9312, lng: 76.2673}, {lat: 9.4981, lng: 76.3388}], total_distance_km: 300, estimated_travel_time_hours: 10,
    description: 'A serene trip through the lush backwaters, spice plantations, and historic forts of Kerala.',
    itinerary: [
      { day: 1, title: 'Kochi Arrival', description: 'Tour Fort Kochi, Jewish Synagogue, and Chinese Fishing Nets.' },
      { day: 2, title: 'Drive to Munnar', description: 'Scenic drive to the tea gardens of Munnar.' },
      { day: 3, title: 'Munnar Sightseeing', description: 'Visit Eravikulam National Park and Mattupetty Dam.' },
      { day: 4, title: 'Thekkady Spices', description: 'Wildlife safari at Periyar and an spice plantation tour.' },
      { day: 5, title: 'Alleppey Houseboat', description: 'Overnight stay in a traditional Kerala Houseboat cruising the backwaters.' },
      { day: 6, title: 'Departure', description: 'Return to Kochi airport.' }
    ]
  },
  {
    name: 'Thailand Cultural Odyssey', destination: 'Bangkok & Chiang Mai, Thailand', duration_days: 7, price: 36000, max_travelers: 20, status: 'approved', available_slots: 20,
    accommodation_type: 'hotel', accommodation_name: 'Amari Watergate', attractions: ['Grand Palace', 'Ayutthaya', 'Doi Suthep', 'Elephant Sanctuary'],
    route_coordinates: [{lat: 13.7563, lng: 100.5018}, {lat: 18.7883, lng: 98.9853}], total_distance_km: 700, estimated_travel_time_hours: 14,
    description: 'Experience the rich Buddhist culture, vibrant street food, and nature of Thailand.',
    itinerary: [
      { day: 1, title: 'Arrival in Bangkok', description: 'Check-in and evening visit to the glowing night markets.' },
      { day: 2, title: 'Grand Palace', description: 'Tour the Grand Palace, Wat Phra Kaew, and Wat Arun.' },
      { day: 3, title: 'Ayutthaya Ruins', description: 'Day trip to the ancient historical ruins of Ayutthaya.' },
      { day: 4, title: 'Fly to Chiang Mai', description: 'Catch a short flight north to Chiang Mai.' },
      { day: 5, title: 'Elephant Sanctuary', description: 'Spend an ethical, interactive day bathing elephants.' },
      { day: 6, title: 'Doi Suthep Temple', description: 'Visit the beautiful mountain temple of Doi Suthep.' },
      { day: 7, title: 'Departure', description: 'Shopping and airport drop.' }
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
  let delResp = await supabase.from('packages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  log += 'Cleared existing packages. Error: ' + (delResp.error ? delResp.error.message : 'none') + '\n';

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
    
    // Map with agency_id and proper itinerary
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
  fs.writeFileSync('full_seed_log_v2.txt', log, 'utf8');
}

seed();
