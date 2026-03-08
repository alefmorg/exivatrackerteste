
CREATE TABLE public.level_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  char_name text NOT NULL,
  level integer NOT NULL,
  recorded_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_level_history_char_name ON public.level_history (char_name);
CREATE INDEX idx_level_history_recorded_at ON public.level_history (recorded_at);

ALTER TABLE public.level_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert level history"
  ON public.level_history FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view level history"
  ON public.level_history FOR SELECT TO authenticated
  USING (true);
