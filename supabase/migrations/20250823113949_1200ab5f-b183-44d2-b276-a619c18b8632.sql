-- Fix critical security vulnerability in password_reset_otps table
-- Remove the current overly permissive policies
DROP POLICY IF EXISTS "Anyone can create OTP records" ON public.password_reset_otps;
DROP POLICY IF EXISTS "Anyone can delete OTP records" ON public.password_reset_otps;
DROP POLICY IF EXISTS "Anyone can update OTP records" ON public.password_reset_otps;
DROP POLICY IF EXISTS "Users can read OTP by email" ON public.password_reset_otps;

-- Create secure policies that only allow service role access
-- This ensures only our edge functions can access OTP data
CREATE POLICY "Service role can manage OTP records" 
ON public.password_reset_otps 
FOR ALL 
USING (auth.role() = 'service_role');

-- Add additional security: ensure OTPs expire and add unique constraint per email
CREATE UNIQUE INDEX IF NOT EXISTS idx_password_reset_otps_email 
ON public.password_reset_otps (email) 
WHERE expires_at > now();

-- Add a cleanup trigger to automatically remove expired OTPs
CREATE OR REPLACE FUNCTION public.trigger_cleanup_expired_otps()
RETURNS TRIGGER AS $$
BEGIN
  -- Clean up expired OTPs whenever a new one is inserted
  DELETE FROM public.password_reset_otps 
  WHERE expires_at < now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER cleanup_expired_otps_trigger
  AFTER INSERT ON public.password_reset_otps
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_cleanup_expired_otps();