-- Update orders table to use integer order_code
ALTER TABLE public.orders ALTER COLUMN order_code TYPE INTEGER USING order_code::integer;

-- Update products table to match the interface
ALTER TABLE public.products DROP COLUMN IF EXISTS stock;
ALTER TABLE public.products DROP COLUMN IF EXISTS featured;
ALTER TABLE public.products ADD COLUMN in_stock BOOLEAN DEFAULT TRUE;
ALTER TABLE public.products ADD COLUMN inventory_count INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN images TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN series TEXT;
ALTER TABLE public.products ADD COLUMN type TEXT;
ALTER TABLE public.products ADD COLUMN specs JSONB;

-- Update email_activity to use integer order_code
ALTER TABLE public.email_activity ALTER COLUMN order_code TYPE INTEGER USING order_code::integer;