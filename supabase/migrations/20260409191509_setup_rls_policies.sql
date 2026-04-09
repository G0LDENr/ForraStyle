-- Habilitar RLS en la tabla users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública
CREATE POLICY "Permitir lectura pública" ON users
    FOR SELECT USING (true);

-- Permitir inserción pública
CREATE POLICY "Permitir inserción pública" ON users
    FOR INSERT WITH CHECK (true);

-- Permitir actualización pública
CREATE POLICY "Permitir actualización pública" ON users
    FOR UPDATE USING (true);

-- Permitir eliminación pública
CREATE POLICY "Permitir eliminación pública" ON users
    FOR DELETE USING (true);