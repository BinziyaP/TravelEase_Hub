-- Add license verification fields to agencies table
-- Run this SQL in your Supabase SQL Editor

-- Add new columns for license verification
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS license_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS license_verification_status TEXT DEFAULT 'pending' CHECK (license_verification_status IN ('pending', 'verified', 'failed', 'error')),
ADD COLUMN IF NOT EXISTS license_verification_details JSONB,
ADD COLUMN IF NOT EXISTS license_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS license_verification_error TEXT;

-- Add index for license verification queries
CREATE INDEX IF NOT EXISTS idx_agencies_license_verified ON public.agencies(license_verified);
CREATE INDEX IF NOT EXISTS idx_agencies_license_verification_status ON public.agencies(license_verification_status);

-- Add comment for documentation
COMMENT ON COLUMN public.agencies.license_verified IS 'Whether the business license has been verified through external API';
COMMENT ON COLUMN public.agencies.license_verification_status IS 'Status of license verification: pending, verified, failed, error';
COMMENT ON COLUMN public.agencies.license_verification_details IS 'JSON object containing verification details from API response';
COMMENT ON COLUMN public.agencies.license_verified_at IS 'Timestamp when license was verified';
COMMENT ON COLUMN public.agencies.license_verification_error IS 'Error message if verification failed';
