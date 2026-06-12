CREATE OR REPLACE FUNCTION public.user_exists_by_email(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = lower(_email));
$$;

GRANT EXECUTE ON FUNCTION public.user_exists_by_email(text) TO anon, authenticated, service_role;

-- Backfill any missing profiles for existing auth users
INSERT INTO public.profiles (id, email)
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;