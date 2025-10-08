# -*- coding: utf-8 -*-
import os
import math
import json
from typing import List, Dict, Any
from flask import Flask, request, jsonify
from flask_cors import CORS

# Optional OpenAI support (fallback to heuristic if not configured)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
try:
	import openai  # type: ignore
	if OPENAI_API_KEY:
		openai.api_key = OPENAI_API_KEY
except Exception:  # pragma: no cover
	openai = None  # type: ignore

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv('ITINERARY_SERVICE_PORT', '5055'))


def haversine_distance_km(a: Dict[str, float], b: Dict[str, float]) -> float:
	R = 6371.0
	lat1 = math.radians(a.get('lat', 0.0))
	lon1 = math.radians(a.get('lng', 0.0))
	lat2 = math.radians(b.get('lat', 0.0))
	lon2 = math.radians(b.get('lng', 0.0))
	dlat = lat2 - lat1
	dlon = lon2 - lon1
	c = math.sin(dlat/2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2) ** 2
	d = 2 * R * math.asin(math.sqrt(c))
	return d


def to_activity_value(name: str, kind: str) -> str:
	return f"{kind}:{name}"


def simple_cluster(attractions: List[Dict[str, Any]], days: int) -> List[List[Dict[str, Any]]]:
	"""Cluster attractions into N days by greedy nearest-neighbor bucketing."""
	if not attractions:
		return [[] for _ in range(days)]

	# Seed: sort by latitude then split
	sorted_atts = sorted(attractions, key=lambda x: (x.get('coordinates', {}).get('lat', 0), x.get('coordinates', {}).get('lng', 0)))
	clusters: List[List[Dict[str, Any]]] = [[] for _ in range(days)]
	for idx, att in enumerate(sorted_atts):
		clusters[idx % days].append(att)
	return clusters


def build_daily_itinerary(days: int, attractions: List[Dict[str, Any]], accommodations: List[Dict[str, Any]], restaurants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
	clusters = simple_cluster(attractions, max(1, days))
	result: List[Dict[str, Any]] = []
	for i in range(max(1, days)):
		day_plan: Dict[str, Any] = {}
		# Morning: a top attraction for the cluster
		if clusters[i]:
			day_plan['morning'] = to_activity_value(clusters[i][0]['name'], 'attraction')
		# Afternoon: next attraction or free time
		if len(clusters[i]) > 1:
			day_plan['afternoon'] = to_activity_value(clusters[i][1]['name'], 'attraction')
		else:
			day_plan['afternoon'] = 'free_time'
		# Evening: restaurant or check-in
		if restaurants:
			day_plan['evening'] = to_activity_value(restaurants[i % len(restaurants)]['name'], 'restaurant')
		elif accommodations:
			day_plan['evening'] = 'check_in'
		else:
			day_plan['evening'] = 'travel'
		result.append(day_plan)
	return result


def summarize_with_openai(payload: Dict[str, Any]) -> str:
	if not OPENAI_API_KEY or not openai:
		return ''
	try:
		prompt = (
			"You are a travel planner. Given the JSON payload, output a short bullet summary of the itinerary focusing on reasoning for day splits and ordering.\n" 
			f"JSON:\n{json.dumps(payload)[:6000]}\n"
		)
		resp = openai.ChatCompletion.create(
			model=os.getenv('OPENAI_MODEL', 'gpt-4o-mini'),
			messages=[{"role": "user", "content": prompt}],
			max_tokens=250,
		)
		return resp.choices[0].message['content']  # type: ignore
	except Exception:
		return ''


@app.route('/health', methods=['GET'])
def health():
	return jsonify({"status": "ok", "service": "itinerary-generator"})


@app.route('/generate', methods=['POST'])
def generate():
	data = request.get_json(silent=True) or {}
	duration = int(data.get('duration_days') or data.get('duration') or 1)
	attractions = data.get('attractions') or []
	accommodations = data.get('accommodations') or []
	restaurants = data.get('restaurants') or []

	# Normalize minimal fields required
	def normalize(items, kind):
		out = []
		for it in items:
			out.append({
				"name": it.get('name') or it.get('title') or 'Unknown',
				"coordinates": it.get('coordinates') or it.get('location') or {"lat": it.get('lat', 0.0), "lng": it.get('lng', 0.0)},
				"kind": kind
			})
		return out

	n_attractions = normalize(attractions, 'attraction')
	n_accommodations = normalize(accommodations, 'accommodation')
	n_restaurants = normalize(restaurants, 'restaurant')

	daily = build_daily_itinerary(duration, n_attractions, n_accommodations, n_restaurants)

	summary = summarize_with_openai({
		"duration_days": duration,
		"attractions": n_attractions,
		"accommodations": n_accommodations,
		"restaurants": n_restaurants,
		"itinerary": daily
	})

	return jsonify({
		"success": True,
		"itinerary": daily,
		"summary": summary,
		"model_used": bool(summary)
	})


if __name__ == '__main__':
	app.run(host='0.0.0.0', port=PORT)
