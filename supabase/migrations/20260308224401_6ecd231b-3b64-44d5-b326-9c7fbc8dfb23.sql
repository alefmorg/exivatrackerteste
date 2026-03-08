
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Authenticated users can view map pins" ON public.map_pins;
DROP POLICY IF EXISTS "Authenticated users can insert map pins" ON public.map_pins;
DROP POLICY IF EXISTS "Authenticated users can update map pins" ON public.map_pins;
DROP POLICY IF EXISTS "Authenticated users can delete map pins" ON public.map_pins;

CREATE POLICY "Authenticated users can view map pins"
  ON public.map_pins FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert map pins"
  ON public.map_pins FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update map pins"
  ON public.map_pins FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete map pins"
  ON public.map_pins FOR DELETE TO authenticated USING (true);
