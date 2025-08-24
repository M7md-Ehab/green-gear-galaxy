-- Fix overly permissive RLS policies for password_reset_otps table
-- Replace the current permissive policy with more restrictive, operation-specific policies

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Service role can manage OTP records" ON public.password_reset_otps;

-- Create more restrictive policies that limit service role access to specific operations
-- and add time-based restrictions

-- Policy for INSERT: Only allow creating new OTPs with proper constraints
CREATE POLICY "Service role can insert new OTPs with constraints" 
ON public.password_reset_otps 
FOR INSERT 
TO service_role
WITH CHECK (
  -- Ensure expires_at is in the future (max 15 minutes)
  expires_at > now() 
  AND expires_at <= now() + interval '15 minutes'
  -- Ensure attempts starts at 0
  AND attempts = 0
  -- Ensure OTP code is exactly 6 digits
  AND otp_code ~ '^[0-9]{6}$'
  -- Ensure email is valid format
  AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Policy for SELECT: Only allow reading OTPs that are not expired and haven't exceeded attempts
CREATE POLICY "Service role can read valid OTPs only" 
ON public.password_reset_otps 
FOR SELECT 
TO service_role
USING (
  -- Only allow reading non-expired OTPs
  expires_at > now()
  -- Only allow reading OTPs that haven't exceeded max attempts
  AND attempts < 5
);

-- Policy for UPDATE: Only allow incrementing attempts counter
CREATE POLICY "Service role can only increment attempts" 
ON public.password_reset_otps 
FOR UPDATE 
TO service_role
USING (
  -- Only allow updating non-expired OTPs
  expires_at > now()
  AND attempts < 5
)
WITH CHECK (
  -- Only allow incrementing attempts by 1
  attempts = OLD.attempts + 1
  -- Prevent modification of other sensitive fields
  AND email = OLD.email
  AND otp_code = OLD.otp_code
  AND expires_at = OLD.expires_at
  AND created_at = OLD.created_at
);

-- Policy for DELETE: Only allow deleting OTPs for cleanup purposes
CREATE POLICY "Service role can delete OTPs for cleanup" 
ON public.password_reset_otps 
FOR DELETE 
TO service_role
USING (
  -- Allow deleting expired OTPs (cleanup)
  expires_at <= now()
  -- Or allow deleting OTPs that have been successfully used (after password reset)
  OR attempts >= 5
);

-- Add an additional security function to validate OTP operations
CREATE OR REPLACE FUNCTION public.validate_otp_operation(
  operation_type text,
  email_param text,
  otp_code_param text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_operations integer;
  current_time timestamp with time zone := now();
BEGIN
  -- Rate limiting: Check for recent operations from the same email
  SELECT COUNT(*) INTO recent_operations
  FROM public.password_reset_otps
  WHERE email = email_param
    AND created_at > current_time - interval '1 hour';
  
  -- Allow max 5 OTP requests per email per hour
  IF operation_type = 'create' AND recent_operations >= 5 THEN
    RETURN false;
  END IF;
  
  -- For verification, ensure OTP exists and is valid
  IF operation_type = 'verify' AND otp_code_param IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.password_reset_otps
      WHERE email = email_param
        AND otp_code = otp_code_param
        AND expires_at > current_time
        AND attempts < 5
    ) THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- Create a more secure cleanup function that only removes truly expired OTPs
CREATE OR REPLACE FUNCTION public.secure_cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only delete OTPs that are at least 1 hour past expiration to allow for clock skew
  DELETE FROM public.password_reset_otps 
  WHERE expires_at < now() - interval '1 hour';
  
  -- Also delete OTPs that have exceeded maximum attempts
  DELETE FROM public.password_reset_otps 
  WHERE attempts >= 5;
END;
$$;

-- Replace the existing cleanup function with the more secure version
DROP FUNCTION IF EXISTS public.cleanup_expired_otps();

-- Add a trigger to automatically clean up on each insert (prevent table bloat)
CREATE OR REPLACE FUNCTION public.auto_cleanup_otps_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clean up expired OTPs when new ones are created
  PERFORM public.secure_cleanup_expired_otps();
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS auto_cleanup_otps ON public.password_reset_otps;
CREATE TRIGGER auto_cleanup_otps
  AFTER INSERT ON public.password_reset_otps
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.auto_cleanup_otps_trigger();