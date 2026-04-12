-- Crear tabla de permisos para administradores (versión simple)
CREATE TABLE IF NOT EXISTS admin_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Permisos de creación
    can_create_users BOOLEAN DEFAULT FALSE,
    create_daily_limit INTEGER DEFAULT 0,
    create_current_count INTEGER DEFAULT 0,
    create_last_reset DATE DEFAULT CURRENT_DATE,
    
    -- Permisos de edición
    can_edit_users BOOLEAN DEFAULT FALSE,
    edit_daily_limit INTEGER DEFAULT 0,
    edit_current_count INTEGER DEFAULT 0,
    edit_last_reset DATE DEFAULT CURRENT_DATE,
    can_edit_admins BOOLEAN DEFAULT FALSE,
    
    -- Permisos de eliminación
    can_delete_users BOOLEAN DEFAULT FALSE,
    can_delete_admins BOOLEAN DEFAULT FALSE,
    can_delete_super_admin BOOLEAN DEFAULT FALSE,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT uq_admin_permissions_admin_id UNIQUE (admin_id)
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_admin_permissions_admin_id ON admin_permissions(admin_id);