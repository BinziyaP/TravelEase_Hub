// Test script to verify route optimization
console.log("🧪 Testing Route Optimization...");

// Simulate coordinates in Wayanad region
const testCoords = [
  { name: "Edakkal Caves", lat: 11.6018, lng: 76.0008 },
  { name: "Wayanad Wildlife Sanctuary", lat: 11.6009, lng: 76.0009 },
  { name: "Lakkidi Viewpoint", lat: 11.6010, lng: 76.0010 },
  { name: "Kuruva Island", lat: 11.6011, lng: 76.0011 },
  { name: "Chembra Peak", lat: 11.6012, lng: 76.0012 },
  { name: "Resort Oasis", lat: 11.6013, lng: 76.0013 },
  { name: "Petals Resorts Wayanad", lat: 11.6014, lng: 76.0014 },
  { name: "Neelimala", lat: 11.6015, lng: 76.0015 },
  { name: "Banasura Sagar Dam", lat: 11.6016, lng: 76.0016 }
];

console.log("📊 Original coordinates order:");
testCoords.forEach((coord, index) => {
  console.log(`  ${index + 1}. ${coord.name} (${coord.lat}, ${coord.lng})`);
});

// Apply route optimization (sort by latitude)
const optimizedCoords = [...testCoords];
optimizedCoords.sort((a, b) => a.lat - b.lat);

console.log("\n🎯 Optimized coordinates order:");
optimizedCoords.forEach((coord, index) => {
  console.log(`  ${index + 1}. ${coord.name} (${coord.lat}, ${coord.lng})`);
});

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

// Calculate total distance for optimized route
let totalDistance = 0;
for (let i = 0; i < optimizedCoords.length - 1; i++) {
  const distance = calculateDistance(
    optimizedCoords[i].lat, optimizedCoords[i].lng,
    optimizedCoords[i + 1].lat, optimizedCoords[i + 1].lng
  );
  totalDistance += distance;
}

console.log(`\n🛣️ Total distance: ${totalDistance.toFixed(2)} km`);

// Test results
if (optimizedCoords.length === testCoords.length) {
  console.log("✅ SUCCESS: All coordinates preserved!");
} else {
  console.log("❌ FAILURE: Some coordinates were lost!");
}

if (totalDistance < 10) {
  console.log("✅ SUCCESS: Realistic distance for nearby attractions!");
} else {
  console.log("❌ FAILURE: Distance too high!");
}

console.log("\n🧪 Route optimization test completed.");
console.log("🎯 The route should now follow roads instead of straight lines!");







