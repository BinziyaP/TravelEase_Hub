/**
 * Destination-Specific Accommodation Database
 * Provides real accommodation data for Indian destinations
 */

// Destination-specific accommodation database
const DESTINATION_ACCOMMODATIONS = {
  // Kerala destinations
  'wayanad': [
    {
      name: 'Vythiri Resort',
      rating: '4.6',
      address: 'Vythiri, Wayanad, Kerala',
      type: 'resort',
      coordinates: { lat: 11.6086, lng: 76.0833 },
      priceRange: '$$$',
      amenities: ['Nature View', 'Spa', 'Restaurant', 'Trekking']
    },
    {
      name: 'Taj Wayanad Resort',
      rating: '4.8',
      address: 'Kalpetta, Wayanad, Kerala',
      type: 'resort',
      coordinates: { lat: 11.6086, lng: 76.0833 },
      priceRange: '$$$$',
      amenities: ['Luxury', 'Spa', 'Fine Dining', 'Adventure Activities']
    },
    {
      name: 'Green Magic Nature Resort',
      rating: '4.4',
      address: 'Vythiri, Wayanad, Kerala',
      type: 'resort',
      coordinates: { lat: 11.6086, lng: 76.0833 },
      priceRange: '$$$',
      amenities: ['Eco-friendly', 'Nature View', 'Organic Food']
    },
    {
      name: 'Wayanad Wild Resort',
      rating: '4.2',
      address: 'Sultan Bathery, Wayanad, Kerala',
      type: 'resort',
      coordinates: { lat: 11.6086, lng: 76.0833 },
      priceRange: '$$',
      amenities: ['Wildlife View', 'Adventure', 'Local Cuisine']
    }
  ],

  'idukki': [
    {
      name: 'Spice Garden Resort',
      rating: '4.3',
      address: 'Munnar Road, Idukki, Kerala',
      type: 'resort',
      coordinates: { lat: 9.8497, lng: 76.9681 },
      priceRange: '$$$',
      amenities: ['Spice Plantation', 'Mountain View', 'Local Food']
    },
    {
      name: 'High Range Hotel',
      rating: '4.1',
      address: 'Idukki Town, Kerala',
      type: 'hotel',
      coordinates: { lat: 9.8497, lng: 76.9681 },
      priceRange: '$$',
      amenities: ['Mountain View', 'Restaurant', 'Parking']
    },
    {
      name: 'Hill View Guesthouse',
      rating: '4.0',
      address: 'Cheruthoni, Idukki, Kerala',
      type: 'guesthouse',
      coordinates: { lat: 9.8497, lng: 76.9681 },
      priceRange: '$',
      amenities: ['Hill Station', 'Local Experience', 'Budget']
    }
  ],

  'munnar': [
    {
      name: 'Taj Tea Trails',
      rating: '4.7',
      address: 'Munnar, Kerala',
      type: 'resort',
      coordinates: { lat: 10.0889, lng: 77.0595 },
      priceRange: '$$$$',
      amenities: ['Tea Plantation', 'Luxury', 'Spa', 'Fine Dining']
    },
    {
      name: 'Windermere Estate',
      rating: '4.5',
      address: 'Pothamedu, Munnar, Kerala',
      type: 'resort',
      coordinates: { lat: 10.0889, lng: 77.0595 },
      priceRange: '$$$',
      amenities: ['Tea Garden', 'Mountain View', 'Organic Food']
    },
    {
      name: 'Fragrant Nature Munnar',
      rating: '4.3',
      address: 'Munnar, Kerala',
      type: 'resort',
      coordinates: { lat: 10.0889, lng: 77.0595 },
      priceRange: '$$$',
      amenities: ['Nature View', 'Adventure', 'Local Cuisine']
    },
    {
      name: 'Munnar Heritage Hotel',
      rating: '4.2',
      address: 'Munnar Town, Kerala',
      type: 'hotel',
      coordinates: { lat: 10.0889, lng: 77.0595 },
      priceRange: '$$',
      amenities: ['Heritage', 'Mountain View', 'Restaurant']
    }
  ],

  'kochi': [
    {
      name: 'Taj Malabar Resort',
      rating: '4.8',
      address: 'Willingdon Island, Kochi, Kerala',
      type: 'resort',
      coordinates: { lat: 9.9312, lng: 76.2673 },
      priceRange: '$$$$',
      amenities: ['Waterfront', 'Luxury', 'Spa', 'Fine Dining']
    },
    {
      name: 'Fort Kochi Heritage Hotel',
      rating: '4.6',
      address: 'Fort Kochi, Kerala',
      type: 'hotel',
      coordinates: { lat: 9.9312, lng: 76.2673 },
      priceRange: '$$$',
      amenities: ['Heritage', 'Cultural', 'Local Experience']
    },
    {
      name: 'Brunton Boatyard',
      rating: '4.7',
      address: 'Fort Kochi, Kerala',
      type: 'hotel',
      coordinates: { lat: 9.9312, lng: 76.2673 },
      priceRange: '$$$$',
      amenities: ['Heritage', 'Waterfront', 'Luxury']
    },
    {
      name: 'Koder House',
      rating: '4.4',
      address: 'Fort Kochi, Kerala',
      type: 'heritage_hotel',
      coordinates: { lat: 9.9312, lng: 76.2673 },
      priceRange: '$$$',
      amenities: ['Heritage', 'Cultural', 'Local Experience']
    }
  ],

  'alleppey': [
    {
      name: 'Punnamada Resort',
      rating: '4.5',
      address: 'Alleppey, Kerala',
      type: 'resort',
      coordinates: { lat: 9.4981, lng: 76.3388 },
      priceRange: '$$$',
      amenities: ['Backwater View', 'Houseboat', 'Local Cuisine']
    },
    {
      name: 'Backwater Ripples',
      rating: '4.4',
      address: 'Alleppey, Kerala',
      type: 'resort',
      coordinates: { lat: 9.4981, lng: 76.3388 },
      priceRange: '$$$',
      amenities: ['Backwater', 'Nature', 'Ayurveda']
    },
    {
      name: 'Coconut Lagoon',
      rating: '4.6',
      address: 'Kumarakom, Alleppey, Kerala',
      type: 'resort',
      coordinates: { lat: 9.4981, lng: 76.3388 },
      priceRange: '$$$$',
      amenities: ['Backwater', 'Luxury', 'Spa', 'Fine Dining']
    }
  ],

  'thiruvananthapuram': [
    {
      name: 'The Leela Kovalam',
      rating: '4.8',
      address: 'Kovalam, Thiruvananthapuram, Kerala',
      type: 'resort',
      coordinates: { lat: 8.5241, lng: 76.9366 },
      priceRange: '$$$$',
      amenities: ['Beachfront', 'Luxury', 'Spa', 'Fine Dining']
    },
    {
      name: 'Taj Green Cove Resort',
      rating: '4.6',
      address: 'Kovalam, Thiruvananthapuram, Kerala',
      type: 'resort',
      coordinates: { lat: 8.5241, lng: 76.9366 },
      priceRange: '$$$$',
      amenities: ['Beachfront', 'Luxury', 'Spa', 'Water Sports']
    },
    {
      name: 'Hotel Pankaj',
      rating: '4.2',
      address: 'Thiruvananthapuram, Kerala',
      type: 'hotel',
      coordinates: { lat: 8.5241, lng: 76.9366 },
      priceRange: '$$',
      amenities: ['City Center', 'Restaurant', 'Parking']
    }
  ],

  'kozhikode': [
    {
      name: 'The Gateway Hotel',
      rating: '4.5',
      address: 'Kozhikode, Kerala',
      type: 'hotel',
      coordinates: { lat: 11.2588, lng: 75.7804 },
      priceRange: '$$$',
      amenities: ['Business', 'Restaurant', 'Conference']
    },
    {
      name: 'Hotel Malabar Palace',
      rating: '4.3',
      address: 'Kozhikode, Kerala',
      type: 'hotel',
      coordinates: { lat: 11.2588, lng: 75.7804 },
      priceRange: '$$',
      amenities: ['Heritage', 'Local Cuisine', 'Parking']
    },
    {
      name: 'Beach Hotel Calicut',
      rating: '4.1',
      address: 'Kozhikode Beach, Kerala',
      type: 'hotel',
      coordinates: { lat: 11.2588, lng: 75.7804 },
      priceRange: '$$',
      amenities: ['Beachfront', 'Local Food', 'Budget']
    }
  ],

  // Major cities
  'delhi': [
    {
      name: 'Taj Palace Hotel',
      rating: '4.8',
      address: 'Chanakyapuri, New Delhi',
      type: 'hotel',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      priceRange: '$$$$',
      amenities: ['Luxury', 'Spa', 'Fine Dining', 'Business']
    },
    {
      name: 'The Leela Palace',
      rating: '4.7',
      address: 'Chanakyapuri, New Delhi',
      type: 'hotel',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      priceRange: '$$$$',
      amenities: ['Luxury', 'Spa', 'Fine Dining', 'Heritage']
    },
    {
      name: 'Hotel Imperial',
      rating: '4.6',
      address: 'Janpath, New Delhi',
      type: 'hotel',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      priceRange: '$$$',
      amenities: ['Heritage', 'Fine Dining', 'Cultural']
    },
    {
      name: 'The Park Hotel',
      rating: '4.5',
      address: 'Connaught Place, New Delhi',
      type: 'hotel',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      priceRange: '$$$',
      amenities: ['Business', 'Restaurant', 'Shopping']
    }
  ],

  'mumbai': [
    {
      name: 'Taj Mahal Palace',
      rating: '4.9',
      address: 'Colaba, Mumbai',
      type: 'hotel',
      coordinates: { lat: 19.0760, lng: 72.8777 },
      priceRange: '$$$$',
      amenities: ['Luxury', 'Heritage', 'Fine Dining', 'Waterfront']
    },
    {
      name: 'The Oberoi',
      rating: '4.8',
      address: 'Nariman Point, Mumbai',
      type: 'hotel',
      coordinates: { lat: 19.0760, lng: 72.8777 },
      priceRange: '$$$$',
      amenities: ['Luxury', 'Business', 'Fine Dining', 'Spa']
    },
    {
      name: 'ITC Maratha',
      rating: '4.7',
      address: 'Andheri, Mumbai',
      type: 'hotel',
      coordinates: { lat: 19.0760, lng: 72.8777 },
      priceRange: '$$$$',
      amenities: ['Luxury', 'Business', 'Spa', 'Fine Dining']
    }
  ],

  'bangalore': [
    {
      name: 'The Leela Palace',
      rating: '4.8',
      address: 'Old Airport Road, Bangalore',
      type: 'hotel',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      priceRange: '$$$$',
      amenities: ['Luxury', 'Business', 'Spa', 'Fine Dining']
    },
    {
      name: 'ITC Gardenia',
      rating: '4.7',
      address: 'Residency Road, Bangalore',
      type: 'hotel',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      priceRange: '$$$$',
      amenities: ['Luxury', 'Business', 'Spa', 'Fine Dining']
    },
    {
      name: 'JW Marriott',
      rating: '4.6',
      address: 'Vittal Mallya Road, Bangalore',
      type: 'hotel',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      priceRange: '$$$',
      amenities: ['Business', 'Restaurant', 'Fitness', 'Spa']
    }
  ],

  'goa': [
    {
      name: 'Taj Exotica Resort',
      rating: '4.7',
      address: 'Benaulim, Goa',
      type: 'resort',
      coordinates: { lat: 15.2993, lng: 73.9440 },
      priceRange: '$$$$',
      amenities: ['Beachfront', 'Luxury', 'Spa', 'Water Sports']
    },
    {
      name: 'The Leela Goa',
      rating: '4.6',
      address: 'Cavelossim, Goa',
      type: 'resort',
      coordinates: { lat: 15.2993, lng: 73.9440 },
      priceRange: '$$$$',
      amenities: ['Beachfront', 'Luxury', 'Spa', 'Golf']
    },
    {
      name: 'ITC Grand Goa',
      rating: '4.5',
      address: 'Cavelossim, Goa',
      type: 'resort',
      coordinates: { lat: 15.2993, lng: 73.9440 },
      priceRange: '$$$',
      amenities: ['Beachfront', 'Spa', 'Water Sports', 'Fine Dining']
    }
  ],

  'jaipur': [
    {
      name: 'Rambagh Palace',
      rating: '4.8',
      address: 'Jaipur, Rajasthan',
      type: 'palace_hotel',
      coordinates: { lat: 26.9124, lng: 75.7873 },
      priceRange: '$$$$',
      amenities: ['Heritage', 'Luxury', 'Palace', 'Fine Dining']
    },
    {
      name: 'The Oberoi Rajvilas',
      rating: '4.7',
      address: 'Jaipur, Rajasthan',
      type: 'resort',
      coordinates: { lat: 26.9124, lng: 75.7873 },
      priceRange: '$$$$',
      amenities: ['Luxury', 'Heritage', 'Spa', 'Cultural']
    },
    {
      name: 'ITC Rajputana',
      rating: '4.6',
      address: 'Jaipur, Rajasthan',
      type: 'hotel',
      coordinates: { lat: 26.9124, lng: 75.7873 },
      priceRange: '$$$',
      amenities: ['Heritage', 'Cultural', 'Fine Dining', 'Spa']
    }
  ],

  'agra': [
    {
      name: 'Taj Hotel & Convention Centre',
      rating: '4.7',
      address: 'Agra, Uttar Pradesh',
      type: 'hotel',
      coordinates: { lat: 27.1767, lng: 78.0081 },
      priceRange: '$$$$',
      amenities: ['Taj View', 'Luxury', 'Fine Dining', 'Heritage']
    },
    {
      name: 'The Oberoi Amarvilas',
      rating: '4.8',
      address: 'Agra, Uttar Pradesh',
      type: 'hotel',
      coordinates: { lat: 27.1767, lng: 78.0081 },
      priceRange: '$$$$',
      amenities: ['Taj View', 'Luxury', 'Fine Dining', 'Heritage']
    },
    {
      name: 'ITC Mughal',
      rating: '4.6',
      address: 'Agra, Uttar Pradesh',
      type: 'hotel',
      coordinates: { lat: 27.1767, lng: 78.0081 },
      priceRange: '$$$',
      amenities: ['Heritage', 'Cultural', 'Fine Dining', 'Spa']
    }
  ]
};

/**
 * Get destination-specific accommodations
 * @param {string} destination - Destination name
 * @param {number} limit - Maximum number of results
 * @returns {Array} Array of accommodation objects
 */
function getDestinationAccommodations(destination, limit = 10) {
  if (!destination) return [];
  
  const normalizedDestination = destination.toLowerCase().trim();
  
  // Direct match
  if (DESTINATION_ACCOMMODATIONS[normalizedDestination]) {
    return DESTINATION_ACCOMMODATIONS[normalizedDestination].slice(0, limit);
  }
  
  // Partial match for common variations
  for (const [key, accommodations] of Object.entries(DESTINATION_ACCOMMODATIONS)) {
    if (normalizedDestination.includes(key) || key.includes(normalizedDestination)) {
      return accommodations.slice(0, limit);
    }
  }
  
  // Handle common aliases
  const aliases = {
    'trivandrum': 'thiruvananthapuram',
    'calicut': 'kozhikode',
    'cochin': 'kochi',
    'madras': 'chennai',
    'calcutta': 'kolkata',
    'bombay': 'mumbai',
    'baroda': 'vadodara',
    'benares': 'varanasi',
    'mysuru': 'mysore',
    'bangaluru': 'bangalore'
  };
  
  const aliasKey = aliases[normalizedDestination];
  if (aliasKey && DESTINATION_ACCOMMODATIONS[aliasKey]) {
    return DESTINATION_ACCOMMODATIONS[aliasKey].slice(0, limit);
  }
  
  // If no specific accommodations found, return empty array
  console.log(`No specific accommodations found for: ${destination}`);
  return [];
}

/**
 * Check if destination has specific accommodations
 * @param {string} destination - Destination name
 * @returns {boolean} Whether destination has specific accommodations
 */
function hasDestinationAccommodations(destination) {
  return getDestinationAccommodations(destination).length > 0;
}

module.exports = {
  DESTINATION_ACCOMMODATIONS,
  getDestinationAccommodations,
  hasDestinationAccommodations
};
