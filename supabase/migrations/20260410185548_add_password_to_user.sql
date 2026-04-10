-- 20260410185548_add_password_to_user.sql

-- Paso 1: Agregar la columna permitiendo valores nulos temporalmente
ALTER TABLE users ADD COLUMN password TEXT;

-- Paso 2: Actualizar los usuarios existentes con una contraseña temporal
-- (Solo si tienes usuarios existentes que quieras mantener)
UPDATE users SET password = 'temporal_password_hash' WHERE password IS NULL;

-- Paso 3: Ahora sí, agregar la restricción NOT NULL
ALTER TABLE users ALTER COLUMN password SET NOT NULL;

-- Paso 4: Agregar constraint de email único si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_email'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
    END IF;
END $$;