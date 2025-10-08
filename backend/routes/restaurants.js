const express = require('express');
const router = express.Router();
const axios = require('axios');

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// In-memory cache for API responses (in production, use Redis)
const cache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Helper function to check cache
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

// Helper function to set cache
const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Google Places API integration for restaurants
const searchRestaurantsWithGooglePlaces = async (location, cuisine = null, radius = 25000) => {
  try {
    console.log(`🔍 Searching restaurants in ${location} using Google Places API${cuisine ? ` for ${cuisine} cuisine` : ''}`);
    
    // Step 1: Geocode the location to get coordinates
    const geocodeUrl = `${GOOGLE_PLACES_BASE_URL}/textsearch/json`;
    const geocodeParams = {
      query: location,
      key: GOOGLE_PLACES_API_KEY
    };
    
    const geocodeResponse = await axios.get(geocodeUrl, { params: geocodeParams });
    const geocodeData = geocodeResponse.data;
    
    if (geocodeData.status !== 'OK' || !geocodeData.results || geocodeData.results.length === 0) {
      throw new Error(`Geocoding failed for location: ${location}`);
    }
    
    const locationCoords = geocodeData.results[0].geometry.location;
    console.log(`📍 Location coordinates: ${locationCoords.lat}, ${locationCoords.lng}`);
    
    // Step 2: Search for restaurants near the location
    const nearbySearchUrl = `${GOOGLE_PLACES_BASE_URL}/nearbysearch/json`;
    const nearbySearchParams = {
      location: `${locationCoords.lat},${locationCoords.lng}`,
      radius: radius,
      type: 'restaurant',
      key: GOOGLE_PLACES_API_KEY
    };
    
    // Add cuisine filter if specified
    if (cuisine) {
      nearbySearchParams.keyword = cuisine;
    }
    
    const nearbyResponse = await axios.get(nearbySearchUrl, { params: nearbySearchParams });
    const nearbyData = nearbyResponse.data;
    
    if (nearbyData.status !== 'OK' || !nearbyData.results) {
      throw new Error(`Nearby search failed for location: ${location}`);
    }
    
    console.log(`🍽️ Found ${nearbyData.results.length} restaurants`);
    
    // Step 3: Get detailed information for each restaurant
    const restaurantPromises = nearbyData.results.slice(0, 10).map(async (place) => {
      try {
        const detailsUrl = `${GOOGLE_PLACES_BASE_URL}/details/json`;
        const detailsParams = {
          place_id: place.place_id,
          fields: 'name,rating,user_ratings_total,formatted_address,types,geometry,photos,price_level,opening_hours,reviews,website',
          key: GOOGLE_PLACES_API_KEY
        };
        
        const detailsResponse = await axios.get(detailsUrl, { params: detailsParams });
        const detailsData = detailsResponse.data;
        
        if (detailsData.status === 'OK' && detailsData.result) {
          const restaurant = detailsData.result;
          
          // Determine cuisine type from types array
          const cuisineTypes = restaurant.types?.filter(type => 
            ['meal_takeaway', 'meal_delivery', 'restaurant', 'food', 'cafe', 'bakery'].includes(type)
          ) || ['restaurant'];
          
          return {
            name: restaurant.name,
            rating: restaurant.rating ? restaurant.rating.toString() : 'N/A',
            user_ratings_total: restaurant.user_ratings_total || 0,
            address: restaurant.formatted_address,
            cuisine: cuisine || 'Local',
            types: restaurant.types || [],
            coordinates: restaurant.geometry?.location,
            price_level: restaurant.price_level || null,
            photos: restaurant.photos?.slice(0, 3) || [],
            opening_hours: restaurant.opening_hours?.weekday_text || [],
            reviews: restaurant.reviews?.slice(0, 3) || [],
            website: restaurant.website || null,
            place_id: place.place_id,
            source: 'google_places'
          };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching details for restaurant ${place.place_id}:`, error.message);
        return null;
      }
    });
    
    const restaurants = (await Promise.all(restaurantPromises)).filter(restaurant => restaurant !== null);
    console.log(`✅ Successfully processed ${restaurants.length} restaurants from Google Places`);
    
    return restaurants;
    
  } catch (error) {
    console.error('❌ Google Places API error for restaurants:', error.message);
    throw error;
  }
};

// Enhanced fallback system for restaurants
const getFallbackRestaurants = async (location, cuisine = null) => {
  console.log(`🔄 Using fallback system for restaurants in: ${location}${cuisine ? ` (${cuisine} cuisine)` : ''}`);
  
  // Try multiple fallback strategies
  const fallbackStrategies = [
    // Strategy 1: Location-specific curated data
    getCuratedRestaurantsForLocation(location, cuisine),
    
    // Strategy 2: Generic location-based data
    getGenericRestaurantsForLocation(location, cuisine),
    
    // Strategy 3: Default mock data
    getMockRestaurants(location)
  ];
  
  for (const strategy of fallbackStrategies) {
    try {
      const restaurants = await strategy;
      if (restaurants && restaurants.length > 0) {
        console.log(`✅ Fallback strategy succeeded with ${restaurants.length} restaurants`);
        return restaurants;
      }
    } catch (error) {
      console.error('Fallback strategy failed:', error.message);
    }
  }
  
  // Ultimate fallback
  return getMockRestaurants(location);
};

// Curated restaurants for specific locations
const getCuratedRestaurantsForLocation = async (location, cuisine = null) => {
  const curatedData = {
    'kottayam': [
      {
        name: 'Kumarakom Lake Resort Restaurant',
        rating: '4.7',
        address: 'Kumarakom, Kottayam, Kerala',
        cuisine: 'Kerala',
        price_range: '$$$',
        specialties: ['Kerala Sadya', 'Seafood', 'Traditional Dishes'],
        coordinates: { lat: 9.6167, lng: 76.4333 },
        source: 'curated'
      },
      {
        name: 'Coconut Lagoon Restaurant',
        rating: '4.5',
        address: 'Kumarakom, Kottayam, Kerala',
        cuisine: 'South Indian',
        price_range: '$$',
        specialties: ['Rice Meals', 'Fish Curry', 'Coconut Dishes'],
        coordinates: { lat: 9.6167, lng: 76.4333 },
        source: 'curated'
      }
    ],
    'munnar': [
      {
        name: 'Rapsy Restaurant',
        rating: '4.3',
        address: 'Munnar, Kerala',
        cuisine: 'Multi-cuisine',
        price_range: '$$',
        specialties: ['North Indian', 'Chinese', 'Kerala'],
        coordinates: { lat: 10.0889, lng: 77.0595 },
        source: 'curated'
      }
    ]
  };
  
  const locationKey = location.toLowerCase().replace(/\s+/g, '');
  let restaurants = curatedData[locationKey] || null;
  
  // Filter by cuisine if specified
  if (restaurants && cuisine) {
    restaurants = restaurants.filter(restaurant => 
      restaurant.cuisine.toLowerCase().includes(cuisine.toLowerCase())
    );
  }
  
  return restaurants;
};

// Generic restaurants based on location patterns
const getGenericRestaurantsForLocation = async (location, cuisine = null) => {
  const locationParts = location.toLowerCase().split(',').map(part => part.trim());
  const cityName = locationParts[0];
  
  const baseRestaurants = [
    {
      name: `${cityName} Traditional Kitchen`,
      rating: '4.3',
      address: `Food Street, ${location}`,
      cuisine: cuisine || 'Local',
      price_range: '$$',
      specialties: ['Local Dishes', 'Traditional Recipes'],
      source: 'generic'
    },
    {
      name: `${cityName} Fine Dining`,
      rating: '4.5',
      address: `Gourmet Avenue, ${location}`,
      cuisine: cuisine || 'International',
      price_range: '$$$',
      specialties: ['Fusion Cuisine', 'Wine Pairing'],
      source: 'generic'
    }
  ];
  
  // Filter by cuisine if specified
  if (cuisine) {
    return baseRestaurants.filter(restaurant => 
      restaurant.cuisine.toLowerCase().includes(cuisine.toLowerCase())
    );
  }
  
  return baseRestaurants;
};

// Mock restaurant data for demonstration (ultimate fallback)
const getMockRestaurants = (location) => [
  {
    name: `${location} Traditional Kitchen`,
    rating: '4.3',
    address: `123 Food Street, ${location}`,
    cuisine: 'Local',
    price_range: '$$',
    specialties: ['Local Dishes', 'Traditional Recipes', 'Spice Garden'],
    coordinates: { lat: 10.8505, lng: 76.2711 }
  },
  {
    name: `${location} Fine Dining`,
    rating: '4.7',
    address: `456 Gourmet Avenue, ${location}`,
    cuisine: 'International',
    price_range: '$$$$',
    specialties: ['Fusion Cuisine', 'Wine Pairing', 'Chef Special'],
    coordinates: { lat: 10.8515, lng: 76.2721 }
  },
  {
    name: `${location} Street Food Corner`,
    rating: '4.1',
    address: `789 Market Square, ${location}`,
    cuisine: 'Street Food',
    price_range: '$',
    specialties: ['Local Snacks', 'Quick Bites', 'Authentic Flavors'],
    coordinates: { lat: 10.8495, lng: 76.2701 }
  },
  {
    name: `${location} Seafood Paradise`,
    rating: '4.6',
    address: `321 Coastal Road, ${location}`,
    cuisine: 'Seafood',
    price_range: '$$$',
    specialties: ['Fresh Catch', 'Grilled Fish', 'Coastal Cuisine'],
    coordinates: { lat: 10.8525, lng: 76.2731 }
  },
  {
    name: `${location} Vegetarian Haven`,
    rating: '4.4',
    address: `654 Green Lane, ${location}`,
    cuisine: 'Vegetarian',
    price_range: '$$',
    specialties: ['Organic Food', 'Ayurvedic Dishes', 'Healthy Options'],
    coordinates: { lat: 10.8485, lng: 76.2691 }
  },
  {
    name: `${location} Café Culture`,
    rating: '4.2',
    address: `987 Coffee Street, ${location}`,
    cuisine: 'Café',
    price_range: '$$',
    specialties: ['Artisan Coffee', 'Pastries', 'Light Meals'],
    coordinates: { lat: 10.8475, lng: 76.2681 }
  }
];

// GET /api/search/restaurants
router.get('/', async (req, res) => {
  try {
    const { location, limit = 10, cuisine, use_api = 'true' } = req.query;
    
    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    console.log(`🍽️ Searching restaurants for location: ${location}${cuisine ? `, cuisine: ${cuisine}` : ''}`);
    
    // Check cache first
    const cacheKey = `restaurants:${location.toLowerCase()}:${cuisine || 'all'}:${limit}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      console.log(`📦 Returning cached restaurant data for ${location}`);
      return res.json({
        success: true,
        location: location,
        count: cachedData.length,
        restaurants: cachedData,
        cached: true,
        source: 'cache'
      });
    }
    
    let restaurants = [];
    let source = 'fallback';
    
    try {
      // Primary: Try Google Places API if API key is available and use_api is true
      if (GOOGLE_PLACES_API_KEY && use_api === 'true') {
        console.log('🚀 Attempting Google Places API search for restaurants...');
        restaurants = await searchRestaurantsWithGooglePlaces(location, cuisine);
        source = 'google_places';
        console.log(`✅ Google Places API returned ${restaurants.length} restaurants`);
      } else {
        throw new Error('Google Places API not available or disabled');
      }
    } catch (apiError) {
      console.log(`⚠️ Google Places API failed: ${apiError.message}`);
      console.log('🔄 Falling back to alternative data sources...');
      
      try {
        // Fallback: Use enhanced fallback system
        restaurants = await getFallbackRestaurants(location, cuisine);
        source = 'fallback';
        console.log(`✅ Fallback system returned ${restaurants.length} restaurants`);
      } catch (fallbackError) {
        console.error('❌ All fallback strategies failed:', fallbackError.message);
        // Ultimate fallback: Basic mock data
        restaurants = getMockRestaurants(location);
        source = 'mock';
      }
    }
    
    // Limit results
    const limitedRestaurants = restaurants.slice(0, parseInt(limit));
    
    // Cache the results
    setCachedData(cacheKey, limitedRestaurants);
    
    console.log(`✅ Final result: ${limitedRestaurants.length} restaurants for ${location} (source: ${source})`);
    
    res.json({
      success: true,
      location: location,
      count: limitedRestaurants.length,
      restaurants: limitedRestaurants,
      source: source,
      cached: false,
      api_available: !!GOOGLE_PLACES_API_KEY,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error searching restaurants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search restaurants',
      details: error.message,
      fallback_used: true
    });
  }
});

// GET /api/search/restaurants/details/:restaurantId
router.get('/details/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Mock restaurant details
    const restaurantDetails = {
      id: restaurantId,
      name: 'Sample Restaurant',
      rating: 4.5,
      reviews: 850,
      cuisine: 'Local',
      price_range: '$$',
      specialties: ['Local Dishes', 'Traditional Recipes'],
      menu_highlights: [
        'Signature Curry',
        'Fresh Seafood',
        'Traditional Desserts'
      ],
      images: [
        'https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Restaurant+Interior',
        'https://via.placeholder.com/800x600/50C878/FFFFFF?text=Signature+Dish',
        'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Chef+Kitchen'
      ],
      description: 'A traditional restaurant serving authentic local cuisine with modern presentation.',
      timings: {
        lunch: '12:00 PM - 3:00 PM',
        dinner: '7:00 PM - 11:00 PM',
        closed: 'Monday'
      },
      amenities: ['WiFi', 'Air Conditioning', 'Parking', 'Takeaway']
    };
    
    res.json({
      success: true,
      restaurant: restaurantDetails
    });
    
  } catch (error) {
    console.error('❌ Error fetching restaurant details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurant details',
      details: error.message
    });
  }
});

module.exports = router;
