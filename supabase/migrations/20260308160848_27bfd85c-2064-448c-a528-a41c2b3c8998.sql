
ALTER TABLE public.map_pins ADD COLUMN pos_x double precision NOT NULL DEFAULT 50;
ALTER TABLE public.map_pins ADD COLUMN pos_y double precision NOT NULL DEFAULT 50;
ALTER TABLE public.map_pins ALTER COLUMN city_id SET DEFAULT '';
