-- Enable Email Confirmations via SQL
-- Run this in your Supabase SQL Editor

-- Update auth configuration to enable email confirmations
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_email_confirmations = true,
  enable_email_change_confirmations = true
WHERE id = 'default';

-- If the above doesn't work, try this alternative:
-- This enables email confirmation at the project level
INSERT INTO auth.config (id, enable_signup, enable_email_confirmations, enable_email_change_confirmations)
VALUES ('default', true, true, true)
ON CONFLICT (id) DO UPDATE SET
  enable_signup = true,
  enable_email_confirmations = true,
  enable_email_change_confirmations = true;

-- Check current auth configuration
SELECT * FROM auth.config;








