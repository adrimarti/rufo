-- 1. Crear tabla
CREATE TABLE putedex_tasks (
  id SERIAL PRIMARY KEY,
  task_number INT,
  name TEXT,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE putedex_tasks ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas SOLO para usuarios autenticados
CREATE POLICY "Allow authenticated read" ON putedex_tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update" ON putedex_tasks
  FOR UPDATE TO authenticated USING (true);

-- 4. Insertar los 18 retos
INSERT INTO putedex_tasks (task_number, name, description) VALUES
(1, 'Clásica', 'Chica de lencería roja en un ventanal iluminado.'),
(2, 'Neon Blue', 'Trabajadora en una zona de luces azules (trans).'),
(3, 'Dominatrix', 'Avistar a alguien con látigo, látex o estética BDSM.'),
(4, 'Vintage', 'Mujer de más de 50 años.'),
(5, 'Barbie Eslava', 'Rubia platino, alta y de rasgos del este.'),
(6, 'Ébano', 'Mujer de rasgos africanos en los ventanales laterales.'),
(7, 'Latina de Fuego', 'Alguien con rasgos sudamericanos.'),
(8, 'Asiática Misteriosa', 'Frecuentes en las callejuelas más estrechas.'),
(9, 'Curvy', 'Una chica de tallas grandes que rompa el estándar.'),
(10, 'Gótica', 'Alguien con maquillaje oscuro y estética alternativa.'),
(11, 'Invisible', 'Un escaparate con la cortina echada (misión fallida).'),
(12, 'Comercial', 'La que intenta convencer activamente al novio desde la puerta.'),
(13, 'Vigilante', 'Una mujer sentada leyendo un libro o mirando el móvil.'),
(14, 'Multitarea', 'Alguien retocándose el maquillaje o las uñas mientras espera.'),
(15, 'Dama del Callejón', 'Encontrarla en la calle más estrecha (Trompettersteeg).'),
(16, 'Echenica', 'Una mujer en silla de ruedas.'),
(17, 'Therian', 'Mujer que va con temática animal.'),
(18, 'Barbuda', 'Mujer con excesivo bello corporal.');

-- INSTRUCCIÓN PARA EL USUARIO:
-- Después de ejecutar este script, ve a la sección de "Authentication" en Supabase.
-- Crea un usuario manualmente (Add user -> Create new user).
-- Usa un email inventado (ej. despedida@amsterdam.app) y una contraseña (ej. Despedida2026$).
-- Ese email y contraseña los añadiremos al archivo .env para que la app inicie sesión automáticamente.
