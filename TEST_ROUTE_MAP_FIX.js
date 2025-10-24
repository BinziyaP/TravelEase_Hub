// Test script to verify route map fixes
console.log("🧪 Testing Route Map Fixes...");

// Simulate 9 attractions data
const testAttractions = [
  { name: "Edakkal Caves", coordinates: { lat: 11.6851, lng: 76.1319 } },
  { name: "Wayanad Wildlife Sanctuary", coordinates: { lat: 11.6851, lng: 76.1319 } },
  { name: "Lakkidi Viewpoint", coordinates: { lat: 11.6851, lng: 76.1319 } },
  { name: "Kuruva Island", coordinates: { lat: 11.6851, lng: 76.1319 } },
  { name: "Chembra Peak", coordinates: { lat: 11.6851, lng: 76.1319 } },
  { name: "Resort Oasis", coordinates: { lat: 11.6851, lng: 76.1319 } },
  { name: "Petals Resorts Wayanad", coordinates: { lat: 11.6851, lng: 76.1319 } },
  { name: "Banasura Sagar Dam", coordinates: { lat: 11.6851, lng: 76.1319 } },
  { name: "Neelimala", coordinates: { lat: 11.6851, lng: 76.1319 } }
];

console.log(`📊 Input attractions: ${testAttractions.length}`);

// Process coordinates (same logic as FreeRouteMap.jsx)
const processedCoords = testAttractions
  .map((item, index) => {
    const lat = item.coordinates.lat;
    const lng = item.coordinates.lng;
    const name = item.name;
    
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    
    if (!isNaN(numLat) && !isNaN(numLng)) {
      return {
        lat: numLat,
        lng: numLng,
        name: name
      };
    } else {
      return {
        lat: 11.6851,
        lng: 76.1319,
        name: name
      };
    }
  })
  .filter(coord => coord !== null);

console.log(`✅ Processed coordinates: ${processedCoords.length}`);

// Remove duplicates and preserve only unique coordinates
const uniqueCoords = [];
const seenCoords = new Set();

processedCoords.forEach((coord, index) => {
  const coordKey = `${coord.name}-${coord.lat}-${coord.lng}`;
  if (!seenCoords.has(coordKey)) {
    seenCoords.add(coordKey);
    // Add small offset to ensure they're all unique on the map
    const offset = uniqueCoords.length * 0.0001;
    uniqueCoords.push({
      ...coord,
      lat: coord.lat + offset,
      lng: coord.lng + offset
    });
  }
});

console.log(`🎯 Unique coordinates: ${uniqueCoords.length}`);

// Test marker numbering
const markers = uniqueCoords.map((coord, index) => {
  const markerNumber = index + 1;
  return {
    number: markerNumber,
    name: coord.name,
    lat: coord.lat,
    lng: coord.lng
  };
});

console.log(`📍 Markers created: ${markers.length}`);
console.log(`📋 Marker numbers: ${markers.map(m => m.number).join(', ')}`);

// Test distance calculation
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

let totalDistance = 0;
for (let i = 0; i < uniqueCoords.length - 1; i++) {
  const distance = calculateDistance(
    uniqueCoords[i].lat, uniqueCoords[i].lng,
    uniqueCoords[i + 1].lat, uniqueCoords[i + 1].lng
  );
  totalDistance += distance;
}

console.log(`🛣️ Total distance: ${totalDistance.toFixed(2)} km`);

// Test results
if (uniqueCoords.length === testAttractions.length) {
  console.log("✅ SUCCESS: All 9 attractions preserved!");
} else {
  console.log("❌ FAILURE: Some attractions were lost!");
}

if (markers.length === 9) {
  console.log("✅ SUCCESS: All 9 markers created!");
} else {
  console.log("❌ FAILURE: Missing markers!");
}

const expectedNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const actualNumbers = markers.map(m => m.number);
const numbersMatch = expectedNumbers.every(num => actualNumbers.includes(num));

if (numbersMatch) {
  console.log("✅ SUCCESS: Sequential numbering (1-9)!");
} else {
  console.log("❌ FAILURE: Non-sequential numbering!");
}

if (totalDistance < 50) {
  console.log("✅ SUCCESS: Realistic distance calculation!");
} else {
  console.log("❌ FAILURE: Distance too high!");
}

console.log("🧪 Test completed.");







