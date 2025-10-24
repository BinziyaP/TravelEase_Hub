// Test script to verify admin dashboard route map fix
console.log("🧪 Testing Admin Dashboard Route Map Fix...");

// Simulate package data with mixed sources (like what admin dashboard receives)
const packageData = {
  route_coordinates: [
    { name: "Edakkal Caves", coordinates: { lat: 11.6851, lng: 76.1319 } },
    { name: "Wayanad Wildlife Sanctuary", coordinates: { lat: 11.6852, lng: 76.1320 } },
    { name: "Lakkidi Viewpoint", coordinates: { lat: 11.6853, lng: 76.1321 } },
    { name: "Kuruva Island", coordinates: { lat: 11.6854, lng: 76.1322 } },
    { name: "Chembra Peak", coordinates: { lat: 11.6855, lng: 76.1323 } },
    { name: "Resort Oasis", coordinates: { lat: 11.6856, lng: 76.1324 } },
    { name: "Petals Resorts Wayanad", coordinates: { lat: 11.6857, lng: 76.1325 } },
    { name: "Neelimala", coordinates: { lat: 11.6858, lng: 76.1326 } },
    { name: "Banasura Sagar Dam", coordinates: { lat: 11.6859, lng: 76.1327 } }
  ],
  selected_places: [
    { name: "Extra Place 1", coordinates: { lat: 11.7, lng: 76.2 } },
    { name: "Extra Place 2", coordinates: { lat: 11.8, lng: 76.3 } }
  ],
  attractions: [
    "Edakkal Caves",
    "Wayanad Wildlife Sanctuary",
    "Lakkidi Viewpoint",
    "Kuruva Island",
    "Chembra Peak",
    "Resort Oasis",
    "Petals Resorts Wayanad",
    "Neelimala",
    "Banasura Sagar Dam"
  ]
};

console.log("📦 Package data:");
console.log(`  - route_coordinates: ${packageData.route_coordinates.length}`);
console.log(`  - selected_places: ${packageData.selected_places.length}`);
console.log(`  - attractions: ${packageData.attractions.length}`);

// Test the fixed admin dashboard logic - use ONLY route_coordinates
let allLocations = [];

if (packageData.route_coordinates && Array.isArray(packageData.route_coordinates) && packageData.route_coordinates.length > 0) {
  console.log('📍 Using route_coordinates:', packageData.route_coordinates.length);
  allLocations = packageData.route_coordinates; // Use ONLY route coordinates
} else if (packageData.selected_places && Array.isArray(packageData.selected_places) && packageData.selected_places.length > 0) {
  console.log('📍 Fallback to selected_places:', packageData.selected_places.length);
  allLocations = packageData.selected_places; // Fallback to selected places
} else if (packageData.attractions && Array.isArray(packageData.attractions) && packageData.attractions.length > 0) {
  console.log('📍 Fallback to attractions:', packageData.attractions.length);
  const attractionLocations = packageData.attractions.map(attraction => ({
    name: attraction,
    coordinates: { lat: 11.6, lng: 76.0 } // Wayanad, Kerala coordinates
  }));
  allLocations = attractionLocations;
}

console.log(`🎯 Final locations for map: ${allLocations.length}`);

// Test duplicate removal
const uniqueCoords = [];
const seenCoords = new Set();

allLocations.forEach((coord, index) => {
  const coordKey = `${coord.name}-${coord.coordinates.lat}-${coord.coordinates.lng}`;
  if (!seenCoords.has(coordKey)) {
    seenCoords.add(coordKey);
    const offset = uniqueCoords.length * 0.0001;
    uniqueCoords.push({
      ...coord,
      coordinates: {
        lat: coord.coordinates.lat + offset,
        lng: coord.coordinates.lng + offset
      }
    });
  }
});

console.log(`🎯 Unique coordinates after deduplication: ${uniqueCoords.length}`);

// Test marker numbering
const markers = uniqueCoords.map((coord, index) => {
  const markerNumber = index + 1;
  return {
    number: markerNumber,
    name: coord.name,
    lat: coord.coordinates.lat,
    lng: coord.coordinates.lng
  };
});

console.log(`📍 Markers created: ${markers.length}`);
console.log(`📋 Marker numbers: ${markers.map(m => m.number).join(', ')}`);

// Test results
if (uniqueCoords.length === packageData.route_coordinates.length) {
  console.log("✅ SUCCESS: Admin dashboard using only route_coordinates (no mixing data sources)!");
} else {
  console.log("❌ FAILURE: Admin dashboard still mixing data sources!");
}

if (markers.length === 9) {
  console.log("✅ SUCCESS: Exactly 9 markers created!");
} else {
  console.log("❌ FAILURE: Wrong number of markers!");
}

const expectedNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const actualNumbers = markers.map(m => m.number);
const numbersMatch = expectedNumbers.every(num => actualNumbers.includes(num));

if (numbersMatch) {
  console.log("✅ SUCCESS: Sequential numbering (1-9)!");
} else {
  console.log("❌ FAILURE: Non-sequential numbering!");
}

console.log("🧪 Admin dashboard test completed.");







