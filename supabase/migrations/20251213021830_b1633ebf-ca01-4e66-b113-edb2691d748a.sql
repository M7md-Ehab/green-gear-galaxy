-- Fix security issue: Restrict email_activity to admins only (already exists, but ensure it's the only policy)
-- The existing policy "Admins can view all email activity" already restricts to admins only

-- Fix security issue: Update orders RLS to prevent access to guest orders by non-admins
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create categories table for storing product categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Categories are viewable by everyone"
ON public.categories
FOR SELECT
USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default categories
INSERT INTO public.categories (name) VALUES 
  ('Electronics'),
  ('Home'),
  ('Accessories'),
  ('Vending Machines'),
  ('Claw Machines')
ON CONFLICT (name) DO NOTHING;