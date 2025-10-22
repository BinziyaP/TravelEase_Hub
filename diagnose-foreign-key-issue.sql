-- Specific queries to diagnose the foreign key constraint issue
-- Run these one by one in Supabase SQL Editor

-- 1. Check the foreign key constraint details
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='packages'
    AND kcu.column_name='agency_id';

-- 2. Check what agencies exist
SELECT id, agency_name, user_id, status FROM agencies;

-- 3. Check if there are any packages with invalid agency_id
SELECT 
    p.id,
    p.name,
    p.agency_id,
    a.id as valid_agency_id,
    a.agency_name
FROM packages p
LEFT JOIN agencies a ON p.agency_id = a.id
WHERE a.id IS NULL;

-- 4. Check current user's agency (if authenticated)
SELECT 
    u.id as user_id,
    u.email,
    a.id as agency_id,
    a.agency_name,
    a.status as agency_status
FROM auth.users u
LEFT JOIN agencies a ON u.id = a.user_id
WHERE u.email = 'binziyap03@gmail.com';











