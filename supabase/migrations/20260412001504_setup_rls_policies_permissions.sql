-- Habilitar RLS en la tabla admin_permissions
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública
CREATE POLICY "Permitir lectura pública" ON admin_permissions
    FOR SELECT USING (true);

-- Permitir inserción pública
CREATE POLICY "Permitir inserción pública" ON admin_permissions
    FOR INSERT WITH CHECK (true);

-- Permitir actualización pública
CREATE POLICY "Permitir actualización pública" ON admin_permissions
    FOR UPDATE USING (true);

-- Permitir eliminación pública
CREATE POLICY "Permitir eliminación pública" ON admin_permissions
    FOR DELETE USING (true);