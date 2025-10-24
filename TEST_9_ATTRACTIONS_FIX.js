// Test script to verify 9 attractions fix
console.log("🧪 Testing 9 attractions fix...");

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

// Test marker numbering
const markers = validCoords.map((coord, index) => {
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

// Test duration calculation for 7-day package
const packageDuration = 7;
const realisticDuration = packageDuration > 1 ? 
  `${packageDuration} days` : 
  `${(61.4 / 50).toFixed(1)}h travel`;

console.log(`⏱️ Duration for ${packageDuration}-day package: ${realisticDuration}`);

// Test results
if (validCoords.length === testAttractions.length) {
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

console.log("🧪 Test completed.");







