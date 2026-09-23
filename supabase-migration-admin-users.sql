-- ==============================================================================
-- FASE 6: Tabla admin_users (Usuarios y permisos)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'staff')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS:
-- Los usuarios autenticados pueden consultar admin_users para validar su propia sesión y permisos.
CREATE POLICY "admin_users_select_authenticated" ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Solo service_role puede insertar, actualizar o eliminar directamente por RLS
CREATE POLICY "admin_users_all_service_role" ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Índice para búsquedas rápidas por email
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users (email);

-- Seed inicial con los dueños confirmados
INSERT INTO admin_users (email, role, active)
VALUES 
  ('admin@gmail.com', 'owner', true),
  ('francoriquero15@gmail.com', 'owner', true)
ON CONFLICT (email) DO UPDATE 
SET role = 'owner', active = true;
