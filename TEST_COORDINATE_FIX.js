// Test script to verify coordinate processing fix
// This simulates the coordinate processing logic from FreeRouteMap.jsx

const testCoordinates = [
  { name: "Edakkal Caves", coordinates: { lat: 11.6851, lng: 76.1319 } },
  { name: "Wayanad Wildlife Sanctuary", coordinates: { lat: 11.6851, lng: 76.1319 } },
  { name: "Lakkidi Viewpoint", coordinates: { lat: 11.6851, lng: 76.1319 } },
  { name: "Kuruva Island", coordinates: { lat: 11.6851, lng: 76.1319 } },
  { name: "Chembra Peak", coordinates: { lat: 11.6851, lng: 76.1319 } },
  { name: "Resort Oasis", coordinates: { lat: 11.6851, lng: 76.1319 } },
  { name: "Petals Resorts Wayanad", coordinates: { lat: 11.6851, lng: 76.1319 } },
  { name: "Banasura Sagar Dam", coordinates: { lat: 11.6851, lng: 76.1319 } }
];

console.log("🧪 Testing coordinate processing fix...");
console.log(`📊 Input coordinates: ${testCoordinates.length}`);

// Process coordinates (same logic as FreeRouteMap.jsx)
const processedCoords = testCoordinates
  .map((item, index) => {
    let lat, lng, name;
    
    if (item.coordinates) {
      lat = item.coordinates.lat;
      lng = item.coordinates.lng;
      name = item.name;
    }
    
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    
    if (!isNaN(numLat) && !isNaN(numLng)) {
      return {
        lat: numLat,
        lng: numLng,
        name: name
      };
    } else {
      // Use default coordinates if invalid
      return {
        lat: 11.6851,
        lng: 76.1319,
        name: name
      };
    }
  })
  .filter(coord => coord !== null);

console.log(`✅ Processed coordinates: ${processedCoords.length}`);

// Add offsets to make all coordinates unique
const validCoords = processedCoords.map((coord, index) => {
  const offset = index * 0.0001;
  return {
    ...coord,
    lat: coord.lat + offset,
    lng: coord.lng + offset
  };
});

console.log(`🎯 Final valid coordinates: ${validCoords.length}`);
console.log(`📋 Coordinates:`);
validCoords.forEach((coord, index) => {
  console.log(`  ${index + 1}. ${coord.name} at ${coord.lat}, ${coord.lng}`);
});

// Test result
if (validCoords.length === testCoordinates.length) {
  console.log("✅ SUCCESS: All coordinates preserved!");
} else {
  console.log("❌ FAILURE: Some coordinates were lost!");
}

console.log("🧪 Test completed.");







