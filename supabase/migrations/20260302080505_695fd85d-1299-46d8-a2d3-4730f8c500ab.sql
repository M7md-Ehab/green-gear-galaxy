
CREATE TABLE IF NOT EXISTS public.machine_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.machine_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Machine types viewable by everyone" ON public.machine_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage machine types" ON public.machine_types FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert some default machine types
INSERT INTO public.machine_types (name) VALUES ('vending'), ('claw') ON CONFLICT DO NOTHING;
