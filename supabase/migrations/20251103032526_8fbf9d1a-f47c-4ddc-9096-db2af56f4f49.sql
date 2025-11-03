-- Allow order items for products not in DB by making product_id nullable
ALTER TABLE public.order_items
ALTER COLUMN product_id DROP NOT NULL;