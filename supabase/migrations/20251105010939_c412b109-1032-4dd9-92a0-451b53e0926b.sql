-- Remove overly permissive RLS policy from otp_codes table
-- This prevents unauthorized access to OTP codes from client-side code
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON public.otp_codes;

-- No replacement policy needed - default deny for all client access is correct
-- Only edge functions with service role key should access this table