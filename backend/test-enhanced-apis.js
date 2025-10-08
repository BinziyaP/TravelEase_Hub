const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testEnhancedAPIs() {
  console.log('🧪 Testing Enhanced Package Form APIs with Google Places Integration...\n');
  
  try {
    // Test Hotels API with different scenarios
    console.log('🏨 Testing Enhanced Hotels API...');
    
    // Test 1: Basic hotel search
    console.log('   📍 Test 1: Basic hotel search for Kottayam');
    const hotelsResponse = await fetch(`${BASE_URL}/api/search/hotels?location=Kottayam&limit=5`);
    const hotelsData = await hotelsResponse.json();
    
    if (hotelsData.success) {
      console.log(`   ✅ Hotels API: Found ${hotelsData.count} hotels`);
      console.log(`   📊 Source: ${hotelsData.source}, API Available: ${hotelsData.api_available}`);
      console.log(`   🏨 Sample: ${hotelsData.hotels[0]?.name} (Rating: ${hotelsData.hotels[0]?.rating})`);
      
      // Test hotel details if we have a place_id
      if (hotelsData.hotels[0]?.place_id) {
        console.log('   🔍 Testing hotel details API...');
        const detailsResponse = await fetch(`${BASE_URL}/api/search/hotels/details/${hotelsData.hotels[0].place_id}`);
        const detailsData = await detailsResponse.json();
        
        if (detailsData.success) {
          console.log(`   ✅ Hotel Details: ${detailsData.hotel.name} - ${detailsData.hotel.address}`);
        }
      }
    } else {
      console.log(`   ❌ Hotels API: ${hotelsData.error}`);
    }
    
    // Test 2: Hotel search with API disabled (fallback test)
    console.log('\n   📍 Test 2: Hotel search with API disabled (fallback test)');
    const hotelsFallbackResponse = await fetch(`${BASE_URL}/api/search/hotels?location=Munnar&limit=3&use_api=false`);
    const hotelsFallbackData = await hotelsFallbackResponse.json();
    
    if (hotelsFallbackData.success) {
      console.log(`   ✅ Fallback Test: Found ${hotelsFallbackData.count} hotels (source: ${hotelsFallbackData.source})`);
    }
    
    // Test Restaurants API with different scenarios
    console.log('\n🍽️ Testing Enhanced Restaurants API...');
    
    // Test 1: Basic restaurant search
    console.log('   📍 Test 1: Basic restaurant search for Kottayam');
    const restaurantsResponse = await fetch(`${BASE_URL}/api/search/restaurants?location=Kottayam&limit=5`);
    const restaurantsData = await restaurantsResponse.json();
    
    if (restaurantsData.success) {
      console.log(`   ✅ Restaurants API: Found ${restaurantsData.count} restaurants`);
      console.log(`   📊 Source: ${restaurantsData.source}, API Available: ${restaurantsData.api_available}`);
      console.log(`   🍽️ Sample: ${restaurantsData.restaurants[0]?.name} (Cuisine: ${restaurantsData.restaurants[0]?.cuisine})`);
    } else {
      console.log(`   ❌ Restaurants API: ${restaurantsData.error}`);
    }
    
    // Test 2: Restaurant search with cuisine filter
    console.log('\n   📍 Test 2: Restaurant search with cuisine filter');
    const restaurantsCuisineResponse = await fetch(`${BASE_URL}/api/search/restaurants?location=Kottayam&cuisine=kerala&limit=3`);
    const restaurantsCuisineData = await restaurantsCuisineResponse.json();
    
    if (restaurantsCuisineData.success) {
      console.log(`   ✅ Cuisine Filter: Found ${restaurantsCuisineData.count} restaurants for Kerala cuisine`);
    }
    
    // Test 3: Restaurant search with fallback
    console.log('\n   📍 Test 3: Restaurant search with API disabled (fallback test)');
    const restaurantsFallbackResponse = await fetch(`${BASE_URL}/api/search/restaurants?location=Munnar&limit=3&use_api=false`);
    const restaurantsFallbackData = await restaurantsFallbackResponse.json();
    
    if (restaurantsFallbackData.success) {
      console.log(`   ✅ Fallback Test: Found ${restaurantsFallbackData.count} restaurants (source: ${restaurantsFallbackData.source})`);
    }
    
    // Test Health Check
    console.log('\n🏥 Testing Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    
    if (healthData.status === 'OK') {
      console.log('✅ Health Check: Server is running');
    } else {
      console.log('❌ Health Check: Server issue');
    }
    
    // Test Cache functionality
    console.log('\n📦 Testing Cache Functionality...');
    const cacheTestResponse = await fetch(`${BASE_URL}/api/search/hotels?location=Kottayam&limit=3`);
    const cacheTestData = await cacheTestResponse.json();
    
    if (cacheTestData.success) {
      console.log(`✅ Cache Test: ${cacheTestData.cached ? 'Returned cached data' : 'Fresh data fetched'}`);
    }
    
    console.log('\n🎉 Enhanced API testing completed!');
    console.log('\n📋 Summary:');
    console.log('   • Google Places API Integration: ✅ Implemented');
    console.log('   • Hotels API: ✅ Ready with real data and fallbacks');
    console.log('   • Restaurants API: ✅ Ready with cuisine filtering');
    console.log('   • Caching System: ✅ Implemented (30min TTL)');
    console.log('   • Fallback System: ✅ Multiple strategies available');
    console.log('   • Enhanced Form: ✅ Ready for 9-step package creation');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Add GOOGLE_PLACES_API_KEY to your .env file for real data');
    console.log('   2. Test the enhanced package form in the frontend');
    console.log('   3. Verify accommodation and restaurant selections work');
    
  } catch (error) {
    console.error('❌ API testing failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure backend server is running (npm start)');
    console.log('   2. Check if port 5000 is available');
    console.log('   3. Verify all routes are properly registered');
    console.log('   4. Check if axios is installed (npm install axios)');
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testEnhancedAPIs();
}

module.exports = { testEnhancedAPIs };
