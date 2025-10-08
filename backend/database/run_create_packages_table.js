#!/usr/bin/env node

/**
 * Create Packages Table Script
 * This script creates the packages table with all required fields
 * to match the EnhancedPackageForm.jsx structure
 */

const fs = require('fs');
const path = require('path');

// Read the create packages table SQL file
const sqlFilePath = path.join(__dirname, 'create_packages_table.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('📦 Create Packages Table Script');
console.log('================================');
console.log('');
console.log('This script creates the packages table with all fields from EnhancedPackageForm.jsx:');
console.log('');
console.log('📋 Basic Package Information:');
console.log('   • name, destination, duration_days, price, max_travelers, description');
console.log('');
console.log('🏨 Accommodation Details:');
console.log('   • accommodation_type, accommodation_name, accommodation_rating');
console.log('   • accommodation_location, accommodation_coordinates (lat/lng)');
console.log('   • accommodation_price_range, accommodation_coordinates (JSONB)');
console.log('');
console.log('🍽️ Meals & Transportation:');
console.log('   • meals_included (TEXT[]), transportation_included (TEXT[])');
console.log('');
console.log('🎯 Attractions & Places:');
console.log('   • selected_attractions (JSONB), selected_places (JSONB)');
console.log('   • selected_hotels (JSONB), attractions (TEXT[])');
console.log('   • attraction_coordinates (TEXT[])');
console.log('');
console.log('📅 Itinerary & Features:');
console.log('   • itinerary (JSONB), included_features (TEXT[])');
console.log('   • excluded_features (TEXT[]), cancellation_policy');
console.log('   • special_requirements, package_images (TEXT[])');
console.log('');
console.log('🗺️ Map Details:');
console.log('   • map_center_lat, map_center_lng, map_zoom, map_center');
console.log('');
console.log('🔗 Database Relationships:');
console.log('   • agency_id → agency_approval_history.agency_id (Foreign Key)');
console.log('   • RLS policies for agency access control');
console.log('   • Comprehensive indexes for performance');
console.log('');
console.log('🔗 Go to: https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql');
console.log('');
console.log('📝 Copy and paste the following SQL:');
console.log('');
console.log('─'.repeat(80));
console.log(sqlContent);
console.log('─'.repeat(80));
console.log('');
console.log('✅ After running this SQL, your packages table will have:');
console.log('');
console.log('📊 Complete Structure:');
console.log('   • All fields from EnhancedPackageForm.jsx');
console.log('   • Proper data types (JSONB, TEXT[], DECIMAL, etc.)');
console.log('   • Foreign key to agency_approval_history');
console.log('');
console.log('🔐 Security & Performance:');
console.log('   • Row Level Security (RLS) policies');
console.log('   • Comprehensive indexes for fast queries');
console.log('   • Updated_at trigger for automatic timestamps');
console.log('');
console.log('🎯 Result:');
console.log('   • Package creation will work perfectly');
console.log('   • All form data will be stored correctly');
console.log('   • Agency relationships properly maintained');
console.log('   • Fast queries with proper indexing');
console.log('');
console.log('🚀 Run the SQL and your packages table will be ready for the form!');






