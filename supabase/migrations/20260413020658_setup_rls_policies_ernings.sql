-- Habilitar RLS en la tabla admin_earnings_config
ALTER TABLE admin_earnings_config ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública
CREATE POLICY "Permitir lectura pública" ON admin_earnings_config
    FOR SELECT USING (true);

-- Permitir inserción pública
CREATE POLICY "Permitir inserción pública" ON admin_earnings_config
    FOR INSERT WITH CHECK (true);

-- Permitir actualización pública
CREATE POLICY "Permitir actualización pública" ON admin_earnings_config
    FOR UPDATE USING (true);

-- Permitir eliminación pública
CREATE POLICY "Permitir eliminación pública" ON admin_earnings_config
    FOR DELETE USING (true);