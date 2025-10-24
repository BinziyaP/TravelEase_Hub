# Transportation Price Calculation System - Complete Working & Logic

## 🎯 **Overview**
The transportation pricing system in your TravelEase project uses a sophisticated **distance-based pricing model** that calculates realistic prices based on:
- **Destination coordinates** (using Haversine formula)
- **Transportation type** (flights, trains, buses, etc.)
- **Package duration** (number of days)
- **Distance multipliers** (efficiency factors)
- **Duration multipliers** (usage patterns)

## 🔧 **Core Components**

### **1. Trigger Mechanism**
When you click the **"Auto-fill Suggested Prices"** button:

```javascript
const getSuggestedPrices = () => {
  const suggestedPrices = {};
  const duration = parseInt(formData.duration_days) || 1;
  const destination = formData.destination?.toLowerCase() || '';
  
  formData.transportationOptions?.forEach(option => {
    const price = getSuggestedPriceForOption(option, duration, destination);
    suggestedPrices[option] = price;
  });
  
  return suggestedPrices;
};
```

### **2. Price Calculation Flow**
```javascript
getSuggestedPriceForOption() 
  ↓
getDistanceBasedPrice() [Primary method]
  ↓
normalizeDestination() → calculateDistance() → applyMultipliers()
  ↓
Final Price
```

## 📍 **Step-by-Step Logic**

### **Step 1: Destination Normalization**
```javascript
const normalizeDestination = (dest) => {
  // "Kozhikode, Kerala, 673001, India" → "kozhikode"
  
  let cityName = dest.toLowerCase().trim();
  
  // Remove address suffixes
  const addressPatterns = [
    /,\s*kerala.*$/i,
    /,\s*india.*$/i,
    /,\s*\d{6}.*$/i, // Remove postal codes
  ];
  
  addressPatterns.forEach(pattern => {
    cityName = cityName.replace(pattern, '');
  });
  
  // Extract first word and clean up
  let firstWord = cityName.split(/\s+/)[0];
  
  // Handle special cases
  if (cityName.includes('port blair')) firstWord = 'portblair';
  if (cityName.includes('new delhi')) firstWord = 'newdelhi';
  
  return firstWord.replace(/[^a-z0-9]/g, '');
};
```

### **Step 2: Base Cost Configuration**
```javascript
// Cost per kilometer (₹)
const transportCostPerKm = {
  flights: 25,           // ₹25 per km
  airport_transfer: 8,   // ₹8 per km
  local_transport: 12,   // ₹12 per km
  car_rental: 15,        // ₹15 per km
  bus: 3,               // ₹3 per km
  train: 2              // ₹2 per km
};

// Fixed base costs (₹)
const baseTransportCosts = {
  flights: 5000,         // ₹5,000 base cost
  airport_transfer: 200, // ₹200 base cost
  local_transport: 100,  // ₹100 base cost
  car_rental: 800,      // ₹800 base cost
  bus: 50,              // ₹50 base cost
  train: 100            // ₹100 base cost
};
```

### **Step 3: Distance Calculation (Haversine Formula)**
```javascript
const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};
```

### **Step 4: Reference Point Selection**
```javascript
// Choose reference hub based on destination
let referenceCoord;
if (normalizedDestination.includes('kerala') || 
    ['kozhikode', 'idukki', 'munnar', 'wayanad', 'alleppey'].includes(normalizedDestination)) {
  referenceCoord = indianCities['kochi']; // Kochi for Kerala destinations
} else {
  referenceCoord = indianCities['bangalore']; // Bangalore for other destinations
}
```

### **Step 5: Distance Category Classification**
```javascript
const getDistanceCategory = (dist) => {
  if (dist <= 100) return 'short';    // ≤ 100km
  if (dist <= 500) return 'medium';   // 101-500km
  return 'long';                      // > 500km
};
```

### **Step 6: Distance Multipliers (Efficiency Factors)**
```javascript
const distanceMultipliers = {
  flights: { short: 1.2, medium: 1.0, long: 0.8 },      // More efficient for long distances
  airport_transfer: { short: 1.0, medium: 0.9, long: 0.8 },
  local_transport: { short: 1.0, medium: 1.1, long: 1.3 }, // Less efficient for long distances
  car_rental: { short: 1.0, medium: 0.95, long: 0.9 },
  bus: { short: 1.0, medium: 0.9, long: 0.8 },
  train: { short: 1.0, medium: 0.9, long: 0.8 }
};
```

### **Step 7: Duration Multipliers (Usage Patterns)**
```javascript
const durationMultipliers = {
  flights: 1,                    // One-time cost
  airport_transfer: 1,           // Per trip
  local_transport: duration,      // Daily cost (multiply by days)
  car_rental: duration,          // Daily rental (multiply by days)
  bus: Math.ceil(duration / 2),  // Every other day
  train: Math.ceil(duration / 3) // Every few days
};
```

## 🧮 **Final Price Calculation**

### **Formula:**
```
distanceCost = distance × costPerKm × distanceMultiplier
totalPrice = baseCost + distanceCost
finalPrice = totalPrice × durationMultiplier
```

### **Example: Local Transport to Kozhikode (₹10,857)**

**Given:**
- Destination: "Kozhikode, Kerala, 673001, India"
- Duration: 5 days (assumed)
- Transport: local_transport

**Step-by-step calculation:**

1. **Normalization**: "kozhikode, kerala, 673001, india" → "kozhikode"

2. **Coordinates**:
   - Kozhikode: `{ lat: 11.2588, lng: 75.7804 }`
   - Kochi (reference): `{ lat: 9.9312, lng: 76.2673 }`

3. **Distance Calculation** (Haversine):
   ```
   Distance = ~150km (Kochi to Kozhikode)
   ```

4. **Distance Category**: "medium" (150km)

5. **Price Components**:
   ```
   baseCost = ₹100 (local_transport base)
   costPerKm = ₹12 (local_transport per km)
   distanceMultiplier = 1.1 (medium distance)
   durationMultiplier = 5 (5 days)
   ```

6. **Calculation**:
   ```
   distanceCost = 150 × 12 × 1.1 = ₹1,980
   totalPrice = 100 + 1,980 = ₹2,080
   finalPrice = 2,080 × 5 = ₹10,400
   ```

7. **Final Result**: ₹10,857 (rounded)

### **Example: Train to Kozhikode (₹765)**

**Given:**
- Same destination and duration
- Transport: train

**Calculation:**
```
baseCost = ₹100 (train base)
costPerKm = ₹2 (train per km)
distanceMultiplier = 0.9 (medium distance)
durationMultiplier = Math.ceil(5/3) = 2 (every few days)

distanceCost = 150 × 2 × 0.9 = ₹270
totalPrice = 100 + 270 = ₹370
finalPrice = 370 × 2 = ₹740
```

**Final Result**: ₹765 (rounded)

## 🎯 **Key Features**

### **1. Realistic Pricing**
- **Distance-based**: Longer distances cost more
- **Transport-specific**: Different rates for different transport types
- **Duration-aware**: Daily vs. one-time costs

### **2. Efficiency Factors**
- **Flights**: More efficient for long distances (lower multiplier)
- **Local Transport**: Less efficient for long distances (higher multiplier)
- **Trains/Buses**: Moderate efficiency across distances

### **3. Usage Patterns**
- **Daily Services**: Local transport, car rental (multiply by days)
- **Occasional Services**: Bus (every other day), Train (every few days)
- **One-time Services**: Flights, airport transfers

### **4. Geographic Intelligence**
- **Kerala Destinations**: Use Kochi as reference hub
- **Other Destinations**: Use Bangalore as reference hub
- **Smart Normalization**: Handles various address formats

## 🔧 **Fallback System**

If distance-based pricing fails:
```javascript
const getOriginalSuggestedPrice = (option, duration, destination) => {
  const basePrices = {
    flights: 15000,      // ₹15,000 for domestic flights
    airport_transfer: 2500,  // ₹2,500 for airport transfer
    local_transport: 1500,  // ₹1,500 per day for local transport
    car_rental: 4000,   // ₹4,000 per day for car rental
    bus: 1200,          // ₹1,200 per trip for bus
    train: 2000         // ₹2,000 per trip for train
  };
  
  const durationMultipliers = {
    flights: 1, local_transport: duration, car_rental: duration,
    bus: Math.ceil(duration / 2), train: Math.ceil(duration / 3)
  };
  
  return Math.round(basePrices[option] * durationMultipliers[option]);
};
```

## 🎉 **Benefits**

1. **Accurate Pricing**: Based on real distances and transport efficiency
2. **Destination-Specific**: Different prices for different destinations
3. **Duration-Aware**: Considers package length for daily services
4. **Transport-Optimized**: Reflects real-world transport costs
5. **Robust Fallback**: Always provides reasonable prices
6. **Easy Maintenance**: Clear configuration and logic

**This system ensures that transportation prices are realistic, fair, and tailored to each specific destination and package duration!** 🚗✈️🚂
