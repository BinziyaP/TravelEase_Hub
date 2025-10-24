const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getDestinationAccommodations, hasDestinationAccommodations } = require('../utils/destinationAccommodations');

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// Simple in-memory cache (consider Redis for production)
const cache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const getCached = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return item.data;
};

const setCached = (key, data) => cache.set(key, { data, ts: Date.now() });

// Search hotels via Google Places (type=lodging)
const searchHotelsWithGooglePlaces = async (location, radius = 25000) => {
  // Step 1: Geocode text to lat/lng
  const geocodeUrl = `${GOOGLE_PLACES_BASE_URL}/textsearch/json`;
  const geocodeParams = { query: location, key: GOOGLE_PLACES_API_KEY };
  const geocodeResp = await axios.get(geocodeUrl, { params: geocodeParams });
  if (geocodeResp.data.status !== 'OK' || !geocodeResp.data.results?.length) {
    throw new Error(`Geocoding failed for location: ${location}`);
  }
  const loc = geocodeResp.data.results[0].geometry.location;

  // Step 2: Nearby search for lodging
  const nearbyUrl = `${GOOGLE_PLACES_BASE_URL}/nearbysearch/json`;
  const nearbyParams = { location: `${loc.lat},${loc.lng}`, radius, type: 'lodging', key: GOOGLE_PLACES_API_KEY };
  const nearbyResp = await axios.get(nearbyUrl, { params: nearbyParams });
  if (nearbyResp.data.status !== 'OK' || !nearbyResp.data.results) {
    throw new Error(`Nearby search failed for location: ${location}`);
  }

  // Step 3: Details for top N hotels
  const detailsUrl = `${GOOGLE_PLACES_BASE_URL}/details/json`;
  const hotels = await Promise.all(
    nearbyResp.data.results.slice(0, 10).map(async (place) => {
      try {
        const detailsParams = { place_id: place.place_id, fields: 'name,rating,user_ratings_total,formatted_address,types,geometry,photos,price_level,website', key: GOOGLE_PLACES_API_KEY };
        const detailsResp = await axios.get(detailsUrl, { params: detailsParams });
        if (detailsResp.data.status !== 'OK' || !detailsResp.data.result) return null;
        const h = detailsResp.data.result;
        return {
          name: h.name,
          rating: h.rating ? h.rating.toString() : null,
          user_ratings_total: h.user_ratings_total || 0,
          address: h.formatted_address,
          type: 'hotel',
          coordinates: h.geometry?.location || loc,
          price_level: h.price_level || null,
          photos: h.photos?.slice(0, 3) || [],
          website: h.website || null,
          place_id: place.place_id,
          source: 'google_places'
        };
      } catch (_e) {
        return null;
      }
    })
  );

  return hotels.filter(Boolean);
};

const mockHotels = (location) => {
  // First try to get destination-specific accommodations
  const destinationAccommodations = getDestinationAccommodations(location, 6);
  
  if (destinationAccommodations.length > 0) {
    console.log(`🏨 Using destination-specific accommodations for: ${location}`);
    return destinationAccommodations.map(acc => ({
      name: acc.name,
      rating: acc.rating,
      address: acc.address,
      type: acc.type,
      coordinates: acc.coordinates,
      price_level: acc.priceRange === '$$$$' ? 4 : acc.priceRange === '$$$' ? 3 : acc.priceRange === '$$' ? 2 : 1,
      amenities: acc.amenities || [],
      source: 'destination_specific'
    }));
  }
  
  // Fallback to generic mock data if no destination-specific accommodations
  console.log(`⚠️ No destination-specific accommodations found for: ${location}, using generic fallback`);
  return [
    {
      name: 'Hotel Paradise',
      rating: '4.5',
      address: `123 Main Street, ${location}`,
      type: 'hotel',
      coordinates: null,
      source: 'generic_fallback'
    },
    {
      name: 'Resort Oasis',
      rating: '4.8',
      address: `456 Beach Road, ${location}`,
      type: 'resort',
      coordinates: null,
      source: 'generic_fallback'
    },
    {
      name: 'Guesthouse Comfort',
      rating: '4.2',
      address: `789 Hill View, ${location}`,
      type: 'guesthouse',
      coordinates: null,
      source: 'generic_fallback'
    }
  ];
};

// GET /api/search/hotels
router.get('/', async (req, res) => {
  try {
    const { location, limit = 10, use_api = 'true' } = req.query;
    if (!location) {
      return res.status(400).json({ success: false, error: 'Location parameter is required' });
    }

    const cacheKey = `hotels:${location.toLowerCase()}:${limit}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ success: true, location, count: cached.length, hotels: cached, cached: true, source: 'cache' });
    }

    let hotels = [];
    let source = 'fallback';
    try {
      if (GOOGLE_PLACES_API_KEY && use_api === 'true') {
        hotels = await searchHotelsWithGooglePlaces(location);
        source = 'google_places';
      } else {
        throw new Error('Google Places API not available or disabled');
      }
    } catch (_e) {
      hotels = mockHotels(location);
      source = 'mock';
    }

    const limited = hotels.slice(0, parseInt(limit));
    setCached(cacheKey, limited);
    res.json({ success: true, location, count: limited.length, hotels: limited, source, cached: false, api_available: !!GOOGLE_PLACES_API_KEY, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to search hotels', details: error.message, fallback_used: true });
  }
});

module.exports = router;




























