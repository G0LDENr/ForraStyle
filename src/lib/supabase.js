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

// Configurar cliente con persistencia de sesión
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,           // Guardar sesión en localStorage
    autoRefreshToken: true,         // Refrescar token automáticamente
    detectSessionInUrl: true,       // Detectar sesión en URL (para magic links)
    storage: localStorage,          // Usar localStorage para guardar la sesión
    storageKey: 'supabase.auth.token' // Clave para guardar en localStorage
  }
})

// Función para obtener la sesión actual
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error al obtener sesión:', error)
    return null
  }
  return session
}

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error al obtener usuario:', error)
    return null
  }
  return user
}

// Función para restaurar sesión desde localStorage
export const restoreSession = async () => {
  const storedSession = localStorage.getItem('supabase.auth.token')
  if (storedSession) {
    try {
      const sessionData = JSON.parse(storedSession)
      const { data, error } = await supabase.auth.setSession(sessionData)
      if (error) {
        console.error('Error al restaurar sesión:', error)
        return null
      }
      console.log('✅ Sesión restaurada correctamente')
      return data.session
    } catch (err) {
      console.error('Error al parsear sesión:', err)
      return null
    }
  }
  return null
}