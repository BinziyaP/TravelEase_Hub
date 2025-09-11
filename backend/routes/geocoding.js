const express = require('express');
const router = express.Router();

/**
 * Geocoding API Route
 * Uses OpenStreetMap's Nominatim API to get coordinates and details for Indian places
 * 
 * @route GET /api/geocode
 * @param {string} place - The place name to geocode (required)
 * @returns {Object} JSON response with geocoding data
 * 
 * Example: GET /api/geocode?place=Tiruvalla
 * Response: {
 *   "success": true,
 *   "data": {
 *     "display_name": "Tiruvalla, Kerala, India",
 *     "lat": "9.3833",
 *     "lon": "76.5667",
 *     "type": "city"
 *   }
 * }
 */

// Rate limiting for geocoding requests (more restrictive since it calls external API)
const rateLimit = require('express-rate-limit');
const geocodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 geocoding requests per windowMs
  message: {
    success: false,
    message: 'Too many geocoding requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all geocoding routes
router.use(geocodeLimiter);

/**
 * GET /api/geocode
 * Geocode a place name to get its coordinates and details
 */
router.get('/geocode', async (req, res) => {
  try {
    const { place } = req.query;

    // Validate input
    if (!place || typeof place !== 'string' || place.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Place parameter is required and must be a non-empty string',
        example: '/api/geocode?place=Tiruvalla'
      });
    }

    // Clean and prepare the place name
    const cleanPlace = place.trim();
    
    // Basic validation - reject obviously non-Indian places
    const nonIndianIndicators = [
      'new york', 'london', 'paris', 'tokyo', 'sydney', 'melbourne', 'toronto',
      'vancouver', 'berlin', 'rome', 'madrid', 'barcelona', 'amsterdam', 'zurich',
      'vienna', 'prague', 'budapest', 'warsaw', 'moscow', 'beijing', 'shanghai',
      'hong kong', 'singapore', 'bangkok', 'kuala lumpur', 'jakarta', 'manila',
      'seoul', 'osaka', 'kyoto', 'dubai', 'abu dhabi', 'doha', 'riyadh', 'cairo'
    ];

    const placeLower = cleanPlace.toLowerCase();
    if (nonIndianIndicators.some(indicator => placeLower.includes(indicator))) {
      return res.status(400).json({
        success: false,
        message: 'Only Indian places are allowed for geocoding',
        provided: cleanPlace
      });
    }

    // Construct the Nominatim API URL
    // Adding "India" to the search query to ensure we get Indian results
    const searchQuery = encodeURIComponent(`${cleanPlace}, India`);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=5&addressdetails=1&countrycodes=in`;

    console.log(`🔍 Geocoding request for: "${cleanPlace}"`);
    console.log(`🌐 Nominatim URL: ${nominatimUrl}`);

    // Make request to Nominatim API
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'TravelEase-Geocoding/1.0 (contact@travelease.com)', // Required by Nominatim
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API request failed with status: ${response.status}`);
    }

    const data = await response.json();

    // Handle no results
    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No results found for "${cleanPlace}"`,
        suggestion: 'Try a different spelling or a more specific location name',
        searched: cleanPlace
      });
    }

    // Find the best match (prioritize exact matches and Indian results)
    let bestMatch = data[0]; // Default to first result
    
    // Look for exact matches or results that contain the place name
    for (const result of data) {
      const displayName = result.display_name.toLowerCase();
      const placeName = cleanPlace.toLowerCase();
      
      // Check if this result is more relevant
      if (displayName.includes(placeName) && 
          (displayName.includes('india') || displayName.includes('kerala') || 
           displayName.includes('tamil nadu') || displayName.includes('karnataka') ||
           displayName.includes('maharashtra') || displayName.includes('gujarat') ||
           displayName.includes('rajasthan') || displayName.includes('uttar pradesh') ||
           displayName.includes('west bengal') || displayName.includes('andhra pradesh') ||
           displayName.includes('telangana') || displayName.includes('bihar') ||
           displayName.includes('odisha') || displayName.includes('madhya pradesh') ||
           displayName.includes('chhattisgarh') || displayName.includes('jharkhand') ||
           displayName.includes('assam') || displayName.includes('manipur') ||
           displayName.includes('meghalaya') || displayName.includes('mizoram') ||
           displayName.includes('nagaland') || displayName.includes('tripura') ||
           displayName.includes('sikkim') || displayName.includes('arunachal pradesh') ||
           displayName.includes('himachal pradesh') || displayName.includes('uttarakhand') ||
           displayName.includes('punjab') || displayName.includes('haryana') ||
           displayName.includes('goa') || displayName.includes('delhi') ||
           displayName.includes('chandigarh') || displayName.includes('puducherry') ||
           displayName.includes('jammu and kashmir') || displayName.includes('ladakh'))) {
        bestMatch = result;
        break;
      }
    }

    // Extract and format the response
    const result = {
      display_name: bestMatch.display_name,
      lat: bestMatch.lat,
      lon: bestMatch.lon,
      type: bestMatch.type || 'unknown',
      // Additional useful information
      importance: bestMatch.importance,
      place_id: bestMatch.place_id,
      // Extract address components if available
      address: bestMatch.address ? {
        city: bestMatch.address.city || bestMatch.address.town || bestMatch.address.village,
        state: bestMatch.address.state,
        country: bestMatch.address.country,
        postcode: bestMatch.address.postcode
      } : null
    };

    console.log(`✅ Geocoding successful for: "${cleanPlace}" -> ${result.display_name}`);

    // Return successful response
    res.json({
      success: true,
      data: result,
      searched: cleanPlace,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Geocoding error:', error);
    
    // Handle specific error types
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return res.status(503).json({
        success: false,
        message: 'Geocoding service temporarily unavailable',
        error: 'Unable to connect to geocoding service'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Internal server error during geocoding',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
});

/**
 * GET /api/geocode/batch
 * Geocode multiple places at once (useful for bulk operations)
 */
router.post('/geocode/batch', async (req, res) => {
  try {
    const { places } = req.body;

    // Validate input
    if (!places || !Array.isArray(places) || places.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Places array is required and must be non-empty',
        example: { places: ['Tiruvalla', 'Kanjirappally', 'Ponkunnam'] }
      });
    }

    if (places.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 places allowed per batch request'
      });
    }

    // Process each place
    const results = [];
    const errors = [];

    for (const place of places) {
      try {
        // Use the same logic as the single geocode endpoint
        const cleanPlace = place.trim();
        const searchQuery = encodeURIComponent(`${cleanPlace}, India`);
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=1&addressdetails=1&countrycodes=in`;

        const response = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'TravelEase-Geocoding/1.0 (contact@travelease.com)',
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const result = data[0];
            results.push({
              place: cleanPlace,
              success: true,
              data: {
                display_name: result.display_name,
                lat: result.lat,
                lon: result.lon,
                type: result.type || 'unknown'
              }
            });
          } else {
            errors.push({
              place: cleanPlace,
              success: false,
              error: 'No results found'
            });
          }
        } else {
          errors.push({
            place: cleanPlace,
            success: false,
            error: `API request failed with status: ${response.status}`
          });
        }

        // Add a small delay to be respectful to the Nominatim API
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        errors.push({
          place: place,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      results: results,
      errors: errors,
      total: places.length,
      successful: results.length,
      failed: errors.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Batch geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during batch geocoding',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
});

/**
 * GET /api/geocode/reverse
 * Reverse geocoding - get place name from coordinates
 */
router.get('/geocode/reverse', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    // Validate coordinates
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Both lat and lon parameters are required',
        example: '/api/geocode/reverse?lat=9.3833&lon=76.5667'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided',
        provided: { lat, lon }
      });
    }

    // Check if coordinates are within India's approximate bounds
    if (latitude < 6.0 || latitude > 37.0 || longitude < 68.0 || longitude > 97.0) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates appear to be outside India',
        provided: { lat: latitude, lon: longitude }
      });
    }

    // Construct the reverse geocoding URL
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&countrycodes=in`;

    console.log(`🔄 Reverse geocoding request for: ${latitude}, ${longitude}`);

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'TravelEase-Geocoding/1.0 (contact@travelease.com)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API request failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.display_name) {
      return res.status(404).json({
        success: false,
        message: 'No location found for the provided coordinates',
        coordinates: { lat: latitude, lon: longitude }
      });
    }

    const result = {
      display_name: data.display_name,
      lat: data.lat,
      lon: data.lon,
      type: data.type || 'unknown',
      address: data.address ? {
        city: data.address.city || data.address.town || data.address.village,
        state: data.address.state,
        country: data.address.country,
        postcode: data.address.postcode
      } : null
    };

    console.log(`✅ Reverse geocoding successful: ${latitude}, ${longitude} -> ${result.display_name}`);

    res.json({
      success: true,
      data: result,
      coordinates: { lat: latitude, lon: longitude },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during reverse geocoding',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
});

module.exports = router;
