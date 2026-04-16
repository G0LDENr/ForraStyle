-- Habilitar RLS en la tabla orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Permitir lectura de pedidos (usuarios autenticados pueden ver sus propios pedidos)
CREATE POLICY "Usuarios pueden ver sus propios pedidos" ON orders
    FOR SELECT USING (auth.uid() = created_by);

-- Permitir inserción de pedidos (usuarios autenticados pueden crear pedidos)
CREATE POLICY "Usuarios pueden crear pedidos" ON orders
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Permitir actualización de pedidos (usuarios pueden actualizar sus propios pedidos)
CREATE POLICY "Usuarios pueden actualizar sus propios pedidos" ON orders
    FOR UPDATE USING (auth.uid() = created_by);

-- Permitir eliminación de pedidos (usuarios pueden eliminar sus propios pedidos)
CREATE POLICY "Usuarios pueden eliminar sus propios pedidos" ON orders
    FOR DELETE USING (auth.uid() = created_by);