
-- Create the initial admin user
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'admin@exiva.com';
  
  IF new_user_id IS NULL THEN
    new_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token
    ) VALUES (
      new_user_id, '00000000-0000-0000-0000-000000000000', 'admin@exiva.com',
      crypt('Admin123!', gen_salt('bf')), now(),
      '{"username": "Admin"}'::jsonb, now(), now(), 'authenticated', 'authenticated', ''
    );
  END IF;
  
  -- Insert role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
