#!/usr/bin/env node

/**
 * Script to update the packages table schema in Supabase
 * Run this script to add missing columns for the enhanced package form
 */

const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'update_accommodation_fields.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('📋 Database Schema Update Script');
console.log('================================');
console.log('');
console.log('This script contains the SQL commands to update your Supabase packages table.');
console.log('Please run the following SQL in your Supabase SQL Editor:');
console.log('');
console.log('🔗 Go to: https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql');
console.log('');
console.log('📝 Copy and paste the following SQL:');
console.log('');
console.log('─'.repeat(80));
console.log(sqlContent);
console.log('─'.repeat(80));
console.log('');
console.log('✅ After running the SQL, your packages table will have all the required columns:');
console.log('   • attractions (TEXT[])');
console.log('   • attraction_coordinates (TEXT[])');
console.log('   • selected_places (JSONB)');
console.log('   • selected_hotels (JSONB)');
console.log('   • meals_included (TEXT[])');
console.log('   • transportation_included (TEXT[])');
console.log('   • itinerary (JSONB)');
console.log('   • included_features (TEXT[])');
console.log('   • excluded_features (TEXT[])');
console.log('   • cancellation_policy (TEXT)');
console.log('   • special_requirements (TEXT)');
console.log('   • package_images (TEXT[])');
console.log('   • map_center (TEXT)');
console.log('   • map_zoom (INTEGER)');
console.log('');
console.log('🚀 Once updated, your package form will work without schema errors!');




