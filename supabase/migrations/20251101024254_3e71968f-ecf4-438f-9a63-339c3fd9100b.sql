-- Add email_activity table to track all emails sent
CREATE TABLE IF NOT EXISTS public.email_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  order_code integer,
  email_type text NOT NULL, -- 'order_confirmation', 'admin_notification', 'shipped', 'delivered', 'finished'
  recipient_email text NOT NULL,
  subject text NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'sent' -- 'sent', 'failed'
);

-- Enable RLS on email_activity
ALTER TABLE public.email_activity ENABLE ROW LEVEL SECURITY;

-- Admins can view all email activity
CREATE POLICY "Admins can view all email activity"
ON public.email_activity
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Edge functions can insert email activity (using service role)
CREATE POLICY "Service role can insert email activity"
ON public.email_activity
FOR INSERT
WITH CHECK (true);

-- Add more status options to orders table by updating the check constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'finished'));

-- Add customer_name column to orders table for personalized emails
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name text;

-- Create index on email_activity for faster queries
CREATE INDEX IF NOT EXISTS idx_email_activity_order_id ON public.email_activity(order_id);
CREATE INDEX IF NOT EXISTS idx_email_activity_sent_at ON public.email_activity(sent_at DESC);