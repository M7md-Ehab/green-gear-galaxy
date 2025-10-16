-- Fix search_path for security
ALTER FUNCTION public.generate_order_code() SET search_path = public;
ALTER FUNCTION public.set_order_code() SET search_path = public;