-- Crear la tabla users
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Comentarios para documentación
COMMENT ON TABLE users IS 'Usuarios de la aplicación';
COMMENT ON COLUMN users.name IS 'Nombre completo del usuario';
COMMENT ON COLUMN users.email IS 'Email único del usuario';