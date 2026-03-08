-- Create a function to check if user is admin or above (admin or master_admin)
CREATE OR REPLACE FUNCTION public.is_admin_or_above(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'master_admin')
  )
$$;

-- Update RLS policies that check for admin to also accept master_admin
-- bonecos table
DROP POLICY IF EXISTS "Only admins can delete bonecos" ON public.bonecos;
CREATE POLICY "Only admins can delete bonecos" ON public.bonecos FOR DELETE USING (is_admin_or_above(auth.uid()));

DROP POLICY IF EXISTS "Only admins can insert bonecos" ON public.bonecos;
CREATE POLICY "Only admins can insert bonecos" ON public.bonecos FOR INSERT WITH CHECK (is_admin_or_above(auth.uid()));

DROP POLICY IF EXISTS "Only admins can update bonecos" ON public.bonecos;
CREATE POLICY "Only admins can update bonecos" ON public.bonecos FOR UPDATE USING (is_admin_or_above(auth.uid()));

DROP POLICY IF EXISTS "Only admins can view bonecos" ON public.bonecos;
CREATE POLICY "Only admins can view bonecos" ON public.bonecos FOR SELECT USING (is_admin_or_above(auth.uid()));

-- monitored_guilds table
DROP POLICY IF EXISTS "Only admins can delete guilds" ON public.monitored_guilds;
CREATE POLICY "Only admins can delete guilds" ON public.monitored_guilds FOR DELETE USING (is_admin_or_above(auth.uid()));

DROP POLICY IF EXISTS "Only admins can insert guilds" ON public.monitored_guilds;
CREATE POLICY "Only admins can insert guilds" ON public.monitored_guilds FOR INSERT WITH CHECK (is_admin_or_above(auth.uid()));

DROP POLICY IF EXISTS "Only admins can update guilds" ON public.monitored_guilds;
CREATE POLICY "Only admins can update guilds" ON public.monitored_guilds FOR UPDATE USING (is_admin_or_above(auth.uid()));

-- user_roles: update policy to allow master_admin
DROP POLICY IF EXISTS "Only admins manage roles" ON public.user_roles;
CREATE POLICY "Only admins manage roles" ON public.user_roles FOR ALL USING (is_admin_or_above(auth.uid()));