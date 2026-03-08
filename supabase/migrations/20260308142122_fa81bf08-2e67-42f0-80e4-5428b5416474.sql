
-- Monitored Guilds (shared across all users)
CREATE TABLE public.monitored_guilds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  world text NOT NULL DEFAULT '',
  member_count integer NOT NULL DEFAULT 0,
  last_update timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.monitored_guilds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view guilds"
  ON public.monitored_guilds FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Only admins can insert guilds"
  ON public.monitored_guilds FOR INSERT
  TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete guilds"
  ON public.monitored_guilds FOR DELETE
  TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update guilds"
  ON public.monitored_guilds FOR UPDATE
  TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Member Annotations (shared notes on guild members)
CREATE TABLE public.member_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  char_name text NOT NULL UNIQUE,
  annotation text NOT NULL DEFAULT '',
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.member_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view annotations"
  ON public.member_annotations FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can upsert annotations"
  ON public.member_annotations FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update annotations"
  ON public.member_annotations FOR UPDATE
  TO authenticated USING (true);

-- Member Categories (Main, Bomba, Maker, Outros)
CREATE TABLE public.member_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  char_name text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'outros',
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.member_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view categories"
  ON public.member_categories FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can upsert categories"
  ON public.member_categories FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON public.member_categories FOR UPDATE
  TO authenticated USING (true);

-- Login History (tracking online/offline changes)
CREATE TABLE public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  char_name text NOT NULL,
  status text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_login_history_char ON public.login_history(char_name, recorded_at DESC);

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view login history"
  ON public.login_history FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert login history"
  ON public.login_history FOR INSERT
  TO authenticated WITH CHECK (true);

-- User Settings (per-user settings synced across devices)
CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  settings jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for shared tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.monitored_guilds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.member_annotations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.member_categories;
