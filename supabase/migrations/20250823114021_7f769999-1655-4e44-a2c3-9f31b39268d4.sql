-- Security Fix 1: Lock down password_reset_otps RLS policies
DROP POLICY IF EXISTS "Anyone can create OTP records" ON public.password_reset_otps;
DROP POLICY IF EXISTS "Anyone can delete OTP records" ON public.password_reset_otps;  
DROP POLICY IF EXISTS "Anyone can update OTP records" ON public.password_reset_otps;
DROP POLICY IF EXISTS "Users can read OTP by email" ON public.password_reset_otps;

-- Only service_role can manage OTP records (edge functions only)
CREATE POLICY "Service role can manage OTP records" 
ON public.password_reset_otps 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Security Fix 2: Restrict profiles visibility (only own profile readable)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Security Fix 3: Make orders.user_id NOT NULL for data integrity
ALTER TABLE public.orders ALTER COLUMN user_id SET NOT NULL;

-- Security Fix 4: Add foreign key constraints for data integrity
ALTER TABLE public.order_items 
ADD CONSTRAINT fk_order_items_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.order_items 
ADD CONSTRAINT fk_order_items_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;

-- Security Fix 5: Create user roles system for proper admin authentication
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Security Fix 6: Add trigger for updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();