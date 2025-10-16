-- Add order_code and user_email columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_code INTEGER,
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Create a unique index on order_code
CREATE UNIQUE INDEX IF NOT EXISTS orders_order_code_idx ON public.orders(order_code);

-- Create a function to generate unique 6-digit order codes
CREATE OR REPLACE FUNCTION public.generate_order_code()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 6-digit number (100000 to 999999)
    new_code := floor(random() * 900000 + 100000)::INTEGER;
    
    -- Check if this code already exists
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_code = new_code) INTO code_exists;
    
    -- If code doesn't exist, use it
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Create a trigger to automatically set order_code on insert
CREATE OR REPLACE FUNCTION public.set_order_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.order_code IS NULL THEN
    NEW.order_code := public.generate_order_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_order_code_trigger ON public.orders;
CREATE TRIGGER set_order_code_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_code();

-- Update RLS policies to allow inserting orders with email
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_email IS NOT NULL);

-- Allow users to view orders by email
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id OR (user_email IS NOT NULL AND auth.jwt() ->> 'email' = user_email));

-- Admin can update order status
CREATE POLICY "Admins can update orders"
  ON public.orders
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow order_items to be inserted with orders
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
CREATE POLICY "Users can create order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id = order_items.order_id 
    AND (user_id = auth.uid() OR user_email IS NOT NULL)
  ));