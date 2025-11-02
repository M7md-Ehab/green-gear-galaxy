-- Make user_id nullable to support guest checkout
ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;