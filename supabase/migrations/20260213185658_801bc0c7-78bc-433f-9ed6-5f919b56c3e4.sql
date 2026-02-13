
CREATE TABLE public.pending_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  otp_type TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pending_otps ENABLE ROW LEVEL SECURITY;

-- No public policies - only edge functions with service role can access this table

CREATE INDEX idx_pending_otps_email_type ON public.pending_otps (email, otp_type);
CREATE INDEX idx_pending_otps_expires_at ON public.pending_otps (expires_at);
