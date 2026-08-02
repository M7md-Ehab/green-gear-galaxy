CREATE SEQUENCE IF NOT EXISTS public.orders_order_code_seq AS bigint START WITH 1000 OWNED BY public.orders.order_code;

SELECT setval('public.orders_order_code_seq', GREATEST((SELECT COALESCE(MAX(order_code), 999) FROM public.orders), 999));

ALTER TABLE public.orders ALTER COLUMN order_code SET DEFAULT nextval('public.orders_order_code_seq');

GRANT USAGE, SELECT ON SEQUENCE public.orders_order_code_seq TO anon, authenticated, service_role;