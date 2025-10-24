/**
 * Distance-Based Transportation Pricing System
 * Calculates transportation costs based on distance to destination and transport facility type
 */

// Base transportation costs per kilometer (in Indian Rupees)
const TRANSPORT_COST_PER_KM = {
  flights: 25,           // ₹25 per km (airline fuel, operations)
  airport_transfer: 8,   // ₹8 per km (taxi/cab rates)
  local_transport: 12,   // ₹12 per km (city transport)
  car_rental: 15,        // ₹15 per km (rental + fuel)
  bus: 3,               // ₹3 per km (public transport)
  train: 2              // ₹2 per km (railway rates)
};

// Base transportation costs (fixed costs regardless of distance)
const BASE_TRANSPORT_COSTS = {
  flights: 5000,         // ₹5,000 base cost (airport fees, taxes)
  airport_transfer: 200, // ₹200 base cost (pickup/drop charges)
  local_transport: 100,  // ₹100 base cost (driver charges)
  car_rental: 800,      // ₹800 base cost (rental setup)
  bus: 50,              // ₹50 base cost (ticket booking)
  train: 100            // ₹100 base cost (reservation charges)
};

// Distance multipliers based on transport efficiency
const DISTANCE_MULTIPLIERS = {
  flights: {
    short: 1.2,    // 0-500km: Less efficient for short distances
    medium: 1.0,   // 500-1500km: Optimal range
    long: 0.8      // 1500km+: More efficient for long distances
  },
  airport_transfer: {
    short: 1.0,    // 0-50km: Standard rates
    medium: 0.9,   // 50-100km: Slight discount
    long: 0.8      // 100km+: Better rates
  },
  local_transport: {
    short: 1.0,    // 0-50km: Standard city rates
    medium: 1.1,   // 50-100km: Higher rates
    long: 1.3      // 100km+: Premium rates
  },
  car_rental: {
    short: 1.0,    // 0-100km: Standard rates
    medium: 0.95,  // 100-300km: Slight discount
    long: 0.9      // 300km+: Better rates
  },
  bus: {
    short: 1.0,    // 0-200km: Standard rates
    medium: 0.9,   // 200-500km: Slight discount
    long: 0.8      // 500km+: Better rates
  },
  train: {
    short: 1.0,    // 0-300km: Standard rates
    medium: 0.9,   // 300-800km: Slight discount
    long: 0.8      // 800km+: Better rates
  }
};

// Major Indian cities with coordinates (for distance calculation)
const INDIAN_CITIES = {
  // Kerala
  'kozhikode': { lat: 11.2588, lng: 75.7804, state: 'Kerala' },
  'kochi': { lat: 9.9312, lng: 76.2673, state: 'Kerala' },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366, state: 'Kerala' },
  'idukki': { lat: 9.8497, lng: 76.9681, state: 'Kerala' },
  'munnar': { lat: 10.0889, lng: 77.0595, state: 'Kerala' },
  'wayanad': { lat: 11.6086, lng: 76.0833, state: 'Kerala' },
  'alleppey': { lat: 9.4981, lng: 76.3388, state: 'Kerala' },
  
  // Major cities
  'delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'mumbai': { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  'bangalore': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  'kolkata': { lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
  'pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  'jaipur': { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  'agra': { lat: 27.1767, lng: 78.0081, state: 'Uttar Pradesh' },
  'goa': { lat: 15.2993, lng: 73.9440, state: 'Goa' },
  
  // Other major destinations
  'shimla': { lat: 31.1048, lng: 77.1734, state: 'Himachal Pradesh' },
  'leh': { lat: 34.1526, lng: 77.5771, state: 'Jammu and Kashmir' },
  'port_blair': { lat: 11.6234, lng: 92.7265, state: 'Andaman and Nicobar' }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Object} coord1 - First coordinate {lat, lng}
 * @param {Object} coord2 - Second coordinate {lat, lng}
 * @returns {number} Distance in kilometers
 */
function calculateDistance(coord1, coord2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Get distance category based on distance
 * @param {number} distance - Distance in kilometers
 * @returns {string} Distance category
 */
function getDistanceCategory(distance) {
  if (distance <= 100) return 'short';
  if (distance <= 500) return 'medium';
  return 'long';
}

/**
 * Calculate transportation price based on distance and transport type
 * @param {string} transportType - Type of transportation
 * @param {string} fromDestination - Starting destination
 * @param {string} toDestination - Ending destination
 * @param {number} duration - Trip duration in days
 * @returns {number} Calculated price in INR
 */
function calculateTransportPrice(transportType, fromDestination, toDestination, duration = 1) {
  // Normalize destination names
  const from = fromDestination?.toLowerCase().trim();
  const to = toDestination?.toLowerCase().trim();
  
  // Get coordinates
  const fromCoord = INDIAN_CITIES[from];
  const toCoord = INDIAN_CITIES[to];
  
  if (!fromCoord || !toCoord) {
    console.warn(`Coordinates not found for: ${from} or ${to}`);
    // Fallback to base pricing
    return BASE_TRANSPORT_COSTS[transportType] || 1000;
  }
  
  // Calculate distance
  const distance = calculateDistance(fromCoord, toCoord);
  
  // Get distance category
  const distanceCategory = getDistanceCategory(distance);
  
  // Get base costs
  const baseCost = BASE_TRANSPORT_COSTS[transportType] || 1000;
  const costPerKm = TRANSPORT_COST_PER_KM[transportType] || 10;
  
  // Get distance multiplier
  const distanceMultiplier = DISTANCE_MULTIPLIERS[transportType]?.[distanceCategory] || 1.0;
  
  // Calculate price
  const distanceCost = distance * costPerKm * distanceMultiplier;
  const totalPrice = baseCost + distanceCost;
  
  // Apply duration multiplier for daily services
  const durationMultipliers = {
    flights: 1,           // One-time cost
    airport_transfer: 1,  // Per trip
    local_transport: duration, // Daily cost
    car_rental: duration, // Daily rental
    bus: Math.ceil(duration / 2), // Every other day
    train: Math.ceil(duration / 3) // Every few days
  };
  
  const finalPrice = totalPrice * (durationMultipliers[transportType] || 1);
  
  return Math.round(finalPrice);
}

/**
 * Calculate all transportation prices for a destination
 * @param {string} fromDestination - Starting destination
 * @param {string} toDestination - Ending destination
 * @param {number} duration - Trip duration in days
 * @returns {Object} Object with all transportation prices
 */
function calculateAllTransportPrices(fromDestination, toDestination, duration = 1) {
  const prices = {};
  
  Object.keys(TRANSPORT_COST_PER_KM).forEach(transportType => {
    prices[transportType] = calculateTransportPrice(transportType, fromDestination, toDestination, duration);
  });
  
  return prices;
}

/**
 * Get transportation pricing details with breakdown
 * @param {string} transportType - Type of transportation
 * @param {string} fromDestination - Starting destination
 * @param {string} toDestination - Ending destination
 * @param {number} duration - Trip duration in days
 * @returns {Object} Detailed pricing breakdown
 */
function getTransportPricingDetails(transportType, fromDestination, toDestination, duration = 1) {
  const from = fromDestination?.toLowerCase().trim();
  const to = toDestination?.toLowerCase().trim();
  
  const fromCoord = INDIAN_CITIES[from];
  const toCoord = INDIAN_CITIES[to];
  
  if (!fromCoord || !toCoord) {
    return {
      price: BASE_TRANSPORT_COSTS[transportType] || 1000,
      distance: 0,
      breakdown: {
        baseCost: BASE_TRANSPORT_COSTS[transportType] || 1000,
        distanceCost: 0,
        total: BASE_TRANSPORT_COSTS[transportType] || 1000
      }
    };
  }
  
  const distance = calculateDistance(fromCoord, toCoord);
  const distanceCategory = getDistanceCategory(distance);
  const baseCost = BASE_TRANSPORT_COSTS[transportType] || 1000;
  const costPerKm = TRANSPORT_COST_PER_KM[transportType] || 10;
  const distanceMultiplier = DISTANCE_MULTIPLIERS[transportType]?.[distanceCategory] || 1.0;
  
  const distanceCost = distance * costPerKm * distanceMultiplier;
  const totalPrice = baseCost + distanceCost;
  
  const durationMultipliers = {
    flights: 1,
    airport_transfer: 1,
    local_transport: duration,
    car_rental: duration,
    bus: Math.ceil(duration / 2),
    train: Math.ceil(duration / 3)
  };
  
  const finalPrice = totalPrice * (durationMultipliers[transportType] || 1);
  
  return {
    price: Math.round(finalPrice),
    distance: Math.round(distance),
    distanceCategory,
    breakdown: {
      baseCost,
      distanceCost: Math.round(distanceCost),
      distanceMultiplier,
      durationMultiplier: durationMultipliers[transportType] || 1,
      total: Math.round(finalPrice)
    }
  };
}

module.exports = {
  calculateTransportPrice,
  calculateAllTransportPrices,
  getTransportPricingDetails,
  calculateDistance,
  INDIAN_CITIES,
  TRANSPORT_COST_PER_KM,
  BASE_TRANSPORT_COSTS
};
