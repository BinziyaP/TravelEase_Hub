-- Populate Sample Package Data for Testing
-- Run this after setting up the database to create test packages

-- 1. Create a sample package with complete data
INSERT INTO packages (
    id,
    agency_id,
    name,
    duration_days,
    destination,
    price,
    max_travelers,
    description,
    selected_places,
    selected_hotels,
    selected_restaurants,
    itinerary,
    route_coordinates,
    total_distance_km,
    estimated_travel_time_hours,
    attractions,
    meals_included,
    transportation_included,
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1), -- Use first user as agency
    'Complete 7-Day Kerala Adventure Package',
    7,
    'Kerala, India',
    45000,
    4,
    'Complete 7-day Kerala adventure package with all amenities including accommodation, meals, transportation, and guided tours.',
    '[
        {"name": "Munnar Tea Gardens", "coordinates": {"lat": 10.0889, "lng": 77.0595}},
        {"name": "Alleppey Backwaters", "coordinates": {"lat": 9.4981, "lng": 76.3388}},
        {"name": "Kochi Fort", "coordinates": {"lat": 9.9312, "lng": 76.2673}},
        {"name": "Wayanad Wildlife Sanctuary", "coordinates": {"lat": 11.6000, "lng": 76.0500}},
        {"name": "Kovalam Beach", "coordinates": {"lat": 8.4004, "lng": 76.9781}},
        {"name": "Periyar National Park", "coordinates": {"lat": 9.4667, "lng": 77.2667}},
        {"name": "Kumarakom Bird Sanctuary", "coordinates": {"lat": 9.6167, "lng": 76.4333}}
    ]'::jsonb,
    '[
        {"name": "Taj Malabar Resort", "coordinates": {"lat": 9.9312, "lng": 76.2673}, "rating": 4.8},
        {"name": "Kumarakom Lake Resort", "coordinates": {"lat": 9.6167, "lng": 76.4333}, "rating": 4.9},
        {"name": "Spice Village Resort", "coordinates": {"lat": 9.4667, "lng": 77.2667}, "rating": 4.7}
    ]'::jsonb,
    '[
        {"name": "Paragon Restaurant", "coordinates": {"lat": 9.9312, "lng": 76.2673}},
        {"name": "Kashi Art Cafe", "coordinates": {"lat": 9.9312, "lng": 76.2673}},
        {"name": "Malabar House", "coordinates": {"lat": 9.9312, "lng": 76.2673}}
    ]'::jsonb,
    '[
        {"day": 1, "morning": "Arrive in Kochi", "afternoon": "Fort Kochi walking tour", "evening": "Paragon Restaurant"},
        {"day": 2, "morning": "Drive to Munnar", "afternoon": "Tea garden visit", "evening": "Resort dinner"},
        {"day": 3, "morning": "Munnar sightseeing", "afternoon": "Tea museum", "evening": "Local cuisine"},
        {"day": 4, "morning": "Drive to Wayanad", "afternoon": "Wildlife sanctuary", "evening": "Resort stay"},
        {"day": 5, "morning": "Wayanad exploration", "afternoon": "Local attractions", "evening": "Cultural show"},
        {"day": 6, "morning": "Drive to Alleppey", "afternoon": "Backwater cruise", "evening": "Houseboat dinner"},
        {"day": 7, "morning": "Kumarakom bird watching", "afternoon": "Departure", "evening": "Airport transfer"}
    ]'::jsonb,
    '[
        {"name": "Kochi Airport", "coordinates": {"lat": 9.9312, "lng": 76.2673}},
        {"name": "Munnar Tea Gardens", "coordinates": {"lat": 10.0889, "lng": 77.0595}},
        {"name": "Wayanad Wildlife Sanctuary", "coordinates": {"lat": 11.6000, "lng": 76.0500}},
        {"name": "Alleppey Backwaters", "coordinates": {"lat": 9.4981, "lng": 76.3388}},
        {"name": "Kumarakom Bird Sanctuary", "coordinates": {"lat": 9.6167, "lng": 76.4333}},
        {"name": "Periyar National Park", "coordinates": {"lat": 9.4667, "lng": 77.2667}},
        {"name": "Kovalam Beach", "coordinates": {"lat": 8.4004, "lng": 76.9781}},
        {"name": "Taj Malabar Resort", "coordinates": {"lat": 9.9312, "lng": 76.2673}},
        {"name": "Kumarakom Lake Resort", "coordinates": {"lat": 9.6167, "lng": 76.4333}},
        {"name": "Spice Village Resort", "coordinates": {"lat": 9.4667, "lng": 77.2667}}
    ]'::jsonb,
    350.5,
    4.5,
    '["Munnar Tea Gardens", "Alleppey Backwaters", "Kochi Fort", "Wayanad Wildlife", "Kovalam Beach", "Periyar National Park", "Kumarakom Bird Sanctuary"]'::jsonb,
    '["breakfast", "lunch", "dinner"]'::jsonb,
    '["car", "boat", "local_transport"]'::jsonb,
    'pending',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 2. Create another sample package with different data
INSERT INTO packages (
    id,
    agency_id,
    name,
    duration_days,
    destination,
    price,
    max_travelers,
    description,
    selected_places,
    selected_hotels,
    selected_restaurants,
    itinerary,
    route_coordinates,
    total_distance_km,
    estimated_travel_time_hours,
    attractions,
    meals_included,
    transportation_included,
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1), -- Use first user as agency
    '3-Day Goa Beach Package',
    3,
    'Goa, India',
    25000,
    2,
    'Perfect 3-day Goa beach package for couples with beach activities, water sports, and nightlife.',
    '[
        {"name": "Calangute Beach", "coordinates": {"lat": 15.5389, "lng": 73.7554}},
        {"name": "Baga Beach", "coordinates": {"lat": 15.5556, "lng": 73.7500}},
        {"name": "Anjuna Beach", "coordinates": {"lat": 15.5833, "lng": 73.7333}},
        {"name": "Dudhsagar Falls", "coordinates": {"lat": 15.3167, "lng": 74.3167}},
        {"name": "Old Goa Churches", "coordinates": {"lat": 15.5000, "lng": 73.9167}}
    ]'::jsonb,
    '[
        {"name": "Taj Exotica Resort", "coordinates": {"lat": 15.5389, "lng": 73.7554}, "rating": 4.9},
        {"name": "Leela Goa", "coordinates": {"lat": 15.5556, "lng": 73.7500}, "rating": 4.8}
    ]'::jsonb,
    '[
        {"name": "Martin's Corner", "coordinates": {"lat": 15.5389, "lng": 73.7554}},
        {"name": "Pousada by the Beach", "coordinates": {"lat": 15.5556, "lng": 73.7500}}
    ]'::jsonb,
    '[
        {"day": 1, "morning": "Arrive in Goa", "afternoon": "Calangute Beach", "evening": "Martin's Corner"},
        {"day": 2, "morning": "Baga Beach activities", "afternoon": "Anjuna Beach", "evening": "Pousada by the Beach"},
        {"day": 3, "morning": "Dudhsagar Falls", "afternoon": "Old Goa Churches", "evening": "Departure"}
    ]'::jsonb,
    '[
        {"name": "Goa Airport", "coordinates": {"lat": 15.3808, "lng": 73.8314}},
        {"name": "Calangute Beach", "coordinates": {"lat": 15.5389, "lng": 73.7554}},
        {"name": "Baga Beach", "coordinates": {"lat": 15.5556, "lng": 73.7500}},
        {"name": "Anjuna Beach", "coordinates": {"lat": 15.5833, "lng": 73.7333}},
        {"name": "Dudhsagar Falls", "coordinates": {"lat": 15.3167, "lng": 74.3167}},
        {"name": "Old Goa Churches", "coordinates": {"lat": 15.5000, "lng": 73.9167}},
        {"name": "Taj Exotica Resort", "coordinates": {"lat": 15.5389, "lng": 73.7554}},
        {"name": "Leela Goa", "coordinates": {"lat": 15.5556, "lng": 73.7500}}
    ]'::jsonb,
    120.3,
    2.8,
    '["Calangute Beach", "Baga Beach", "Anjuna Beach", "Dudhsagar Falls", "Old Goa Churches"]'::jsonb,
    '["breakfast", "lunch"]'::jsonb,
    '["car", "boat"]'::jsonb,
    'pending',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 3. Create an approved package
INSERT INTO packages (
    id,
    agency_id,
    name,
    duration_days,
    destination,
    price,
    max_travelers,
    description,
    selected_places,
    selected_hotels,
    selected_restaurants,
    itinerary,
    route_coordinates,
    total_distance_km,
    estimated_travel_time_hours,
    attractions,
    meals_included,
    transportation_included,
    status,
    admin_notes,
    approved_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1), -- Use first user as agency
    '5-Day Rajasthan Heritage Tour',
    5,
    'Rajasthan, India',
    35000,
    6,
    'Heritage tour of Rajasthan covering Jaipur, Jodhpur, and Udaipur with palace stays and cultural experiences.',
    '[
        {"name": "Amber Fort", "coordinates": {"lat": 26.9855, "lng": 75.8513}},
        {"name": "City Palace Jaipur", "coordinates": {"lat": 26.9260, "lng": 75.8235}},
        {"name": "Mehrangarh Fort", "coordinates": {"lat": 26.2389, "lng": 73.0243}},
        {"name": "Udaipur City Palace", "coordinates": {"lat": 24.5854, "lng": 73.7125}},
        {"name": "Lake Pichola", "coordinates": {"lat": 24.5729, "lng": 73.6830}}
    ]'::jsonb,
    '[
        {"name": "Rambagh Palace", "coordinates": {"lat": 26.9260, "lng": 75.8235}, "rating": 4.9},
        {"name": "Umaid Bhawan Palace", "coordinates": {"lat": 26.2389, "lng": 73.0243}, "rating": 4.8},
        {"name": "Taj Lake Palace", "coordinates": {"lat": 24.5729, "lng": 73.6830}, "rating": 4.9}
    ]'::jsonb,
    '[
        {"name": "Laxmi Misthan Bhandar", "coordinates": {"lat": 26.9260, "lng": 75.8235}},
        {"name": "Indique Restaurant", "coordinates": {"lat": 24.5729, "lng": 73.6830}}
    ]'::jsonb,
    '[
        {"day": 1, "morning": "Arrive in Jaipur", "afternoon": "Amber Fort", "evening": "Laxmi Misthan Bhandar"},
        {"day": 2, "morning": "City Palace", "afternoon": "Local markets", "evening": "Rambagh Palace"},
        {"day": 3, "morning": "Drive to Jodhpur", "afternoon": "Mehrangarh Fort", "evening": "Umaid Bhawan Palace"},
        {"day": 4, "morning": "Drive to Udaipur", "afternoon": "City Palace", "evening": "Taj Lake Palace"},
        {"day": 5, "morning": "Lake Pichola", "afternoon": "Departure", "evening": "Airport transfer"}
    ]'::jsonb,
    '[
        {"name": "Jaipur Airport", "coordinates": {"lat": 26.8242, "lng": 75.8012}},
        {"name": "Amber Fort", "coordinates": {"lat": 26.9855, "lng": 75.8513}},
        {"name": "City Palace Jaipur", "coordinates": {"lat": 26.9260, "lng": 75.8235}},
        {"name": "Mehrangarh Fort", "coordinates": {"lat": 26.2389, "lng": 73.0243}},
        {"name": "Udaipur City Palace", "coordinates": {"lat": 24.5854, "lng": 73.7125}},
        {"name": "Lake Pichola", "coordinates": {"lat": 24.5729, "lng": 73.6830}},
        {"name": "Rambagh Palace", "coordinates": {"lat": 26.9260, "lng": 75.8235}},
        {"name": "Umaid Bhawan Palace", "coordinates": {"lat": 26.2389, "lng": 73.0243}},
        {"name": "Taj Lake Palace", "coordinates": {"lat": 24.5729, "lng": 73.6830}}
    ]'::jsonb,
    280.7,
    3.2,
    '["Amber Fort", "City Palace Jaipur", "Mehrangarh Fort", "Udaipur City Palace", "Lake Pichola"]'::jsonb,
    '["breakfast", "lunch", "dinner"]'::jsonb,
    '["car", "train"]'::jsonb,
    'approved',
    'Approved by admin - Complete heritage package with excellent itinerary and pricing.',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 4. Verify the sample data
SELECT 
    'SAMPLE DATA CREATED' as status,
    COUNT(*) as total_packages,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_packages,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_packages,
    COUNT(CASE WHEN selected_places IS NOT NULL THEN 1 END) as packages_with_places,
    COUNT(CASE WHEN selected_hotels IS NOT NULL THEN 1 END) as packages_with_hotels,
    COUNT(CASE WHEN itinerary IS NOT NULL THEN 1 END) as packages_with_itinerary,
    COUNT(CASE WHEN route_coordinates IS NOT NULL THEN 1 END) as packages_with_routes
FROM packages;
