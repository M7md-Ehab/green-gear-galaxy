-- Create OTP codes table
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('signup', 'signin', 'recovery')),
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_email_type ON public.otp_codes(email, type, verified);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to manage OTP codes
CREATE POLICY "Service role can manage OTP codes"
  ON public.otp_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to clean up expired OTPs (optional, for maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.otp_codes
  WHERE expires_at < now() - INTERVAL '1 hour';
END;
$$;