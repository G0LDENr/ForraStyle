-- Tabla única para porcentajes y sueldos de administradores
CREATE TABLE IF NOT EXISTS admin_earnings_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  percentage_by_ship DECIMAL(5,2) DEFAULT 0,
  percentage_by_employee DECIMAL(5,2) DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  monthly_earnings DECIMAL(10,2) DEFAULT 0,
  current_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
  current_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(admin_id)
);

-- Agregar comentarios a las columnas
COMMENT ON COLUMN admin_earnings_config.percentage_by_ship IS 'Porcentaje por envío';
COMMENT ON COLUMN admin_earnings_config.percentage_by_employee IS 'Porcentaje por empleado';
COMMENT ON COLUMN admin_earnings_config.total_earnings IS 'Ganancias totales acumuladas';
COMMENT ON COLUMN admin_earnings_config.monthly_earnings IS 'Ganancias del mes actual';

-- Insertar configuración por defecto para admins existentes
INSERT INTO admin_earnings_config (admin_id, percentage_by_ship, percentage_by_employee)
SELECT id, 10, 5 FROM users WHERE rol = 1
ON CONFLICT (admin_id) DO NOTHING;