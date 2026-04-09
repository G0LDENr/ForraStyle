import { createClient } from '@supabase/supabase-js'

// Para Create React App se usa process.env
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Validación
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '❌ Faltan variables de entorno de Supabase.\n' +
    'Crea un archivo .env con:\n' +
    'REACT_APP_SUPABASE_URL=tu_url\n' +
    'REACT_APP_SUPABASE_ANON_KEY=tu_key'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)