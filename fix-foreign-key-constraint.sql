-- Fix Foreign Key Constraint Error for Packages Table
-- Run this SQL in your Supabase SQL Editor

-- 1. Check the current foreign key constraint
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

-- 2. Check if there are any packages with invalid agency_id
SELECT 
    p.id,
    p.name,
    p.agency_id,
    a.id as valid_agency_id,
    a.agency_name
FROM packages p
LEFT JOIN agencies a ON p.agency_id = a.id
WHERE a.id IS NULL;

-- 3. Check what agencies exist
SELECT id, agency_name, user_id, status FROM agencies;

-- 4. If there are invalid packages, either:
--    Option A: Delete packages with invalid agency_id (if they're test data)
DELETE FROM packages 
WHERE agency_id NOT IN (SELECT id FROM agencies);

--    Option B: Or fix the agency_id to point to a valid agency
--    UPDATE packages 
--    SET agency_id = (SELECT id FROM agencies LIMIT 1)
--    WHERE agency_id NOT IN (SELECT id FROM agencies);

-- 5. Verify the constraint is working
SELECT 
    p.id,
    p.name,
    p.agency_id,
    a.agency_name
FROM packages p
JOIN agencies a ON p.agency_id = a.id;

-- 6. Check the packages table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'packages' AND table_schema = 'public'
ORDER BY ordinal_position;








