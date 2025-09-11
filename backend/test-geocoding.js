/**
 * Test script for the geocoding API
 * Tests various Indian places including small towns and villages
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

// Test cases - various Indian places including small towns
const testPlaces = [
  // Kerala places (as mentioned in requirements)
  'Tiruvalla',
  'Kanjirappally', 
  'Ponkunnam',
  'Edakkara',
  'Kayamkulam',
  'Nilambur',
  'Malappuram',
  'Kottakkal',
  'Ponnani',
  'Perinthalmanna',
  'Manjeri',
  'Tirur',
  'Guruvayur',
  'Wayanad',
  'Idukki',
  'Pathanamthitta',
  'Kottayam',
  'Alappuzha',
  'Kasargod',
  
  // Other Indian places
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Agra',
  'Udaipur',
  'Goa',
  'Kochi',
  'Thiruvananthapuram',
  'Thrissur',
  'Calicut',
  'Kannur',
  'Kollam',
  'Palakkad',
  'Mysore',
  
  // Small towns and villages
  'Tirupati',
  'Vijayawada',
  'Visakhapatnam',
  'Warangal',
  'Nizamabad',
  'Khammam',
  'Karimnagar',
  'Ramagundam',
  'Mahbubnagar',
  'Nalgonda',
  'Adilabad',
  'Suryapet',
  'Miryalaguda',
  'Siddipet',
  'Jagtial',
  'Kamareddy',
  'Sangareddy',
  'Wanaparthy',
  'Medak',
  'Nagarkurnool',
  'Vikarabad',
  'Jangaon',
  'Bhadrachalam',
  'Bhongir',
  'Bodhan'
];

/**
 * Test single geocoding request
 */
async function testSingleGeocoding(place) {
  try {
    console.log(`\n🔍 Testing: "${place}"`);
    
    const response = await fetch(`${BASE_URL}/geocode?place=${encodeURIComponent(place)}`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`  ✅ Success: ${data.data.display_name}`);
      console.log(`  📍 Coordinates: ${data.data.lat}, ${data.data.lon}`);
      console.log(`  🏷️ Type: ${data.data.type}`);
      if (data.data.address) {
        console.log(`  🏘️ Address: ${data.data.address.city || 'N/A'}, ${data.data.address.state || 'N/A'}`);
      }
    } else {
      console.log(`  ❌ Failed: ${data.message}`);
    }
    
    return data.success;
  } catch (error) {
    console.log(`  💥 Error: ${error.message}`);
    return false;
  }
}

/**
 * Test batch geocoding
 */
async function testBatchGeocoding(places) {
  try {
    console.log(`\n🔄 Testing batch geocoding for ${places.length} places...`);
    
    const response = await fetch(`${BASE_URL}/geocode/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ places })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`  ✅ Batch successful: ${data.successful}/${data.total} places geocoded`);
      console.log(`  ❌ Failed: ${data.failed} places`);
      
      // Show some successful results
      if (data.results.length > 0) {
        console.log(`  📋 Sample results:`);
        data.results.slice(0, 3).forEach(result => {
          console.log(`    - ${result.place}: ${result.data.display_name}`);
        });
      }
      
      // Show errors if any
      if (data.errors.length > 0) {
        console.log(`  🚨 Errors:`);
        data.errors.slice(0, 3).forEach(error => {
          console.log(`    - ${error.place}: ${error.error}`);
        });
      }
    } else {
      console.log(`  ❌ Batch failed: ${data.message}`);
    }
    
    return data.success;
  } catch (error) {
    console.log(`  💥 Batch error: ${error.message}`);
    return false;
  }
}

/**
 * Test reverse geocoding
 */
async function testReverseGeocoding(lat, lon, expectedPlace) {
  try {
    console.log(`\n🔄 Testing reverse geocoding: ${lat}, ${lon}`);
    
    const response = await fetch(`${BASE_URL}/geocode/reverse?lat=${lat}&lon=${lon}`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`  ✅ Success: ${data.data.display_name}`);
      console.log(`  📍 Coordinates: ${data.data.lat}, ${data.data.lon}`);
      console.log(`  🏷️ Type: ${data.data.type}`);
      if (expectedPlace) {
        const isExpected = data.data.display_name.toLowerCase().includes(expectedPlace.toLowerCase());
        console.log(`  🎯 Expected "${expectedPlace}": ${isExpected ? '✅' : '❌'}`);
      }
    } else {
      console.log(`  ❌ Failed: ${data.message}`);
    }
    
    return data.success;
  } catch (error) {
    console.log(`  💥 Error: ${error.message}`);
    return false;
  }
}

/**
 * Test error cases
 */
async function testErrorCases() {
  console.log(`\n🚨 Testing error cases...`);
  
  const errorTests = [
    { url: `${BASE_URL}/geocode`, description: 'Missing place parameter' },
    { url: `${BASE_URL}/geocode?place=`, description: 'Empty place parameter' },
    { url: `${BASE_URL}/geocode?place=New York`, description: 'Non-Indian place' },
    { url: `${BASE_URL}/geocode?place=NonExistentPlace12345`, description: 'Non-existent place' },
    { url: `${BASE_URL}/geocode/reverse`, description: 'Missing coordinates' },
    { url: `${BASE_URL}/geocode/reverse?lat=invalid&lon=invalid`, description: 'Invalid coordinates' },
    { url: `${BASE_URL}/geocode/reverse?lat=40.7128&lon=-74.0060`, description: 'Coordinates outside India' }
  ];
  
  for (const test of errorTests) {
    try {
      const response = await fetch(test.url);
      const data = await response.json();
      
      if (!data.success) {
        console.log(`  ✅ ${test.description}: ${data.message}`);
      } else {
        console.log(`  ❌ ${test.description}: Expected error but got success`);
      }
    } catch (error) {
      console.log(`  💥 ${test.description}: ${error.message}`);
    }
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting Geocoding API Tests');
  console.log('================================');
  
  // Test server health
  try {
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    console.log(`✅ Server is running: ${healthData.message}`);
  } catch (error) {
    console.log(`❌ Server is not running: ${error.message}`);
    console.log('Please start the server with: npm start or node server.js');
    return;
  }
  
  // Test single geocoding for a few places
  console.log('\n📍 Testing Single Geocoding');
  console.log('============================');
  
  const singleTestPlaces = testPlaces.slice(0, 10); // Test first 10 places
  let singleSuccessCount = 0;
  
  for (const place of singleTestPlaces) {
    const success = await testSingleGeocoding(place);
    if (success) singleSuccessCount++;
    
    // Add delay to be respectful to the API
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n📊 Single Geocoding Results: ${singleSuccessCount}/${singleTestPlaces.length} successful`);
  
  // Test batch geocoding
  console.log('\n📦 Testing Batch Geocoding');
  console.log('===========================');
  
  const batchTestPlaces = testPlaces.slice(10, 15); // Test 5 places in batch
  await testBatchGeocoding(batchTestPlaces);
  
  // Test reverse geocoding
  console.log('\n🔄 Testing Reverse Geocoding');
  console.log('=============================');
  
  const reverseTests = [
    { lat: 9.3833, lon: 76.5667, expected: 'Tiruvalla' },
    { lat: 19.0760, lon: 72.8777, expected: 'Mumbai' },
    { lat: 12.9716, lon: 77.5946, expected: 'Bangalore' }
  ];
  
  for (const test of reverseTests) {
    await testReverseGeocoding(test.lat, test.lon, test.expected);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Test error cases
  await testErrorCases();
  
  console.log('\n✅ All tests completed!');
  console.log('\n📋 API Endpoints:');
  console.log('  - GET /api/geocode?place=<PLACE_NAME>');
  console.log('  - POST /api/geocode/batch');
  console.log('  - GET /api/geocode/reverse?lat=<LAT>&lon=<LON>');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testSingleGeocoding,
  testBatchGeocoding,
  testReverseGeocoding,
  runTests
};
