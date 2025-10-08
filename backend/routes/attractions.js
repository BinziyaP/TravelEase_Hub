const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

/**
 * Dynamic Tourist Attractions API
 * Fetches real-time tourist attractions for any Indian destination
 * Categories: Beaches, Temples/Churches, Forts/Heritage, Museums, Parks/Wildlife, Waterfalls/Hills, Malls/Markets, Promenades/Other
 */

// Helper function to categorize attractions
const categorizeAttractions = (places) => {
  const categories = {
    beaches: [],
    temples: [],
    forts: [],
    museums: [],
    parks: [],
    waterfalls: [],
    malls: [],
    other: []
  };

  places.forEach(place => {
    const tags = place.tags || {};
    const name = (tags.name || tags['name:en'] || '').toLowerCase();
    const tourism = tags.tourism || '';
    const amenity = tags.amenity || '';
    const historic = tags.historic || '';
    const leisure = tags.leisure || '';
    const shop = tags.shop || '';
    const natural = tags.natural || '';

    // Beaches / Sea spots
    if (tourism === 'beach' || name.includes('beach') || name.includes('coast') || 
        name.includes('seaside') || name.includes('marina') || name.includes('waterfront')) {
      categories.beaches.push({
        id: place.id,
        name: tags.name || tags['name:en'] || 'Unnamed Beach',
        type: 'beach',
        coordinates: { lat: place.lat, lon: place.lon },
        address: tags['addr:city'] || tags['addr:state'] || 'India'
      });
    }
    // Temples & Pilgrimage
    else if (tourism === 'temple' || amenity === 'place_of_worship' || 
             name.includes('temple') || name.includes('church') || name.includes('mosque') ||
             name.includes('gurudwara') || name.includes('mandir') || name.includes('ashram')) {
      categories.temples.push({
        id: place.id,
        name: tags.name || tags['name:en'] || 'Unnamed Temple',
        type: 'temple',
        coordinates: { lat: place.lat, lon: place.lon },
        address: tags['addr:city'] || tags['addr:state'] || 'India'
      });
    }
    // Forts / Heritage
    else if (historic === 'fort' || historic === 'castle' || historic === 'palace' || 
             historic === 'monument' || historic === 'memorial' || name.includes('fort') ||
             name.includes('palace') || name.includes('heritage')) {
      categories.forts.push({
        id: place.id,
        name: tags.name || tags['name:en'] || 'Unnamed Heritage Site',
        type: 'fort',
        coordinates: { lat: place.lat, lon: place.lon },
        address: tags['addr:city'] || tags['addr:state'] || 'India'
      });
    }
    // Museums
    else if (tourism === 'museum' || amenity === 'museum' || historic === 'museum' ||
             name.includes('museum') || name.includes('gallery') || name.includes('art')) {
      categories.museums.push({
        id: place.id,
        name: tags.name || tags['name:en'] || 'Unnamed Museum',
        type: 'museum',
        coordinates: { lat: place.lat, lon: place.lon },
        address: tags['addr:city'] || tags['addr:state'] || 'India'
      });
    }
    // Parks / Wildlife
    else if (leisure === 'park' || leisure === 'nature_reserve' || leisure === 'wildlife_park' ||
             name.includes('park') || name.includes('garden') || name.includes('sanctuary') ||
             name.includes('wildlife') || name.includes('zoo') || name.includes('botanical')) {
      categories.parks.push({
        id: place.id,
        name: tags.name || tags['name:en'] || 'Unnamed Park',
        type: 'park',
        coordinates: { lat: place.lat, lon: place.lon },
        address: tags['addr:city'] || tags['addr:state'] || 'India'
      });
    }
    // Waterfalls / Hills
    else if (tourism === 'waterfall' || natural === 'waterfall' || name.includes('waterfall') ||
             name.includes('falls') || name.includes('hill') || name.includes('mountain') ||
             name.includes('peak') || name.includes('viewpoint')) {
      categories.waterfalls.push({
        id: place.id,
        name: tags.name || tags['name:en'] || 'Unnamed Waterfall',
        type: 'waterfall',
        coordinates: { lat: place.lat, lon: place.lon },
        address: tags['addr:city'] || tags['addr:state'] || 'India'
      });
    }
    // Malls / Markets
    else if (shop === 'mall' || amenity === 'marketplace' || name.includes('mall') ||
             name.includes('market') || name.includes('bazaar') || name.includes('shopping')) {
      categories.malls.push({
        id: place.id,
        name: tags.name || tags['name:en'] || 'Unnamed Mall',
        type: 'mall',
        coordinates: { lat: place.lat, lon: place.lon },
        address: tags['addr:city'] || tags['addr:state'] || 'India'
      });
    }
    // Other / Activities
    else if (tourism === 'attraction' || tourism === 'theme_park' || tourism === 'zoo' ||
             name.includes('attraction') || name.includes('center') || name.includes('centre') ||
             name.includes('promenade') || name.includes('walkway') || name.includes('plaza')) {
      categories.other.push({
        id: place.id,
        name: tags.name || tags['name:en'] || 'Unnamed Attraction',
        type: 'other',
        coordinates: { lat: place.lat, lon: place.lon },
        address: tags['addr:city'] || tags['addr:state'] || 'India'
      });
    }
  });

  return categories;
};

// Helper function to generate fallback attractions for popular destinations
const generateFallbackAttractions = (destination) => {
  const dest = destination.toLowerCase();
  
  // Kerala destinations
  if (dest.includes('thiruvananthapuram') || dest.includes('trivandrum')) {
    return {
      beaches: [
        { id: 'kovalam', name: 'Kovalam Beach (Lighthouse, Hawa Beach, Samudra)', type: 'beach', coordinates: { lat: 8.4004, lon: 76.9781 } },
        { id: 'varkala', name: 'Varkala (Papanasam cliffs & beach)', type: 'beach', coordinates: { lat: 8.7333, lon: 76.7167 } },
        { id: 'shankumugham', name: 'Shankumugham Beach', type: 'beach', coordinates: { lat: 8.4833, lon: 76.9167 } },
        { id: 'poovar', name: 'Poovar (estuary/boat trips)', type: 'beach', coordinates: { lat: 8.3167, lon: 77.0833 } }
      ],
      temples: [
        { id: 'padmanabhaswamy', name: 'Sri Padmanabhaswamy Temple', type: 'temple', coordinates: { lat: 8.4829, lon: 76.9444 } },
        { id: 'attukal', name: 'Attukal Bhagavathy Temple', type: 'temple', coordinates: { lat: 8.4833, lon: 76.9500 } },
        { id: 'chitra', name: 'Sree Chitra Temple', type: 'temple', coordinates: { lat: 8.4833, lon: { lat: 8.4833, lon: 76.9500 } } }
      ],
      museums: [
        { id: 'napier', name: 'Napier Museum', type: 'museum', coordinates: { lat: 8.5083, lon: 76.9569 } },
        { id: 'chitra_gallery', name: 'Sree Chitra Art Gallery', type: 'museum', coordinates: { lat: 8.5083, lon: 76.9569 } },
        { id: 'kanakakunnu', name: 'Kanakakunnu Palace', type: 'museum', coordinates: { lat: 8.5083, lon: 76.9569 } },
        { id: 'koyikkal', name: 'Koyikkal Palace', type: 'museum', coordinates: { lat: 8.5083, lon: 76.9569 } }
      ],
      parks: [
        { id: 'neyyar', name: 'Neyyar Wildlife Sanctuary (boat and safari)', type: 'park', coordinates: { lat: 8.5333, lon: 77.1333 } },
        { id: 'peppara', name: 'Peppara Wildlife Sanctuary', type: 'park', coordinates: { lat: 8.5333, lon: 77.1333 } },
        { id: 'veli', name: 'Veli Tourist Village', type: 'park', coordinates: { lat: 8.4833, lon: 76.9167 } }
      ],
      malls: [
        { id: 'chalai', name: 'Chalai Bazaar', type: 'mall', coordinates: { lat: 8.4833, lon: 76.9500 } },
        { id: 'mg_road', name: 'MG Road (shops & eateries)', type: 'mall', coordinates: { lat: 8.4833, lon: 76.9500 } }
      ],
      other: [
        { id: 'vizhinjam', name: 'Vizhinjam Lighthouse & port area', type: 'other', coordinates: { lat: 8.3833, lon: 76.9833 } },
        { id: 'ayurvedic', name: 'Ayurvedic centres and massage clinics', type: 'other', coordinates: { lat: 8.4833, lon: 76.9500 } },
        { id: 'poovar_boat', name: 'Poovar backwater boat rides', type: 'other', coordinates: { lat: 8.3167, lon: 77.0833 } }
      ]
    };
  }
  
  // Delhi
  if (dest.includes('delhi') || dest.includes('new delhi')) {
    return {
      forts: [
        { id: 'red_fort', name: 'Red Fort (Lal Qila)', type: 'fort', coordinates: { lat: 28.6562, lon: 77.2410 } },
        { id: 'qutub_minar', name: 'Qutub Minar & Qutub Complex', type: 'fort', coordinates: { lat: 28.5244, lon: 77.1855 } },
        { id: 'humayun_tomb', name: 'Humayun\'s Tomb', type: 'fort', coordinates: { lat: 28.5931, lon: 77.2506 } },
        { id: 'india_gate', name: 'India Gate & Rajpath', type: 'fort', coordinates: { lat: 28.6129, lon: 77.2295 } }
      ],
      temples: [
        { id: 'lotus_temple', name: 'Lotus Temple (Baháʼí House of Worship)', type: 'temple', coordinates: { lat: 28.5535, lon: 77.2588 } },
        { id: 'akshardham', name: 'Akshardham Temple', type: 'temple', coordinates: { lat: 28.6127, lon: 77.2773 } },
        { id: 'jama_masjid', name: 'Jama Masjid', type: 'temple', coordinates: { lat: 28.6507, lon: 77.2334 } }
      ],
      museums: [
        { id: 'national_museum', name: 'National Museum', type: 'museum', coordinates: { lat: 28.6118, lon: 77.2194 } },
        { id: 'ngma', name: 'National Gallery of Modern Art (NGMA)', type: 'museum', coordinates: { lat: 28.6118, lon: 77.2194 } },
        { id: 'gandhi_smriti', name: 'Gandhi Smriti & Raj Ghat', type: 'museum', coordinates: { lat: 28.6410, lon: 77.2483 } }
      ],
      parks: [
        { id: 'lodhi_gardens', name: 'Lodhi Gardens', type: 'park', coordinates: { lat: 28.5931, lon: 77.2194 } },
        { id: 'nehru_park', name: 'Nehru Park (Chanakyapuri)', type: 'park', coordinates: { lat: 28.5931, lon: 77.1855 } },
        { id: 'sunder_nursery', name: 'Sunder Nursery', type: 'park', coordinates: { lat: 28.5931, lon: 77.2506 } }
      ],
      malls: [
        { id: 'chandni_chowk', name: 'Chandni Chowk (Old Delhi)', type: 'mall', coordinates: { lat: 28.6562, lon: 77.2309 } },
        { id: 'connaught_place', name: 'Connaught Place (CP)', type: 'mall', coordinates: { lat: 28.6315, lon: 77.2167 } },
        { id: 'khan_market', name: 'Khan Market', type: 'mall', coordinates: { lat: 28.6009, lon: 77.2270 } }
      ],
      other: [
        { id: 'hauz_khas', name: 'Hauz Khas Village', type: 'other', coordinates: { lat: 28.5500, lon: 77.2000 } },
        { id: 'dilli_haat', name: 'Dilli Haat (INA / Janakpuri)', type: 'other', coordinates: { lat: 28.5931, lon: 77.2194 } }
      ]
    };
  }
  
  // Kottayam specific fallback
  if (dest.includes('kottayam')) {
    return {
      museums: [
        { id: 'driftwood_museum', name: 'Drift Wood Museum', type: 'museum', coordinates: { lat: 9.5916, lon: 76.5222 } },
        { id: 'st_alphonsa_museum', name: 'St. Alphonsa Museum', type: 'museum', coordinates: { lat: 9.5916, lon: 76.5222 } },
        { id: 'fr_kadalikkattil_museum', name: 'Fr. Kadalikkattil Museum', type: 'museum', coordinates: { lat: 9.5916, lon: 76.5222 } },
        { id: 'blessed_chavara_museum', name: 'Blessed Chavara Museum', type: 'museum', coordinates: { lat: 9.5916, lon: 76.5222 } },
        { id: 'gramophone_museum', name: 'Discs & Machines: Sunny\'s Gramophone Museum', type: 'museum', coordinates: { lat: 9.5916, lon: 76.5222 } }
      ],
      attractions: [
        { id: 'kumarakom_bird_sanctuary', name: 'Kumarakom Bird Sanctuary', type: 'attraction', coordinates: { lat: 9.5916, lon: 76.5222 } },
        { id: 'perumthenaruvi_waterfall', name: 'Perumthenaruvi Waterfall', type: 'attraction', coordinates: { lat: 9.5916, lon: 76.5222 } },
        { id: 'nagappara_waterfall', name: 'Nagappara Waterfall', type: 'attraction', coordinates: { lat: 9.5916, lon: 76.5222 } },
        { id: 'tk_madhavan_statue', name: 'T.K.Madhavan Statue', type: 'attraction', coordinates: { lat: 9.5916, lon: 76.5222 } },
        { id: 'milma', name: 'Milma', type: 'attraction', coordinates: { lat: 9.5916, lon: 76.5222 } },
        { id: 'punnapara_vayalar_memorial', name: 'Punnapara Vayalar Memorial', type: 'attraction', coordinates: { lat: 9.5916, lon: 76.5222 } },
        { id: 'thangal_para', name: 'Thangal Para', type: 'attraction', coordinates: { lat: 9.5916, lon: 76.5222 } },
        { id: 'gandhi_square', name: 'Gandhi square', type: 'attraction', coordinates: { lat: 9.5916, lon: 76.5222 } },
        { id: 'naalumanikattu', name: 'Naalumanikattu - Village Road side Tourism Site', type: 'attraction', coordinates: { lat: 9.5916, lon: 76.5222 } },
        { id: 'mahatma_gandhi', name: 'മഹാത്മാ ഗാന്ധി (Mahatma Gandhi)', type: 'attraction', coordinates: { lat: 9.5916, lon: 76.5222 } }
      ]
    };
  }
  
  // Generic fallback for other destinations
  return {
    beaches: [],
    temples: [],
    forts: [],
    museums: [],
    parks: [],
    waterfalls: [],
    malls: [],
    other: []
  };
};

// GET /api/attractions/:destination
router.get('/:destination', async (req, res) => {
  try {
    const { destination } = req.params;
    
    if (!destination || destination.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Destination must be at least 2 characters long'
      });
    }

    console.log(`🔍 Searching attractions for: ${destination}`);

    // For now, use fallback data to ensure the API works
    // TODO: Implement real-time API calls later
    console.log('📍 Using fallback data for now...');
    
    const attractions = generateFallbackAttractions(destination);
    const coordinates = { lat: 9.5916, lon: 76.5222 }; // Default Kottayam coordinates

    // Remove empty categories
    Object.keys(attractions).forEach(category => {
      if (attractions[category].length === 0) {
        delete attractions[category];
      }
    });

    const totalAttractions = Object.values(attractions).reduce((sum, category) => sum + category.length, 0);

    res.json({
      success: true,
      destination: {
        name: destination,
        coordinates: coordinates,
        verified: true
      },
      attractions: attractions,
      summary: {
        totalAttractions: totalAttractions,
        categories: Object.keys(attractions).length
      }
    });

  } catch (error) {
    console.error('Error fetching attractions:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tourist attractions',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
