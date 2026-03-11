-- 1. Crear tabla para localizaciones de usuarios
CREATE TABLE user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL UNIQUE,
  user_name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas SOLO para usuarios autenticados
CREATE POLICY "Allow authenticated read locations" ON user_locations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert locations" ON user_locations
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update locations" ON user_locations
  FOR UPDATE TO authenticated USING (true);

-- INSTRUCCIÓN PARA EL USUARIO:
-- Ejecuta este script adicional en el SQL Editor de tu proyecto en Supabase.
-- De esta forma tendrás control de las nuevas tablas que vamos creando.
