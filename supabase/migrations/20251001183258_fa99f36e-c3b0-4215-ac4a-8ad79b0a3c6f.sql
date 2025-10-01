-- Drop OTP-related triggers
DROP TRIGGER IF EXISTS auto_cleanup_otps ON public.password_reset_otps;

-- Drop OTP-related functions
DROP FUNCTION IF EXISTS public.auto_cleanup_otps_trigger();
DROP FUNCTION IF EXISTS public.secure_cleanup_expired_otps();
DROP FUNCTION IF EXISTS public.validate_otp_operation(text, text, text);

-- Drop password reset OTPs table
DROP TABLE IF EXISTS public.password_reset_otps;