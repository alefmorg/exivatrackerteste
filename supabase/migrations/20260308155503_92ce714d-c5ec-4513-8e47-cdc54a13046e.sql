
CREATE TABLE public.map_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  char_name text NOT NULL,
  city_id text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.map_pins ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX map_pins_char_name_unique ON public.map_pins (char_name);

CREATE POLICY "Authenticated users can view map pins"
  ON public.map_pins FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert map pins"
  ON public.map_pins FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update map pins"
  ON public.map_pins FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete map pins"
  ON public.map_pins FOR DELETE TO authenticated
  USING (true);
