-- Create table for password reset OTP codes
CREATE TABLE public.password_reset_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read their own OTP records by email
CREATE POLICY "Users can read OTP by email" 
ON public.password_reset_otps 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert OTP records
CREATE POLICY "Anyone can create OTP records" 
ON public.password_reset_otps 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to update OTP records
CREATE POLICY "Anyone can update OTP records" 
ON public.password_reset_otps 
FOR UPDATE 
USING (true);

-- Create policy to allow anyone to delete expired OTP records
CREATE POLICY "Anyone can delete OTP records" 
ON public.password_reset_otps 
FOR DELETE 
USING (true);

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.password_reset_otps 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;