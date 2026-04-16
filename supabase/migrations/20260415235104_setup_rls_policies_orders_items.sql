-- Habilitar RLS en la tabla order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Permitir lectura de items (usuarios pueden ver items de sus pedidos)
CREATE POLICY "Usuarios pueden ver items de sus pedidos" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.created_by = auth.uid()
        )
    );

-- Permitir inserción de items (usuarios pueden agregar items a sus pedidos)
CREATE POLICY "Usuarios pueden insertar items en sus pedidos" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.created_by = auth.uid()
        )
    );

-- Permitir actualización de items (usuarios pueden actualizar items de sus pedidos)
CREATE POLICY "Usuarios pueden actualizar items de sus pedidos" ON order_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.created_by = auth.uid()
        )
    );

-- Permitir eliminación de items (usuarios pueden eliminar items de sus pedidos)
CREATE POLICY "Usuarios pueden eliminar items de sus pedidos" ON order_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.created_by = auth.uid()
        )
    );