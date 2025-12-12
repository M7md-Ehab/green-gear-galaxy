-- Add missing fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_phone text,
ADD COLUMN IF NOT EXISTS customer_address text,
ADD COLUMN IF NOT EXISTS customer_city text,
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cod',
ADD COLUMN IF NOT EXISTS notes text;

-- Drop the existing restrictive feedback insert policy
DROP POLICY IF EXISTS "Users can submit feedback" ON public.feedback;

-- Create a permissive policy for feedback insertion (anyone can submit)
CREATE POLICY "Anyone can submit feedback" 
ON public.feedback 
FOR INSERT 
WITH CHECK (true);

-- Update order status constraint to support new status values
-- First check if we need to update by seeing existing statuses
-- We'll use text type so no constraint needed, just update edge function