const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

router.get('/', async (req, res) => {
  try {
    if (!GOOGLE_KEY) return res.status(400).json({ success: false, message: 'Missing GOOGLE_PLACES_API_KEY' });
    const input = (req.query.input || '').trim();
    if (input.length < 2) return res.json({ success: true, predictions: [] });
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:in&types=(cities)&key=${GOOGLE_KEY}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Google Autocomplete error ${r.status}`);
    const data = await r.json();
    const predictions = (data.predictions || []).map(p => ({
      description: p.description,
      place_id: p.place_id,
      types: p.types || []
    }));
    res.json({ success: true, predictions });
  } catch (e) {
    console.error('Places autocomplete error:', e.message);
    res.status(500).json({ success: false, message: 'Autocomplete failed' });
  }
});

module.exports = router;


