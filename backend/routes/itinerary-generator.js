const express = require('express');
const axios = require('axios');
const router = express.Router();

const SERVICE_URL = process.env.ITINERARY_SERVICE_URL || 'http://localhost:5055';

router.get('/health', async (req, res) => {
	try {
		const r = await axios.get(`${SERVICE_URL}/health`, { timeout: 5000 });
		return res.json({ success: true, service: r.data });
	} catch (err) {
		return res.status(502).json({ success: false, error: 'Service unavailable' });
	}
});

router.post('/generate', async (req, res) => {
	try {
		const payload = req.body || {};
		const { data } = await axios.post(`${SERVICE_URL}/generate`, payload, { timeout: 20000 });
		return res.json(data);
	} catch (err) {
		const status = err.response?.status || 502;
		const details = err.response?.data || { message: err.message };
		return res.status(status).json({ success: false, error: 'Itinerary generation failed', details });
	}
});

module.exports = router;






























