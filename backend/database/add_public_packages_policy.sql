-- Add public policy to allow reading approved packages
-- This allows anyone to read approved packages without authentication

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public can view approved packages" ON packages;

-- Create new policy for public access to approved packages
CREATE POLICY "Public can view approved packages" ON packages
  FOR SELECT USING (status = 'approved');

-- Also add a policy for agencies table to allow reading agency info for approved packages
DROP POLICY IF EXISTS "Public can view agency info for approved packages" ON agencies;

CREATE POLICY "Public can view agency info for approved packages" ON agencies
  FOR SELECT USING (true); -- Allow public access to agency info
