-- Fix Admin User Metadata for TravelEase
-- Run this SQL in your Supabase SQL Editor

-- Update the admin user's metadata to ensure it's in both app_metadata and user_metadata
UPDATE auth.users 
SET 
  raw_app_meta_data = raw_app_meta_data || '{"user_type": "admin"}'::jsonb,
  raw_user_meta_data = raw_user_meta_data || '{"user_type": "admin"}'::jsonb
WHERE email = 'travelease029@gmail.com';

-- Verify the update
SELECT 
  id,
  email,
  raw_app_meta_data,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'travelease029@gmail.com';

-- Test the admin access
SELECT 'Admin metadata updated successfully!' as message;
