
-- Handoff logs table to track who took/returned each character
CREATE TABLE public.boneco_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boneco_id uuid REFERENCES public.bonecos(id) ON DELETE CASCADE NOT NULL,
  boneco_name text NOT NULL,
  user_id uuid NOT NULL,
  username text NOT NULL DEFAULT '',
  action text NOT NULL CHECK (action IN ('pegar', 'devolver')),
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.boneco_logs ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view logs
CREATE POLICY "Authenticated users can view logs"
ON public.boneco_logs FOR SELECT TO authenticated
USING (true);

-- All authenticated users can insert logs (when taking/returning chars)
CREATE POLICY "Authenticated users can insert logs"
ON public.boneco_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Enable realtime for bonecos
ALTER PUBLICATION supabase_realtime ADD TABLE public.bonecos;

-- Allow regular users to read bonecos (not just admins)
CREATE POLICY "Authenticated users can view bonecos"
ON public.bonecos FOR SELECT TO authenticated
USING (true);

-- Allow authenticated users to update used_by and status (for claim/return)
CREATE POLICY "Users can claim/return bonecos"
ON public.bonecos FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);
