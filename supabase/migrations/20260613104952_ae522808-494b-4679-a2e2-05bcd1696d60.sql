
-- Orders: allow inserts for authenticated users (their own) and guests (no user_id)
CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Guests can create orders"
  ON public.orders FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

-- Order items: allow inserts when matching order is accessible
CREATE POLICY "Users can create their own order items"
  ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "Guests can create order items"
  ON public.order_items FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id IS NULL
    )
  );

-- Ensure base grants exist for inserts
GRANT INSERT ON public.orders TO authenticated, anon;
GRANT INSERT ON public.order_items TO authenticated, anon;
