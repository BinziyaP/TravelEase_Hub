# Geocoding API Guide

This guide explains how to use the free geocoding functionality in the TravelEase API, which uses OpenStreetMap's Nominatim API to get coordinates and details for Indian places.

## 🚀 Quick Start

### Start the Server
```bash
cd backend
npm start
# or
node server.js
```

### Test the API
```bash
node test-geocoding.js
```

## 📍 API Endpoints

### 1. Single Place Geocoding
**GET** `/api/geocode?place=<PLACE_NAME>`

Get coordinates and details for a single Indian place.

#### Example Request:
```bash
curl "http://localhost:5000/api/geocode?place=Tiruvalla"
```

#### Example Response:
```json
{
  "success": true,
  "data": {
    "display_name": "Tiruvalla, Kerala, India",
    "lat": "9.3833",
    "lon": "76.5667",
    "type": "city",
    "importance": 0.5,
    "place_id": "123456789",
    "address": {
      "city": "Tiruvalla",
      "state": "Kerala",
      "country": "India",
      "postcode": "689101"
    }
  },
  "searched": "Tiruvalla",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Batch Geocoding
**POST** `/api/geocode/batch`

Geocode multiple places at once (maximum 10 places per request).

#### Example Request:
```bash
curl -X POST "http://localhost:5000/api/geocode/batch" \
  -H "Content-Type: application/json" \
  -d '{"places": ["Tiruvalla", "Kanjirappally", "Ponkunnam"]}'
```

#### Example Response:
```json
{
  "success": true,
  "results": [
    {
      "place": "Tiruvalla",
      "success": true,
      "data": {
        "display_name": "Tiruvalla, Kerala, India",
        "lat": "9.3833",
        "lon": "76.5667",
        "type": "city"
      }
    }
  ],
  "errors": [],
  "total": 3,
  "successful": 3,
  "failed": 0,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Reverse Geocoding
**GET** `/api/geocode/reverse?lat=<LATITUDE>&lon=<LONGITUDE>`

Get place name from coordinates.

#### Example Request:
```bash
curl "http://localhost:5000/api/geocode/reverse?lat=9.3833&lon=76.5667"
```

#### Example Response:
```json
{
  "success": true,
  "data": {
    "display_name": "Tiruvalla, Kerala, India",
    "lat": "9.3833",
    "lon": "76.5667",
    "type": "city",
    "address": {
      "city": "Tiruvalla",
      "state": "Kerala",
      "country": "India",
      "postcode": "689101"
    }
  },
  "coordinates": {
    "lat": 9.3833,
    "lon": 76.5667
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🎯 Supported Places

The API works for **ALL Indian places** including:

### Major Cities
- Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad, Jaipur, Agra, Udaipur, Goa

### Kerala Places
- Tiruvalla, Kanjirappally, Ponkunnam, Edakkara, Kayamkulam, Nilambur, Malappuram, Kottakkal, Ponnani, Perinthalmanna, Manjeri, Tirur, Guruvayur, Wayanad, Idukki, Pathanamthitta, Kottayam, Alappuzha, Kasargod

### Small Towns & Villages
- Any city, town, village, or locality in India
- The API automatically detects the place type (city, town, village, etc.)

## 🔧 Features

### ✅ What Works
- **All Indian places** - cities, towns, villages, localities
- **Automatic place type detection** - city, town, village, etc.
- **Comprehensive address details** - city, state, country, postcode
- **Rate limiting** - 50 requests per 15 minutes per IP
- **Error handling** - proper error messages for invalid inputs
- **Batch processing** - geocode multiple places at once
- **Reverse geocoding** - get place name from coordinates

### 🚫 Restrictions
- **India only** - non-Indian places are rejected
- **Rate limited** - 50 requests per 15 minutes per IP
- **Batch limit** - maximum 10 places per batch request

## 📝 Response Fields

### Success Response
- `success`: `true`
- `data`: Object containing:
  - `display_name`: Full address string
  - `lat`: Latitude (string)
  - `lon`: Longitude (string)
  - `type`: Place type (city, town, village, etc.)
  - `importance`: Relevance score (0-1)
  - `place_id`: OpenStreetMap place ID
  - `address`: Object with city, state, country, postcode
- `searched`: Original search term
- `timestamp`: ISO timestamp

### Error Response
- `success`: `false`
- `message`: Error description
- Additional error-specific fields

## 🚨 Error Handling

### Common Error Cases
1. **Missing place parameter**: `Place parameter is required`
2. **Empty place**: `Place parameter is required and must be a non-empty string`
3. **Non-Indian place**: `Only Indian places are allowed for geocoding`
4. **No results found**: `No results found for "PLACE_NAME"`
5. **Invalid coordinates**: `Invalid coordinates provided`
6. **Rate limit exceeded**: `Too many geocoding requests from this IP`

## 💡 Usage Examples

### JavaScript/Frontend
```javascript
// Single place geocoding
async function geocodePlace(placeName) {
  try {
    const response = await fetch(`/api/geocode?place=${encodeURIComponent(placeName)}`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`Found: ${data.data.display_name}`);
      console.log(`Coordinates: ${data.data.lat}, ${data.data.lon}`);
      return data.data;
    } else {
      console.error(`Error: ${data.message}`);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
geocodePlace('Tiruvalla').then(result => {
  if (result) {
    // Use the coordinates
    console.log(`Latitude: ${result.lat}, Longitude: ${result.lon}`);
  }
});
```

### Node.js/Backend
```javascript
const fetch = require('node-fetch');

async function geocodePlace(placeName) {
  try {
    const response = await fetch(`http://localhost:5000/api/geocode?place=${encodeURIComponent(placeName)}`);
    const data = await response.json();
    
    if (data.success) {
      return {
        name: data.data.display_name,
        latitude: parseFloat(data.data.lat),
        longitude: parseFloat(data.data.lon),
        type: data.data.type
      };
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Usage
geocodePlace('Kanjirappally').then(result => {
  if (result) {
    console.log(`Found: ${result.name} at ${result.latitude}, ${result.longitude}`);
  }
});
```

## 🔒 Rate Limiting

- **Single requests**: 50 requests per 15 minutes per IP
- **Batch requests**: Same limit applies
- **User-Agent**: Required by Nominatim API (automatically set)

## 🌐 External API

This service uses OpenStreetMap's Nominatim API:
- **URL**: `https://nominatim.openstreetmap.org/search`
- **Free**: No API key required
- **Rate limit**: Respectful usage (delays between requests)
- **User-Agent**: `TravelEase-Geocoding/1.0 (contact@travelease.com)`

## 🧪 Testing

Run the test script to verify functionality:
```bash
node test-geocoding.js
```

The test script will:
- Test single geocoding for various Indian places
- Test batch geocoding
- Test reverse geocoding
- Test error cases
- Show detailed results

## 📞 Support

For issues or questions:
1. Check the error messages in API responses
2. Verify the place name spelling
3. Ensure the place is in India
4. Check rate limiting (wait 15 minutes if exceeded)
5. Run the test script to verify server functionality
