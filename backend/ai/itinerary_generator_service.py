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


def calculate_itinerary_price(days: int, attractions: List[Dict[str, Any]], accommodations: List[Dict[str, Any]], restaurants: List[Dict[str, Any]], max_travelers: int = 1, transport_options: List[str] = None) -> Dict[str, Any]:
	"""Calculate comprehensive pricing for the itinerary based on all factors."""
	
	# Base pricing per component per person (in Indian Rupees) - REALISTIC PRICING FOR INDIA
	BASE_ACCOMMODATION_COST_PER_PERSON = 600   # ₹600 per night per person (budget hotels)
	BASE_ATTRACTION_COST_PER_PERSON = 100      # ₹100 per attraction per person (entry fees)
	BASE_RESTAURANT_COST_PER_PERSON = 200      # ₹200 per restaurant visit per person (meal cost)
	BASE_GUIDE_COST_PER_GROUP_PER_DAY = 1200   # ₹1,200 per day for entire group (realistic guide rate)
	BASE_INSURANCE_COST_PER_PERSON = 50        # ₹50 per day per person (travel insurance)
	
	# Transport pricing based on type and distance - MARKET REALISTIC PRICING
	BASE_TRANSPORT_COST_PER_DAY = 300          # ₹300 base transport cost per day
	BASE_TRANSPORT_COST_PER_KM = 5             # ₹5 per km for long distances
	# Add-on transport components (additive)
	LOCAL_TRANSPORT_COST_PER_DAY = 100         # ₹100 per day per person for local city transport
	AIRPORT_TRANSFER_COST_PER_TRIP = 150       # ₹150 per person per airport transfer (one-way)
	
	# Traveler group discounts
	GROUP_DISCOUNT_THRESHOLD = 4  # Apply discount for groups of 4+
	GROUP_DISCOUNT_RATE = 0.1     # 10% discount for large groups
	
	# Calculate total distance for transport pricing
	total_distance = calculate_total_route_distance(attractions, accommodations, restaurants)
	
	# Calculate base costs per person
	accommodation_cost_per_person = BASE_ACCOMMODATION_COST_PER_PERSON * days
	attraction_cost_per_person = BASE_ATTRACTION_COST_PER_PERSON * len(attractions)
	restaurant_cost_per_person = BASE_RESTAURANT_COST_PER_PERSON * len(restaurants)  # Fixed: removed * days
	guide_cost_per_person = (BASE_GUIDE_COST_PER_GROUP_PER_DAY * days) / max_travelers  # Guide cost shared among all travelers
	insurance_cost_per_person = BASE_INSURANCE_COST_PER_PERSON * days
	
	# Transport cost calculation based on distance and transport options
	transport_cost_per_person = BASE_TRANSPORT_COST_PER_DAY * days
	if total_distance > 100:  # For longer distances, add per-km cost
		transport_cost_per_person += (total_distance - 100) * BASE_TRANSPORT_COST_PER_KM
	
	# Adjust transport cost: choose highest-cost intercity mode, and add local components
	transport_multiplier = 1.0
	selected = set((transport_options or []) or [])
	# normalize values sent from UI
	if 'car_rental' in selected:
		selected.add('car')
	
	# Intercity mode multipliers
	mode_multipliers = {
		'flights': 2.5,
		'train': 1.8,
		'bus': 1.2,
		'car': 1.5
	}
	if selected:
		present_modes = [mode_multipliers[m] for m in mode_multipliers.keys() if m in selected]
		if present_modes:
			transport_multiplier = max(present_modes)
	
	transport_cost_per_person *= transport_multiplier
	
	# Additive local components
	if 'local_transport' in selected:
		transport_cost_per_person += LOCAL_TRANSPORT_COST_PER_DAY * days
	# Assume two transfers by default (to and from airport) if selected
	if 'airport_transfer' in selected:
		transport_cost_per_person += AIRPORT_TRANSFER_COST_PER_TRIP * 2
	
	# Calculate total cost for all travelers
	total_accommodation_cost = accommodation_cost_per_person * max_travelers
	total_attraction_cost = attraction_cost_per_person * max_travelers
	total_restaurant_cost = restaurant_cost_per_person * max_travelers
	total_transport_cost = transport_cost_per_person * max_travelers
	total_guide_cost = BASE_GUIDE_COST_PER_GROUP_PER_DAY * days  # Guide cost is per group, not per person
	total_insurance_cost = insurance_cost_per_person * max_travelers
	
	# Apply group discount if applicable
	group_discount = 0
	if max_travelers >= GROUP_DISCOUNT_THRESHOLD:
		subtotal_before_discount = (total_accommodation_cost + total_attraction_cost + 
								   total_restaurant_cost + total_transport_cost + 
								   total_guide_cost + total_insurance_cost)
		group_discount = subtotal_before_discount * GROUP_DISCOUNT_RATE
	
	# Calculate subtotal after group discount
	subtotal = (total_accommodation_cost + total_attraction_cost + total_restaurant_cost + 
				total_transport_cost + total_guide_cost + total_insurance_cost - group_discount)
	
	# Add margins and fees - REALISTIC MARGINS FOR INDIA
	agency_margin = subtotal * 0.10  # 10% agency margin (realistic for travel industry)
	service_fee = subtotal * 0.02    # 2% service fee (minimal)
	taxes = subtotal * 0.05          # 5% GST (realistic for travel packages in India)
	
	# Final total
	total_price = subtotal + agency_margin + service_fee + taxes
	
	return {
		"pricing_factors": {
			"days": days,
			"max_travelers": max_travelers,
			"attractions_count": len(attractions),
			"restaurants_count": len(restaurants),
			"accommodations_count": len(accommodations),
			"transport_options": transport_options or [],
			"total_distance_km": round(total_distance, 2),
			"group_discount_applied": group_discount > 0
		},
		"base_costs_per_person": {
			"accommodation": round(accommodation_cost_per_person, 2),
			"attractions": round(attraction_cost_per_person, 2),
			"restaurants": round(restaurant_cost_per_person, 2),
			"transport": round(transport_cost_per_person, 2),
			"guide": round(guide_cost_per_person, 2),
			"insurance": round(insurance_cost_per_person, 2)
		},
		"total_costs": {
			"accommodation": round(total_accommodation_cost, 2),
			"attractions": round(total_attraction_cost, 2),
			"restaurants": round(total_restaurant_cost, 2),
			"transport": round(total_transport_cost, 2),
			"guide": round(total_guide_cost, 2),
			"insurance": round(total_insurance_cost, 2),
			"group_discount": round(group_discount, 2)
		},
		"fees_and_margins": {
			"agency_margin": round(agency_margin, 2),
			"service_fee": round(service_fee, 2),
			"taxes": round(taxes, 2)
		},
		"totals": {
			"subtotal": round(subtotal, 2),
			"total_price": round(total_price, 2),
			"price_per_person": round(total_price / max_travelers, 2)
		},
		"route_info": {
			"total_distance_km": round(total_distance, 2),
			"estimated_travel_time_hours": round(total_distance / 60, 1),  # Assume 60km/h average
			"transport_type_multiplier": round(transport_multiplier, 1)
		}
	}


def calculate_total_route_distance(attractions: List[Dict[str, Any]], accommodations: List[Dict[str, Any]], restaurants: List[Dict[str, Any]]) -> float:
	"""Calculate total route distance using haversine formula."""
	
	all_locations = []
	
	# Add accommodation locations
	for acc in accommodations:
		coords = acc.get('coordinates', {})
		if coords.get('lat') and coords.get('lng'):
			all_locations.append(coords)
	
	# Add attraction locations
	for attr in attractions:
		coords = attr.get('coordinates', {})
		if coords.get('lat') and coords.get('lng'):
			all_locations.append(coords)
	
	# Add restaurant locations
	for rest in restaurants:
		coords = rest.get('coordinates', {})
		if coords.get('lat') and coords.get('lng'):
			all_locations.append(coords)
	
	if len(all_locations) < 2:
		return 0.0
	
	# Calculate total distance by visiting all locations in sequence
	total_distance = 0.0
	for i in range(len(all_locations) - 1):
		distance = haversine_distance_km(all_locations[i], all_locations[i + 1])
		total_distance += distance
	
	return total_distance


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
	max_travelers = int(data.get('max_travelers') or data.get('travelers') or 1)
	transport_options = data.get('transport_options') or data.get('transportationOptions') or []

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

	# Calculate pricing and route information with all factors
	pricing_info = calculate_itinerary_price(
		duration, 
		n_attractions, 
		n_accommodations, 
		n_restaurants,
		max_travelers,
		transport_options
	)

	summary = summarize_with_openai({
		"duration_days": duration,
		"max_travelers": max_travelers,
		"attractions": n_attractions,
		"accommodations": n_accommodations,
		"restaurants": n_restaurants,
		"transport_options": transport_options,
		"itinerary": daily,
		"pricing": pricing_info
	})

	# Build ordered route coordinates based on the generated daily itinerary
	name_to_obj = {}
	for item in (n_attractions + n_accommodations + n_restaurants):
		name_to_obj[item.get('name','').strip().lower()] = item

	ordered_coords = []
	slots = ['morning', 'afternoon', 'evening']
	for day in daily:
		for slot in slots:
			val = day.get(slot)
			if not val:
				continue
			key = (val.split(':',1)[1] if isinstance(val, str) and ':' in val else (val.get('name') if isinstance(val, dict) else str(val))).strip().lower()
			obj = name_to_obj.get(key)
			if obj:
				ordered_coords.append(obj)

	# Append any remaining unique locations not already included
	seen = set((o.get('name','').strip().lower() for o in ordered_coords))
	for item in (n_attractions + n_accommodations + n_restaurants):
		key = item.get('name','').strip().lower()
		if key and key not in seen:
			ordered_coords.append(item)
			seen.add(key)

	return jsonify({
		"success": True,
		"itinerary": daily,
		"summary": summary,
		"model_used": bool(summary),
		"pricing": pricing_info,
		"route_coordinates": ordered_coords,  # Ordered by itinerary, includes all places
		"pricing_factors": {
			"travelers": max_travelers,
			"transport_type": transport_options,
			"distance_km": pricing_info["route_info"]["total_distance_km"]
		}
	})


if __name__ == '__main__':
	app.run(host='0.0.0.0', port=PORT)
