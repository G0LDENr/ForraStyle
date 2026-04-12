-- Agregar columna para guardar las ediciones por usuario
ALTER TABLE admin_permissions ADD COLUMN IF NOT EXISTS user_edit_counts JSONB DEFAULT '{}';