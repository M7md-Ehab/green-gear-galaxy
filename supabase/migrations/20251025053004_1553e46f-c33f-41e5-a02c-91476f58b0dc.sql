-- Add admin-only write policies to products table
CREATE POLICY "Admins can insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON products FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON products FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Fix orders SELECT policy to prevent email enumeration
-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

-- Create new policy that only allows viewing own orders (no email-based access)
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);