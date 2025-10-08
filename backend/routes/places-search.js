const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

// Simple in-memory cache (consider Redis for prod)
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map(); // key -> { ts, data }

// Load curated attractions (if exists)
let curated = {};
try {
  const curatedPath = path.join(__dirname, '..', 'database', 'curated_attractions.json');
  if (fs.existsSync(curatedPath)) {
    const raw = fs.readFileSync(curatedPath, 'utf8');
    curated = JSON.parse(raw);
  }
} catch (_e) {
  curated = {};
}

// Helpers
const googleGetRetry = async (url, attempts = 3, timeoutMs = 8000, backoffMs = 600) => {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!resp.ok) throw new Error(`Google API error: ${resp.status}`);
      return await resp.json();
    } catch (e) {
      clearTimeout(timer);
      lastErr = e;
      if (i < attempts - 1) {
        await sleep(backoffMs * (i + 1));
        continue;
      }
    }
  }
  throw lastErr;
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Minimal async pool for concurrency limiting
const asyncPool = async (limit, tasks, taskFn) => {
  const results = new Array(tasks.length);
  let i = 0;
  const workers = new Array(Math.min(limit, tasks.length)).fill(0).map(async () => {
    for (;;) {
      const cur = i++;
      if (cur >= tasks.length) break;
      results[cur] = await taskFn(tasks[cur], cur);
    }
  });
  await Promise.all(workers);
  return results;
};

const getAddressParts = (addressComponents = []) => {
  const get = (type) => {
    const c = addressComponents.find(a => a.types.includes(type));
    return c ? c.long_name : '';
  };
  return {
    country: get('country'),
    state: get('administrative_area_level_1'),
    district: get('administrative_area_level_2') || get('administrative_area_level_3'),
    city: get('locality') || get('postal_town') || get('sublocality')
  };
};

const looksInsideArea = (placeAddr, target) => {
  if (placeAddr.country && placeAddr.country.toLowerCase() !== 'india') return false;
  const t = target;
  // require state match when provided
  if (t.state && placeAddr.state && placeAddr.state.toLowerCase() !== t.state.toLowerCase()) return false;
  // prefer district/city match if provided
  if (t.district && placeAddr.district && placeAddr.district.toLowerCase() !== t.district.toLowerCase()) return false;
  if (t.city && placeAddr.city && placeAddr.city.toLowerCase() !== t.city.toLowerCase()) return false;
  return true;
};

const CATEGORIES = [
  { key: 'beaches', type: 'tourist_attraction', keyword: 'beach' },
  { key: 'hills_viewpoints', type: 'tourist_attraction', keyword: 'viewpoint hill peak' },
  { key: 'backwaters_lakes_rivers', type: 'natural_feature', keyword: 'backwater lake river' },
  { key: 'temples', type: 'hindu_temple', keyword: '' },
  { key: 'churches_mosques', type: 'church', keyword: '' },
  { key: 'churches_mosques', type: 'mosque', keyword: '' },
  { key: 'museums_heritage', type: 'museum', keyword: '' },
  { key: 'museums_heritage', type: 'tourist_attraction', keyword: 'palace fort heritage' },
  { key: 'parks_sanctuaries', type: 'park', keyword: '' },
  { key: 'parks_sanctuaries', type: 'zoo', keyword: '' },
  { key: 'parks_sanctuaries', type: 'natural_feature', keyword: 'wildlife sanctuary national park' },
  { key: 'waterfalls', type: 'natural_feature', keyword: 'waterfall' },
  // Malls / modern shopping: broaden types and keywords to catch branded malls (e.g., LuLu Mall)
  { key: 'malls_modern', type: 'shopping_mall', keyword: 'mall plaza shopping center shopping centre lulu' },
  { key: 'malls_modern', type: 'department_store', keyword: 'mall shopping' },
  { key: 'malls_modern', type: 'supermarket', keyword: 'hypermarket mall' },
  { key: 'other', type: 'tourist_attraction', keyword: '' }
];

const rank = (arr, center) => {
  const distance = (a) => {
    if (!a.geometry || !a.geometry.location) return 999999;
    const { lat, lng } = a.geometry.location;
    const dx = (lat - center.lat);
    const dy = (lng - center.lng);
    return dx * dx + dy * dy;
  };
  arr.sort((a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0)
    || (b.rating || 0) - (a.rating || 0)
    || distance(a) - distance(b));
  return arr;
};

router.get('/', async (req, res) => {
  if (!GOOGLE_KEY) return res.status(400).json({ success: false, message: 'Missing GOOGLE_PLACES_API_KEY' });
  const location = (req.query.location || '').trim();
  const rankByDistance = String(req.query.rankby || '').toLowerCase() === 'distance';
  if (!location) return res.status(400).json({ success: false, message: 'location is required' });
  try {
    // -1) Curated fallback first
    const lc = location.toLowerCase();
    const curatedHit = curated[lc] || curated[lc.replace(/\s+/g, ' ')] || curated[lc.split(',')[0]?.trim()] || null;
    if (curatedHit) {
      return res.json({ success: true, categories: curatedHit });
    }

    // 0) Cache check
    const cacheKey = JSON.stringify({ v: 2, location: location.toLowerCase(), rankByDistance });
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS) {
      return res.json(cached.data);
    }

    // 1) Geocode to center + admin parts
    const geo = await googleGetRetry(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&components=country:IN&key=${GOOGLE_KEY}`);
    if (!geo.results || geo.results.length === 0) return res.status(404).json({ success: false, message: 'Destination not found' });
    const center = geo.results[0].geometry.location;
    const targetParts = getAddressParts(geo.results[0].address_components);

    // 2) For each category, run nearby search and collect details (parallelized)
    const grouped = {};

    const processSpec = async (spec) => {
      const keywords = spec.keyword ? spec.keyword.split(' ') : [''];
      const seen = new Set();
      const rawResults = [];

      // Run each keyword search in parallel
      await Promise.all(keywords.map(async (kw) => {
        const base = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${center.lat},${center.lng}`;
        const query = rankByDistance
          ? `${base}&rankby=distance&type=${spec.type}${kw ? `&keyword=${encodeURIComponent(kw)}` : ''}&key=${GOOGLE_KEY}`
          : `${base}&radius=25000&type=${spec.type}${kw ? `&keyword=${encodeURIComponent(kw)}` : ''}&key=${GOOGLE_KEY}`;

        let pageUrl = query; let page = 0;
        do {
          let data;
          try {
            data = await googleGetRetry(pageUrl, 3, 8000);
          } catch (_e) {
            break; // skip this keyword/page on failure
          }
          for (const r of (data.results || [])) {
            if (seen.has(r.place_id)) continue;
            seen.add(r.place_id);
            rawResults.push(r);
          }
          if (data.next_page_token && page < 1) {
            page++;
            await sleep(2000);
            pageUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${data.next_page_token}&key=${GOOGLE_KEY}`;
          } else {
            pageUrl = null;
          }
        } while (pageUrl);
      }));

      // Fetch minimal details with field mask to filter inside area, limit concurrency and count
      const MAX_DETAILS = 60;
      const subset = rawResults.slice(0, MAX_DETAILS);
      const detailed = await asyncPool(5, subset, async (r) => {
        try {
          const d = await googleGetRetry(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${r.place_id}&fields=name,types,geometry,formatted_address,address_components,rating,user_ratings_total,place_id&key=${GOOGLE_KEY}`, 2, 7000);
          return d && d.result ? d.result : r;
        } catch (_e) {
          return r; // fallback to minimal result
        }
      });

      const filtered = detailed.filter((p) => {
        const addrParts = getAddressParts(p.address_components || []);
        return looksInsideArea(addrParts, targetParts);
      });

      const ranked = rank(filtered, center)
        .slice(0, 40)
        .map(p => ({
          id: p.place_id,
          name: p.name,
          coordinates: { lat: p.geometry?.location?.lat, lon: p.geometry?.location?.lng },
          rating: p.rating,
          user_ratings_total: p.user_ratings_total
        }));

      return { key: spec.key, items: ranked };
    };

    const specResults = await Promise.allSettled(CATEGORIES.map(processSpec));
    for (const r of specResults) {
      if (r.status === 'fulfilled') {
        const { key, items } = r.value;
        if (items && items.length > 0) {
          grouped[key] = (grouped[key] || []).concat(items);
        }
      }
    }

    const response = { success: true, categories: grouped };

    // 3) Save to cache
    cache.set(cacheKey, { ts: Date.now(), data: response });

    return res.json(response);
  } catch (e) {
    console.error('Google places search error:', e.message);
    return res.status(500).json({ success: false, message: 'Google places search failed', error: e.message });
  }
});

module.exports = router;


